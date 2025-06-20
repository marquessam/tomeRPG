// src/stores/gameStore.jsx - Updated with real API calls
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
      return { ...state, loading: action.payload }
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
        loading: false
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
    default:
      return state
  }
}

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  const createGame = useCallback(async (gameName, playerName) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await fetch(`${API_BASE}/database`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'create-game',
          gameName, 
          playerName,
          role: 'dm' 
        })
      })
      
      const data = await response.json()
      if (data.success) {
        dispatch({ type: 'SET_CURRENT_PLAYER', payload: data.player })
        return data.roomCode
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }, [])

  const joinGame = useCallback(async (roomCode, playerName) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await fetch(`${API_BASE}/database`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'join-game',
          roomCode, 
          playerName,
          role: 'player'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        dispatch({ type: 'SET_CURRENT_PLAYER', payload: data.player })
        return true
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }, [])

  const loadGame = useCallback(async (roomCode) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await fetch(`${API_BASE}/database/game/${roomCode}`)
      const data = await response.json()
      
      if (response.ok) {
        dispatch({ type: 'SET_GAME_DATA', payload: data })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }, [])

  const createCharacter = useCallback(async (name, characterClass) => {
    if (!state.gameState || !state.currentPlayer) return
    
    try {
      const response = await fetch(`${API_BASE}/database`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-character',
          gameId: state.gameState.id,
          playerId: state.currentPlayer.id,
          name,
          characterClass
        })
      })
      
      const data = await response.json()
      if (data.success) {
        // Reload game data to get updated characters
        await loadGame(state.gameState.roomCode)
        return data.character
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }, [state.gameState, state.currentPlayer, loadGame])

  const moveCharacter = useCallback(async (characterId, x, y, facing) => {
    try {
      const response = await fetch(`${API_BASE}/database`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'game-action',
          gameId: state.gameState.id,
          characterId,
          action: 'move',
          details: { x, y, facing }
        })
      })
      
      if (response.ok) {
        dispatch({ type: 'UPDATE_CHARACTER', payload: { id: characterId, grid_x: x, grid_y: y, facing } })
      }
    } catch (error) {
      console.error('Move character error:', error)
    }
  }, [state.gameState])

  const attackCharacter = useCallback(async (attackerId, targetId, damage) => {
    try {
      const response = await fetch(`${API_BASE}/database`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'game-action',
          gameId: state.gameState.id,
          characterId: attackerId,
          action: 'attack',
          targetId,
          details: { damage }
        })
      })
      
      if (response.ok) {
        // Update target's HP
        const targetCharacter = state.characters.find(c => c.id === targetId)
        if (targetCharacter) {
          const newHp = Math.max(0, targetCharacter.hp - damage)
          dispatch({ type: 'UPDATE_CHARACTER', payload: { id: targetId, hp: newHp } })
        }
      }
    } catch (error) {
      console.error('Attack character error:', error)
    }
  }, [state.gameState, state.characters])

  const sendMessage = useCallback((message, character) => {
    // TODO: Send to websocket/database
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
