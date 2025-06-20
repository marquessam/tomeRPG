// functions/get-game.js - Function to get game data
import pg from 'pg'
const { Client } = pg

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  let client
  try {
    // Extract room code from path
    const roomCode = event.path.split('/').pop()
    
    if (!roomCode) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Room code required' })
      }
    }

    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
    
    await client.connect()

    // Get game info
    const gameResult = await client.query(`
      SELECT g.*, gs.turn_order, gs.current_character_id, gs.round_number, gs.phase_data
      FROM games g
      LEFT JOIN game_state gs ON g.id = gs.game_id
      WHERE g.room_code = $1
    `, [roomCode])

    if (gameResult.rows.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Game not found' })
      }
    }

    const game = gameResult.rows[0]

    // Get players
    const playersResult = await client.query(`
      SELECT id, name, role, is_connected, color, cursor_x, cursor_y
      FROM players WHERE game_id = $1
      ORDER BY created_at
    `, [game.id])

    // Get characters
    const charactersResult = await client.query(`
      SELECT c.*, p.name as player_name
      FROM characters c
      LEFT JOIN players p ON c.player_id = p.id
      WHERE c.game_id = $1
    `, [game.id])

    // Get recent messages
    const messagesResult = await client.query(`
      SELECT m.*, c.name as character_name, p.name as player_name
      FROM messages m
      LEFT JOIN characters c ON m.character_id = c.id
      LEFT JOIN players p ON m.player_id = p.id
      WHERE m.game_id = $1
      ORDER BY m.created_at DESC
      LIMIT 50
    `, [game.id])

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        game: {
          id: game.id,
          roomCode: game.room_code,
          name: game.name,
          status: game.status,
          currentTurn: game.round_number,
          phase: game.current_phase,
          turnOrder: game.turn_order || [],
          currentCharacterId: game.current_character_id
        },
        players: playersResult.rows,
        characters: charactersResult.rows,
        messages: messagesResult.rows.reverse()
      })
    }
  } catch (error) {
    console.error('Get game error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to get game data',
        details: error.message 
      })
    }
  } finally {
    if (client) {
      await client.end()
    }
  }
}
