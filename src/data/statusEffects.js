// src/data/statusEffects.js - D&D 4e style status effects
export const STATUS_EFFECTS = {
  // Negative Effects
  blinded: {
    name: 'Blinded',
    type: 'negative',
    icon: '🙈',
    color: 'text-gray-400',
    description: 'Cannot see. Grants combat advantage to enemies.',
    duration: 'save_ends'
  },
  
  dazed: {
    name: 'Dazed',
    type: 'negative', 
    icon: '😵',
    color: 'text-yellow-400',
    description: 'Can take only one action per turn.',
    duration: 'save_ends'
  },
  
  dominated: {
    name: 'Dominated',
    type: 'negative',
    icon: '🧠',
    color: 'text-purple-400',
    description: 'Controlled by enemy. Must use actions as directed.',
    duration: 'save_ends'
  },
  
  grabbed: {
    name: 'Grabbed',
    type: 'negative',
    icon: '🤝',
    color: 'text-orange-400', 
    description: 'Cannot move away from grabber.',
    duration: 'escape'
  },
  
  helpless: {
    name: 'Helpless',
    type: 'negative',
    icon: '😵‍💫',
    color: 'text-red-400',
    description: 'Cannot take actions. Grants combat advantage.',
    duration: 'save_ends'
  },
  
  immobilized: {
    name: 'Immobilized',
    type: 'negative',
    icon: '🦶',
    color: 'text-brown-400',
    description: 'Cannot move from current position.',
    duration: 'save_ends'
  },
  
  marked: {
    name: 'Marked',
    type: 'negative',
    icon: '🎯',
    color: 'text-red-400',
    description: 'Takes penalty when attacking other targets.',
    duration: 'end_of_turn'
  },
  
  ongoing_damage: {
    name: 'Ongoing Damage',
    type: 'negative',
    icon: '🩸',
    color: 'text-red-500',
    description: 'Takes damage at start of each turn.',
    duration: 'save_ends'
  },
  
  petrified: {
    name: 'Petrified',
    type: 'negative',
    icon: '🗿',
    color: 'text-gray-500',
    description: 'Turned to stone. Cannot take any actions.',
    duration: 'special'
  },
  
  prone: {
    name: 'Prone',
    type: 'negative',
    icon: '⬇️',
    color: 'text-brown-400',
    description: 'Lying down. Grants combat advantage to adjacent enemies.',
    duration: 'move_action'
  },
  
  restrained: {
    name: 'Restrained',
    type: 'negative',
    icon: '⛓️',
    color: 'text-gray-400',
    description: 'Cannot move and takes penalty to attacks.',
    duration: 'save_ends'
  },
  
  slowed: {
    name: 'Slowed',
    type: 'negative',
    icon: '🐌',
    color: 'text-blue-400',
    description: 'Speed reduced by half.',
    duration: 'save_ends'
  },
  
  stunned: {
    name: 'Stunned',
    type: 'negative',
    icon: '😵',
    color: 'text-yellow-400',
    description: 'Cannot take actions and grants combat advantage.',
    duration: 'save_ends'
  },
  
  surprised: {
    name: 'Surprised',
    type: 'negative',
    icon: '😮',
    color: 'text-orange-400',
    description: 'Cannot act during surprise round.',
    duration: 'end_of_round'
  },
  
  unconscious: {
    name: 'Unconscious',
    type: 'negative',
    icon: '💤',
    color: 'text-gray-400',
    description: 'Helpless and unaware of surroundings.',
    duration: 'save_ends'
  },
  
  weakened: {
    name: 'Weakened',
    type: 'negative',
    icon: '💔',
    color: 'text-red-400',
    description: 'Damage reduced by half.',
    duration: 'save_ends'
  },

  // Positive Effects
  blessed: {
    name: 'Blessed',
    type: 'positive',
    icon: '✨',
    color: 'text-yellow-300',
    description: 'Bonus to attack rolls and damage.',
    duration: 'encounter'
  },
  
  concealed: {
    name: 'Concealed',
    type: 'positive',
    icon: '👻',
    color: 'text-gray-300',
    description: 'Enemies have penalty to hit.',
    duration: 'end_of_turn'
  },
  
  cover: {
    name: 'Cover',
    type: 'positive',
    icon: '🛡️',
    color: 'text-blue-300',
    description: 'Bonus to AC and Reflex defenses.',
    duration: 'positional'
  },
  
  flying: {
    name: 'Flying',
    type: 'positive',
    icon: '🕊️',
    color: 'text-cyan-300',
    description: 'Can move through air and over obstacles.',
    duration: 'sustained'
  },
  
  hasted: {
    name: 'Hasted',
    type: 'positive',
    icon: '💨',
    color: 'text-green-300',
    description: 'Increased speed and extra actions.',
    duration: 'encounter'
  },
  
  invisible: {
    name: 'Invisible',
    type: 'positive',
    icon: '👤',
    color: 'text-gray-300',
    description: 'Cannot be seen. Combat advantage on attacks.',
    duration: 'save_ends'
  },
  
  regenerating: {
    name: 'Regenerating',
    type: 'positive',
    icon: '💚',
    color: 'text-green-400',
    description: 'Heals HP at start of each turn.',
    duration: 'encounter'
  },
  
  shielded: {
    name: 'Shielded',
    type: 'positive',
    icon: '🛡️',
    color: 'text-blue-400',
    description: 'Temporary hit points or damage resistance.',
    duration: 'encounter'
  }
}

// Helper functions for status effect management
export const getStatusEffectsByType = (type) => {
  return Object.entries(STATUS_EFFECTS)
    .filter(([key, effect]) => effect.type === type)
    .reduce((obj, [key, effect]) => ({ ...obj, [key]: effect }), {})
}

export const getStatusEffectIcon = (effectKey) => {
  return STATUS_EFFECTS[effectKey]?.icon || '❓'
}

export const getStatusEffectColor = (effectKey) => {
  return STATUS_EFFECTS[effectKey]?.color || 'text-white'
}

export const isNegativeEffect = (effectKey) => {
  return STATUS_EFFECTS[effectKey]?.type === 'negative'
}

export const isPositiveEffect = (effectKey) => {
  return STATUS_EFFECTS[effectKey]?.type === 'positive'
}

// Status effect application logic
export const applyStatusEffect = (character, effectKey, duration = null) => {
  const effect = STATUS_EFFECTS[effectKey]
  if (!effect) return character

  const statusEffect = {
    id: `${effectKey}_${Date.now()}`,
    key: effectKey,
    name: effect.name,
    duration: duration || effect.duration,
    appliedAt: Date.now(),
    source: 'unknown' // Could track what applied the effect
  }

  return {
    ...character,
    status_effects: [...(character.status_effects || []), statusEffect]
  }
}

export const removeStatusEffect = (character, effectId) => {
  return {
    ...character,
    status_effects: (character.status_effects || []).filter(effect => effect.id !== effectId)
  }
}

export const hasStatusEffect = (character, effectKey) => {
  return (character.status_effects || []).some(effect => effect.key === effectKey)
}

export const getActiveStatusEffects = (character) => {
  return (character.status_effects || []).map(effect => ({
    ...effect,
    ...STATUS_EFFECTS[effect.key]
  }))
}
