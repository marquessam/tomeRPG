// src/App.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import GameRoom from './components/GameRoom'
import { GameProvider } from './stores/gameStore'

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/:roomCode" element={<GameRoom />} />
        </Routes>
      </div>
    </GameProvider>
  )
}

export default App
