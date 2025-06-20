// src/components/Game/CombatLog.jsx - Combat message tracking
import React, { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../../stores/gameStore'

const CombatLog = () => {
  const { messages } = useGameStore()
  const [filter, setFilter] = useState('all') // 'all', 'combat', 'dialogue', 'system'
  const logEndRef = useRef(null)

  const scrollToBottom = () => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const filteredMessages = messages.filter(message => {
    if (filter === 'all') return true
    return message.messageType === filter
  })

  const getMessageIcon = (messageType) => {
    switch (messageType) {
      case 'combat': return '⚔️'
      case 'dialogue': return '💬'
      case 'system': return '🔧'
      case 'damage': return '🩸'
      case 'healing': return '💚'
      case 'status': return '✨'
      case 'death': return '💀'
      case 'critical': return '🎯'
      default: return '📝'
    }
  }

  const getMessageColor = (messageType) => {
    switch (messageType) {
      case 'combat': return 'text-red-400'
      case 'dialogue': return 'text-blue-400'
      case 'system': return 'text-gray-400'
      case 'damage': return 'text-red-500'
      case 'healing': return 'text-green-400'
      case 'status': return 'text-yellow-400'
      case 'death': return 'text-purple-400'
      case 'critical': return 'text-orange-400'
      default: return 'text-white'
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const addSystemMessage = (content, type = 'system') => {
    // This would be called from game actions
    const message = {
      id: Date.now(),
      content,
      messageType: type,
      timestamp: new Date(),
      isSystem: true
    }
    // Would dispatch to game store
  }

  return (
    <div className="ff-window h-full flex flex-col">
      {/* Header */}
      <div className="ff-stat-window mb-2">
        <div className="flex justify-between items-center">
          <h3 className="ff-stat-label">COMBAT LOG</h3>
          <div className="flex gap-1">
            <button 
              className={`ff-button text-xs ${filter === 'all' ? 'ff-button-green' : ''}`}
              onClick={() => setFilter('all')}
            >
              ALL
            </button>
            <button 
              className={`ff-button text-xs ${filter === 'combat' ? 'ff-button-green' : ''}`}
              onClick={() => setFilter('combat')}
            >
              ⚔️
            </button>
            <button 
              className={`ff-button text-xs ${filter === 'dialogue' ? 'ff-button-green' : ''}`}
              onClick={() => setFilter('dialogue')}
            >
              💬
            </button>
            <button 
              className={`ff-button text-xs ${filter === 'system' ? 'ff-button-green' : ''}`}
              onClick={() => setFilter('system')}
            >
              🔧
            </button>
          </div>
        </div>
      </div>

      {/* Message Display */}
      <div className="flex-1 ff-window-dark p-2 overflow-auto max-h-64">
        {filteredMessages.length === 0 ? (
          <p className="text-gray-400 font-pixel text-xs text-center text-ff-shadow">
            No messages yet...
          </p>
        ) : (
          <div className="space-y-2">
            {filteredMessages.map(message => (
              <div key={message.id} className="flex items-start gap-2 p-1">
                {/* Timestamp */}
                <span className="text-gray-500 font-pixel text-xs min-w-16 text-right">
                  {formatTimestamp(message.timestamp)}
                </span>
                
                {/* Message Icon */}
                <span className="text-sm min-w-6 text-center">
                  {getMessageIcon(message.messageType)}
                </span>
                
                {/* Message Content */}
                <div className="flex-1">
                  <div className={`font-pixel text-xs leading-relaxed ${getMessageColor(message.messageType)}`}>
                    {/* Character name for dialogue */}
                    {message.character && (
                      <span className="text-yellow-400">
                        {message.character.name}: 
                      </span>
                    )}
                    
                    {/* Player name for system messages */}
                    {message.player && !message.character && (
                      <span className="text-blue-400">
                        {message.player.name}: 
                      </span>
                    )}
                    
                    {/* Message content */}
                    <span className="ml-1">{message.content}</span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="ff-stat-window mt-2">
        <div className="grid grid-cols-2 gap-1">
          <button 
            className="ff-button text-xs"
            onClick={() => {
              addSystemMessage('Round started', 'system')
            }}
          >
            ROUND START
          </button>
          <button 
            className="ff-button text-xs"
            onClick={() => {
              addSystemMessage('Initiative rolled', 'system')
            }}
          >
            INITIATIVE
          </button>
          <button 
            className="ff-button text-xs"
            onClick={() => {
              addSystemMessage('Combat ended', 'system')
            }}
          >
            COMBAT END
          </button>
          <button 
            className="ff-button ff-button-red text-xs"
            onClick={() => {
              // Clear messages
            }}
          >
            CLEAR
          </button>
        </div>
      </div>
    </div>
  )
}

// Example combat message generators
export const CombatMessages = {
  attack: (attacker, target, damage, isCritical = false) => ({
    content: `${attacker} attacks ${target} for ${damage} damage${isCritical ? ' (CRITICAL!)' : ''}`,
    messageType: isCritical ? 'critical' : 'combat'
  }),

  miss: (attacker, target) => ({
    content: `${attacker} attacks ${target} but misses!`,
    messageType: 'combat'
  }),

  heal: (healer, target, amount) => ({
    content: `${healer} heals ${target} for ${amount} HP`,
    messageType: 'healing'
  }),

  statusApplied: (character, effect) => ({
    content: `${character} is now ${effect}`,
    messageType: 'status'
  }),

  statusRemoved: (character, effect) => ({
    content: `${character} is no longer ${effect}`,
    messageType: 'status'
  }),

  death: (character) => ({
    content: `${character} has fallen!`,
    messageType: 'death'
  }),

  powerUsed: (character, powerName, target = null) => ({
    content: `${character} uses ${powerName}${target ? ` on ${target}` : ''}`,
    messageType: 'combat'
  }),

  turnStart: (character) => ({
    content: `${character}'s turn begins`,
    messageType: 'system'
  }),

  roundStart: (roundNumber) => ({
    content: `--- Round ${roundNumber} begins ---`,
    messageType: 'system'
  }),

  initiative: (character, roll) => ({
    content: `${character} rolled ${roll} for initiative`,
    messageType: 'system'
  })
}

export default CombatLog
