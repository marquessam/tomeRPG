// src/components/Game/CharacterToken.jsx
import React from 'react'

const CharacterToken = ({ character, gridSize, onClick }) => {
  const cellSize = 100 / gridSize // percentage
  
  const getCharacterColor = (characterClass) => {
    switch (characterClass) {
      case 'fighter': return 'bg-red-600'
      case 'mage': return 'bg-blue-600'
      case 'thief': return 'bg-green-600'
      case 'cleric': return 'bg-yellow-600'
      case 'enemy': return 'bg-gray-600'
      default: return 'bg-purple-600'
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

  const hpPercentage = (character.hp / character.maxHp) * 100

  return (
    <div
      className="absolute character-token transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
      style={{
        left: `${(character.x + 0.5) * cellSize}%`,
        top: `${(character.y + 0.5) * cellSize}%`,
        width: `${cellSize * 0.8}%`,
        height: `${cellSize * 0.8}%`,
      }}
      onClick={onClick}
    >
      {/* Character Circle */}
      <div className={`
        w-full h-full rounded-full border-2 border-white 
        ${getCharacterColor(character.class)}
        flex items-center justify-center text-white font-bold text-xs
        shadow-lg hover:shadow-xl
      `}>
        {getFacingIndicator(character.facing)}
      </div>

      {/* Health Bar */}
      <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gray-800 border border-white">
        <div 
          className={`h-full transition-all duration-300 ${
            hpPercentage > 50 ? 'bg-green-500' : 
            hpPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${hpPercentage}%` }}
        />
      </div>

      {/* Character Name */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-white font-pixel text-xs text-center whitespace-nowrap bg-black bg-opacity-75 px-1 rounded">
        {character.name}
      </div>
    </div>
  )
}

export default CharacterToken
