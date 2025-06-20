// functions/create-character.js - Enhanced character creation with powers
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
    const { 
      gameId, 
      playerId, 
      name, 
      characterClass, 
      selectedPowers = [],
      portraitFileId = null,
      spriteFileId = null 
    } = JSON.parse(event.body || '{}')
    
    console.log('Creating character:', { gameId, playerId, name, characterClass, selectedPowers })
    
    if (!gameId || !playerId || !name || !characterClass) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required character data' })
      }
    }

    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
    
    await client.connect()

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
    console.log('Class data:', classData)

    // Find empty starting position
    const existingCharacters = await client.query(`
      SELECT grid_x, grid_y FROM characters WHERE game_id = $1
    `, [gameId])

    let startX = 5, startY = 5
    const occupied = new Set(existingCharacters.rows.map(char => `${char.grid_x},${char.grid_y}`))
    
    // Find first unoccupied spot in a 5x5 starting area
    for (let y = 3; y <= 7; y++) {
      for (let x = 3; x <= 7; x++) {
        if (!occupied.has(`${x},${y}`)) {
          startX = x
          startY = y
          break
        }
      }
      if (startX !== 5 || startY !== 5) break
    }

    // Start transaction
    await client.query('BEGIN')

    try {
      // Create character
      const characterResult = await client.query(`
        INSERT INTO characters (
          game_id, player_id, name, class, level,
          hp, max_hp, mp, max_mp, attack, defense, speed,
          grid_x, grid_y, facing, is_npc,
          portrait_file_id, sprite_file_id
        ) VALUES ($1, $2, $3, $4, 1, $5, $5, $6, $6, $7, $8, $9, $10, $11, 'down', false, $12, $13)
        RETURNING *
      `, [
        gameId, playerId, name, characterClass,
        classData.base_hp, classData.base_mp, 
        classData.base_attack, classData.base_defense, classData.base_speed,
        startX, startY, portraitFileId, spriteFileId
      ])

      const character = characterResult.rows[0]
      console.log('Character created:', character.id)

      // Add selected powers to character
      if (selectedPowers.length > 0) {
        // First, get the actual power IDs from the database
        const powerNames = selectedPowers.map(p => p.name)
        const powersResult = await client.query(`
          SELECT id, name, power_type FROM powers 
          WHERE name = ANY($1) AND class_name = $2
        `, [powerNames, characterClass])

        console.log('Found powers:', powersResult.rows)

        // Insert character-power relationships
        for (const power of powersResult.rows) {
          const usesRemaining = power.power_type === 'at_will' ? null : 1
          
          await client.query(`
            INSERT INTO character_powers (character_id, power_id, uses_remaining)
            VALUES ($1, $2, $3)
          `, [character.id, power.id, usesRemaining])
        }

        console.log('Added powers to character')
      }

      // Give starting equipment based on class
      const startingItems = {
        fighter: ['Iron Sword', 'Steel Shield', 'Leather Armor'],
        wizard: ['Wizard Staff', 'Health Potion'],
        rogue: ['Magic Dagger', 'Leather Armor', 'Health Potion'],
        cleric: ['Iron Sword', 'Steel Shield', 'Health Potion']
      }

      const itemsForClass = startingItems[characterClass] || []
      
      if (itemsForClass.length > 0) {
        const itemsResult = await client.query(`
          SELECT id, name, item_type, slot FROM items 
          WHERE name = ANY($1)
        `, [itemsForClass])

        console.log('Found starting items:', itemsResult.rows)

        for (const item of itemsResult.rows) {
          // Auto-equip armor and weapons
          const isEquipped = ['weapon', 'armor'].includes(item.item_type)
          
          await client.query(`
            INSERT INTO character_items (character_id, item_id, quantity, is_equipped)
            VALUES ($1, $2, 1, $3)
          `, [character.id, item.id, isEquipped])
        }

        console.log('Added starting equipment')
      }

      // Commit transaction
      await client.query('COMMIT')

      // Get the complete character with powers and items
      const completeCharacterResult = await client.query(`
        SELECT 
          c.*,
          cc.display_name as class_display_name,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', p.id,
                'name', p.name,
                'power_type', p.power_type,
                'action_type', p.action_type,
                'attack_type', p.attack_type,
                'range_value', p.range_value,
                'damage_dice', p.damage_dice,
                'description', p.description,
                'uses_remaining', cp.uses_remaining
              )
            ) FILTER (WHERE p.id IS NOT NULL), 
            '[]'
          ) as powers,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', i.id,
                'name', i.name,
                'item_type', i.item_type,
                'slot', i.slot,
                'is_equipped', ci.is_equipped,
                'quantity', ci.quantity
              )
            ) FILTER (WHERE i.id IS NOT NULL),
            '[]'
          ) as items
        FROM characters c
        LEFT JOIN character_classes cc ON c.class = cc.name
        LEFT JOIN character_powers cp ON c.id = cp.character_id
        LEFT JOIN powers p ON cp.power_id = p.id
        LEFT JOIN character_items ci ON c.id = ci.character_id
        LEFT JOIN items i ON ci.item_id = i.id
        WHERE c.id = $1
        GROUP BY c.id, cc.display_name
      `, [character.id])

      const completeCharacter = completeCharacterResult.rows[0]

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          character: completeCharacter
        })
      }

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    }

  } catch (error) {
    console.error('Create character error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to create character',
        details: error.message
      })
    }
  } finally {
    if (client) {
      try {
        await client.end()
      } catch (closeError) {
        console.error('Error closing connection:', closeError)
      }
    }
  }
}
