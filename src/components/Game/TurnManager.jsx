// src/components/Game/TurnManager.jsx - D&D 4e style turn management
import React, { useState, useEffect } from 'react'
import { useGameStore } from '../../stores/gameStore'

const TurnManager = ({ onClose }) => {
  const { characters, currentPlayer, gameState } = useGameStore()
  const [initiative, setInitiative] = useState({})
  const [turnOrder, setTurnOrder] = useState([])
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0)
  const [roundNumber, setRoundNumber] = useState(1)
  const [combatPhase, setCombatPhase] = useState('setup') // 'setup', 'initiative', 'combat', 'resolution'

  // Only show for DMs
  if (currentPlayer?.role !== 'dm') {
    return null
  }

  const allCombatants = characters.filter(char => 
    !char.status_effects?.some(effect => effect.key === 'unconscious' || effect.key === 'dead')
  )

  useEffect(() => {
    // Initialize initiative for all characters
    const initialInitiative = {}
    allCombatants.forEach(char => {
      initialInitiative[char.id] = {
        roll: 0,
        modifier: Math.floor((char.speed - 10) / 2), // Dex-like modifier
        total: 0,
        hasRolled: false
      }
    })
    setInitiative(initialInitiative)
  }, [allCombatants])

  const rollInitiative = (characterId) => {
    const roll = Math.floor(Math.random() * 20) + 1
    const modifier = initiative[characterId]?.modifier || 0
    const total = roll + modifier
    
    setInitiative(prev => ({
      ...prev,
      [characterId]: {
        ...prev[characterId],
        roll,
        total,
        hasRolled: true
      }
    }))
  }

  const rollAllInitiative = () => {
    allCombatants.forEach(char => {
      if (!initiative[char.id]?.hasRolled) {
        rollInitiative(char.id)
      }
    })
  }

  const startCombat = () => {
    // Sort by initiative (highest first)
    const sorted = allCombatants
      .filter(char => initiative[char.id]?.hasRolled)
      .sort((a, b) => {
        const aInit = initiative[a.id]?.total || 0
        const bInit = initiative[b.id]?.total || 0
        if (aInit === bInit) {
          // Tie-breaker: higher dex modifier goes first
          const aMod = initiative[a.id]?.modifier || 0
          const bMod = initiative[b.id]?.modifier || 0
          return bMod - aMod
        }
        return bInit - aInit
      })

    setTurnOrder(sorted)
    setCurrentTurnIndex(0)
    setCombatPhase('combat')
    setRoundNumber(1)
  }

  const nextTurn = () => {
    const nextIndex = currentTurnIndex + 1
    if (nextIndex >= turnOrder.length) {
      // New round
      setCurrentTurnIndex(0)
      setRoundNumber(prev => prev + 1)
      // Reset all character actions for new round
      turnOrder.forEach(char => {
        // TODO: Reset has_acted, has_moved, status effects, etc.
      })
    } else {
      setCurrentTurnIndex(nextIndex)
    }
  }

  const endCombat = () => {
    setCombatPhase('resolution')
    setTurnOrder([])
    setCurrentTurnIndex(0)
    setRoundNumber(1)
    // TODO: Reset all combat states, heal characters, etc.
  }

  const delayTurn = (characterId) => {
    const charIndex = turnOrder.findIndex(char => char.id === characterId)
    if (charIndex === -1) return

    const newOrder = [...turnOrder]
    const [delayedChar] = newOrder.splice(charIndex, 1)
    
    // Insert at end or before next player character
    const insertIndex = newOrder.length
    newOrder.splice(insertIndex, 0, delayedChar)
    
    setTurnOrder(newOrder)
    
    // Adjust current turn index if needed
    if (charIndex <= currentTurnIndex) {
      setCurrentTurnIndex(Math.max(0, currentTurnIndex - 1))
    }
  }

  const removeFromCombat = (characterId) => {
    setTurnOrder(prev => prev.filter(char => char.id !== characterId))
    if (currentTurnIndex >= turnOrder.length - 1) {
      setCurrentTurnIndex(Math.max(0, turnOrder.length - 2))
    }
  }

  const getCurrentCharacter = () => {
    return turnOrder[currentTurnIndex] || null
  }

  const getCharacterFromId = (id) => {
    return allCombatants.find(char => char.id === id)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="ff-dialogue-box max-w-4xl w-full p-6 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="ff-stat-window mb-4">
          <div className="flex justify-between items-center">
            <h2 className="ff-stat-label">TURN MANAGER</h2>
            <div className="flex items-center gap-4">
              <div className="ff-stat-row">
                <span className="ff-stat-label">PHASE</span>
                <span className="ff-stat-value">{combatPhase.toUpperCase()}</span>
              </div>
              {combatPhase === 'combat' && (
                <div className="ff-stat-row">
                  <span className="ff-stat-label">ROUND</span>
                  <span className="ff-stat-value">{roundNumber}</span>
                </div>
              )}
              <button 
                className="ff-button ff-button-red text-xs"
                onClick={onClose}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>

        {/* Setup Phase */}
        {combatPhase === 'setup' && (
          <div className="space-y-4">
            <div className="ff-stat-window text-center">
              <h3 className="ff-stat-label mb-3">COMBAT SETUP</h3>
              <p className="text-white font-pixel text-xs text-ff-shadow mb-4">
                Roll initiative for all combatants to determine turn order
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  className="ff-button ff-button-green"
                  onClick={rollAllInitiative}
                >
                  ROLL ALL INITIATIVE
                </button>
                <button 
                  className="ff-button"
                  onClick={() => setCombatPhase('initiative')}
                >
                  MANUAL SETUP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Initiative Phase */}
        {(combatPhase === 'setup' || combatPhase === 'initiative') && (
          <div className="space-y-4">
            <div className="ff-stat-window">
              <h3 className="ff-stat-label mb-3 text-center">INITIATIVE ROLLS</h3>
              
              <div className="space-y-2 max-h-64 overflow-auto">
                {allCombatants.map(char => {
                  const charInit = initiative[char.id] || {}
                  const hasRolled = charInit.hasRolled
                  
                  return (
                    <div key={char.id} className="ff-stat-window p-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${char.is_npc ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                          <div>
                            <div className="ff-stat-row">
                              <span className="ff-stat-label text-xs">{char.name}</span>
                            </div>
                            <div className="text-gray-300 font-pixel text-xs">
                              Modifier: {charInit.modifier >= 0 ? '+' : ''}{charInit.modifier}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {hasRolled ? (
                            <div className="text-center">
                              <div className="ff-stat-value text-lg">{charInit.total}</div>
                              <div className="text-xs text-gray-300">
                                ({charInit.roll} + {charInit.modifier})
                              </div>
                            </div>
                          ) : (
                            <button 
                              className="ff-button text-xs"
                              onClick={() => rollInitiative(char.id)}
                            >
                              ROLL
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {Object.values(initiative).every(init => init.hasRolled) && (
                <div className="mt-4 text-center">
                  <button 
                    className="ff-button ff-button-green"
                    onClick={startCombat}
                  >
                    START COMBAT
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Combat Phase */}
        {combatPhase === 'combat' && (
          <div className="space-y-4">
            {/* Current Turn */}
            <div className="ff-stat-window">
              <h3 className="ff-stat-label mb-3 text-center">CURRENT TURN</h3>
              
              {getCurrentCharacter() && (
                <div className="ff-stat-window p-3 border-yellow-400 bg-yellow-900 bg-opacity-20">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className={`w-4 h-4 rounded-full ${getCurrentCharacter().is_npc ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                      <div>
                        <div className="ff-stat-row">
                          <span className="ff-stat-label">{getCurrentCharacter().name}</span>
                          <span className="ff-stat-value">
                            INIT {initiative[getCurrentCharacter().id]?.total || 0}
                          </span>
                        </div>
                        <div className="text-gray-300 font-pixel text-xs">
                          {getCurrentCharacter().is_npc ? 'NPC' : 'Player Character'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        className="ff-button ff-button-green text-xs"
                        onClick={nextTurn}
                      >
                        END TURN
                      </button>
                      <button 
                        className="ff-button text-xs"
                        onClick={() => delayTurn(getCurrentCharacter().id)}
                      >
                        DELAY
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Turn Order */}
            <div className="ff-stat-window">
              <h3 className="ff-stat-label mb-3 text-center">TURN ORDER</h3>
              
              <div className="space-y-1 max-h-48 overflow-auto">
                {turnOrder.map((char, index) => {
                  const isCurrent = index === currentTurnIndex
                  const charInit = initiative[char.id] || {}
                  
                  return (
                    <div 
                      key={`${char.id}-${index}`}
                      className={`
                        ff-stat-window p-2 transition-all duration-200
                        ${isCurrent ? 'border-yellow-400 bg-yellow-900 bg-opacity-20' : ''}
                      `}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="ff-stat-value text-xs w-6 text-center">
                            {index + 1}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${char.is_npc ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                          <div>
                            <div className="ff-stat-row">
                              <span className="ff-stat-label text-xs">{char.name}</span>
                              <span className="ff-stat-value text-xs">{charInit.total}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          {char.has_moved && (
                            <span className="w-2 h-2 bg-orange-400 rounded-full" title="Has moved"></span>
                          )}
                          {char.has_acted && (
                            <span className="w-2 h-2 bg-red-400 rounded-full" title="Has acted"></span>
                          )}
                          {!char.has_moved && !char.has_acted && (
                            <span className="w-2 h-2 bg-green-400 rounded-full" title="Ready to act"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Combat Controls */}
            <div className="ff-stat-window">
              <h3 className="ff-stat-label mb-3 text-center">COMBAT CONTROLS</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <button 
                  className="ff-button text-xs"
                  onClick={() => setCurrentTurnIndex(Math.max(0, currentTurnIndex - 1))}
                  disabled={currentTurnIndex === 0}
                >
                  PREVIOUS
                </button>
                <button 
                  className="ff-button text-xs"
                  onClick={nextTurn}
                >
                  NEXT TURN
                </button>
                <button 
                  className="ff-button text-xs"
                  onClick={() => {
                    setRoundNumber(prev => prev + 1)
                    setCurrentTurnIndex(0)
                  }}
                >
                  NEW ROUND
                </button>
                <button 
                  className="ff-button ff-button-red text-xs"
                  onClick={endCombat}
                >
                  END COMBAT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resolution Phase */}
        {combatPhase === 'resolution' && (
          <div className="ff-stat-window text-center">
            <h3 className="ff-stat-label mb-3">COMBAT ENDED</h3>
            <p className="text-white font-pixel text-xs text-ff-shadow mb-4">
              Combat has ended. Characters can rest and recover.
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                className="ff-button ff-button-green"
                onClick={() => setCombatPhase('setup')}
              >
                NEW COMBAT
              </button>
              <button 
                className="ff-button"
                onClick={onClose}
              >
                CLOSE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TurnManager
