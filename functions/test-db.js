// functions/test-db.js - Fixed CommonJS version
const { Client } = require('pg')

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  let client
  try {
    console.log('Testing database connection...')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0)
    console.log('NODE_ENV:', process.env.NODE_ENV)
    
    if (!process.env.DATABASE_URL) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'DATABASE_URL environment variable not set',
          environment: process.env.NODE_ENV || 'development'
        })
      }
    }
    
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
    
    console.log('Attempting to connect...')
    await client.connect()
    console.log('Connected successfully!')
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version')
    console.log('Query result:', result.rows[0])
    
    // Test if our tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    
    const tables = tablesResult.rows.map(row => row.table_name)
    console.log('Available tables:', tables)
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Database connection successful',
        timestamp: result.rows[0].current_time,
        version: result.rows[0].postgres_version,
        tables: tables,
        environment: process.env.NODE_ENV || 'development',
        hasRequiredTables: tables.includes('games') && tables.includes('players')
      })
    }
  } catch (error) {
    console.error('Database test error:', error)
    console.error('Error stack:', error.stack)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Database test failed',
        details: error.message,
        stack: error.stack,
        environment: process.env.NODE_ENV || 'development'
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
