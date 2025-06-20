// src/components/UI/CharacterSheet.jsx - New FF-style character sheet
import React from 'react'
import { useGameStore } from '../../stores/gameStore'

const CharacterSheet = ({ onClose }) => {
  const { characters, currentPlayer } = useGameStore()
  
  // Find current player's character
  const character = characters.find(c => c.player_id === currentPlayer?.id)

  if (!character) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
        <div className="ff-dialogue-box max-w-md w-full p-6">
          <div className="ff-stat-window text-center">
            <h2 className="ff-stat-label mb-4">NO CHARACTER</h2>
            <p className="text-white font-pixel text-xs text-ff-shadow mb-4">
              You need to create a character first.
            </p>
            <button 
              className="ff-button ff-button-red"
              onClick={onClose}
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    )
  }

  const hpPercentage = (character.hp / character.max_hp) * 100
  const mpPercentage = (character.mp / character.max_mp) * 100

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="ff-dialogue-box max-w-2xl w-full p-6">
        {/* Header */}
        <div className="ff-stat-window mb-4">
          <div className="flex justify-between items-center">
            <h2 className="ff-stat-label">CHARACTER SHEET</h2>
            <button 
              className="ff-button ff-button-red text-xs"
              onClick={onClose}
            >
              CLOSE
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Info */}
          <div className="ff-stat-window">
            <div className="flex gap-4 mb-4">
              <div className="ff-portrait text-white">
                {character.name[0]}
              </div>
              <div className="flex-1">
                <div className="ff-stat-row">
                  <span className="ff-stat-label">NAME</span>
                  <span className="ff-stat-value">{character.name}</span>
                </div>
                <div className="ff-stat-row">
                  <span className="ff-stat-label">CLASS</span>
                  <span className="ff-stat-value">{character.class?.toUpperCase()}</span>
                </div>
                <div className="ff-stat-row">
                  <span className="ff-stat-label">LEVEL</span>
                  <span className="ff-stat-value">{character.level}</span>
                </div>
              </div>
            </div>

            {/* Health Bar */}
            <div className="mb-2">
              <div className="ff-stat-row">
                <span className="ff-stat-label">HP</span>
                <span className="ff-stat-value">{character.hp}/{character.max_hp}</span>
              </div>
              <div className="ff-health-bar">
                <div 
                  className={`ff-health-fill ${
                    hpPercentage > 50 ? 'ff-health-high' : 
                    hpPercentage > 25 ? 'ff-health-medium' : 'ff-health-low'
                  }`}
                  style={{ width: `${hpPercentage}%` }}
                />
              </div>
            </div>

            {/* MP Bar */}
            <div>
              <div className="ff-stat-row">
                <span className="ff-stat-label">MP</span>
                <span className="ff-stat-value">{character.mp}/{character.max_mp}</span>
              </div>
              <div className="ff-mp-bar">
                <div 
                  className="ff-mp-fill"
                  style={{ width: `${mpPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="ff-stat-window">
            <h3 className="ff-stat-label mb-3 text-center">ATTRIBUTES</h3>
            <div className="space-y-2">
              <div className="ff-stat-row">
                <span className="ff-stat-label">ATTACK</span>
                <span className="ff-stat-value">{character.attack}</span>
              </div>
              <div className="ff-stat-row">
                <span className="ff-stat-label">DEFENSE</span>
                <span className="ff-stat-value">{character.defense}</span>
              </div>
              <div className="ff-stat-row">
                <span className="ff-stat-label">SPEED</span>
                <span className="ff-stat-value">{character.speed}</span>
              </div>
              <div className="ff-stat-row">
                <span className="ff-stat-label">MAGIC</span>
                <span className="ff-stat-value">{character.magic || 0}</span>
              </div>
            </div>
          </div>

          {/* Equipment */}
          <div className="ff-stat-window">
            <h3 className="ff-stat-label mb-3 text-center">EQUIPMENT</h3>
            <div className="grid grid-cols-4 gap-1">
              {/* Weapon Slot */}
              <div className="ff-equipment-slot" title="Weapon">
                ⚔️
              </div>
              {/* Armor Slot */}
              <div className="ff-equipment-slot" title="Armor">
                🛡️
              </div>
              {/* Accessory Slot */}
              <div className="ff-equipment-slot" title="Accessory">
                💍
              </div>
              {/* Empty Slot */}
              <div className="ff-equipment-slot" title="Empty">
                ▫️
              </div>
            </div>
          </div>

          {/* Position */}
          <div className="ff-stat-window">
            <h3 className="ff-stat-label mb-3 text-center">POSITION</h3>
            <div className="space-y-2">
              <div className="ff-stat-row">
                <span className="ff-stat-label">X</span>
                <span className="ff-stat-value">{character.grid_x}</span>
              </div>
              <div className="ff-stat-row">
                <span className="ff-stat-label">Y</span>
                <span className="ff-stat-value">{character.grid_y}</span>
              </div>
              <div className="ff-stat-row">
                <span className="ff-stat-label">FACING</span>
                <span className="ff-stat-value">{character.facing?.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CharacterSheet
