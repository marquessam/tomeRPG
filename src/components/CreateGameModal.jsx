// src/components/CreateGameModal.jsx - Updated with FF styling
import React, { useState } from 'react'
import { useGameStore } from '../stores/gameStore'

const CreateGameModal = ({ onClose, onGameCreated }) => {
  const [gameName, setGameName] = useState('')
  const [playerName, setPlayerName] = useState('')
  const { createGame, loading, error } = useGameStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!gameName.trim() || !playerName.trim()) return

    try {
      const roomCode = await createGame(gameName.trim(), playerName.trim())
      onGameCreated(roomCode)
    } catch (error) {
      console.error('Failed to create game:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="ff-dialogue-box max-w-md w-full p-6">
        <div className="ff-stat-window mb-4">
          <h2 className="ff-stat-label text-center">CREATE NEW GAME</h2>
        </div>
        
        {error && (
          <div className="ff-window-dark p-3 mb-4">
            <p className="text-red-400 font-pixel text-xs text-ff-shadow text-center">
              ERROR: {error}
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="ff-stat-window">
            <div className="ff-stat-row mb-2">
              <span className="ff-stat-label">GAME NAME</span>
            </div>
            <input 
              type="text" 
              className="ff-input w-full"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="MY EPIC ADVENTURE"
              maxLength={50}
              required
              disabled={loading}
            />
          </div>

          <div className="ff-stat-window">
            <div className="ff-stat-row mb-2">
              <span className="ff-stat-label">DM NAME</span>
            </div>
            <input 
              type="text" 
              className="ff-input w-full"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="DUNGEON MASTER"
              maxLength={20}
              required
              disabled={loading}
            />
          </div>

          <div className="flex gap-4">
            <button 
              type="submit" 
              className="ff-button ff-button-green flex-1 h-12"
              disabled={loading}
            >
              {loading ? 'CREATING...' : 'CREATE'}
            </button>
            <button 
              type="button"
              className="ff-button ff-button-red h-12 px-6"
              onClick={onClose}
              disabled={loading}
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateGameModal
