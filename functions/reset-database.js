// functions/reset-database.js - Simple reset function
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
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  let client
  try {
    console.log('Resetting database...')
    
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
    
    await client.connect()

    // Clear all game data but keep structure
    await client.query('DELETE FROM messages')
    await client.query('DELETE FROM game_state')
    await client.query('DELETE FROM characters')
    await client.query('DELETE FROM players')
    await client.query('DELETE FROM games')
    console.log('Cleared all game data')

    // Create a fresh demo game
    await client.query(`
      INSERT INTO games (room_code, name, status) 
      VALUES ('DEMO01', 'Demo Game', 'waiting')
    `)
    console.log('Created fresh demo game')

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Database reset completed - all game data cleared',
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('Database reset error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to reset database',
        details: error.message
      })
    }
  } finally {
    if (client) {
      await client.end()
    }
  }
}
