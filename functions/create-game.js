// functions/create-game.js - Fixed CommonJS version
const { Client } = require('pg')

// Generate unique room code
const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

exports.handler = async (event, context) => {
  // Handle CORS
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
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  let client
  try {
    console.log('Creating game - parsing body...')
    const { gameName, playerName, role = 'dm' } = JSON.parse(event.body || '{}')
    
    console.log('Parsed data:', { gameName, playerName, role })
    
    if (!gameName || !playerName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Game name and player name are required' })
      }
    }

    console.log('Connecting to database...')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    
    // Create database client
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
    
    await client.connect()
    console.log('Database connected successfully')

    // Generate unique room code
    let roomCode
    let attempts = 0
    do {
      roomCode = generateRoomCode()
      console.log('Generated room code:', roomCode)
      const existing = await client.query('SELECT id FROM games WHERE room_code = $1', [roomCode])
      if (existing.rows.length === 0) break
      attempts++
    } while (attempts < 10)

    console.log('Creating game record...')
    // Create game
    const gameResult = await client.query(`
      INSERT INTO games (room_code, name, status) 
      VALUES ($1, $2, 'waiting') 
      RETURNING id, room_code, name, status
    `, [roomCode, gameName])

    const game = gameResult.rows[0]
    console.log('Game created:', game)

    console.log('Creating player record...')
    // Create DM player
    const playerResult = await client.query(`
      INSERT INTO players (game_id, name, role, is_connected, color) 
      VALUES ($1, $2, $3, true, '#ff6b6b') 
      RETURNING id, name, role, color
    `, [game.id, playerName, role])

    const player = playerResult.rows[0]
    console.log('Player created:', player)

    // Update game with DM
    await client.query('UPDATE games SET dm_player_id = $1 WHERE id = $2', [player.id, game.id])

    // Initialize game state
    await client.query(`
      INSERT INTO game_state (game_id, turn_order, current_character_id, round_number) 
      VALUES ($1, '[]', NULL, 1)
    `, [game.id])

    console.log('Game creation successful')
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        roomCode: game.room_code,
        gameId: game.id,
        player: player
      })
    }
  } catch (error) {
    console.error('Create game error:', error)
    console.error('Error stack:', error.stack)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to create game',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  } finally {
    if (client) {
      try {
        await client.end()
        console.log('Database connection closed')
      } catch (closeError) {
        console.error('Error closing database connection:', closeError)
      }
    }
  }
}
