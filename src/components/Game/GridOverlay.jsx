// src/components/Game/GridOverlay.jsx - Enhanced with combat visualizations
import React from 'react'

const GridOverlay = ({ 
  gridSize = 20, 
  onCellClick, 
  selectedCell,
  validMoves = [],
  validTargets = [],
  aoePreview = [],
  gameMode = 'explore'
}) => {
  const cells = []
  
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const isSelected = selectedCell && selectedCell.x === x && selectedCell.y === y
      const isValidMove = validMoves.some(move => move.x === x && move.y === y)
      const isAOETarget = aoePreview.some(cell => cell.x === x && cell.y === y)
      
      let cellClass = 'grid-cell cursor-pointer border border-gray-600 transition-all duration-200'
      let cellContent = null
      
      // Base hover effect
      if (!isSelected && !isValidMove && !isAOETarget) {
        cellClass += ' hover:bg-white hover:bg-opacity-5'
      }
      
      // Selected cell
      if (isSelected) {
        cellClass += ' bg-blue-500 bg-opacity-30 border-blue-400'
      }
      
      // Valid movement cells
      if (isValidMove) {
        cellClass += ' bg-green-500 bg-opacity-20 border-green-400 hover:bg-green-500 hover:bg-opacity-40'
        cellContent = (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        )
      }
      
      // AOE preview cells
      if (isAOETarget) {
        const isCenter = aoePreview.length > 1 && 
                        aoePreview[Math.floor(aoePreview.length / 2)]?.x === x && 
                        aoePreview[Math.floor(aoePreview.length / 2)]?.y === y
        
        if (isCenter) {
          cellClass += ' bg-red-500 bg-opacity-40 border-red-400'
          cellContent = (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-red-400 font-pixel text-xs">💥</div>
            </div>
          )
        } else {
          cellClass += ' bg-red-500 bg-opacity-20 border-red-300'
          cellContent = (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-1 h-1 bg-red-400 rounded-full"></div>
            </div>
          )
        }
      }
      
      // Game mode specific cursors
      if (gameMode === 'target') {
        cellClass += ' cursor-crosshair'
      } else if (gameMode === 'move') {
        cellClass += ' cursor-move'
      } else if (gameMode === 'aoe') {
        cellClass += ' cursor-crosshair'
      }
      
      cells.push(
        <div
          key={`${x}-${y}`}
          className={cellClass}
          style={{
            gridColumn: x + 1,
            gridRow: y + 1,
          }}
          onClick={() => onCellClick(x, y)}
          onMouseEnter={() => {
            // Preview AOE on hover when in AOE mode
            if (gameMode === 'aoe') {
              // This would trigger AOE preview update in parent
            }
          }}
          title={`${x}, ${y}`}
        >
          {cellContent}
        </div>
      )
    }
  }

  return (
    <>
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 grid bg-gray-900"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: `${100/gridSize}% ${100/gridSize}%`
        }}
      >
        {cells}
      </div>
      
      {/* Mode overlay indicators */}
      {gameMode !== 'explore' && (
        <div className="absolute top-2 right-2 ff-stat-window p-2 bg-black bg-opacity-75">
          <div className="text-xs text-white font-pixel">
            {gameMode === 'move' && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>MOVEMENT</span>
              </div>
            )}
            {gameMode === 'target' && (
              <div className="flex items-center gap-1">
                <span className="text-red-400">🎯</span>
                <span>TARGETING</span>
              </div>
            )}
            {gameMode === 'aoe' && (
              <div className="flex items-center gap-1">
                <span className="text-red-400">💥</span>
                <span>AREA EFFECT</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Range/distance indicator */}
      {(validMoves.length > 0 || aoePreview.length > 0) && (
        <div className="absolute bottom-2 left-2 ff-stat-window p-2 bg-black bg-opacity-75">
          <div className="text-xs text-white font-pixel">
            {validMoves.length > 0 && (
              <div className="ff-stat-row">
                <span className="ff-stat-label">RANGE</span>
                <span className="ff-stat-value">{Math.max(...validMoves.map(m => Math.abs(m.x) + Math.abs(m.y)))}</span>
              </div>
            )}
            {aoePreview.length > 0 && (
              <div className="ff-stat-row">
                <span className="ff-stat-label">AREA</span>
                <span className="ff-stat-value">{aoePreview.length} CELLS</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default GridOverlay
