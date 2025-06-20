// functions/get-file.js - Serve uploaded images
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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  let client
  try {
    // Extract file ID from path
    const fileId = event.path.split('/').pop()
    
    if (!fileId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'File ID required' })
      }
    }

    console.log('Fetching file:', fileId)

    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
    
    await client.connect()

    // Get file from database
    const result = await client.query(`
      SELECT file_data, file_type, filename
      FROM uploaded_files 
      WHERE id = $1
    `, [fileId])

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'File not found' })
      }
    }

    const file = result.rows[0]
    console.log('File found:', file.filename, file.file_type)

    // Return the image with appropriate headers
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': file.file_type,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Content-Disposition': `inline; filename="${file.filename}"`
      },
      body: file.file_data.toString('base64'),
      isBase64Encoded: true
    }

  } catch (error) {
    console.error('Get file error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to retrieve file',
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
