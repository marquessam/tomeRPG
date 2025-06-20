// src/components/CreateGameModal.jsx - Updated to use real API
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
      // Error is handled by the store
      console.error('Failed to create game:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="nes-container with-title is-rounded bg-nes-blue max-w-md w-full">
        <p className="title text-white font-pixel">Create New Game</p>
        
        {error && (
          <div className="nes-container is-error mb-4">
            <p className="text-red-200 font-pixel text-xs">{error}</p>
          </div>
        )}
        
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
