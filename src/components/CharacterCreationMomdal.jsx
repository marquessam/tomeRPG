// src/components/CharacterCreationModal.jsx - New component for character creation
import React, { useState } from 'react'
import { useGameStore } from '../stores/gameStore'

const CHARACTER_CLASSES = [
  { 
    name: 'fighter', 
    display: 'Fighter',
    description: 'Strong melee combatant with high HP and attack',
    stats: { hp: 30, mp: 5, attack: 8, defense: 6, speed: 4 }
  },
  { 
    name: 'mage', 
    display: 'Mage',
    description: 'Magical damage dealer with powerful spells',
    stats: { hp: 15, mp: 20, attack: 5, defense: 3, speed: 5 }
  },
  { 
    name: 'thief', 
    display: 'Thief',
    description: 'Fast and agile with backstab abilities',
    stats: { hp: 20, mp: 10, attack: 6, defense: 4, speed: 7 }
  },
  { 
    name: 'cleric', 
    display: 'Cleric',
    description: 'Support character with healing and buffs',
    stats: { hp: 25, mp: 15, attack: 5, defense: 5, speed: 4 }
  }
]

const CharacterCreationModal = ({ onClose, onCharacterCreated }) => {
  const [name, setName] = useState('')
  const [selectedClass, setSelectedClass] = useState('fighter')
  const { createCharacter, loading, error } = useGameStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      const character = await createCharacter(name.trim(), selectedClass)
      onCharacterCreated(character)
      onClose()
    } catch (error) {
      console.error('Failed to create character:', error)
    }
  }

  const selectedClassData = CHARACTER_CLASSES.find(c => c.name === selectedClass)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="nes-container with-title is-rounded bg-nes-blue max-w-2xl w-full">
        <p className="title text-white font-pixel">Create Character</p>
        
        {error && (
          <div className="nes-container is-error mb-4">
            <p className="text-red-200 font-pixel text-xs">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="nes-field">
            <label className="text-white font-pixel text-xs">Character Name:</label>
            <input 
              type="text" 
              className="nes-input font-pixel text-xs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter character name"
              maxLength={30}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-white font-pixel text-xs">Choose Class:</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CHARACTER_CLASSES.map(charClass => (
                <div
                  key={charClass.name}
                  className={`
                    nes-container cursor-pointer transition-all duration-200
                    ${selectedClass === charClass.name ? 'is-primary' : 'is-dark'}
                  `}
                  onClick={() => setSelectedClass(charClass.name)}
                >
                  <div className="text-white font-pixel text-xs">
                    <h3 className="mb-1">{charClass.display}</h3>
                    <p className="text-gray-300 text-xs mb-2">{charClass.description}</p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <span>HP: {charClass.stats.hp}</span>
                      <span>MP: {charClass.stats.mp}</span>
                      <span>ATK: {charClass.stats.attack}</span>
                      <span>DEF: {charClass.stats.defense}</span>
                      <span>SPD: {charClass.stats.speed}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              type="submit" 
              className="nes-btn is-success font-pixel text-xs flex-1"
              disabled={loading || !name.trim()}
            >
              {loading ? 'Creating...' : 'Create Character'}
            </button>
            <button 
              type="button"
              className="nes-btn font-pixel text-xs"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CharacterCreationModal
