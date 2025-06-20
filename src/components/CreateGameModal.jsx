// src/components/CreateGameModal.jsx
import React, { useState } from 'react'

const CreateGameModal = ({ onClose, onGameCreated }) => {
  const [gameName, setGameName] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!gameName.trim() || !playerName.trim()) return

    setLoading(true)
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`${import.meta.env.VITE_API_URL}/create-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          gameName: gameName.trim(), 
          playerName: playerName.trim(),
          role: 'dm' 
        })
      })
      
      const data = await response.json()
      if (data.roomCode) {
        onGameCreated(data.roomCode)
      }
    } catch (error) {
      console.error('Failed to create game:', error)
      // For now, simulate success for development
      const mockRoomCode = 'DEMO' + Math.floor(Math.random() * 100)
      onGameCreated(mockRoomCode)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="nes-container with-title is-rounded bg-nes-blue max-w-md w-full">
        <p className="title text-white font-pixel">Create New Game</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="nes-field">
            <label className="text-white font-pixel text-xs">Game Name:</label>
            <input 
              type="text" 
              className="nes-input font-pixel text-xs"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="My Epic Adventure"
              maxLength={50}
              required
            />
          </div>

          <div className="nes-field">
            <label className="text-white font-pixel text-xs">Your Name (DM):</label>
            <input 
              type="text" 
              className="nes-input font-pixel text-xs"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Dungeon Master"
              maxLength={20}
              required
            />
          </div>

          <div className="flex gap-4">
            <button 
              type="submit" 
              className="nes-btn is-primary font-pixel text-xs flex-1"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Game'}
            </button>
            <button 
              type="button"
              className="nes-btn font-pixel text-xs"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateGameModal
