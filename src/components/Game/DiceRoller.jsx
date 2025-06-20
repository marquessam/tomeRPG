// src/components/Game/DiceRoller.jsx - D&D style dice roller
import React, { useState } from 'react'
import { useGameStore } from '../../stores/gameStore'

const DICE_TYPES = [
  { sides: 4, symbol: '🎲', color: 'text-purple-400' },
  { sides: 6, symbol: '⚀', color: 'text-blue-400' },
  { sides: 8, symbol: '🎲', color: 'text-green-400' },
  { sides: 10, symbol: '🎲', color: 'text-yellow-400' },
  { sides: 12, symbol: '🎲', color: 'text-orange-400' },
  { sides: 20, symbol: '🎲', color: 'text-red-400' }
]

const QUICK_ROLLS = [
  { name: 'Attack Roll', dice: '1d20', modifier: 0, description: 'Basic attack roll' },
  { name: 'Damage', dice: '1d8', modifier: 0, description: 'Weapon damage' },
  { name: 'Saving Throw', dice: '1d20', modifier: 0, description: 'Save vs effect' },
  { name: 'Skill Check', dice: '1d20', modifier: 0, description: 'Ability check' },
  { name: 'Initiative', dice: '1d20', modifier: 0, description: 'Combat initiative' }
]

const DiceRoller = ({ onClose }) => {
  const [selectedDice, setSelectedDice] = useState([])
  const [modifier, setModifier] = useState(0)
  const [customExpression, setCustomExpression] = useState('')
  const [rollHistory, setRollHistory] = useState([])
  const [rolling, setRolling] = useState(false)
  const { sendMessage, currentPlayer } = useGameStore()

  const addDie = (sides) => {
    setSelectedDice(prev => [...prev, { sides, id: Date.now() }])
  }

  const removeDie = (id) => {
    setSelectedDice(prev => prev.filter(die => die.id !== id))
  }

  const rollDice = async (diceExpression = null, rollModifier = null, description = '') => {
    setRolling(true)
    
    let expression = diceExpression
    let mod = rollModifier ?? modifier
    
    if (!expression) {
      // Build expression from selected dice
      const diceGroups = {}
      selectedDice.forEach(die => {
        diceGroups[die.sides] = (diceGroups[die.sides] || 0) + 1
      })
      
      const parts = Object.entries(diceGroups).map(([sides, count]) => `${count}d${sides}`)
      expression = parts.join(' + ') || '1d20'
    }

    // Parse and roll the dice
    const result = parseDiceExpression(expression, mod)
    
    // Simulate rolling animation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const rollResult = {
      id: Date.now(),
      expression: `${expression}${mod !== 0 ? ` + ${mod}` : ''}`,
      rolls: result.rolls,
      modifier: mod,
      total: result.total,
      description,
      player: currentPlayer?.name || 'Unknown',
      timestamp: new Date()
    }
    
    setRollHistory(prev => [rollResult, ...prev.slice(0, 9)]) // Keep last 10 rolls
    setRolling(false)
    
    // Send to chat if it's a significant roll
    if (description || result.total >= 15) {
      const message = `🎲 ${rollResult.player} rolled ${rollResult.expression}: ${rollResult.total}${description ? ` (${description})` : ''}`
      sendMessage(message)
    }
    
    return rollResult
  }

  const parseDiceExpression = (expression, mod = 0) => {
    const rolls = []
    let total = mod
    
    // Simple parser for expressions like "2d6", "1d20+3", "3d8+1d4"
    const diceRegex = /(\d+)d(\d+)/g
    let match
    
    while ((match = diceRegex.exec(expression)) !== null) {
      const count = parseInt(match[1])
      const sides = parseInt(match[2])
      
      const diceRolls = []
      for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * sides) + 1
        diceRolls.push(roll)
        total += roll
      }
      
      rolls.push({
        count,
        sides,
        rolls: diceRolls,
        sum: diceRolls.reduce((a, b) => a + b, 0)
      })
    }
    
    return { rolls, total }
  }

  const quickRoll = async (quickRoll) => {
    await rollDice(quickRoll.dice, quickRoll.modifier, quickRoll.name)
  }

  const rollCustomExpression = async () => {
    if (!customExpression.trim()) return
    await rollDice(customExpression, 0, 'Custom Roll')
  }

  const clearSelectedDice = () => {
    setSelectedDice([])
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="ff-dialogue-box max-w-4xl w-full p-6 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="ff-stat-window mb-4">
          <div className="flex justify-between items-center">
            <h2 className="ff-stat-label">DICE ROLLER</h2>
            <button 
              className="ff-button ff-button-red text-xs"
              onClick={onClose}
            >
              CLOSE
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dice Selection & Rolling */}
          <div className="space-y-4">
            {/* Dice Types */}
            <div className="ff-stat-window">
              <h3 className="ff-stat-label mb-3 text-center">SELECT DICE</h3>
              <div className="grid grid-cols-3 gap-2">
                {DICE_TYPES.map(die => (
                  <button
                    key={die.sides}
                    className="ff-button text-xs h-12 flex flex-col items-center justify-center"
                    onClick={() => addDie(die.sides)}
                    disabled={rolling}
                  >
                    <span className={`text-lg ${die.color}`}>{die.symbol}</span>
                    <span>d{die.sides}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Dice */}
            {selectedDice.length > 0 && (
              <div className="ff-stat-window">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="ff-stat-label">SELECTED DICE</h3>
                  <button 
                    className="ff-button ff-button-red text-xs"
                    onClick={clearSelectedDice}
                  >
                    CLEAR
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {selectedDice.map(die => (
                    <button
                      key={die.id}
                      className="ff-button text-xs px-2 py-1"
                      onClick={() => removeDie(die.id)}
                      title="Click to remove"
                    >
                      d{die.sides} ×
                    </button>
                  ))}
                </div>
                
                {/* Modifier */}
                <div className="ff-stat-window">
                  <div className="ff-stat-row mb-2">
                    <span className="ff-stat-label">MODIFIER</span>
                  </div>
                  <input 
                    type="number" 
                    className="ff-input w-full text-center"
                    value={modifier}
                    onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    disabled={rolling}
                  />
                </div>
                
                <button 
                  className="ff-button ff-button-green w-full h-12 text-lg"
                  onClick={() => rollDice()}
                  disabled={rolling}
                >
                  {rolling ? 'ROLLING...' : '🎲 ROLL'}
                </button>
              </div>
            )}

            {/* Custom Expression */}
            <div className="ff-stat-window">
              <h3 className="ff-stat-label mb-3 text-center">CUSTOM ROLL</h3>
              <div className="space-y-2">
                <input 
                  type="text" 
                  className="ff-input w-full"
                  value={customExpression}
                  onChange={(e) => setCustomExpression(e.target.value)}
                  placeholder="2d6+3, 1d20+5, etc."
                  disabled={rolling}
                />
                <button 
                  className="ff-button w-full"
                  onClick={rollCustomExpression}
                  disabled={rolling || !customExpression.trim()}
                >
                  ROLL EXPRESSION
                </button>
              </div>
            </div>

            {/* Quick Rolls */}
            <div className="ff-stat-window">
              <h3 className="ff-stat-label mb-3 text-center">QUICK ROLLS</h3>
              <div className="space-y-2">
                {QUICK_ROLLS.map(roll => (
                  <button
                    key={roll.name}
                    className="ff-button w-full text-xs text-left"
                    onClick={() => quickRoll(roll)}
                    disabled={rolling}
                  >
                    <div className="flex justify-between">
                      <span>{roll.name}</span>
                      <span className="text-gray-300">{roll.dice}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Roll History */}
          <div className="space-y-4">
            <div className="ff-stat-window">
              <h3 className="ff-stat-label mb-3 text-center">ROLL HISTORY</h3>
              
              {rollHistory.length === 0 ? (
                <p className="text-gray-400 font-pixel text-xs text-center text-ff-shadow">
                  No rolls yet
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-auto">
                  {rollHistory.map(roll => (
                    <div key={roll.id} className="ff-stat-window p-2">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <div className="ff-stat-row">
                            <span className="ff-stat-label text-xs">{roll.description || 'Roll'}</span>
                            <span className="ff-stat-value text-lg">{roll.total}</span>
                          </div>
                          <div className="text-gray-300 font-pixel text-xs">
                            {roll.expression} by {roll.player}
                          </div>
                        </div>
                      </div>
                      
                      {/* Individual die results */}
                      <div className="space-y-1">
                        {roll.rolls.map((diceGroup, index) => (
                          <div key={index} className="text-xs text-gray-300">
                            {diceGroup.count}d{diceGroup.sides}: [{diceGroup.rolls.join(', ')}] = {diceGroup.sum}
                          </div>
                        ))}
                        {roll.modifier !== 0 && (
                          <div className="text-xs text-gray-300">
                            Modifier: {roll.modifier > 0 ? '+' : ''}{roll.modifier}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiceRoller
