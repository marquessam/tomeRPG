// functions/setup-database.js - Automatically setup/reset database schema
const { Client } = require('pg')

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed. Use POST to setup database.' })
    }
  }

  let client
  try {
    const { force = false } = JSON.parse(event.body || '{}')
    
    console.log('Setting up database schema...')
    
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
    
    await client.connect()
    console.log('Connected to database')

    // Get current tables
    const currentTablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    const currentTables = currentTablesResult.rows.map(row => row.table_name)
    console.log('Current tables:', currentTables)

    // Drop existing tables if force=true or if they're not the ones we need
    const requiredTables = ['games', 'players', 'character_classes', 'characters', 'game_state', 'messages']
    const hasCorrectTables = requiredTables.every(table => currentTables.includes(table))
    
    if (force || !hasCorrectTables) {
      console.log('Dropping existing tables...')
      
      // Drop tables in correct order (due to foreign key constraints)
      const tablesToDrop = [
        'messages', 'game_state', 'characters', 'players', 'games', 'character_classes',
        // Also drop any existing tables that might conflict
        'game_sessions', 'session_updates', 'session_users', 'images'
      ]
      
      for (const table of tablesToDrop) {
        try {
          await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`)
          console.log(`Dropped table: ${table}`)
        } catch (error) {
          console.log(`Table ${table} didn't exist or couldn't be dropped:`, error.message)
        }
      }
    }

    console.log('Creating new schema...')

    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    console.log('UUID extension enabled')

    // Create games table
    await client.query(`
      CREATE TABLE games (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        room_code VARCHAR(6) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        dm_player_id UUID,
        status VARCHAR(20) DEFAULT 'waiting',
        current_turn_index INTEGER DEFAULT 0,
        current_phase VARCHAR(20) DEFAULT 'setup',
        grid_size INTEGER DEFAULT 20,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('Created games table')

    // Create players table
    await client.query(`
      CREATE TABLE players (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        game_id UUID REFERENCES games(id) ON DELETE CASCADE,
        name VARCHAR(50) NOT NULL,
        role VARCHAR(10) NOT NULL,
        is_connected BOOLEAN DEFAULT false,
        cursor_x INTEGER DEFAULT 0,
        cursor_y INTEGER DEFAULT 0,
        color VARCHAR(7) DEFAULT '#ffffff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('Created players table')

    // Create character_classes table
    await client.query(`
      CREATE TABLE character_classes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(20) UNIQUE NOT NULL,
        base_hp INTEGER NOT NULL,
        base_mp INTEGER NOT NULL,
        base_attack INTEGER NOT NULL,
        base_defense INTEGER NOT NULL,
        base_speed INTEGER NOT NULL,
        description TEXT
      )
    `)
    console.log('Created character_classes table')

    // Insert character classes
    await client.query(`
      INSERT INTO character_classes (name, base_hp, base_mp, base_attack, base_defense, base_speed, description) VALUES
      ('fighter', 30, 5, 8, 6, 4, 'Strong melee combatant with high HP and attack'),
      ('mage', 15, 20, 5, 3, 5, 'Magical damage dealer with powerful spells'),
      ('thief', 20, 10, 6, 4, 7, 'Fast and agile with backstab abilities'),
      ('cleric', 25, 15, 5, 5, 4, 'Support character with healing and buffs')
    `)
    console.log('Inserted character classes')

    // Create characters table
    await client.query(`
      CREATE TABLE characters (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        game_id UUID REFERENCES games(id) ON DELETE CASCADE,
        player_id UUID REFERENCES players(id) ON DELETE SET NULL,
        name VARCHAR(50) NOT NULL,
        class VARCHAR(20) REFERENCES character_classes(name),
        level INTEGER DEFAULT 1,
        hp INTEGER NOT NULL,
        max_hp INTEGER NOT NULL,
        mp INTEGER NOT NULL,
        max_mp INTEGER NOT NULL,
        attack INTEGER NOT NULL,
        defense INTEGER NOT NULL,
        speed INTEGER NOT NULL,
        grid_x INTEGER DEFAULT 0,
        grid_y INTEGER DEFAULT 0,
        facing VARCHAR(5) DEFAULT 'down',
        is_npc BOOLEAN DEFAULT false,
        status_effects JSONB DEFAULT '[]',
        equipment JSONB DEFAULT '{"weapon": null, "armor": null, "accessory": null}',
        powers JSONB DEFAULT '{"atWill": [], "encounter": [], "daily": []}',
        initiative INTEGER DEFAULT 0,
        has_acted BOOLEAN DEFAULT false,
        has_moved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('Created characters table')

    // Create game_state table
    await client.query(`
      CREATE TABLE game_state (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        game_id UUID REFERENCES games(id) ON DELETE CASCADE,
        turn_order JSONB NOT NULL DEFAULT '[]',
        current_character_id UUID,
        round_number INTEGER DEFAULT 1,
        phase_data JSONB DEFAULT '{}',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('Created game_state table')

    // Create messages table
    await client.query(`
      CREATE TABLE messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        game_id UUID REFERENCES games(id) ON DELETE CASCADE,
        character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
        player_id UUID REFERENCES players(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        message_type VARCHAR(20) DEFAULT 'dialogue',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('Created messages table')

    // Create indexes for performance
    await client.query('CREATE INDEX idx_games_room_code ON games(room_code)')
    await client.query('CREATE INDEX idx_players_game_id ON players(game_id)')
    await client.query('CREATE INDEX idx_characters_game_id ON characters(game_id)')
    await client.query('CREATE INDEX idx_messages_game_id ON messages(game_id)')
    console.log('Created indexes')

    // Create a test game
    await client.query(`
      INSERT INTO games (room_code, name, status) 
      VALUES ('DEMO01', 'Demo Game', 'waiting')
    `)
    console.log('Created demo game')

    // Verify tables were created
    const finalTablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    const finalTables = finalTablesResult.rows.map(row => row.table_name)
    console.log('Final tables:', finalTables)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Database schema setup completed successfully',
        tablesCreated: finalTables,
        requiredTablesExist: requiredTables.every(table => finalTables.includes(table)),
        demoGameCreated: true,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('Database setup error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to setup database',
        details: error.message,
        stack: error.stack
      })
    }
  } finally {
    if (client) {
      try {
        await client.end()
        console.log('Database connection closed')
      } catch (closeError) {
        console.error('Error closing connection:', closeError)
      }
    }
  }
}

