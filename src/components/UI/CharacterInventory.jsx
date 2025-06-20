// src/components/UI/CharacterInventory.jsx - Inventory and equipment management
import React, { useState } from 'react'
import { useGameStore } from '../../stores/gameStore'

const CharacterInventory = ({ onClose }) => {
  const { characters, currentPlayer } = useGameStore()
  const [selectedTab, setSelectedTab] = useState('equipment') // 'equipment', 'inventory', 'powers'
  
  // Find current player's character
  const character = characters.find(c => c.player_id === currentPlayer?.id)

  if (!character) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
        <div className="ff-dialogue-box max-w-md w-full p-6">
          <div className="ff-stat-window text-center">
            <h2 className="ff-stat-label mb-4">NO CHARACTER</h2>
            <p className="text-white font-pixel text-xs text-ff-shadow mb-4">
              You need a character to access inventory.
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

  // Mock data - would come from character in real implementation
  const mockInventory = [
    { id: 1, name: 'Health Potion', type: 'consumable', quantity: 3, description: 'Restores 2d4+2 HP' },
    { id: 2, name: 'Rope (50ft)', type: 'gear', quantity: 1, description: 'Sturdy hemp rope' },
    { id: 3, name: 'Torch', type: 'gear', quantity: 5, description: 'Provides light for 1 hour' },
    { id: 4, name: 'Gold Pieces', type: 'currency', quantity: 150, description: 'Standard currency' }
  ]

  const mockEquipment = {
    main_hand: { id: 1, name: 'Iron Sword', attack_bonus: 1, damage_bonus: 2 },
    off_hand: { id: 2, name: 'Steel Shield', defense_bonus: 2 },
    armor: { id: 3, name: 'Leather Armor', defense_bonus: 3 },
    accessory: null
  }

  const mockPowers = [
    { 
      id: 1, name: 'Cleave', type: 'at_will', action_type: 'standard',
      description: 'Basic melee attack that can hit adjacent enemies',
      uses_remaining: null
    },
    { 
      id: 2, name: 'Shield Bash', type: 'encounter', action_type: 'standard',
      description: 'Attack that can knock enemies prone',
      uses_remaining: 1
    }
  ]

  const getPowerTypeColor = (type) => {
    switch (type) {
      case 'at_will': return 'text-green-400'
      case 'encounter': return 'text-yellow-400'  
      case 'daily': return 'text-red-400'
      default: return 'text-white'
    }
  }

  const getItemTypeIcon = (type) => {
    switch (type) {
      case 'weapon': return '⚔️'
      case 'armor': return '🛡️'
      case 'accessory': return '💍'
      case 'consumable': return '🧪'
      case 'gear': return '🎒'
      case 'currency': return '💰'
      default: return '📦'
    }
  }

  const useItem = (item) => {
    if (item.type === 'consumable') {
      console.log('Using item:', item.name)
      // TODO: Implement item effects
    }
  }

  const equipItem = (item) => {
    console.log('Equipping item:', item.name)
    // TODO: Implement equipment system
  }

  const unequipItem = (slot) => {
    console.log('Unequipping slot:', slot)
    // TODO: Implement unequip
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="ff-dialogue-box max-w-4xl w-full p-6 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="ff-stat-window mb-4">
          <div className="flex justify-between items-center">
            <h2 className="ff-stat-label">
              {character.name?.toUpperCase()}'S INVENTORY
            </h2>
            <button 
              className="ff-button ff-button-red text-xs"
              onClick={onClose}
            >
              CLOSE
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="ff-stat-window mb-4">
          <div className="flex gap-2">
            <button 
              className={`ff-button flex-1 text-xs ${selectedTab === 'equipment' ? 'ff-button-green' : ''}`}
              onClick={() => setSelectedTab('equipment')}
            >
              EQUIPMENT
            </button>
            <button 
              className={`ff-button flex-1 text-xs ${selectedTab === 'inventory' ? 'ff-button-green' : ''}`}
              onClick={() => setSelectedTab('inventory')}
            >
              INVENTORY
            </button>
            <button 
              className={`ff-button flex-1 text-xs ${selectedTab === 'powers' ? 'ff-button-green' : ''}`}
              onClick={() => setSelectedTab('powers')}
            >
              POWERS
            </button>
          </div>
        </div>

        {/* Equipment Tab */}
        {selectedTab === 'equipment' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Equipment Slots */}
            <div className="ff-stat-window">
              <h3 className="ff-stat-label mb-3 text-center">EQUIPPED ITEMS</h3>
              
              <div className="space-y-3">
                {/* Main Hand */}
                <div className="ff-stat-window p-2">
                  <div className="flex justify-between items-center">
                    <span className="ff-stat-label text-xs">MAIN HAND</span>
                    {mockEquipment.main_hand && (
                      <button 
                        className="ff-button ff-button-red text-xs"
                        onClick={() => unequipItem('main_hand')}
                      >
                        UNEQUIP
                      </button>
                    )}
                  </div>
                  {mockEquipment.main_hand ? (
                    <div className="mt-2">
                      <div className="ff-stat-row">
                        <span className="text-white font-pixel text-xs">
                          ⚔️ {mockEquipment.main_hand.name}
                        </span>
                      </div>
                      <div className="text-gray-300 font-pixel text-xs">
                        +{mockEquipment.main_hand.attack_bonus} ATK, +{mockEquipment.main_hand.damage_bonus} DMG
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 font-pixel text-xs mt-2">Empty</div>
                  )}
                </div>

                {/* Off Hand */}
                <div className="ff-stat-window p-2">
                  <div className="flex justify-between items-center">
                    <span className="ff-stat-label text-xs">OFF HAND</span>
                    {mockEquipment.off_hand && (
                      <button 
                        className="ff-button ff-button-red text-xs"
                        onClick={() => unequipItem('off_hand')}
                      >
                        UNEQUIP
                      </button>
                    )}
                  </div>
                  {mockEquipment.off_hand ? (
                    <div className="mt-2">
                      <div className="ff-stat-row">
                        <span className="text-white font-pixel text-xs">
                          🛡️ {mockEquipment.off_hand.name}
                        </span>
                      </div>
                      <div className="text-gray-300 font-pixel text-xs">
                        +{mockEquipment.off_hand.defense_bonus} DEF
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 font-pixel text-xs mt-2">Empty</div>
                  )}
                </div>

                {/* Armor */}
                <div className="ff-stat-window p-2">
                  <div className="flex justify-between items-center">
                    <span className="ff-stat-label text-xs">ARMOR</span>
                    {mockEquipment.armor && (
                      <button 
                        className="ff-button ff-button-red text-xs"
                        onClick={() => unequipItem('armor')}
                      >
                        UNEQUIP
                      </button>
                    )}
                  </div>
                  {mockEquipment.armor ? (
                    <div className="mt-2">
                      <div className="ff-stat-row">
                        <span className="text-white font-pixel text-xs">
                          👕 {mockEquipment.armor.name}
                        </span>
                      </div>
                      <div className="text-gray-300 font-pixel text-xs">
                        +{mockEquipment.armor.defense_bonus} DEF
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 font-pixel text-xs mt-2">Empty</div>
                  )}
                </div>

                {/* Accessory */}
                <div className="ff-stat-window p-2">
                  <div className="flex justify-between items-center">
                    <span className="ff-stat-label text-xs">ACCESSORY</span>
                  </div>
                  <div className="text-gray-500 font-pixel text-xs mt-2">Empty</div>
                </div>
              </div>
            </div>

            {/* Character Stats */}
            <div className="ff-stat-window">
              <h3 className="ff-stat-label mb-3 text-center">COMBAT STATS</h3>
              
              <div className="space-y-2">
                <div className="ff-stat-row">
                  <span className="ff-stat-label">ATTACK</span>
                  <span className="ff-stat-value">
                    {character.attack + (mockEquipment.main_hand?.attack_bonus || 0)}
                  </span>
                </div>
                <div className="ff-stat-row">
                  <span className="ff-stat-label">DEFENSE</span>
                  <span className="ff-stat-value">
                    {character.defense + 
                     (mockEquipment.off_hand?.defense_bonus || 0) + 
                     (mockEquipment.armor?.defense_bonus || 0)}
                  </span>
                </div>
                <div className="ff-stat-row">
                  <span className="ff-stat-label">SPEED</span>
                  <span className="ff-stat-value">{character.speed}</span>
                </div>
                <div className="ff-stat-row">
                  <span className="ff-stat-label">ARMOR CLASS</span>
                  <span className="ff-stat-value">
                    {10 + character.defense + 
                     (mockEquipment.off_hand?.defense_bonus || 0) + 
                     (mockEquipment.armor?.defense_bonus || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {selectedTab === 'inventory' && (
          <div className="ff-stat-window">
            <h3 className="ff-stat-label mb-3 text-center">CARRIED ITEMS</h3>
            
            {mockInventory.length === 0 ? (
              <p className="text-gray-400 font-pixel text-xs text-center text-ff-shadow">
                No items in inventory
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mockInventory.map(item => (
                  <div key={item.id} className="ff-stat-window p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getItemTypeIcon(item.type)}</span>
                        <div>
                          <div className="ff-stat-row">
                            <span className="ff-stat-label text-xs">{item.name}</span>
                          </div>
                          {item.quantity > 1 && (
                            <div className="ff-stat-row">
                              <span className="text-gray-300 text-xs">Qty: {item.quantity}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {item.type === 'consumable' && (
                        <button 
                          className="ff-button ff-button-green text-xs"
                          onClick={() => useItem(item)}
                        >
                          USE
                        </button>
                      )}
                      {item.type === 'weapon' || item.type === 'armor' && (
                        <button 
                          className="ff-button text-xs"
                          onClick={() => equipItem(item)}
                        >
                          EQUIP
                        </button>
                      )}
                    </div>
                    
                    <p className="text-gray-300 font-pixel text-xs leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Powers Tab */}
        {selectedTab === 'powers' && (
          <div className="ff-stat-window">
            <h3 className="ff-stat-label mb-3 text-center">CHARACTER POWERS</h3>
            
            <div className="space-y-3">
              {mockPowers.map(power => (
                <div key={power.id} className="ff-stat-window p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="ff-stat-row">
                        <span className="ff-stat-label">{power.name}</span>
                        <span className={`ff-stat-value text-xs ${getPowerTypeColor(power.type)}`}>
                          {power.type.replace('_', '-').toUpperCase()}
                        </span>
                      </div>
                      <div className="ff-stat-row">
                        <span className="text-gray-300 text-xs">{power.action_type} action</span>
                        {power.uses_remaining !== null && (
                          <span className="text-gray-300 text-xs">
                            Uses: {power.uses_remaining}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 font-pixel text-xs leading-relaxed">
                    {power.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CharacterInventory
