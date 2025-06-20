// functions/join-game.js - Fixed CommonJS version
const { Client } = require('pg')

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
    console.log('Joining game - parsing body...')
    const { roomCode, playerName, role = 'player' } = JSON.parse(event.body || '{}')
    
    console.log('Parsed data:', { roomCode, playerName, role })
    
    if (!roomCode || !playerName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Room code and player name are required' })
      }
    }

    console.log('Connecting to database...')
    
    // Create database client
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
    
    await client.connect()
    console.log('Database connected successfully')

    console.log('Finding game...')
    // Find game
    const gameResult = await client.query(`
      SELECT id, name, status FROM games WHERE room_code = $1
    `, [roomCode])

    if (gameResult.rows.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Game not found' })
      }
    }

    const game = gameResult.rows[0]
    console.log('Game found:', game)

    // Check if game is joinable
    if (game.status !== 'waiting' && game.status !== 'active') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Game is not accepting new players' })
      }
    }

    // Check player limit
    const playerCount = await client.query('SELECT COUNT(*) FROM players WHERE game_id = $1', [game.id])
    if (parseInt(playerCount.rows[0].count) >= 5) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Game is full' })
      }
    }

    // Player colors
    const colors = ['#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
    const usedColors = await client.query('SELECT color FROM players WHERE game_id = $1', [game.id])
    const availableColor = colors.find(color => !usedColors.rows.some(row => row.color === color)) || '#9c88ff'

    console.log('Creating player...')
    // Create player
    const playerResult = await client.query(`
      INSERT INTO players (game_id, name, role, is_connected, color) 
      VALUES ($1, $2, $3, true, $4) 
      RETURNING id, name, role, color
    `, [game.id, playerName, role, availableColor])

    const player = playerResult.rows[0]
    console.log('Player created:', player)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        gameId: game.id,
        player: player
      })
    }
  } catch (error) {
    console.error('Join game error:', error)
    console.error('Error stack:', error.stack)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to join game',
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
