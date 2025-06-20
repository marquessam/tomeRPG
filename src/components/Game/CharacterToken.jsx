// src/components/Game/CharacterToken.jsx - Enhanced with combat states
import React from 'react'

const CharacterToken = ({ 
  character, 
  gridSize, 
  onClick, 
  isSelected = false,
  isValidTarget = false,
  showDetails = true
}) => {
  const cellSize = 100 / gridSize // percentage
  
  const getCharacterColor = (characterClass, isNPC = false) => {
    if (isNPC || character.monster_id) {
      return 'bg-red-600' // Enemies are red
    }
    
    switch (characterClass) {
      case 'fighter': return 'bg-blue-600'
      case 'wizard': return 'bg-purple-600'
      case 'rogue': return 'bg-green-600'
      case 'cleric': return 'bg-yellow-600'
      case 'enemy': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  const getFacingIndicator = (facing) => {
    switch (facing) {
      case 'up': return '▲'
      case 'down': return '▼'
      case 'left': return '◄'
      case 'right': return '►'
      default: return '●'
    }
  }

  const getStatusIcon = () => {
    if (character.hp <= 0) return '💀'
    if (character.hp <= character.max_hp * 0.25) return '🩸'
    if (character.status_effects?.includes('poisoned')) return '🤢'
    if (character.status_effects?.includes('stunned')) return '😵'
    if (character.status_effects?.includes('blessed')) return '✨'
    return null
  }

  const hpPercentage = Math.max(0, (character.hp / character.max_hp) * 100)
  const mpPercentage = Math.max(0, (character.mp / character.max_mp) * 100)

  // Determine token styling based on state
  let tokenClass = `
    w-full h-full rounded-full border-2 border-white 
    flex items-center justify-center text-white font-bold text-xs
    shadow-lg transition-all duration-300 cursor-pointer
    ${getCharacterColor(character.class, character.is_npc)}
  `
  
  let containerClass = `
    absolute character-token transform -translate-x-1/2 -translate-y-1/2 z-10
    transition-all duration-300
  `

  // Selected character styling
  if (isSelected) {
    tokenClass += ' border-yellow-400 shadow-yellow-400/50'
    containerClass += ' scale-110'
  }

  // Valid target styling
  if (isValidTarget) {
    tokenClass += ' border-red-400 shadow-red-400/50 animate-pulse'
    containerClass += ' cursor-crosshair'
  }

  // Dead character styling
  if (character.hp <= 0) {
    tokenClass += ' grayscale opacity-75'
  }

  // Action state styling
  if (character.has_acted && character.has_moved) {
    tokenClass += ' opacity-60'
  } else if (character.has_acted) {
    tokenClass += ' opacity-80'
  } else if (character.has_moved) {
    tokenClass += ' opacity-80'
  }

  const statusIcon = getStatusIcon()

  return (
    <div
      className={containerClass}
      style={{
        left: `${(character.grid_x + 0.5) * cellSize}%`,
        top: `${(character.grid_y + 0.5) * cellSize}%`,
        width: `${cellSize * 0.8}%`,
        height: `${cellSize * 0.8}%`,
      }}
      onClick={onClick}
    >
      {/* Character Circle */}
      <div className={tokenClass}>
        {/* Character sprite or facing indicator */}
        {character.sprite_file_id ? (
          <img 
            src={`/.netlify/functions/get-file/${character.sprite_file_id}`} 
            alt={character.name}
            className="w-full h-full object-cover rounded-full pixel-perfect"
            onError={(e) => {
              // Fallback to facing indicator if image fails to load
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'inline'
            }}
          />
        ) : null}
        <span className={`text-lg ${character.sprite_file_id ? 'hidden' : 'inline'}`}>
          {getFacingIndicator(character.facing)}
        </span>
        
        {/* Status effect overlay */}
        {statusIcon && (
          <div className="absolute -top-1 -right-1 text-xs">
            {statusIcon}
          </div>
        )}
        
        {/* Turn indicator */}
        {isSelected && (
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full border border-white flex items-center justify-center">
            <span className="text-black text-xs font-bold">!</span>
          </div>
        )}
      </div>

      {/* Health Bar */}
      {showDetails && (
        <div className="absolute -bottom-3 left-0 right-0 h-1 bg-gray-800 border border-white">
          <div 
            className={`h-full transition-all duration-500 ${
              hpPercentage > 50 ? 'bg-green-500' : 
              hpPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${hpPercentage}%` }}
          />
        </div>
      )}

      {/* Mana Bar (if character has MP) */}
      {showDetails && character.max_mp > 0 && (
        <div className="absolute -bottom-5 left-0 right-0 h-1 bg-gray-800 border border-white">
          <div 
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${mpPercentage}%` }}
          />
        </div>
      )}

      {/* Character Name */}
      {showDetails && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white font-pixel text-xs text-center whitespace-nowrap bg-black bg-opacity-75 px-1 rounded">
          {character.name}
          {character.level > 1 && (
            <span className="text-yellow-400 ml-1">L{character.level}</span>
          )}
        </div>
      )}

      {/* HP/MP Numbers (on hover or when selected) */}
      {(isSelected || isValidTarget) && showDetails && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white font-pixel text-xs text-center whitespace-nowrap bg-black bg-opacity-75 px-1 rounded">
          <div>HP: {character.hp}/{character.max_hp}</div>
          {character.max_mp > 0 && (
            <div>MP: {character.mp}/{character.max_mp}</div>
          )}
        </div>
      )}

      {/* Initiative order indicator */}
      {character.initiative && (
        <div className="absolute top-0 left-0 w-4 h-4 bg-blue-600 rounded-full border border-white flex items-center justify-center">
          <span className="text-white text-xs font-bold">{character.initiative}</span>
        </div>
      )}

      {/* Action state indicators */}
      <div className="absolute top-0 right-0 flex flex-col gap-1">
        {character.has_moved && (
          <div className="w-3 h-3 bg-orange-500 rounded-full border border-white" title="Has moved"></div>
        )}
        {character.has_acted && (
          <div className="w-3 h-3 bg-red-500 rounded-full border border-white" title="Has acted"></div>
        )}
      </div>

      {/* Equipment indicators */}
      {character.equipment?.main_hand && (
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 text-xs">
          ⚔️
        </div>
      )}
      {character.equipment?.armor && (
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 text-xs">
          🛡️
        </div>
      )}
    </div>
  )
}

export default CharacterToken
