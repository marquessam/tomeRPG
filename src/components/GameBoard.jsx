// src/components/Game/GameBoard.jsx
import React, { useState } from 'react'
import GridOverlay from './GridOverlay'
import CharacterToken from './CharacterToken'

const GameBoard = () => {
  const [selectedCell, setSelectedCell] = useState(null)
  const [characters] = useState([
    // Demo characters for testing
    { id: 1, name: 'Hero', x: 5, y: 5, facing: 'down', hp: 25, maxHp: 30, class: 'fighter' },
    { id: 2, name: 'Mage', x: 7, y: 8, facing: 'up', hp: 15, maxHp: 15, class: 'mage' },
    { id: 3, name: 'Goblin', x: 12, y: 10, facing: 'left', hp: 8, maxHp: 12, class: 'enemy', isNPC: true }
  ])

  const handleCellClick = (x, y) => {
    setSelectedCell({ x, y })
    console.log(`Clicked cell: ${x}, ${y}`)
  }

  const handleCharacterClick = (character) => {
    console.log(`Selected character: ${character.name}`)
  }

  return (
    <div className="nes-container is-rounded bg-black p-4 h-full overflow-auto">
      <div className="relative bg-gray-800 rounded-lg" style={{ aspectRatio: '1/1', maxHeight: '600px' }}>
        <GridOverlay 
          gridSize={20} 
          onCellClick={handleCellClick}
          selectedCell={selectedCell}
        />
        
        {characters.map(character => (
          <CharacterToken
            key={character.id}
            character={character}
            gridSize={20}
            onClick={() => handleCharacterClick(character)}
          />
        ))}
      </div>

      {/* Game Controls */}
      <div className="mt-4 flex gap-2 text-white font-pixel text-xs">
        <button className="nes-btn is-primary text-xs">Move</button>
        <button className="nes-btn is-warning text-xs">Attack</button>
        <button className="nes-btn is-success text-xs">Cast</button>
        <button className="nes-btn text-xs">End Turn</button>
      </div>
    </div>
  )
}

export default GameBoard
