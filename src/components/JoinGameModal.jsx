// src/components/JoinGameModal.jsx - Updated with FF styling
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
      console.error('Failed to join game:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="ff-dialogue-box max-w-md w-full p-6">
        <div className="ff-stat-window mb-4">
          <h2 className="ff-stat-label text-center">JOIN GAME</h2>
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
              <span className="ff-stat-label">ROOM CODE</span>
            </div>
            <input 
              type="text" 
              className="ff-input w-full uppercase text-center"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              required
              disabled={loading}
            />
          </div>

          <div className="ff-stat-window">
            <div className="ff-stat-row mb-2">
              <span className="ff-stat-label">PLAYER NAME</span>
            </div>
            <input 
              type="text" 
              className="ff-input w-full"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="HERO NAME"
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
              {loading ? 'JOINING...' : 'JOIN'}
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

export default JoinGameModal
