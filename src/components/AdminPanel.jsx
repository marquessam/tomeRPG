
// src/components/AdminPanel.jsx - Database management component
import React, { useState } from 'react'

const AdminPanel = ({ onClose }) => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const setupDatabase = async (force = false) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/.netlify/functions/setup-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Setup failed')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resetDatabase = async () => {
    if (!confirm('This will delete all game data. Are you sure?')) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/.netlify/functions/reset-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Reset failed')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testDatabase = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/.netlify/functions/test-db')
      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Test failed')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="ff-dialogue-box max-w-2xl w-full p-6">
        <div className="ff-stat-window mb-4">
          <div className="flex justify-between items-center">
            <h2 className="ff-stat-label">DATABASE ADMIN</h2>
            <button 
              className="ff-button ff-button-red text-xs"
              onClick={onClose}
            >
              CLOSE
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Test Database */}
          <div className="ff-stat-window text-center">
            <h3 className="ff-stat-label mb-3">TEST CONNECTION</h3>
            <button 
              className="ff-button w-full"
              onClick={testDatabase}
              disabled={loading}
            >
              TEST DB
            </button>
            <p className="text-white font-pixel text-xs mt-2 text-ff-shadow">
              Check database status
            </p>
          </div>

          {/* Setup Database */}
          <div className="ff-stat-window text-center">
            <h3 className="ff-stat-label mb-3">SETUP SCHEMA</h3>
            <button 
              className="ff-button ff-button-green w-full mb-2"
              onClick={() => setupDatabase(false)}
              disabled={loading}
            >
              SETUP
            </button>
            <button 
              className="ff-button ff-button-red w-full text-xs"
              onClick={() => setupDatabase(true)}
              disabled={loading}
            >
              FORCE RESET
            </button>
            <p className="text-white font-pixel text-xs mt-2 text-ff-shadow">
              Create correct tables
            </p>
          </div>

          {/* Reset Data */}
          <div className="ff-stat-window text-center">
            <h3 className="ff-stat-label mb-3">CLEAR DATA</h3>
            <button 
              className="ff-button ff-button-red w-full"
              onClick={resetDatabase}
              disabled={loading}
            >
              CLEAR ALL
            </button>
            <p className="text-white font-pixel text-xs mt-2 text-ff-shadow">
              Delete all games/players
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="ff-stat-window text-center mb-4">
            <p className="text-yellow-400 font-pixel text-xs text-ff-shadow">
              PROCESSING...
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="ff-window-dark p-4 mb-4">
            <h3 className="text-red-400 font-pixel text-xs mb-2">ERROR:</h3>
            <p className="text-white font-pixel text-xs text-ff-shadow break-all">
              {error}
            </p>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="ff-window-dark p-4 max-h-64 overflow-auto">
            <h3 className="text-green-400 font-pixel text-xs mb-2">RESULT:</h3>
            <pre className="text-white font-pixel text-xs text-ff-shadow whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Instructions */}
        <div className="ff-stat-window mt-4">
          <h3 className="ff-stat-label mb-2">INSTRUCTIONS</h3>
          <div className="text-white font-pixel text-xs space-y-1 text-ff-shadow">
            <p>• TEST DB: Check if database is connected</p>
            <p>• SETUP: Create TomeRPG tables (safe)</p>
            <p>• FORCE RESET: Delete everything and recreate</p>
            <p>• CLEAR ALL: Keep tables, delete game data</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
