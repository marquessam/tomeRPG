// src/components/Game/PowerSelector.jsx - D&D 4e style power selector
import React from 'react'

const PowerSelector = ({ character, onPowerSelect, selectedPower, gameMode }) => {
  // Mock powers for now - these would come from character.powers in real implementation
  const mockPowers = {
    fighter: [
      { 
        id: 1, name: 'Cleave', type: 'at_will', action_type: 'standard',
        attack_type: 'melee', range_value: 1, damage_dice: '1d8+4',
        description: 'Basic melee attack that can hit adjacent enemies',
        uses_remaining: null // at-will powers don't have uses
      },
      { 
        id: 2, name: 'Power Attack', type: 'at_will', action_type: 'standard',
        attack_type: 'melee', range_value: 1, damage_dice: '1d8+6',
        description: 'Heavy attack with increased damage',
        uses_remaining: null
      },
      { 
        id: 3, name: 'Shield Bash', type: 'encounter', action_type: 'standard',
        attack_type: 'melee', range_value: 1, damage_dice: '2d6+4',
        description: 'Attack that can knock enemies prone',
        uses_remaining: 1
      }
    ],
    wizard: [
      { 
        id: 4, name: 'Magic Missile', type: 'at_will', action_type: 'standard',
        attack_type: 'ranged', range_value: 10, damage_dice: '1d4+4',
        description: 'Unerring bolt of magical energy',
        uses_remaining: null
      },
      { 
        id: 5, name: 'Ray of Frost', type: 'at_will', action_type: 'standard',
        attack_type: 'ranged', range_value: 10, damage_dice: '1d6+4',
        description: 'Icy ray that slows the target',
        uses_remaining: null
      },
      { 
        id: 6, name: 'Burning Hands', type: 'encounter', action_type: 'standard',
        attack_type: 'close', range_value: 3, area_type: 'blast', area_size: 1,
        damage_dice: '2d6+4', description: 'Cone of fire affecting multiple enemies',
        uses_remaining: 1
      }
    ],
    rogue: [
      { 
        id: 7, name: 'Piercing Strike', type: 'at_will', action_type: 'standard',
        attack_type: 'melee', range_value: 1, damage_dice: '1d4+4',
        description: 'Precise attack targeting weak points',
        uses_remaining: null
      },
      { 
        id: 8, name: 'Sly Flourish', type: 'at_will', action_type: 'standard',
        attack_type: 'melee', range_value: 1, damage_dice: '1d6+4',
        description: 'Deceptive attack with extra damage',
        uses_remaining: null
      },
      { 
        id: 9, name: 'Dazing Strike', type: 'encounter', action_type: 'standard',
        attack_type: 'melee', range_value: 1, damage_dice: '2d4+4',
        description: 'Attack that dazes the target',
        uses_remaining: 1
      }
    ],
    cleric: [
      { 
        id: 10, name: 'Sacred Flame', type: 'at_will', action_type: 'standard',
        attack_type: 'ranged', range_value: 5, damage_dice: '1d6+4',
        description: 'Divine fire that damages undead',
        uses_remaining: null
      },
      { 
        id: 11, name: 'Blessing of Battle', type: 'at_will', action_type: 'minor',
        attack_type: 'ranged', range_value: 5, damage_dice: '0',
        description: 'Grant ally +2 to next attack',
        uses_remaining: null
      },
      { 
        id: 12, name: 'Healing Word', type: 'encounter', action_type: 'minor',
        attack_type: 'ranged', range_value: 5, damage_dice: '0',
        description: 'Heal ally for 2d6+4 hit points',
        uses_remaining: 1
      }
    ]
  }

  const characterPowers = mockPowers[character.class] || []

  const getPowerTypeColor = (type) => {
    switch (type) {
      case 'at_will': return 'text-green-400'
      case 'encounter': return 'text-yellow-400'  
      case 'daily': return 'text-red-400'
      default: return 'text-white'
    }
  }

  const getPowerTypeBackground = (type) => {
    switch (type) {
      case 'at_will': return 'bg-green-900 bg-opacity-30'
      case 'encounter': return 'bg-yellow-900 bg-opacity-30'  
      case 'daily': return 'bg-red-900 bg-opacity-30'
      default: return 'bg-gray-900 bg-opacity-30'
    }
  }

  const getActionTypeIcon = (actionType) => {
    switch (actionType) {
      case 'standard': return '⚔️'
      case 'move': return '👟'
      case 'minor': return '🔧'
      case 'free': return '💨'
      default: return '❓'
    }
  }

  const getAttackTypeIcon = (attackType) => {
    switch (attackType) {
      case 'melee': return '⚔️'
      case 'ranged': return '🏹'
      case 'close': return '💥'
      case 'area': return '🌟'
      default: return '❓'
    }
  }

  const isPowerUsable = (power) => {
    if (character.has_acted && power.action_type === 'standard') return false
    if (power.type === 'encounter' && power.uses_remaining <= 0) return false
    if (power.type === 'daily' && power.uses_remaining <= 0) return false
    return true
  }

  if (characterPowers.length === 0) {
    return (
      <div className="ff-stat-window">
        <h4 className="ff-stat-label mb-2 text-center">POWERS</h4>
        <p className="text-gray-400 font-pixel text-xs text-center text-ff-shadow">
          No powers available
        </p>
      </div>
    )
  }

  return (
    <div className="ff-stat-window">
      <h4 className="ff-stat-label mb-3 text-center">POWERS</h4>
      
      <div className="space-y-2 max-h-48 overflow-auto">
        {characterPowers.map(power => {
          const isSelected = selectedPower?.id === power.id
          const isUsable = isPowerUsable(power)
          
          return (
            <div
              key={power.id}
              className={`
                ff-stat-window cursor-pointer transition-all duration-200 p-2
                ${isSelected ? 'border-yellow-400 bg-yellow-900 bg-opacity-20' : ''}
                ${!isUsable ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}
                ${getPowerTypeBackground(power.type)}
              `}
              onClick={() => isUsable && onPowerSelect(power)}
            >
              {/* Power Header */}
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {getActionTypeIcon(power.action_type)}
                  </span>
                  <div>
                    <div className="ff-stat-row">
                      <span className="ff-stat-label text-xs">{power.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`ff-stat-value text-xs ${getPowerTypeColor(power.type)}`}>
                        {power.type.replace('_', '-').toUpperCase()}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {getAttackTypeIcon(power.attack_type)} {power.attack_type}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Uses remaining */}
                <div className="text-right">
                  {power.uses_remaining !== null && (
                    <div className="ff-stat-row">
                      <span className="ff-stat-label text-xs">USES</span>
                      <span className="ff-stat-value text-xs">{power.uses_remaining}</span>
                    </div>
                  )}
                  {isSelected && (
                    <span className="text-yellow-400 font-pixel text-lg">✓</span>
                  )}
                </div>
              </div>

              {/* Power Details */}
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-300">
                    Range: {power.range_value}{power.area_type ? ` (${power.area_type} ${power.area_size})` : ''}
                  </span>
                  {power.damage_dice !== '0' && (
                    <span className="text-gray-300">
                      Damage: {power.damage_dice}
                    </span>
                  )}
                </div>
                <p className="text-gray-300 font-pixel text-xs leading-relaxed">
                  {power.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Power Usage Tips */}
      <div className="mt-3 pt-2 border-t border-gray-600">
        <div className="text-xs text-gray-400 font-pixel text-ff-shadow space-y-1">
          <div className="flex justify-between">
            <span className="text-green-400">At-Will:</span>
            <span>Unlimited uses</span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-400">Encounter:</span>
            <span>Once per fight</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-400">Daily:</span>
            <span>Once per day</span>
          </div>
        </div>
      </div>

      {/* Cancel Power Selection */}
      {selectedPower && gameMode !== 'explore' && (
        <div className="mt-2">
          <button 
            className="ff-button ff-button-red w-full text-xs"
            onClick={() => onPowerSelect(null)}
          >
            CANCEL POWER
          </button>
        </div>
      )}
    </div>
  )
}

export default PowerSelector
