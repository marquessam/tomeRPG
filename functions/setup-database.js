// functions/setup-database.js - Enhanced with powers, items, and monsters
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
    
    console.log('Setting up enhanced database schema...', { force })
    
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
    
    await client.connect()
    console.log('Connected to database')

    // If force=true, drop everything and start fresh
    if (force) {
      console.log('Force mode: dropping all existing tables...')
      
      const allTablesToDrop = [
        'character_powers', 'powers', 'items', 'character_items', 'monsters',
        'messages', 'game_state', 'characters', 'players', 'games', 'character_classes',
        'uploaded_files'
      ]
      
      for (const table of allTablesToDrop) {
        try {
          await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`)
          console.log(`Dropped table: ${table}`)
        } catch (error) {
          console.log(`Could not drop ${table}:`, error.message)
        }
      }
    }

    console.log('Creating/verifying enhanced schema...')

    // Enable UUID extension
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
      console.log('UUID extension enabled')
    } catch (error) {
      console.log('UUID extension note:', error.message)
    }

    // Create uploaded_files table for sprites/portraits
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS uploaded_files (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          filename VARCHAR(255) NOT NULL,
          original_name VARCHAR(255) NOT NULL,
          file_type VARCHAR(50) NOT NULL,
          file_size INTEGER NOT NULL,
          file_data BYTEA NOT NULL,
          uploaded_by UUID,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      console.log('Uploaded files table ready')
    } catch (error) {
      console.error('Error creating uploaded_files:', error.message)
    }

    // Create character_classes table
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS character_classes (
          id SERIAL PRIMARY KEY,
          name VARCHAR(20) UNIQUE NOT NULL,
          display_name VARCHAR(50) NOT NULL,
          base_hp INTEGER NOT NULL,
          base_mp INTEGER NOT NULL,
          base_attack INTEGER NOT NULL,
          base_defense INTEGER NOT NULL,
          base_speed INTEGER NOT NULL,
          primary_stat VARCHAR(20) NOT NULL,
          description TEXT
        )
      `)
      console.log('Character classes table ready')

      // Insert classes if they don't exist
      const classCount = await client.query('SELECT COUNT(*) FROM character_classes')
      if (parseInt(classCount.rows[0].count) === 0) {
        await client.query(`
          INSERT INTO character_classes (name, display_name, base_hp, base_mp, base_attack, base_defense, base_speed, primary_stat, description) VALUES
          ('fighter', 'Fighter', 30, 10, 8, 7, 4, 'strength', 'Heavily armored warrior with devastating melee attacks'),
          ('wizard', 'Wizard', 18, 25, 4, 3, 5, 'intelligence', 'Master of arcane magic with powerful ranged spells'),
          ('rogue', 'Rogue', 22, 15, 6, 4, 8, 'dexterity', 'Stealthy combatant with precise strikes and mobility'),
          ('cleric', 'Cleric', 26, 20, 5, 5, 4, 'wisdom', 'Divine spellcaster focused on healing and support')
        `)
        console.log('Inserted character classes')
      }
    } catch (error) {
      console.error('Error with character_classes:', error.message)
    }

    // Create powers table (D&D 4e style abilities)
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS powers (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(100) NOT NULL,
          class_name VARCHAR(20) REFERENCES character_classes(name),
          power_type VARCHAR(20) NOT NULL, -- 'at_will', 'encounter', 'daily'
          action_type VARCHAR(20) NOT NULL, -- 'standard', 'move', 'minor', 'free'
          attack_type VARCHAR(20) NOT NULL, -- 'melee', 'ranged', 'close', 'area'
          range_value INTEGER DEFAULT 1,
          area_type VARCHAR(20), -- 'burst', 'blast', 'line', null for single target
          area_size INTEGER DEFAULT 1,
          damage_dice VARCHAR(20), -- '1d8', '2d6+4', etc
          damage_type VARCHAR(20), -- 'physical', 'fire', 'cold', etc
          effects JSONB DEFAULT '[]', -- conditions, forced movement, etc
          keywords VARCHAR(200), -- 'weapon', 'fire', 'healing', etc
          description TEXT NOT NULL,
          level_required INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      console.log('Powers table ready')

      // Insert basic powers for each class
      const powerCount = await client.query('SELECT COUNT(*) FROM powers')
      if (parseInt(powerCount.rows[0].count) === 0) {
        await client.query(`
          INSERT INTO powers (name, class_name, power_type, action_type, attack_type, range_value, damage_dice, damage_type, description, keywords) VALUES
          -- Fighter Powers
          ('Cleave', 'fighter', 'at_will', 'standard', 'melee', 1, '1d8+4', 'physical', 'Basic melee attack that can hit adjacent enemies', 'weapon'),
          ('Power Attack', 'fighter', 'at_will', 'standard', 'melee', 1, '1d8+6', 'physical', 'Heavy attack with increased damage', 'weapon'),
          ('Shield Bash', 'fighter', 'encounter', 'standard', 'melee', 1, '2d6+4', 'physical', 'Attack that can knock enemies prone', 'weapon'),
          ('Whirlwind Strike', 'fighter', 'daily', 'standard', 'close', 1, '2d8+6', 'physical', 'Attack all adjacent enemies', 'weapon'),
          
          -- Wizard Powers  
          ('Magic Missile', 'wizard', 'at_will', 'standard', 'ranged', 10, '1d4+4', 'force', 'Unerring bolt of magical energy', 'force, implement'),
          ('Ray of Frost', 'wizard', 'at_will', 'standard', 'ranged', 10, '1d6+4', 'cold', 'Icy ray that slows the target', 'cold, implement'),
          ('Burning Hands', 'wizard', 'encounter', 'standard', 'close', 3, '2d6+4', 'fire', 'Cone of fire affecting multiple enemies', 'fire, implement'),
          ('Fireball', 'wizard', 'daily', 'standard', 'area', 20, '3d6+4', 'fire', 'Explosive blast in large area', 'fire, implement'),
          
          -- Rogue Powers
          ('Piercing Strike', 'rogue', 'at_will', 'standard', 'melee', 1, '1d4+4', 'physical', 'Precise attack targeting weak points', 'weapon'),
          ('Sly Flourish', 'rogue', 'at_will', 'standard', 'melee', 1, '1d6+4', 'physical', 'Deceptive attack with extra damage', 'weapon'),
          ('Dazing Strike', 'rogue', 'encounter', 'standard', 'melee', 1, '2d4+4', 'physical', 'Attack that dazes the target', 'weapon'),
          ('Assassinate', 'rogue', 'daily', 'standard', 'melee', 1, '3d8+6', 'physical', 'Devastating sneak attack', 'weapon'),
          
          -- Cleric Powers
          ('Sacred Flame', 'cleric', 'at_will', 'standard', 'ranged', 5, '1d6+4', 'radiant', 'Divine fire that damages undead', 'divine, implement'),
          ('Blessing of Battle', 'cleric', 'at_will', 'minor', 'ranged', 5, '0', 'none', 'Grant ally +2 to next attack', 'divine'),
          ('Healing Word', 'cleric', 'encounter', 'minor', 'ranged', 5, '0', 'healing', 'Heal ally for 2d6+4 hit points', 'divine, healing'),
          ('Mass Cure', 'cleric', 'daily', 'standard', 'close', 3, '0', 'healing', 'Heal all allies in burst', 'divine, healing')
        `)
        console.log('Inserted basic powers')
      }
    } catch (error) {
      console.error('Error with powers table:', error.message)
    }

    // Create items table
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS items (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(100) NOT NULL,
          item_type VARCHAR(20) NOT NULL, -- 'weapon', 'armor', 'accessory', 'consumable'
          slot VARCHAR(20), -- 'main_hand', 'off_hand', 'armor', 'accessory', null
          attack_bonus INTEGER DEFAULT 0,
          damage_bonus INTEGER DEFAULT 0,
          defense_bonus INTEGER DEFAULT 0,
          properties JSONB DEFAULT '{}', -- magical properties, bonuses, etc
          description TEXT,
          rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'uncommon', 'rare', 'epic'
          level_required INTEGER DEFAULT 1,
          sprite_file_id UUID REFERENCES uploaded_files(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      console.log('Items table ready')

      // Insert basic items
      const itemCount = await client.query('SELECT COUNT(*) FROM items')
      if (parseInt(itemCount.rows[0].count) === 0) {
        await client.query(`
          INSERT INTO items (name, item_type, slot, attack_bonus, damage_bonus, defense_bonus, description, rarity) VALUES
          ('Iron Sword', 'weapon', 'main_hand', 1, 2, 0, 'A sturdy iron blade', 'common'),
          ('Steel Shield', 'armor', 'off_hand', 0, 0, 2, 'A reliable steel shield', 'common'),
          ('Wizard Staff', 'weapon', 'main_hand', 1, 0, 0, 'Focuses magical energy', 'common'),
          ('Leather Armor', 'armor', 'armor', 0, 0, 3, 'Light but protective', 'common'),
          ('Health Potion', 'consumable', null, 0, 0, 0, 'Restores 2d4+2 hit points', 'common'),
          ('Magic Dagger', 'weapon', 'main_hand', 2, 1, 0, 'A blade imbued with arcane power', 'uncommon')
        `)
        console.log('Inserted basic items')
      }
    } catch (error) {
      console.error('Error with items table:', error.message)
    }

    // Create monsters table
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS monsters (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(100) NOT NULL,
          type VARCHAR(50) NOT NULL, -- 'humanoid', 'beast', 'undead', etc
          level INTEGER NOT NULL,
          hp INTEGER NOT NULL,
          ac INTEGER NOT NULL, -- armor class
          attack_bonus INTEGER NOT NULL,
          damage VARCHAR(20) NOT NULL, -- damage expression like '1d8+3'
          speed INTEGER NOT NULL,
          special_abilities JSONB DEFAULT '[]',
          loot_table JSONB DEFAULT '[]', -- what items they can drop
          xp_value INTEGER NOT NULL,
          description TEXT,
          sprite_file_id UUID REFERENCES uploaded_files(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      console.log('Monsters table ready')

      // Insert basic monsters
      const monsterCount = await client.query('SELECT COUNT(*) FROM monsters')
      if (parseInt(monsterCount.rows[0].count) === 0) {
        await client.query(`
          INSERT INTO monsters (name, type, level, hp, ac, attack_bonus, damage, speed, xp_value, description) VALUES
          ('Goblin Warrior', 'humanoid', 1, 15, 14, 3, '1d6+1', 6, 25, 'Small, fierce humanoid with crude weapons'),
          ('Orc Berserker', 'humanoid', 3, 35, 16, 5, '1d8+3', 5, 150, 'Large, brutal warrior in a battle rage'),
          ('Skeleton Archer', 'undead', 2, 20, 15, 4, '1d6+2', 6, 100, 'Animated bones wielding a longbow'),
          ('Fire Elemental', 'elemental', 5, 55, 17, 7, '2d6+4', 8, 400, 'Living flame that burns everything it touches'),
          ('Giant Spider', 'beast', 2, 25, 14, 4, '1d8+2', 7, 125, 'Large arachnid with venomous fangs')
        `)
        console.log('Inserted basic monsters')
      }
    } catch (error) {
      console.error('Error with monsters table:', error.message)
    }

    // Create remaining game tables...
    // (Keep existing games, players, characters, etc. tables as before)
    
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS games (
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

      await client.query(`
        CREATE TABLE IF NOT EXISTS players (
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

      await client.query(`
        CREATE TABLE IF NOT EXISTS characters (
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
          monster_id UUID REFERENCES monsters(id), -- if this is a monster instance
          status_effects JSONB DEFAULT '[]',
          equipment JSONB DEFAULT '{"main_hand": null, "off_hand": null, "armor": null, "accessory": null}',
          initiative INTEGER DEFAULT 0,
          has_acted BOOLEAN DEFAULT false,
          has_moved BOOLEAN DEFAULT false,
          portrait_file_id UUID REFERENCES uploaded_files(id),
          sprite_file_id UUID REFERENCES uploaded_files(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Character powers junction table
      await client.query(`
        CREATE TABLE IF NOT EXISTS character_powers (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
          power_id UUID REFERENCES powers(id) ON DELETE CASCADE,
          uses_remaining INTEGER DEFAULT 1, -- for encounter/daily powers
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(character_id, power_id)
        )
      `)

      // Character items junction table  
      await client.query(`
        CREATE TABLE IF NOT EXISTS character_items (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
          item_id UUID REFERENCES items(id) ON DELETE CASCADE,
          quantity INTEGER DEFAULT 1,
          is_equipped BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      await client.query(`
        CREATE TABLE IF NOT EXISTS game_state (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          game_id UUID REFERENCES games(id) ON DELETE CASCADE,
          turn_order JSONB NOT NULL DEFAULT '[]',
          current_character_id UUID,
          round_number INTEGER DEFAULT 1,
          phase_data JSONB DEFAULT '{}',
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      await client.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          game_id UUID REFERENCES games(id) ON DELETE CASCADE,
          character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
          player_id UUID REFERENCES players(id) ON DELETE SET NULL,
          content TEXT NOT NULL,
          message_type VARCHAR(20) DEFAULT 'dialogue',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      console.log('All game tables ready')
    } catch (error) {
      console.error('Error creating game tables:', error.message)
    }

    // Create indexes
    try {
      await client.query('CREATE INDEX IF NOT EXISTS idx_games_room_code ON games(room_code)')
      await client.query('CREATE INDEX IF NOT EXISTS idx_players_game_id ON players(game_id)')
      await client.query('CREATE INDEX IF NOT EXISTS idx_characters_game_id ON characters(game_id)')
      await client.query('CREATE INDEX IF NOT EXISTS idx_messages_game_id ON messages(game_id)')
      await client.query('CREATE INDEX IF NOT EXISTS idx_powers_class ON powers(class_name)')
      await client.query('CREATE INDEX IF NOT EXISTS idx_character_powers_char ON character_powers(character_id)')
      await client.query('CREATE INDEX IF NOT EXISTS idx_character_items_char ON character_items(character_id)')
      console.log('Indexes ready')
    } catch (error) {
      console.log('Index creation note:', error.message)
    }

    // Verify final state
    const finalTablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    const finalTables = finalTablesResult.rows.map(row => row.table_name)

    const requiredTables = [
      'games', 'players', 'character_classes', 'characters', 'game_state', 'messages',
      'powers', 'character_powers', 'items', 'character_items', 'monsters', 'uploaded_files'
    ]
    const hasAllTables = requiredTables.every(table => finalTables.includes(table))

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Enhanced database schema setup completed successfully',
        tablesCreated: finalTables,
        requiredTablesExist: hasAllTables,
        requiredTables: requiredTables,
        missingTables: requiredTables.filter(table => !finalTables.includes(table)),
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('Database setup error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to setup enhanced database',
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
