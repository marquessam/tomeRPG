// src/components/UI/DialoguePopup.jsx
import React, { useState, useEffect } from 'react'
import { useGameStore } from '../../stores/gameStore'

const DialoguePopup = ({ onClose, character }) => {
  const [message, setMessage] = useState('')
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const { sendMessage } = useGameStore()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!message.trim()) return

    // Start typewriter effect
    setIsTyping(true)
    setDisplayedText('')
    
    let index = 0
    const fullText = `"${message.trim()}"`
    
    const typeInterval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1))
        index++
      } else {
        clearInterval(typeInterval)
        setIsTyping(false)
        
        // Send message to game store
        sendMessage({
          content: message.trim(),
          character: character,
          type: 'dialogue'
        })
        
        // Auto close after a delay
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    }, 50) // Typing speed
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="nes-container with-title is-rounded bg-nes-blue max-w-2xl w-full">
        <p className="title text-white font-pixel">Character Dialogue</p>
        
        {/* Character Portrait Area */}
        <div className="flex gap-4 mb-4">
          <div className="w-16 h-16 bg-gray-700 border-2 border-white rounded flex items-center justify-center">
            <span className="text-white font-pixel text-xs">
              {character?.name?.[0] || '?'}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-pixel text-sm mb-1">
              {character?.name || 'Unknown Character'}
            </h3>
            <p className="text-gray-300 font-pixel text-xs">
              {character?.class || 'Adventurer'}
            </p>
          </div>
        </div>

        {/* Dialogue Display */}
        {displayedText && (
          <div className="dialogue-box mb-4 min-h-20 flex items-center">
            <p className="text-white font-pixel text-sm leading-relaxed">
              {displayedText}
              {isTyping && <span className="animate-pulse">|</span>}
            </p>
          </div>
        )}

        {/* Input Form */}
        {!isTyping && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="nes-field">
              <label className="text-white font-pixel text-xs">What does {character?.name || 'your character'} say?</label>
              <textarea 
                className="nes-textarea font-pixel text-xs"
                rows="3"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter dialogue here..."
                maxLength={200}
                required
                autoFocus
              />
              <p className="text-gray-300 font-pixel text-xs mt-1">
                {message.length}/200 characters
              </p>
            </div>

            <div className="flex gap-4">
              <button 
                type="submit" 
                className="nes-btn is-primary font-pixel text-xs flex-1"
                disabled={!message.trim()}
              >
                Speak
              </button>
              <button 
                type="button"
                className="nes-btn font-pixel text-xs"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default DialoguePopup
