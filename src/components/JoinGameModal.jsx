// src/components/JoinGameModal.jsx - Updated to use real API
import React, { useState } from 'react'
import { useGameStore } from '../stores/gameStore'

const JoinGameModal = ({ onClose, onGameJoined }) => {
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const { joinGame, loading, error } = useGameStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!roomCode.trim() || !playerName.trim()) return

    try {
      await joinGame(roomCode.trim().toUpperCase(), playerName.trim())
      onGameJoined(roomCode.trim().toUpperCase())
    } catch (error) {
      // Error is handled by the store
      console.error('Failed to join game:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="nes-container with-title is-rounded bg-nes-blue max-w-md w-full">
        <p className="title text-white font-pixel">Join Game</p>
        
        {error && (
          <div className="nes-container is-error mb-4">
            <p className="text-red-200 font-pixel text-xs">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="nes-field">
            <label className="text-white font-pixel text-xs">Room Code:</label>
            <input 
              type="text" 
              className="nes-input font-pixel text-xs uppercase"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              required
              disabled={loading}
            />
          </div>

          <div className="nes-field">
            <label className="text-white font-pixel text-xs">Your Name:</label>
            <input 
              type="text" 
              className="nes-input font-pixel text-xs"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Hero Name"
              maxLength={20}
              required
              disabled={loading}
            />
          </div>

          <div className="flex gap-4">
            <button 
              type="submit" 
              className="nes-btn is-success font-pixel text-xs flex-1"
              disabled={loading}
            >
              {loading ? 'Joining...' : 'Join Game'}
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

export default JoinGameModal
