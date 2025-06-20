// src/components/Game/MonsterManagement.jsx - DM tool for spawning monsters
import React, { useState } from 'react'
import { useGameStore } from '../../stores/gameStore'

const MONSTER_TEMPLATES = [
  {
    id: 1,
    name: 'Goblin Warrior',
    type: 'humanoid',
    level: 1,
    hp: 15,
    ac: 14,
    attack: 3,
    damage: '1d6+1',
    speed: 6,
    xp: 25,
    description: 'Small, fierce humanoid with crude weapons',
    sprite: '👹'
  },
  {
    id: 2,
    name: 'Orc Berserker',
    type: 'humanoid', 
    level: 3,
    hp: 35,
    ac: 16,
    attack: 5,
    damage: '1d8+3',
    speed: 5,
    xp: 150,
    description: 'Large, brutal warrior in a battle rage',
    sprite: '💀'
  },
  {
    id: 3,
    name: 'Skeleton Archer',
    type: 'undead',
    level: 2,
    hp: 20,
    ac: 15,
    attack: 4,
    damage: '1d6+2',
    speed: 6,
    xp: 100,
    description: 'Animated bones wielding a longbow',
    sprite: '💀'
  },
  {
    id: 4,
    name: 'Fire Elemental',
    type: 'elemental',
    level: 5,
    hp: 55,
    ac: 17,
    attack: 7,
    damage: '2d6+4',
    speed: 8,
    xp: 400,
    description: 'Living flame that burns everything it touches',
    sprite: '🔥'
  },
  {
    id: 5,
    name: 'Giant Spider',
    type: 'beast',
    level: 2,
    hp: 25,
    ac: 14,
    attack: 4,
    damage: '1d8+2',
    speed: 7,
    xp: 125,
    description: 'Large arachnid with venomous fangs',
    sprite: '🕷️'
  }
]

