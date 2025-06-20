// src/stores/gameStore.jsx - Updated to use separate function endpoints
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
    case 'UPDATE_CHARACTER':
      return {
        ...state,
        characters: state.characters.map(char => 
          char.id === action.payload.id ? { ...char, ...action.payload } : char
        )
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

  // For now, we'll add mock functions for other operations
  const createCharacter = useCallback(async (name, characterClass) => {
    // TODO: Implement when backend is working
    console.log('Create character:', { name, characterClass })
    
    // Mock character for testing
    const mockCharacter = {
      id: Date.now(),
      name,
      class: characterClass,
      player_id: state.currentPlayer?.id,
      hp: 25,
      max_hp: 25,
      mp: 10,
      max_mp: 10,
      attack: 8,
      defense: 5,
      speed: 5,
      grid_x: Math.floor(Math.random() * 20),
      grid_y: Math.floor(Math.random() * 20),
      facing: 'down'
    }
    
    dispatch({ 
      type: 'SET_GAME_DATA', 
      payload: {
        ...state,
        characters: [...state.characters, mockCharacter]
      }
    })
    
    return mockCharacter
  }, [state])

  const moveCharacter = useCallback(async (characterId, x, y, facing) => {
    console.log('Move character:', { characterId, x, y, facing })
    dispatch({ 
      type: 'UPDATE_CHARACTER', 
      payload: { id: characterId, grid_x: x, grid_y: y, facing } 
    })
  }, [])

  const attackCharacter = useCallback(async (attackerId, targetId, damage) => {
    console.log('Attack character:', { attackerId, targetId, damage })
    const targetCharacter = state.characters.find(c => c.id === targetId)
    if (targetCharacter) {
      const newHp = Math.max(0, targetCharacter.hp - damage)
      dispatch({ type: 'UPDATE_CHARACTER', payload: { id: targetId, hp: newHp } })
    }
  }, [state.characters])

  const sendMessage = useCallback((message, character) => {
    console.log('Send message:', { message, character })
    dispatch({ type: 'ADD_MESSAGE', payload: {
      id: Date.now(),
      content: message,
      timestamp: new Date(),
      character,
      player: state.currentPlayer
    }})
  }, [state.currentPlayer])

  const value = {
    ...state,
    createGame,
    joinGame,
    loadGame,
    createCharacter,
    moveCharacter,
    attackCharacter,
    sendMessage
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
