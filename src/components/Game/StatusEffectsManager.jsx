// src/components/Game/StatusEffectsManager.jsx - Apply and manage status effects
import React, { useState } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { 
  STATUS_EFFECTS, 
  getStatusEffectsByType, 
  applyStatusEffect, 
  removeStatusEffect,
  getActiveStatusEffects 
} from '../../data/statusEffects'

const StatusEffectsManager = ({ onClose, targetCharacter = null }) => {
  const { characters, currentPlayer, updateCharacter } = useGameStore()
  const [selectedCharacter, setSelectedCharacter] = useState(targetCharacter)
  const [selectedEffect, setSelectedEffect] = useState(null)
  const [effectType, setEffectType] = useState('negative') // 'negative', 'positive'
  const [duration, setDuration] = useState('save_ends')

  // Only show for DMs
  if (currentPlayer?.role !== 'dm') {
    return null
  }

  const handleApplyEffect = () => {
    if (!selectedCharacter || !selectedEffect) return

    const updatedCharacter = applyStatusEffect(selectedCharacter, selectedEffect, duration)
    updateCharacter(updatedCharacter)

    // Add combat log message
    // addCombatMessage(`${selectedCharacter.name} is now ${STATUS_EFFECTS[selectedEffect].name}`)

    setSelectedEffect(null)
  }

  const handleRemoveEffect = (effectId) => {
    if (!selectedCharacter) return

    const updatedCharacter = removeStatusEffect(selectedCharacter, effectId)
    updateCharacter(updatedCharacter)

    // Add combat log message
    // addCombatMessage(`Status effect removed from ${selectedCharacter.name}`)
  }

  const effectsByType = getStatusEffectsByType(effectType)
  const activeEffects = selectedCharacter ? getActiveStatusEffects(selectedCharacter) : []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="ff-dialogue-box max-w-4xl w-full p-6 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="ff-stat-window mb-4">
          <div className="flex justify-between items-center">
            <h2 className="ff-stat-label">STATUS EFFECTS</h2>
            <button 
              className="ff-button ff-button-red text-xs"
              onClick={onClose}
            >
              CLOSE
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Character Selection & Active Effects */}
          <div className="space-y-4">
            {/* Character Selection */}
            <div className="ff-stat-window">
              <h3 className="ff-stat-label mb-3 text-center">SELECT CHARACTER</h3>
              
              <div className="space-y-2 max-h-48 overflow-auto">
                {characters.map(char => (
                  <div
                    key={char.id}
                    className={`
                      ff-stat-window cursor-pointer transition-all duration-200 p-2
                      ${selectedCharacter?.id === char.id ? 'border-yellow-400 bg-yellow-900 bg-opacity-20' : 'hover:border-blue-400'}
                    `}
                    onClick={() => setSelectedCharacter(char)}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${char.is_npc ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                      <div className="flex-1">
                        <div className="ff-stat-row">
                          <span className="ff-stat-label text-xs">{char.name}</span>
                          <span className="ff-stat-value text-xs">
                            {char.hp}/{char.max_hp} HP
                          </span>
                        </div>
                        <div className="text-gray-300 font-pixel text-xs">
                          {char.class || 'Monster'} • Level {char.level}
                        </div>
                      </div>
                      
                      {/* Active effects count */}
                      {char.status_effects?.length > 0 && (
                        <span className="ff-button text-xs px-2 py-1">
                          {char.status_effects.length} effects
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Effects */}
            {selectedCharacter && (
              <div className="ff-stat-window">
                <h3 className="ff-stat-label mb-3 text-center">
                  ACTIVE EFFECTS - {selectedCharacter.name}
                </h3>
                
                {activeEffects.length === 0 ? (
                  <p className="text-gray-400 font-pixel text-xs text-center text-ff-shadow">
                    No active status effects
                  </p>
                ) : (
                  <div className="space-y-2">
                    {activeEffects.map(effect => (
                      <div key={effect.id} className="ff-stat-window p-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{effect.icon}</span>
                            <div>
                              <div className="ff-stat-row">
                                <span className={`ff-stat-label text-xs ${effect.color}`}>
                                  {effect.name}
                                </span>
                              </div>
                              <div className="text-gray-300 font-pixel text-xs">
                                Duration: {effect.duration.replace('_', ' ')}
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            className="ff-button ff-button-red text-xs"
                            onClick={() => handleRemoveEffect(effect.id)}
                          >
                            REMOVE
                          </button>
                        </div>
                        
                        <p className="text-gray-300 font-pixel text-xs mt-2 leading-relaxed">
                          {effect.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Apply New Effects */}
          <div className="space-y-4">
            {/* Effect Type Selection */}
            <div className="ff-stat-window">
              <h3 className="ff-stat-label mb-3 text-center">APPLY EFFECT</h3>
              
              <div className="flex gap-2 mb-4">
                <button 
                  className={`ff-button flex-1 text-xs ${effectType === 'negative' ? 'ff-button-red' : ''}`}
                  onClick={() => setEffectType('negative')}
                >
                  NEGATIVE
                </button>
                <button 
                  className={`ff-button flex-1 text-xs ${effectType === 'positive' ? 'ff-button-green' : ''}`}
                  onClick={() => setEffectType('positive')}
                >
                  POSITIVE
                </button>
              </div>

              {/* Duration Selection */}
              <div className="ff-stat-window mb-3">
                <div className="ff-stat-row mb-2">
                  <span className="ff-stat-label">DURATION</span>
                </div>
                <select 
                  className="ff-input w-full text-xs"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value="save_ends">Save Ends</option>
                  <option value="end_of_turn">End of Turn</option>
                  <option value="end_of_encounter">End of Encounter</option>
                  <option value="end_of_round">End of Round</option>
                  <option value="permanent">Permanent</option>
                  <option value="special">Special</option>
                </select>
              </div>
            </div>

            {/* Available Effects */}
            <div className="ff-stat-window">
              <h3 className="ff-stat-label mb-3 text-center">
                {effectType.toUpperCase()} EFFECTS
              </h3>
              
              <div className="space-y-2 max-h-64 overflow-auto">
                {Object.entries(effectsByType).map(([key, effect]) => (
                  <div
                    key={key}
                    className={`
                      ff-stat-window cursor-pointer transition-all duration-200 p-2
                      ${selectedEffect === key ? 'border-yellow-400 bg-yellow-900 bg-opacity-20' : 'hover:border-blue-400'}
                    `}
                    onClick={() => setSelectedEffect(key)}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{effect.icon}</span>
                      <div className="flex-1">
                        <div className="ff-stat-row">
                          <span className={`ff-stat-label text-xs ${effect.color}`}>
                            {effect.name}
                          </span>
                        </div>
                        <p className="text-gray-300 font-pixel text-xs leading-relaxed mt-1">
                          {effect.description}
                        </p>
                      </div>
                      {selectedEffect === key && (
                        <span className="text-yellow-400 font-pixel text-lg">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <div className="text-center">
              <button 
                className="ff-button ff-button-green w-full"
                onClick={handleApplyEffect}
                disabled={!selectedCharacter || !selectedEffect}
              >
                APPLY EFFECT
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="ff-stat-window mt-4">
          <h3 className="ff-stat-label mb-3 text-center">QUICK ACTIONS</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button 
              className="ff-button text-xs"
              onClick={() => {
                if (selectedCharacter) {
                  const updated = applyStatusEffect(selectedCharacter, 'prone')
                  updateCharacter(updated)
                }
              }}
              disabled={!selectedCharacter}
            >
              PRONE
            </button>
            <button 
              className="ff-button text-xs"
              onClick={() => {
                if (selectedCharacter) {
                  const updated = applyStatusEffect(selectedCharacter, 'stunned')
                  updateCharacter(updated)
                }
              }}
              disabled={!selectedCharacter}
            >
              STUNNED
            </button>
            <button 
              className="ff-button text-xs"
              onClick={() => {
                if (selectedCharacter) {
                  const updated = applyStatusEffect(selectedCharacter, 'blessed')
                  updateCharacter(updated)
                }
              }}
              disabled={!selectedCharacter}
            >
              BLESSED
            </button>
            <button 
              className="ff-button ff-button-red text-xs"
              onClick={() => {
                if (selectedCharacter) {
                  const updated = { ...selectedCharacter, status_effects: [] }
                  updateCharacter(updated)
                }
              }}
              disabled={!selectedCharacter}
            >
              CLEAR ALL
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatusEffectsManager
