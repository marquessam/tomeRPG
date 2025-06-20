// src/components/JoinGameModal.jsx
import React, { useState } from 'react'

const JoinGameModal = ({ onClose, onGameJoined }) => {
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!roomCode.trim() || !playerName.trim()) return

    setLoading(true)
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`${import.meta.env.VITE_API_URL}/join-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roomCode: roomCode.trim().toUpperCase(), 
          playerName: playerName.trim(),
          role: 'player'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        onGameJoined(roomCode.trim().toUpperCase())
      }
    } catch (error) {
      console.error('Failed to join game:', error)
      // For now, simulate success for development
      onGameJoined(roomCode.trim().toUpperCase())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="nes-container with-title is-rounded bg-nes-blue max-w-md w-full">
        <p className="title text-white font-pixel">Join Game</p>
        
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
