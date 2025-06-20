// src/components/Multiplayer/PlayerList.jsx
import React from 'react'
import { useGameStore } from '../../stores/gameStore'

const PlayerList = () => {
  const { players, currentPlayer } = useGameStore()
  
  // Demo players for testing
  const demoPlayers = [
    { id: 1, name: 'GameMaster', role: 'dm', isConnected: true, color: '#ff6b6b' },
    { id: 2, name: 'Alice', role: 'player', isConnected: true, color: '#4ecdc4' },
    { id: 3, name: 'Bob', role: 'player', isConnected: false, color: '#45b7d1' },
    { id: 4, name: 'Charlie', role: 'player', isConnected: true, color: '#96ceb4' }
  ]

  const playersToShow = players.length > 0 ? players : demoPlayers

  return (
    <div className="nes-container is-rounded bg-nes-blue">
      <h3 className="text-white font-pixel text-xs mb-3">Players ({playersToShow.length}/5)</h3>
      
      <div className="space-y-2">
        {playersToShow.map(player => (
          <div 
            key={player.id}
            className={`
              flex items-center gap-2 p-2 rounded
              ${player.id === currentPlayer?.id ? 'bg-white bg-opacity-20' : 'bg-black bg-opacity-20'}
            `}
          >
            {/* Connection Status */}
            <div 
              className={`w-2 h-2 rounded-full ${
                player.isConnected ? 'bg-green-400' : 'bg-red-400'
              }`}
              title={player.isConnected ? 'Connected' : 'Disconnected'}
            />
            
            {/* Player Color */}
            <div 
              className="w-3 h-3 rounded border border-white"
              style={{ backgroundColor: player.color }}
            />
            
            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <div className="text-white font-pixel text-xs truncate">
                {player.name}
                {player.id === currentPlayer?.id && ' (You)'}
              </div>
              <div className="text-gray-300 font-pixel text-xs">
                {player.role === 'dm' ? 'Dungeon Master' : 'Player'}
              </div>
            </div>
            
            {/* Role Badge */}
            <div className={`
              px-2 py-1 rounded text-xs font-pixel
              ${player.role === 'dm' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}
            `}>
              {player.role.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {/* Waiting for Players */}
      {playersToShow.length < 3 && (
        <div className="mt-3 p-2 bg-yellow-600 bg-opacity-20 rounded">
          <p className="text-yellow-200 font-pixel text-xs text-center">
            Waiting for more players...
          </p>
        </div>
      )}
    </div>
  )
}

export default PlayerList
