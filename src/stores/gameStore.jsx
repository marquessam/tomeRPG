// src/stores/gameStore.jsx - Enhanced with file upload and character creation
import React, { createContext, useContext, useReducer, useCallback } from 'react'

const GameContext = createContext()

const API_BASE = import.meta.env.VITE_API_URL || '/.netlify/functions'

const initialState = {
  gameState: null,
  currentPlayer: null,
  players: [],
  characters: [],
  messages: [],
  isConnected: false,
  loading: false,
  error: null
}

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null }
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload }
    case 'SET_GAME_DATA':
      return { 
        ...state, 
        gameState: action.payload.game,
        players: action.payload.players,
        characters: action.payload.characters,
        messages: action.payload.messages,
        isConnected: true,
        loading: false,
        error: null
      }
    case 'SET_CURRENT_PLAYER':
      return { ...state, currentPlayer: action.payload }
    case 'ADD_CHARACTER':
      return {
        ...state,
        characters: [...state.characters, action.payload]
      }
    case 'UPDATE_CHARACTER':
      return {
        ...state,
        characters: state.characters.map(char => 
          char.id === action.payload.id ? { ...char, ...action.payload } : char
        )
      }
    case 'REMOVE_CHARACTER':
      return {
        ...state,
        characters: state.characters.filter(char => char.id !== action.payload)
      }
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  // File upload utility
  const uploadFile = useCallback(async (file, uploadedBy = null) => {
    try {
      // Convert file to base64
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = reader.result.split(',')[1] // Remove data:image/... prefix
          resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const response = await fetch(`${API_BASE}/upload-file`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileData: base64Data,
          fileType: file.type,
          uploadedBy
        })
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }

      const result = await response.json()
      return result.file.id

    } catch (error) {
      console.error('File upload error:', error)
      throw error
    }
  }, [])

  const createGame = useCallback(async (gameName, playerName) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })
    
    try {
      console.log('Creating game:', { gameName, playerName })
      
      const response = await fetch(`${API_BASE}/create-game`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          gameName, 
          playerName,
          role: 'dm' 
        })
      })
      
      console.log('Create game response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Create game error response:', errorText)
        throw new Error(`Server error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Create game response data:', data)
      
      if (data.success) {
        dispatch({ type: 'SET_CURRENT_PLAYER', payload: data.player })
        dispatch({ type: 'SET_LOADING', payload: false })
        return data.roomCode
      } else {
        throw new Error(data.error || 'Failed to create game')
      }
    } catch (error) {
      console.error('Create game error:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }, [])

  const joinGame = useCallback(async (roomCode, playerName) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })
    
    try {
      console.log('Joining game:', { roomCode, playerName })
      
      const response = await fetch(`${API_BASE}/join-game`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          roomCode, 
          playerName,
          role: 'player'
        })
      })
      
      console.log('Join game response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Join game error response:', errorText)
        throw new Error(`Server error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Join game response data:', data)
      
      if (data.success) {
        dispatch({ type: 'SET_CURRENT_PLAYER', payload: data.player })
        dispatch({ type: 'SET_LOADING', payload: false })
        return true
      } else {
        throw new Error(data.error || 'Failed to join game')
      }
    } catch (error) {
      console.error('Join game error:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }, [])

  const loadGame = useCallback(async (roomCode) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })
    
    try {
      console.log('Loading game:', roomCode)
      
      const response = await fetch(`${API_BASE}/get-game/${roomCode}`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        }
      })
      
      console.log('Load game response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Load game error response:', errorText)
        throw new Error(`Server error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Load game response data:', data)
      
      if (data.game) {
        dispatch({ type: 'SET_GAME_DATA', payload: data })
      } else {
        throw new Error('Invalid game data received')
      }
    } catch (error) {
      console.error('Load game error:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }, [])

  const createCharacter = useCallback(async (characterData) => {
    if (!state.currentPlayer || !state.gameState) {
      throw new Error('No active game or player')
    }

    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })
    
    try {
      console.log('Creating character:', characterData)

      let portraitFileId = null
      let spriteFileId = null

      // Upload files if provided
      if (characterData.portraitFile) {
        console.log('Uploading portrait...')
        portraitFileId = await uploadFile(characterData.portraitFile, state.currentPlayer.id)
      }

      if (characterData.spriteFile) {
        console.log('Uploading sprite...')
        spriteFileId = await uploadFile(characterData.spriteFile, state.currentPlayer.id)
      }

      // Create character
      const response = await fetch(`${API_BASE}/create-character`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          gameId: state.gameState.id,
          playerId: state.currentPlayer.id,
          name: characterData.name,
          characterClass: characterData.class,
          selectedPowers: characterData.powers || [],
          portraitFileId,
          spriteFileId
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Create character error response:', errorText)
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()
      console.log('Create character response:', data)

      if (data.success) {
        dispatch({ type: 'ADD_CHARACTER', payload: data.character })
        dispatch({ type: 'SET_LOADING', payload: false })
        return data.character
      } else {
        throw new Error(data.error || 'Failed to create character')
      }

    } catch (error) {
      console.error('Create character error:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }, [state, uploadFile])

  const spawnMonster = useCallback(async (monsterData) => {
    if (state.currentPlayer?.role !== 'dm') {
      throw new Error('Only DMs can spawn monsters')
    }

    // For now, add monster locally (TODO: implement backend)
    const monster = {
      ...monsterData,
      id: `monster_${Date.now()}_${Math.random()}`,
      player_id: null,
      is_npc: true,
      created_at: new Date().toISOString()
    }

    dispatch({ type: 'ADD_CHARACTER', payload: monster })
    return monster
  }, [state])

  const moveCharacter = useCallback(async (characterId, x, y, facing) => {
    console.log('Move character:', { characterId, x, y, facing })
    dispatch({ 
      type: 'UPDATE_CHARACTER', 
      payload: { id: characterId, grid_x: x, grid_y: y, facing, has_moved: true } 
    })
  }, [])

  const attackCharacter = useCallback(async (attackerId, targetId, damage) => {
    console.log('Attack character:', { attackerId, targetId, damage })
    const targetCharacter = state.characters.find(c => c.id === targetId)
    if (targetCharacter) {
      const newHp = Math.max(0, targetCharacter.hp - damage)
      dispatch({ type: 'UPDATE_CHARACTER', payload: { id: targetId, hp: newHp } })
      
      // Add combat message
      const attacker = state.characters.find(c => c.id === attackerId)
      const message = {
        id: Date.now(),
        content: `${attacker?.name || 'Someone'} attacks ${targetCharacter.name} for ${damage} damage!`,
        timestamp: new Date(),
        messageType: 'combat',
        gameId: state.gameState?.id
      }
      dispatch({ type: 'ADD_MESSAGE', payload: message })
    }
  }, [state.characters, state.gameState])

  const usePower = useCallback(async (characterId, powerId, targets = []) => {
    console.log('Use power:', { characterId, powerId, targets })
    
    // Mark character as having acted
    dispatch({ 
      type: 'UPDATE_CHARACTER', 
      payload: { id: characterId, has_acted: true } 
    })

    // TODO: Implement power effects, damage calculation, etc.
  }, [])

  const sendMessage = useCallback((content, character = null) => {
    console.log('Send message:', { content, character })
    const message = {
      id: Date.now(),
      content,
      timestamp: new Date(),
      character,
      player: state.currentPlayer,
      messageType: 'dialogue'
    }
    dispatch({ type: 'ADD_MESSAGE', payload: message })
  }, [state.currentPlayer])

  const endTurn = useCallback(async (characterId) => {
    console.log('End turn for character:', characterId)
    
    // Reset character actions
    dispatch({
      type: 'UPDATE_CHARACTER',
      payload: { id: characterId, has_acted: false, has_moved: false }
    })

    // TODO: Advance to next character in turn order
  }, [])

  const getFileUrl = useCallback((fileId) => {
    if (!fileId) return null
    return `${API_BASE}/get-file/${fileId}`
  }, [])

  const value = {
    ...state,
    createGame,
    joinGame,
    loadGame,
    createCharacter,
    spawnMonster,
    moveCharacter,
    attackCharacter,
    usePower,
    sendMessage,
    endTurn,
    uploadFile,
    getFileUrl
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}

export const useGameStore = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGameStore must be used within GameProvider')
  }
  return context
}
