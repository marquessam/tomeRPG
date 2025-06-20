// src/components/Multiplayer/PlayerList.jsx - Updated with FF styling
import React from 'react'
import { useGameStore } from '../../stores/gameStore'

const PlayerList = () => {
  const { players, currentPlayer } = useGameStore()
  
  // Use actual players or demo data
  const demoPlayers = [
    { id: 1, name: 'GameMaster', role: 'dm', is_connected: true, color: '#ff6b6b' },
    { id: 2, name: 'Alice', role: 'player', is_connected: true, color: '#4ecdc4' },
    { id: 3, name: 'Bob', role: 'player', is_connected: false, color: '#45b7d1' },
  ]

  const playersToShow = players.length > 0 ? players : demoPlayers

  return (
    <div className="ff-window p-3">
      <div className="ff-stat-window mb-3">
        <div className="ff-stat-row">
          <span className="ff-stat-label">PARTY</span>
          <span className="ff-stat-value">{playersToShow.length}/5</span>
        </div>
      </div>
      
      <div className="space-y-2">
        {playersToShow.map(player => (
          <div 
            key={player.id}
            className={`ff-stat-window ${
              player.id === currentPlayer?.id ? 'border-yellow-400' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              {/* Connection Status */}
              <div 
                className={`w-2 h-2 rounded-full ${
                  player.is_connected ? 'bg-green-400' : 'bg-red-400'
                }`}
                title={player.is_connected ? 'Connected' : 'Disconnected'}
              />
              
              {/* Player Color */}
              <div 
                className="w-3 h-3 border border-white"
                style={{ backgroundColor: player.color }}
              />
              
              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <div className="ff-stat-row">
                  <span className="text-white font-pixel text-xs truncate">
                    {player.name}
                    {player.id === currentPlayer?.id && ' (YOU)'}
                  </span>
                </div>
                <div className="ff-stat-row">
                  <span className="ff-stat-label text-xs">
                    {player.role === 'dm' ? 'DM' : 'PLAYER'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Waiting Message */}
      {playersToShow.length < 3 && (
        <div className="ff-stat-window mt-3 bg-yellow-900 bg-opacity-30">
          <p className="text-yellow-200 font-pixel text-xs text-center text-ff-shadow">
            WAITING FOR PLAYERS...
          </p>
        </div>
      )}
    </div>
  )
}

export default PlayerList
