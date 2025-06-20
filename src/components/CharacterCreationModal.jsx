// src/components/CharacterCreationModal.jsx - Enhanced with powers and file upload
import React, { useState, useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'

const CHARACTER_CLASSES = [
  { 
    name: 'fighter', 
    display: 'Fighter',
    description: 'Heavily armored warrior with devastating melee attacks',
    stats: { hp: 30, mp: 10, attack: 8, defense: 7, speed: 4 },
    primaryStat: 'Strength'
  },
  { 
    name: 'wizard', 
    display: 'Wizard',
    description: 'Master of arcane magic with powerful ranged spells',
    stats: { hp: 18, mp: 25, attack: 4, defense: 3, speed: 5 },
    primaryStat: 'Intelligence'
  },
  { 
    name: 'rogue', 
    display: 'Rogue',
    description: 'Stealthy combatant with precise strikes and mobility',
    stats: { hp: 22, mp: 15, attack: 6, defense: 4, speed: 8 },
    primaryStat: 'Dexterity'
  },
  { 
    name: 'cleric', 
    display: 'Cleric',
    description: 'Divine spellcaster focused on healing and support',
    stats: { hp: 26, mp: 20, attack: 5, defense: 5, speed: 4 },
    primaryStat: 'Wisdom'
  }
]

const DEFAULT_POWERS = {
  fighter: [
    { name: 'Cleave', type: 'at_will', description: 'Basic melee attack that can hit adjacent enemies' },
    { name: 'Power Attack', type: 'at_will', description: 'Heavy attack with increased damage' },
    { name: 'Shield Bash', type: 'encounter', description: 'Attack that can knock enemies prone' }
  ],
  wizard: [
    { name: 'Magic Missile', type: 'at_will', description: 'Unerring bolt of magical energy' },
    { name: 'Ray of Frost', type: 'at_will', description: 'Icy ray that slows the target' },
    { name: 'Burning Hands', type: 'encounter', description: 'Cone of fire affecting multiple enemies' }
  ],
  rogue: [
    { name: 'Piercing Strike', type: 'at_will', description: 'Precise attack targeting weak points' },
    { name: 'Sly Flourish', type: 'at_will', description: 'Deceptive attack with extra damage' },
    { name: 'Dazing Strike', type: 'encounter', description: 'Attack that dazes the target' }
  ],
  cleric: [
    { name: 'Sacred Flame', type: 'at_will', description: 'Divine fire that damages undead' },
    { name: 'Blessing of Battle', type: 'at_will', description: 'Grant ally +2 to next attack' },
    { name: 'Healing Word', type: 'encounter', description: 'Heal ally for 2d6+4 hit points' }
  ]
}

const CharacterCreationModal = ({ onClose, onCharacterCreated }) => {
  const [step, setStep] = useState(1) // 1: Basic Info, 2: Powers, 3: Portrait
  const [name, setName] = useState('')
  const [selectedClass, setSelectedClass] = useState('fighter')
  const [selectedPowers, setSelectedPowers] = useState([])
  const [portraitFile, setPortraitFile] = useState(null)
  const [spriteFile, setSpriteFile] = useState(null)
  const { createCharacter, loading, error } = useGameStore()

  useEffect(() => {
    // Reset powers when class changes
    setSelectedPowers([])
  }, [selectedClass])

  const handleSubmit = async () => {
    if (!name.trim()) return

    try {
      const characterData = {
        name: name.trim(),
        class: selectedClass,
        powers: selectedPowers,
        portraitFile,
        spriteFile
      }
      
      const character = await createCharacter(characterData)
      onCharacterCreated(character)
      onClose()
    } catch (error) {
      console.error('Failed to create character:', error)
    }
  }

  const selectedClassData = CHARACTER_CLASSES.find(c => c.name === selectedClass)
  const availablePowers = DEFAULT_POWERS[selectedClass] || []

  const togglePower = (power) => {
    setSelectedPowers(prev => {
      const exists = prev.find(p => p.name === power.name)
      if (exists) {
        return prev.filter(p => p.name !== power.name)
      } else {
        return [...prev, power]
      }
    })
  }

  const handleFileChange = (event, type) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
      if (type === 'portrait') {
        setPortraitFile(file)
      } else if (type === 'sprite') {
        setSpriteFile(file)
      }
    }
  }

  const getPowerTypeColor = (type) => {
    switch (type) {
      case 'at_will': return 'text-green-400'
      case 'encounter': return 'text-yellow-400'  
      case 'daily': return 'text-red-400'
      default: return 'text-white'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="ff-dialogue-box max-w-4xl w-full p-6 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="ff-stat-window mb-4">
          <div className="flex justify-between items-center">
            <h2 className="ff-stat-label">CREATE CHARACTER</h2>
            <div className="flex items-center gap-4">
              <div className="ff-stat-row">
                <span className="ff-stat-label">STEP</span>
                <span className="ff-stat-value">{step}/3</span>
              </div>
              <button 
                className="ff-button ff-button-red text-xs"
                onClick={onClose}
                disabled={loading}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="ff-window-dark p-3 mb-4">
            <p className="text-red-400 font-pixel text-xs text-ff-shadow text-center">
              ERROR: {error}
            </p>
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="ff-stat-window">
              <div className="ff-stat-row mb-2">
                <span className="ff-stat-label">CHARACTER NAME</span>
              </div>
              <input 
                type="text" 
                className="ff-input w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ENTER NAME"
                maxLength={30}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-4">
              <h3 className="ff-stat-label text-center">CHOOSE CLASS</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CHARACTER_CLASSES.map(charClass => (
                  <div
                    key={charClass.name}
                    className={`
                      ff-stat-window cursor-pointer transition-all duration-200
                      ${selectedClass === charClass.name ? 'border-yellow-400 bg-yellow-900 bg-opacity-20' : 'hover:border-blue-400'}
                    `}
                    onClick={() => setSelectedClass(charClass.name)}
                  >
                    <div className="text-white font-pixel text-xs">
                      <h3 className="ff-stat-label mb-2">{charClass.display}</h3>
                      <p className="text-gray-300 text-xs mb-3 leading-relaxed">{charClass.description}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="ff-stat-row">
                          <span className="ff-stat-label">HP</span>
                          <span className="ff-stat-value">{charClass.stats.hp}</span>
                        </div>
                        <div className="ff-stat-row">
                          <span className="ff-stat-label">MP</span>
                          <span className="ff-stat-value">{charClass.stats.mp}</span>
                        </div>
                        <div className="ff-stat-row">
                          <span className="ff-stat-label">ATK</span>
                          <span className="ff-stat-value">{charClass.stats.attack}</span>
                        </div>
                        <div className="ff-stat-row">
                          <span className="ff-stat-label">DEF</span>
                          <span className="ff-stat-value">{charClass.stats.defense}</span>
                        </div>
                        <div className="ff-stat-row">
                          <span className="ff-stat-label">SPD</span>
                          <span className="ff-stat-value">{charClass.stats.speed}</span>
                        </div>
                        <div className="ff-stat-row">
                          <span className="ff-stat-label">MAIN</span>
                          <span className="ff-stat-value text-xs">{charClass.primaryStat.substring(0,3).toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                className="ff-button ff-button-green"
                onClick={() => setStep(2)}
                disabled={!name.trim()}
              >
                NEXT: POWERS
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Powers Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="ff-stat-window text-center">
              <h3 className="ff-stat-label mb-2">SELECT POWERS</h3>
              <p className="text-white font-pixel text-xs text-ff-shadow">
                Choose 2 at-will powers and 1 encounter power for {selectedClassData?.display}
              </p>
            </div>

            <div className="space-y-4">
              {availablePowers.map(power => {
                const isSelected = selectedPowers.find(p => p.name === power.name)
                const typeCount = selectedPowers.filter(p => p.type === power.type).length
                const canSelect = power.type === 'at_will' ? typeCount < 2 : typeCount < 1
                
                return (
                  <div
                    key={power.name}
                    className={`
                      ff-stat-window cursor-pointer transition-all duration-200
                      ${isSelected ? 'border-yellow-400 bg-yellow-900 bg-opacity-20' : ''}
                      ${!canSelect && !isSelected ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}
                    `}
                    onClick={() => (canSelect || isSelected) && togglePower(power)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="ff-stat-row mb-1">
                          <span className="ff-stat-label">{power.name}</span>
                          <span className={`ff-stat-value text-xs ${getPowerTypeColor(power.type)}`}>
                            {power.type.replace('_', '-').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-300 font-pixel text-xs leading-relaxed">
                          {power.description}
                        </p>
                      </div>
                      <div className="ml-4">
                        {isSelected ? (
                          <span className="text-yellow-400 font-pixel text-lg">✓</span>
                        ) : (
                          <span className="text-gray-600 font-pixel text-lg">○</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="ff-stat-window">
              <div className="ff-stat-row">
                <span className="ff-stat-label">SELECTED</span>
                <span className="ff-stat-value">{selectedPowers.length}/3</span>
              </div>
              <div className="text-xs text-gray-300 font-pixel text-ff-shadow mt-2">
                At-Will: {selectedPowers.filter(p => p.type === 'at_will').length}/2 • 
                Encounter: {selectedPowers.filter(p => p.type === 'encounter').length}/1
              </div>
            </div>

            <div className="flex justify-between">
              <button 
                className="ff-button"
                onClick={() => setStep(1)}
              >
                BACK
              </button>
              <button 
                className="ff-button ff-button-green"
                onClick={() => setStep(3)}
                disabled={selectedPowers.length !== 3}
              >
                NEXT: PORTRAIT
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Portrait & Sprite Upload */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="ff-stat-window text-center">
              <h3 className="ff-stat-label mb-2">CHARACTER ART</h3>
              <p className="text-white font-pixel text-xs text-ff-shadow">
                Upload portrait and sprite images (optional)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Portrait Upload */}
              <div className="ff-stat-window">
                <h4 className="ff-stat-label mb-3 text-center">PORTRAIT</h4>
                <div className="text-center">
                  <div className="ff-portrait mx-auto mb-3 bg-gray-800">
                    {portraitFile ? (
                      <img 
                        src={URL.createObjectURL(portraitFile)} 
                        alt="Portrait preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-pixel text-xl">
                        {name ? name[0]?.toUpperCase() : '?'}
                      </span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'portrait')}
                    className="hidden"
                    id="portrait-upload"
                  />
                  <label 
                    htmlFor="portrait-upload"
                    className="ff-button text-xs cursor-pointer inline-block"
                  >
                    UPLOAD
                  </label>
                  {portraitFile && (
                    <button 
                      className="ff-button ff-button-red text-xs ml-2"
                      onClick={() => setPortraitFile(null)}
                    >
                      REMOVE
                    </button>
                  )}
                </div>
              </div>

              {/* Sprite Upload */}
              <div className="ff-stat-window">
                <h4 className="ff-stat-label mb-3 text-center">BATTLE SPRITE</h4>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 border-2 border-white bg-gray-800 flex items-center justify-center">
                    {spriteFile ? (
                      <img 
                        src={URL.createObjectURL(spriteFile)} 
                        alt="Sprite preview"
                        className="w-full h-full object-cover pixel-perfect"
                      />
                    ) : (
                      <span className="text-white font-pixel text-xs">
                        {selectedClass[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'sprite')}
                    className="hidden"
                    id="sprite-upload"
                  />
                  <label 
                    htmlFor="sprite-upload"
                    className="ff-button text-xs cursor-pointer inline-block"
                  >
                    UPLOAD
                  </label>
                  {spriteFile && (
                    <button 
                      className="ff-button ff-button-red text-xs ml-2"
                      onClick={() => setSpriteFile(null)}
                    >
                      REMOVE
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Character Summary */}
            <div className="ff-stat-window">
              <h4 className="ff-stat-label mb-3 text-center">CHARACTER SUMMARY</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="ff-stat-row">
                    <span className="ff-stat-label">NAME</span>
                    <span className="ff-stat-value">{name}</span>
                  </div>
                  <div className="ff-stat-row">
                    <span className="ff-stat-label">CLASS</span>
                    <span className="ff-stat-value">{selectedClassData?.display}</span>
                  </div>
                </div>
                <div>
                  <div className="ff-stat-row">
                    <span className="ff-stat-label">POWERS</span>
                    <span className="ff-stat-value">{selectedPowers.length}</span>
                  </div>
                  <div className="ff-stat-row">
                    <span className="ff-stat-label">IMAGES</span>
                    <span className="ff-stat-value">
                      {(portraitFile ? 1 : 0) + (spriteFile ? 1 : 0)}/2
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button 
                className="ff-button"
                onClick={() => setStep(2)}
              >
                BACK
              </button>
              <button 
                className="ff-button ff-button-green"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'CREATING...' : 'CREATE CHARACTER'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CharacterCreationModal
