// src/components/GameRoom.jsx - Enhanced with character creation flow
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import GameBoard from './Game/GameBoard'
import DialoguePopup from './UI/DialoguePopup'
import PlayerList from './Multiplayer/PlayerList'
import CharacterSheet from './UI/CharacterSheet'
import CharacterCreationModal from './CharacterCreationModal'
import MonsterManagement from './Game/MonsterManagement'
import CharacterInventory from './UI/CharacterInventory'
import DiceRoller from './Game/DiceRoller'
import { useGameStore } from '../stores/gameStore'

const GameRoom = () => {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const { 
    gameState, 
    currentPlayer, 
    characters, 
    loadGame, 
    spawnMonster,
    isConnected, 
    loading, 
    error 
  } = useGameStore()
  
  const [showDialogue, setShowDialogue] = useState(false)
  const [showCharacterSheet, setShowCharacterSheet] = useState(false)
  const [showCharacterCreation, setShowCharacterCreation] = useState(false)
  const [showMonsterManagement, setShowMonsterManagement] = useState(false)
  const [showDiceRoller, setShowDiceRoller] = useState(false)
  const [showInventory, setShowInventory] = useState(false)

  // Check if current player has a character
  const playerCharacter = characters.find(char => char.player_id === currentPlayer?.id)
  const needsCharacter = currentPlayer && !playerCharacter && currentPlayer.role !== 'dm'

  useEffect(() => {
    if (!roomCode) {
      navigate('/')
      return
    }
    loadGame(roomCode)
  }, [roomCode, navigate, loadGame])

  // Auto-show character creation for new players
  useEffect(() => {
    if (needsCharacter && !showCharacterCreation) {
      setShowCharacterCreation(true)
    }
  }, [needsCharacter, showCharacterCreation])

  const handleLeaveGame = () => {
    navigate('/')
  }

  const handleCharacterCreated = (character) => {
    setShowCharacterCreation(false)
    console.log('Character created:', character)
  }

  const handleSpawnMonster = (monster) => {
    spawnMonster(monster)
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
            <h3 className="ff-stat-label mb-4 text-red-400">CONNECTION ERROR</h3>
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
              <div className="flex items-center gap-4">
                <div className="ff-stat-row">
                  <span className="ff-stat-label">ROOM</span>
                  <span className="ff-stat-value">{roomCode}</span>
                </div>
                <div className="ff-stat-row">
                  <span className="ff-stat-label">TURN</span>
                  <span className="ff-stat-value">{gameState?.currentTurn || 1}</span>
                </div>
                <div className="ff-stat-row">
                  <span className="ff-stat-label">PHASE</span>
                  <span className="ff-stat-value">{gameState?.phase?.toUpperCase() || 'SETUP'}</span>
                </div>
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
          
          {/* Character Status */}
          {playerCharacter ? (
            <div className="ff-window p-3">
              <div className="ff-stat-window mb-3">
                <h3 className="ff-stat-label text-center">YOUR CHARACTER</h3>
              </div>
              
              <div className="space-y-2">
                <div className="ff-stat-row">
                  <span className="ff-stat-label">NAME</span>
                  <span className="ff-stat-value text-xs">{playerCharacter.name}</span>
                </div>
                <div className="ff-stat-row">
                  <span className="ff-stat-label">CLASS</span>
                  <span className="ff-stat-value text-xs">{playerCharacter.class?.toUpperCase()}</span>
                </div>
                <div className="ff-stat-row">
                  <span className="ff-stat-label">HP</span>
                  <span className="ff-stat-value text-xs">
                    {playerCharacter.hp}/{playerCharacter.max_hp}
                  </span>
                </div>
                <div className="ff-stat-row">
                  <span className="ff-stat-label">MP</span>
                  <span className="ff-stat-value text-xs">
                    {playerCharacter.mp}/{playerCharacter.max_mp}
                  </span>
                </div>
              </div>
            </div>
          ) : needsCharacter && (
            <div className="ff-window p-3">
              <div className="ff-stat-window text-center">
                <h3 className="ff-stat-label mb-3">NO CHARACTER</h3>
                <p className="text-white font-pixel text-xs text-ff-shadow mb-3">
                  Create your character to join the adventure
                </p>
                <button 
                  className="ff-button ff-button-green w-full"
                  onClick={() => setShowCharacterCreation(true)}
                >
                  CREATE CHARACTER
                </button>
              </div>
            </div>
          )}
          
          {/* Action Menu */}
          <div className="ff-window p-3">
            <div className="ff-stat-window mb-3">
              <h3 className="ff-stat-label text-center">ACTIONS</h3>
            </div>
            
            <div className="space-y-2">
              <button 
                className="ff-button w-full text-xs"
                onClick={() => setShowDialogue(true)}
                disabled={!playerCharacter}
              >
                SPEAK
              </button>
              <button 
                className="ff-button w-full text-xs"
                onClick={() => setShowCharacterSheet(true)}
                disabled={!playerCharacter}
              >
                CHARACTER
              </button>
              <button 
                className="ff-button w-full text-xs"
                onClick={() => setShowInventory(true)}
                disabled={!playerCharacter}
              >
                INVENTORY
              </button>
              {currentPlayer?.role === 'dm' && (
                <>
                  <button 
                    className="ff-button w-full text-xs"
                    onClick={() => setShowMonsterManagement(true)}
                  >
                    MONSTERS
                  </button>
                  <button 
                    className="ff-button w-full text-xs"
                    onClick={() => setShowDiceRoller(true)}
                  >
                    DICE ROLLER
                  </button>
                </>
              )}
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
                {playerCharacter && (
                  <div className="ff-stat-row">
                    <span className="ff-stat-label">CHARACTER</span>
                    <span className="ff-stat-value text-xs">{playerCharacter.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Game Status */}
          <div className="ff-window p-3">
            <div className="ff-stat-window">
              <div className="ff-stat-row">
                <span className="ff-stat-label">CHARACTERS</span>
                <span className="ff-stat-value">{characters.filter(c => !c.is_npc).length}</span>
              </div>
              <div className="ff-stat-row">
                <span className="ff-stat-label">MONSTERS</span>
                <span className="ff-stat-value">{characters.filter(c => c.is_npc).length}</span>
              </div>
              <div className="ff-stat-row">
                <span className="ff-stat-label">STATUS</span>
                <span className="ff-stat-value text-xs">
                  {gameState?.status?.toUpperCase() || 'ACTIVE'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDialogue && (
        <DialoguePopup 
          onClose={() => setShowDialogue(false)}
          character={playerCharacter}
        />
      )}

      {showCharacterSheet && (
        <CharacterSheet 
          onClose={() => setShowCharacterSheet(false)}
        />
      )}

      {(showCharacterCreation || needsCharacter) && (
        <CharacterCreationModal 
          onClose={() => !needsCharacter && setShowCharacterCreation(false)}
          onCharacterCreated={handleCharacterCreated}
        />
      )}

      {showMonsterManagement && (
        <MonsterManagement 
          onClose={() => setShowMonsterManagement(false)}
          onSpawnMonster={handleSpawnMonster}
        />
      )}

      {showDiceRoller && (
        <DiceRoller 
          onClose={() => setShowDiceRoller(false)}
        />
      )}

      {showInventory && (
        <CharacterInventory 
          onClose={() => setShowInventory(false)}
        />
      )}
    </div>
  )
}

export default GameRoom
