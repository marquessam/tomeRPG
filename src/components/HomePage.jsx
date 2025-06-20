// src/components/HomePage.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CreateGameModal from './CreateGameModal'
import JoinGameModal from './JoinGameModal'

const HomePage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="nes-container with-title is-rounded bg-nes-blue max-w-2xl w-full">
        <p className="title text-white font-pixel text-lg">TomeRPG</p>
        
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-white font-pixel text-2xl text-shadow">
              Tactical Multiplayer Adventure
            </h1>
            <p className="text-white font-pixel text-sm leading-relaxed">
              A retro NES-style tactical RPG built for 3-5 players.<br/>
              One DM controls the world, others control heroes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              className="nes-btn is-warning font-pixel text-sm h-16"
              onClick={() => setShowCreateModal(true)}
            >
              Create New Game
            </button>
            
            <button 
              className="nes-btn is-success font-pixel text-sm h-16"
              onClick={() => setShowJoinModal(true)}
            >
              Join Existing Game
            </button>
          </div>

          <div className="bg-black bg-opacity-30 p-4 rounded-lg">
            <h3 className="text-white font-pixel text-xs mb-2">✨ Features:</h3>
            <ul className="text-white font-pixel text-xs space-y-1 text-left">
              <li>• 20x20 tactical grid combat</li>
              <li>• Real-time multiplayer dialogue system</li>
              <li>• Classic NES aesthetic with modern web tech</li>
              <li>• Simple but strategic turn-based combat</li>
            </ul>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateGameModal 
          onClose={() => setShowCreateModal(false)}
          onGameCreated={(roomCode) => navigate(`/game/${roomCode}`)}
        />
      )}
      
      {showJoinModal && (
        <JoinGameModal 
          onClose={() => setShowJoinModal(false)}
          onGameJoined={(roomCode) => navigate(`/game/${roomCode}`)}
        />
      )}
    </div>
  )
}

export default HomePage
