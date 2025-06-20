// src/components/GameRoom.jsx - Updated with FF styling
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import GameBoard from './Game/GameBoard'
import DialoguePopup from './UI/DialoguePopup'
import PlayerList from './Multiplayer/PlayerList'
import CharacterSheet from './UI/CharacterSheet'
import { useGameStore } from '../stores/gameStore'

const GameRoom = () => {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const { gameState, currentPlayer, loadGame, isConnected, loading, error } = useGameStore()
  const [showDialogue, setShowDialogue] = useState(false)
  const [showCharacterSheet, setShowCharacterSheet] = useState(false)

  useEffect(() => {
    if (!roomCode) {
      navigate('/')
      return
    }
    loadGame(roomCode)
  }, [roomCode, navigate, loadGame])

  const handleLeaveGame = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="ff-dialogue-box p-6">
          <div className="ff-stat-window text-center">
            <h3 className="ff-stat-label mb-4">CONNECTING</h3>
            <p className="text-white font-pixel text-xs text-ff-shadow">
              Loading game data...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="ff-dialogue-box p-6">
          <div className="ff-stat-window text-center">
            <h3 className="ff-stat-label mb-4 text-red-400">ERROR</h3>
            <p className="text-white font-pixel text-xs text-ff-shadow mb-4">
              {error}
            </p>
            <button 
              className="ff-button ff-button-red"
              onClick={handleLeaveGame}
            >
              RETURN HOME
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="ff-dialogue-box p-6">
          <div className="ff-stat-window text-center">
            <h3 className="ff-stat-label mb-4">CONNECTING</h3>
            <p className="text-white font-pixel text-xs text-ff-shadow">
              Establishing connection...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-2">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 h-screen">
        {/* Main Game Area */}
        <div className="lg:col-span-3 space-y-2">
          {/* Header */}
          <div className="ff-window p-3">
            <div className="flex justify-between items-center">
              <div className="ff-stat-row">
                <span className="ff-stat-label">ROOM</span>
                <span className="ff-stat-value">{roomCode}</span>
              </div>
              <div className="ff-stat-row">
                <span className="ff-stat-label">TURN</span>
                <span className="ff-stat-value">{gameState?.currentTurn || 1}</span>
              </div>
              <button 
                className="ff-button ff-button-red text-xs"
                onClick={handleLeaveGame}
              >
                EXIT
              </button>
            </div>
          </div>
          
          {/* Game Board */}
          <GameBoard />
        </div>

        {/* Sidebar */}
        <div className="space-y-2">
          {/* Player List */}
          <PlayerList />
          
          {/* Action Menu */}
          <div className="ff-window p-3">
            <div className="ff-stat-window mb-3">
              <h3 className="ff-stat-label text-center">ACTIONS</h3>
            </div>
            
            <div className="space-y-2">
              <button 
                className="ff-button w-full text-xs"
                onClick={() => setShowDialogue(true)}
              >
                SPEAK
              </button>
              <button 
                className="ff-button w-full text-xs"
                onClick={() => setShowCharacterSheet(true)}
              >
                CHARACTER
              </button>
              <button className="ff-button w-full text-xs">
                INVENTORY
              </button>
              <button className="ff-button ff-button-green w-full text-xs">
                END TURN
              </button>
            </div>
          </div>

          {/* Current Player Info */}
          {currentPlayer && (
            <div className="ff-window p-3">
              <div className="ff-stat-window">
                <div className="ff-stat-row">
                  <span className="ff-stat-label">PLAYER</span>
                </div>
                <div className="ff-stat-row">
                  <span className="text-white font-pixel text-xs">{currentPlayer.name}</span>
                </div>
                <div className="ff-stat-row">
                  <span className="ff-stat-label">ROLE</span>
                  <span className="ff-stat-value">{currentPlayer.role.toUpperCase()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showDialogue && (
        <DialoguePopup 
          onClose={() => setShowDialogue(false)}
          character={currentPlayer?.character}
        />
      )}

      {showCharacterSheet && (
        <CharacterSheet 
          onClose={() => setShowCharacterSheet(false)}
        />
      )}
    </div>
  )
}

export default GameRoom