const MonsterManagement = ({ onClose, onSpawnMonster }) => {
  const [selectedMonster, setSelectedMonster] = useState(null)
  const [spawnMode, setSpawnMode] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const { currentPlayer, characters } = useGameStore()
  
  // Only show for DMs
  if (currentPlayer?.role !== 'dm') {
    return null
  }

  const existingMonsters = characters.filter(char => char.is_npc || char.monster_id)

  const handleSpawnClick = (monster) => {
    setSelectedMonster(monster)
    setSpawnMode(true)
  }

  const confirmSpawn = () => {
    if (selectedMonster && quantity > 0) {
      for (let i = 0; i < quantity; i++) {
        const monsterInstance = {
          ...selectedMonster,
          id: `monster_${Date.now()}_${i}`,
          name: quantity > 1 ? `${selectedMonster.name} ${i + 1}` : selectedMonster.name,
          max_hp: selectedMonster.hp,
          max_mp: 0,
          mp: 0,
          defense: selectedMonster.ac,
          grid_x: Math.floor(Math.random() * 20),
          grid_y: Math.floor(Math.random() * 20),
          facing: 'down',
          is_npc: true,
          monster_id: selectedMonster.id,
          initiative: 0,
          has_acted: false,
          has_moved: false
        }
        
        onSpawnMonster(monsterInstance)
      }
    }
    
    setSpawnMode(false)
    setSelectedMonster(null)
    setQuantity(1)
  }

  const removeMonster = (monsterId) => {
    // TODO: Implement monster removal
    console.log('Remove monster:', monsterId)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="ff-dialogue-box max-w-4xl w-full p-6 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="ff-stat-window mb-4">
          <div className="flex justify-between items-center">
            <h2 className="ff-stat-label">MONSTER MANAGEMENT</h2>
            <button 
              className="ff-button ff-button-red text-xs"
              onClick={onClose}
            >
              CLOSE
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monster Templates */}
          <div className="space-y-4">
            <div className="ff-stat-window">
              <h3 className="ff-stat-label mb-3 text-center">SPAWN MONSTERS</h3>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-auto">
              {MONSTER_TEMPLATES.map(monster => (
                <div
                  key={monster.id}
                  className={`
                    ff-stat-window cursor-pointer transition-all duration-200 p-3
                    ${selectedMonster?.id === monster.id ? 'border-yellow-400 bg-yellow-900 bg-opacity-20' : 'hover:border-red-400'}
                  `}
                  onClick={() => setSelectedMonster(monster)}
                >
                  <div className="flex items-start gap-3">
                    {/* Monster Icon */}
                    <div className="text-2xl">{monster.sprite}</div>
                    
                    {/* Monster Info */}
                    <div className="flex-1">
                      <div className="ff-stat-row mb-1">
                        <span className="ff-stat-label">{monster.name}</span>
                        <span className="ff-stat-value">L{monster.level}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div className="ff-stat-row">
                          <span className="ff-stat-label">HP</span>
                          <span className="ff-stat-value">{monster.hp}</span>
                        </div>
                        <div className="ff-stat-row">
                          <span className="ff-stat-label">AC</span>
                          <span className="ff-stat-value">{monster.ac}</span>
                        </div>
                        <div className="ff-stat-row">
                          <span className="ff-stat-label">ATK</span>
                          <span className="ff-stat-value">+{monster.attack}</span>
                        </div>
                        <div className="ff-stat-row">
                          <span className="ff-stat-label">DMG</span>
                          <span className="ff-stat-value">{monster.damage}</span>
                        </div>
                        <div className="ff-stat-row">
                          <span className="ff-stat-label">SPD</span>
                          <span className="ff-stat-value">{monster.speed}</span>
                        </div>
                        <div className="ff-stat-row">
                          <span className="ff-stat-label">XP</span>
                          <span className="ff-stat-value">{monster.xp}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 font-pixel text-xs leading-relaxed">
                        {monster.description}
                      </p>
                    </div>

                    {/* Spawn Button */}
                    <button 
                      className="ff-button ff-button-green text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSpawnClick(monster)
                      }}
                    >
                      SPAWN
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Monsters & Spawn Controls */}
          <div className="space-y-4">
            {/* Spawn Controls */}
            {spawnMode && selectedMonster && (
              <div className="ff-stat-window">
                <h3 className="ff-stat-label mb-3 text-center">SPAWN: {selectedMonster.name}</h3>
                
                <div className="space-y-3">
                  <div className="ff-stat-window">
                    <div className="ff-stat-row mb-2">
                      <span className="ff-stat-label">QUANTITY</span>
                    </div>
                    <input 
                      type="number" 
                      className="ff-input w-full text-center"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                      min="1"
                      max="10"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button 
                      className="ff-button ff-button-green flex-1"
                      onClick={confirmSpawn}
                    >
                      CONFIRM SPAWN
                    </button>
                    <button 
                      className="ff-button ff-button-red"
                      onClick={() => {
                        setSpawnMode(false)
                        setSelectedMonster(null)
                      }}
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Active Monsters List */}
            <div className="ff-stat-window">
              <h3 className="ff-stat-label mb-3 text-center">
                ACTIVE MONSTERS ({existingMonsters.length})
              </h3>
              
              {existingMonsters.length === 0 ? (
                <p className="text-gray-400 font-pixel text-xs text-center text-ff-shadow">
                  No monsters on the battlefield
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-auto">
                  {existingMonsters.map(monster => {
                    const hpPercentage = (monster.hp / monster.max_hp) * 100
                    
                    return (
                      <div key={monster.id} className="ff-stat-window p-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {MONSTER_TEMPLATES.find(t => t.id === monster.monster_id)?.sprite || '👹'}
                            </span>
                            <div>
                              <div className="ff-stat-row">
                                <span className="ff-stat-label text-xs">{monster.name}</span>
                              </div>
                              <div className="ff-stat-row">
                                <span className="text-gray-300 text-xs">
                                  HP: {monster.hp}/{monster.max_hp}
                                </span>
                              </div>
                              
                              {/* HP Bar */}
                              <div className="w-16 h-1 bg-gray-800 border border-white mt-1">
                                <div 
                                  className={`h-full transition-all duration-300 ${
                                    hpPercentage > 50 ? 'bg-green-500' : 
                                    hpPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${hpPercentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-300">
                              ({monster.grid_x}, {monster.grid_y})
                            </span>
                            <button 
                              className="ff-button ff-button-red text-xs"
                              onClick={() => removeMonster(monster.id)}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Monster Actions */}
            <div className="ff-stat-window">
              <h3 className="ff-stat-label mb-3 text-center">MONSTER ACTIONS</h3>
              
              <div className="space-y-2">
                <button 
                  className="ff-button w-full text-xs"
                  onClick={() => console.log('Roll initiative for all monsters')}
                >
                  ROLL INITIATIVE
                </button>
                <button 
                  className="ff-button w-full text-xs"
                  onClick={() => console.log('Reset monster actions')}
                >
                  RESET ACTIONS
                </button>
                <button 
                  className="ff-button ff-button-red w-full text-xs"
                  onClick={() => console.log('Remove all monsters')}
                >
                  CLEAR ALL
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MonsterManagement
