// src/components/HomePage.jsx - Updated to include admin panel
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CreateGameModal from './CreateGameModal'
import JoinGameModal from './JoinGameModal'
import AdminPanel from './AdminPanel'

const HomePage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="ff-window max-w-4xl w-full p-6">
        {/* Title Section */}
        <div className="text-center space-y-6 mb-8">
          <div className="ff-stat-window">
            <h1 className="text-white font-pixel text-3xl text-ff-shadow mb-2">
              TOME RPG
            </h1>
            <div className="ff-stat-row">
              <span className="ff-stat-label">VERSION</span>
              <span className="ff-stat-value">1.0</span>
            </div>
            <div className="ff-stat-row">
              <span className="ff-stat-label">PLAYERS</span>
              <span className="ff-stat-value">3-5</span>
            </div>
          </div>
          
          <p className="text-white font-pixel text-sm leading-relaxed text-ff-shadow">
            A tactical multiplayer RPG inspired by<br/>
            Final Fantasy Mystic Quest
          </p>
        </div>

        {/* Main Menu Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="ff-stat-window text-center">
            <h3 className="ff-stat-label mb-4">NEW ADVENTURE</h3>
            <button 
              className="ff-button ff-button-green w-full h-16"
              onClick={() => setShowCreateModal(true)}
            >
              CREATE GAME
            </button>
            <p className="text-white font-pixel text-xs mt-2 text-ff-shadow">
              Start as Dungeon Master
            </p>
          </div>
          
          <div className="ff-stat-window text-center">
            <h3 className="ff-stat-label mb-4">JOIN PARTY</h3>
            <button 
              className="ff-button w-full h-16"
              onClick={() => setShowJoinModal(true)}
            >
              JOIN GAME
            </button>
            <p className="text-white font-pixel text-xs mt-2 text-ff-shadow">
              Enter with room code
            </p>
          </div>
        </div>

        {/* Features Window */}
        <div className="ff-window-dark p-4 mb-6">
          <h3 className="ff-stat-label mb-4 text-center">GAME FEATURES</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="ff-stat-row">
                <span className="ff-stat-label">GRID SIZE</span>
                <span className="ff-stat-value">20x20</span>
              </div>
              <div className="ff-stat-row">
                <span className="ff-stat-label">CLASSES</span>
                <span className="ff-stat-value">4</span>
              </div>
              <div className="ff-stat-row">
                <span className="ff-stat-label">COMBAT</span>
                <span className="ff-stat-value">TACTICAL</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="ff-stat-row">
                <span className="ff-stat-label">MULTIPLAYER</span>
                <span className="ff-stat-value">REAL-TIME</span>
              </div>
              <div className="ff-stat-row">
                <span className="ff-stat-label">DIALOGUE</span>
                <span className="ff-stat-value">ENHANCED</span>
              </div>
              <div className="ff-stat-row">
                <span className="ff-stat-label">BACKSTAB</span>
                <span className="ff-stat-value">2X DAMAGE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Section */}
        <div className="text-center">
          <button 
            className="ff-button text-xs"
            onClick={() => setShowAdminPanel(true)}
          >
            DATABASE ADMIN
          </button>
        </div>
      </div>

      {/* Modals */}
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

      {showAdminPanel && (
        <AdminPanel 
          onClose={() => setShowAdminPanel(false)}
        />
      )}
    </div>
  )
}

export default HomePage
