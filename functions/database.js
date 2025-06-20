// functions/database.js - Database connection and utilities
import { Client } from 'pg'

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

// Connect to database
const connectDB = async () => {
  try {
    await client.connect()
    console.log('Connected to PostgreSQL')
  } catch (error) {
    console.error('Database connection error:', error)
    throw error
  }
}

// Generate unique room code
const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    await connectDB()
    const { httpMethod, path, body } = event
    const data = body ? JSON.parse(body) : {}

    switch (httpMethod) {
      case 'POST':
        if (path.includes('create-game')) {
          return await createGame(data, headers)
        } else if (path.includes('join-game')) {
          return await joinGame(data, headers)
        } else if (path.includes('create-character')) {
          return await createCharacter(data, headers)
        }
        break

      case 'GET':
        if (path.includes('game/')) {
          const roomCode = path.split('/').pop()
          return await getGame(roomCode, headers)
        }
        break

      case 'PUT':
        if (path.includes('update-character')) {
          return await updateCharacter(data, headers)
        } else if (path.includes('game-action')) {
          return await handleGameAction(data, headers)
        }
        break
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route not found' })
    }

  } catch (error) {
    console.error('Function error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  } finally {
    await client.end()
  }
}

// Create new game
const createGame = async (data, headers) => {
  const { gameName, playerName, role = 'dm' } = data
  
  try {
    // Generate unique room code
    let roomCode
    let attempts = 0
    do {
      roomCode = generateRoomCode()
      const existing = await client.query('SELECT id FROM games WHERE room_code = $1', [roomCode])
      if (existing.rows.length === 0) break
      attempts++
    } while (attempts < 10)

    // Create game
    const gameResult = await client.query(`
      INSERT INTO games (room_code, name, status) 
      VALUES ($1, $2, 'waiting') 
      RETURNING id, room_code, name, status
    `, [roomCode, gameName])

    const game = gameResult.rows[0]

    // Create DM player
    const playerResult = await client.query(`
      INSERT INTO players (game_id, name, role, is_connected, color) 
      VALUES ($1, $2, $3, true, '#ff6b6b') 
      RETURNING id, name, role, color
    `, [game.id, playerName, role])

    // Update game with DM
    await client.query('UPDATE games SET dm_player_id = $1 WHERE id = $2', [playerResult.rows[0].id, game.id])

    // Initialize game state
    await client.query(`
      INSERT INTO game_state (game_id, turn_order, current_character_id, round_number) 
      VALUES ($1, '[]', NULL, 1)
    `, [game.id])

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        roomCode: game.room_code,
        gameId: game.id,
        player: playerResult.rows[0]
      })
    }
  } catch (error) {
    console.error('Create game error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create game' })
    }
  }
}

// Join existing game
const joinGame = async (data, headers) => {
  const { roomCode, playerName, role = 'player' } = data
  
  try {
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

    // Create player
    const playerResult = await client.query(`
      INSERT INTO players (game_id, name, role, is_connected, color) 
      VALUES ($1, $2, $3, true, $4) 
      RETURNING id, name, role, color
    `, [game.id, playerName, role, availableColor])

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        gameId: game.id,
        player: playerResult.rows[0]
      })
    }
  } catch (error) {
    console.error('Join game error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to join game' })
    }
  }
}

// Get game data
const getGame = async (roomCode, headers) => {
  try {
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
      body: JSON.stringify({ error: 'Failed to get game data' })
    }
  }
}

// Create character
const createCharacter = async (data, headers) => {
  const { gameId, playerId, name, characterClass } = data
  
  try {
    // Get class stats
    const classResult = await client.query(`
      SELECT * FROM character_classes WHERE name = $1
    `, [characterClass])

    if (classResult.rows.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid character class' })
      }
    }

    const classData = classResult.rows[0]

    // Create character
    const characterResult = await client.query(`
      INSERT INTO characters (
        game_id, player_id, name, class, level,
        hp, max_hp, mp, max_mp, attack, defense, speed,
        grid_x, grid_y, facing
      ) VALUES ($1, $2, $3, $4, 1, $5, $5, $6, $6, $7, $8, $9, 0, 0, 'down')
      RETURNING *
    `, [
      gameId, playerId, name, characterClass,
      classData.base_hp, classData.base_mp, classData.base_attack,
      classData.base_defense, classData.base_speed
    ])

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        character: characterResult.rows[0]
      })
    }
  } catch (error) {
    console.error('Create character error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create character' })
    }
  }
}

// Update character (position, HP, etc.)
const updateCharacter = async (data, headers) => {
  const { characterId, updates } = data
  
  try {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ')
    const values = [characterId, ...Object.values(updates)]
    
    const result = await client.query(`
      UPDATE characters SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `, values)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        character: result.rows[0]
      })
    }
  } catch (error) {
    console.error('Update character error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to update character' })
    }
  }
}

// Handle game actions (move, attack, etc.)
const handleGameAction = async (data, headers) => {
  const { gameId, characterId, action, targetId, details } = data
  
  try {
    // Log the action
    await client.query(`
      INSERT INTO combat_log (game_id, character_id, action_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [gameId, characterId, action, targetId, JSON.stringify(details)])

    // Handle specific actions
    switch (action) {
      case 'move':
        await client.query(`
          UPDATE characters SET grid_x = $1, grid_y = $2, facing = $3, has_moved = true
          WHERE id = $4
        `, [details.x, details.y, details.facing, characterId])
        break

      case 'attack':
        if (targetId && details.damage) {
          await client.query(`
            UPDATE characters SET hp = GREATEST(0, hp - $1)
            WHERE id = $2
          `, [details.damage, targetId])
        }
        await client.query('UPDATE characters SET has_acted = true WHERE id = $1', [characterId])
        break
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    }
  } catch (error) {
    console.error('Handle action error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to handle action' })
    }
  }
}
