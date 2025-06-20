// src/components/GameRoom.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import GameBoard from './Game/GameBoard'
import DialoguePopup from './UI/DialoguePopup'
import PlayerList from './Multiplayer/PlayerList'
import { useGameStore } from '../stores/gameStore'

const GameRoom = () => {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const { gameState, currentPlayer, loadGame, isConnected } = useGameStore()
  const [showDialogue, setShowDialogue] = useState(false)

  useEffect(() => {
    if (!roomCode) {
      navigate('/')
      return
    }

    // Load game data
    loadGame(roomCode)
  }, [roomCode, navigate, loadGame])

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="nes-container is-rounded bg-nes-blue">
          <p className="text-white font-pixel">Connecting to game...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-screen">
        {/* Main Game Area */}
        <div className="lg:col-span-3 space-y-4">
          <div className="nes-container is-rounded bg-nes-blue p-2">
            <div className="flex justify-between items-center text-white font-pixel text-xs">
              <span>Room: {roomCode}</span>
              <span>Turn: {gameState?.currentTurn || 1}</span>
              <button 
                className="nes-btn is-error text-xs"
                onClick={() => navigate('/')}
              >
                Leave Game
              </button>
            </div>
          </div>
          
          <GameBoard />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <PlayerList />
          
          <div className="nes-container is-rounded bg-nes-blue">
            <div className="text-white font-pixel text-xs space-y-2">
              <h3 className="mb-2">Quick Actions</h3>
              <button 
                className="nes-btn is-warning w-full text-xs mb-2"
                onClick={() => setShowDialogue(true)}
              >
                Speak
              </button>
              <button className="nes-btn w-full text-xs mb-2">
                End Turn
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDialogue && (
        <DialoguePopup 
          onClose={() => setShowDialogue(false)}
          character={currentPlayer?.character}
        />
      )}
    </div>
  )
}

export default GameRoom
