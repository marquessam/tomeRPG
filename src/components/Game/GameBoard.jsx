// src/components/Game/GameBoard.jsx - Enhanced with combat and powers
import React, { useState, useEffect } from 'react'
import GridOverlay from './GridOverlay'
import CharacterToken from './CharacterToken'
import PowerSelector from './PowerSelector'
import TargetSelector from './TargetSelector'
import { useGameStore } from '../../stores/gameStore'

const GameBoard = () => {
  const { characters, currentPlayer, gameState } = useGameStore()
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [selectedCell, setSelectedCell] = useState(null)
  const [gameMode, setGameMode] = useState('explore') // 'explore', 'move', 'target', 'aoe'
  const [selectedPower, setSelectedPower] = useState(null)
  const [validTargets, setValidTargets] = useState([])
  const [validMoves, setValidMoves] = useState([])
  const [aoePreview, setAoePreview] = useState([])

  // Get current player's character
  const playerCharacter = characters.find(char => char.player_id === currentPlayer?.id)

  useEffect(() => {
    // Auto-select player's character when it's their turn
    if (playerCharacter && gameState?.currentCharacterId === playerCharacter.id) {
      setSelectedCharacter(playerCharacter)
    }
  }, [playerCharacter, gameState])

  const handleCellClick = (x, y) => {
    setSelectedCell({ x, y })
    
    if (gameMode === 'move' && selectedCharacter) {
      handleMove(x, y)
    } else if (gameMode === 'target' && selectedPower) {
      handlePowerTarget(x, y)
    } else if (gameMode === 'aoe' && selectedPower) {
      handleAOETarget(x, y)
    }
  }

  const handleCharacterClick = (character) => {
    if (gameMode === 'target' && validTargets.includes(character.id)) {
      handlePowerTarget(character.grid_x, character.grid_y, character)
    } else {
      setSelectedCharacter(character)
      setGameMode('explore')
    }
  }

  const handleMove = (targetX, targetY) => {
    if (!selectedCharacter || !validMoves.find(cell => cell.x === targetX && cell.y === targetY)) {
      return
    }

    // Calculate facing direction
    const deltaX = targetX - selectedCharacter.grid_x
    const deltaY = targetY - selectedCharacter.grid_y
    let facing = selectedCharacter.facing

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      facing = deltaX > 0 ? 'right' : 'left'
    } else if (deltaY !== 0) {
      facing = deltaY > 0 ? 'down' : 'up'
    }

    // Move character
    moveCharacter(selectedCharacter.id, targetX, targetY, facing)
    setGameMode('explore')
    setValidMoves([])
  }

  const handlePowerUse = (power) => {
    if (!selectedCharacter) return

    setSelectedPower(power)
    
    if (power.attack_type === 'melee') {
      // Show adjacent cells as valid targets
      const targets = getAdjacentCells(selectedCharacter.grid_x, selectedCharacter.grid_y)
      setValidTargets(getCharactersInCells(targets))
      setGameMode('target')
    } else if (power.attack_type === 'ranged') {
      // Show all characters within range
      const targets = getCharactersInRange(selectedCharacter, power.range_value)
      setValidTargets(targets.map(char => char.id))
      setGameMode('target')
    } else if (power.area_type) {
      // AOE power - show targeting cursor
      setGameMode('aoe')
    }
  }

  const handlePowerTarget = (x, y, targetCharacter = null) => {
    if (!selectedPower || !selectedCharacter) return

    const damage = calculateDamage(selectedPower, selectedCharacter)
    
    if (targetCharacter) {
      // Direct character target
      attackCharacter(selectedCharacter.id, targetCharacter.id, damage)
    } else {
      // Area effect
      const affectedCharacters = getCharactersInArea(x, y, selectedPower)
      affectedCharacters.forEach(char => {
        if (char.id !== selectedCharacter.id) { // Don't hit self
          attackCharacter(selectedCharacter.id, char.id, damage)
        }
      })
    }

    // Reset targeting
    setSelectedPower(null)
    setGameMode('explore')
    setValidTargets([])
    setAoePreview([])
  }

  const handleAOETarget = (x, y) => {
    if (!selectedPower) return

    const affectedCells = getAOECells(x, y, selectedPower)
    setAoePreview(affectedCells)
    
    // Handle click to confirm AOE
    if (gameMode === 'aoe') {
      handlePowerTarget(x, y)
    }
  }

  const startMove = () => {
    if (!selectedCharacter) return
    
    const moves = getValidMoves(selectedCharacter)
    setValidMoves(moves)
    setGameMode('move')
  }

  const endTurn = () => {
    // TODO: Implement turn end logic
    setSelectedCharacter(null)
    setSelectedPower(null)
    setGameMode('explore')
    setValidMoves([])
    setValidTargets([])
    setAoePreview([])
  }

  // Helper functions
  const getAdjacentCells = (x, y) => {
    return [
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y - 1 },
      { x, y: y + 1 },
      { x: x - 1, y: y - 1 },
      { x: x + 1, y: y - 1 },
      { x: x - 1, y: y + 1 },
      { x: x + 1, y: y + 1 }
    ].filter(cell => cell.x >= 0 && cell.x < 20 && cell.y >= 0 && cell.y < 20)
  }

  const getCharactersInCells = (cells) => {
    return characters.filter(char => 
      cells.some(cell => cell.x === char.grid_x && cell.y === char.grid_y)
    ).map(char => char.id)
  }

  const getCharactersInRange = (fromCharacter, range) => {
    return characters.filter(char => {
      if (char.id === fromCharacter.id) return false
      const distance = Math.abs(char.grid_x - fromCharacter.grid_x) + 
                      Math.abs(char.grid_y - fromCharacter.grid_y)
      return distance <= range
    })
  }

  const getValidMoves = (character) => {
    const moves = []
    const speed = character.speed || 5
    
    for (let x = Math.max(0, character.grid_x - speed); x <= Math.min(19, character.grid_x + speed); x++) {
      for (let y = Math.max(0, character.grid_y - speed); y <= Math.min(19, character.grid_y + speed); y++) {
        const distance = Math.abs(x - character.grid_x) + Math.abs(y - character.grid_y)
        if (distance <= speed && !isOccupied(x, y)) {
          moves.push({ x, y })
        }
      }
    }
    
    return moves
  }

  const getAOECells = (centerX, centerY, power) => {
    const cells = []
    const size = power.area_size || 1
    
    if (power.area_type === 'burst') {
      // Square burst around center
      for (let x = centerX - size; x <= centerX + size; x++) {
        for (let y = centerY - size; y <= centerY + size; y++) {
          if (x >= 0 && x < 20 && y >= 0 && y < 20) {
            cells.push({ x, y })
          }
        }
      }
    } else if (power.area_type === 'blast') {
      // Line blast from caster to target
      // TODO: Implement line calculation
      cells.push({ x: centerX, y: centerY })
    }
    
    return cells
  }

  const getCharactersInArea = (centerX, centerY, power) => {
    const affectedCells = getAOECells(centerX, centerY, power)
    return characters.filter(char => 
      affectedCells.some(cell => cell.x === char.grid_x && cell.y === char.grid_y)
    )
  }

  const isOccupied = (x, y) => {
    return characters.some(char => char.grid_x === x && char.grid_y === y)
  }

  const calculateDamage = (power, caster) => {
    // Simple damage calculation - can be enhanced later
    const baseDamage = parseInt(power.damage_dice?.split('d')[1] || '6')
    const modifier = Math.floor(caster.attack / 2)
    return Math.floor(Math.random() * baseDamage) + 1 + modifier
  }

  // Mock functions - replace with actual game store calls
  const moveCharacter = (characterId, x, y, facing) => {
    console.log('Move character:', { characterId, x, y, facing })
  }

  const attackCharacter = (attackerId, targetId, damage) => {
    console.log('Attack character:', { attackerId, targetId, damage })
  }

  return (
    <div className="ff-window p-4 h-full overflow-auto">
      <div className="relative bg-gray-900 rounded-lg" style={{ aspectRatio: '1/1', maxHeight: '600px' }}>
        <GridOverlay 
          gridSize={20} 
          onCellClick={handleCellClick}
          selectedCell={selectedCell}
          validMoves={validMoves}
          validTargets={validTargets}
          aoePreview={aoePreview}
          gameMode={gameMode}
        />
        
        {characters.map(character => (
          <CharacterToken
            key={character.id}
            character={character}
            gridSize={20}
            isSelected={selectedCharacter?.id === character.id}
            isValidTarget={validTargets.includes(character.id)}
            onClick={() => handleCharacterClick(character)}
          />
        ))}

        {/* Mode indicator */}
        <div className="absolute top-2 left-2 ff-stat-window p-2">
          <div className="ff-stat-row">
            <span className="ff-stat-label">MODE</span>
            <span className="ff-stat-value text-xs">{gameMode.toUpperCase()}</span>
          </div>
          {selectedPower && (
            <div className="ff-stat-row">
              <span className="ff-stat-label">POWER</span>
              <span className="ff-stat-value text-xs">{selectedPower.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="mt-4 space-y-3">
        {/* Movement Controls */}
        <div className="ff-stat-window">
          <h4 className="ff-stat-label mb-2 text-center">MOVEMENT</h4>
          <div className="flex gap-2">
            <button 
              className={`ff-button flex-1 text-xs ${gameMode === 'move' ? 'ff-button-green' : ''}`}
              onClick={startMove}
              disabled={!selectedCharacter || selectedCharacter.has_moved}
            >
              MOVE
            </button>
            <button 
              className="ff-button text-xs"
              onClick={() => setGameMode('explore')}
            >
              CANCEL
            </button>
          </div>
        </div>

        {/* Power Controls */}
        {selectedCharacter && (
          <PowerSelector
            character={selectedCharacter}
            onPowerSelect={handlePowerUse}
            selectedPower={selectedPower}
            gameMode={gameMode}
          />
        )}

        {/* Turn Controls */}
        <div className="ff-stat-window">
          <h4 className="ff-stat-label mb-2 text-center">TURN</h4>
          <div className="flex gap-2">
            <button 
              className="ff-button ff-button-green flex-1"
              onClick={endTurn}
            >
              END TURN
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameBoard
