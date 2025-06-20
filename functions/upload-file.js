// functions/upload-file.js - Handle image uploads for sprites and portraits
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
    console.log('Processing file upload...')

    // Parse multipart form data (simplified - in production use a proper multipart parser)
    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || ''
    
    if (!contentType.includes('multipart/form-data')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Content-Type must be multipart/form-data' })
      }
    }

    // For now, expect base64 encoded file data in JSON body (simplified approach)
    const { fileName, fileData, fileType, uploadedBy } = JSON.parse(event.body || '{}')
    
    if (!fileName || !fileData || !fileType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing file data, name, or type' })
      }
    }

    // Validate file type
    if (!fileType.startsWith('image/')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Only image files are allowed' })
      }
    }

    // Validate file size (base64 adds ~33% overhead)
    const fileSizeBytes = (fileData.length * 3) / 4
    const maxSizeBytes = 2 * 1024 * 1024 // 2MB limit
    
    if (fileSizeBytes > maxSizeBytes) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'File too large. Maximum size is 2MB.' })
      }
    }

    console.log('Connecting to database...')
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
    
    await client.connect()

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(fileData, 'base64')

    // Insert file into database
    const result = await client.query(`
      INSERT INTO uploaded_files (filename, original_name, file_type, file_size, file_data, uploaded_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, filename, file_type, file_size, created_at
    `, [
      fileName,
      fileName,
      fileType,
      fileBuffer.length,
      fileBuffer,
      uploadedBy || null
    ])

    const uploadedFile = result.rows[0]
    console.log('File uploaded successfully:', uploadedFile.id)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        file: {
          id: uploadedFile.id,
          filename: uploadedFile.filename,
          fileType: uploadedFile.file_type,
          fileSize: uploadedFile.file_size,
          createdAt: uploadedFile.created_at
        }
      })
    }

  } catch (error) {
    console.error('File upload error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to upload file',
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
