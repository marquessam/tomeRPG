// src/stores/gameStore.jsx
import React, { createContext, useContext, useReducer } from 'react'

const GameContext = createContext()

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
    case 'SET_GAME_STATE':
      return { ...state, gameState: action.payload }
    case 'SET_CURRENT_PLAYER':
      return { ...state, currentPlayer: action.payload }
    case 'SET_PLAYERS':
      return { ...state, players: action.payload }
    case 'SET_CHARACTERS':
      return { ...state, characters: action.payload }
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

  const loadGame = async (roomCode) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      // TODO: Replace with actual API calls
      // For now, simulate game loading
      setTimeout(() => {
        dispatch({ type: 'SET_CONNECTED', payload: true })
        dispatch({ type: 'SET_GAME_STATE', payload: { 
          roomCode, 
          currentTurn: 1, 
          phase: 'setup' 
        }})
        dispatch({ type: 'SET_LOADING', payload: false })
      }, 1000)
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }

  const sendMessage = (message) => {
    // TODO: Send to websocket
    dispatch({ type: 'ADD_MESSAGE', payload: {
      id: Date.now(),
      content: message,
      timestamp: new Date(),
      character: state.currentPlayer?.character
    }})
  }

  const value = {
    ...state,
    loadGame,
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
