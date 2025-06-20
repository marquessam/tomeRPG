// src/components/Game/GridOverlay.jsx
import React from 'react'

const GridOverlay = ({ gridSize = 20, onCellClick, selectedCell }) => {
  const cells = []
  
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const isSelected = selectedCell && selectedCell.x === x && selectedCell.y === y
      
      cells.push(
        <div
          key={`${x}-${y}`}
          className={`
            grid-cell cursor-pointer border border-gray-600 
            ${isSelected ? 'bg-yellow-500 bg-opacity-30' : 'hover:bg-white hover:bg-opacity-10'}
          `}
          style={{
            gridColumn: x + 1,
            gridRow: y + 1,
          }}
          onClick={() => onCellClick(x, y)}
          title={`${x}, ${y}`}
        />
      )
    }
  }

  return (
    <div 
      className="absolute inset-0 grid"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`
      }}
    >
      {cells}
    </div>
  )
}

export default GridOverlay
