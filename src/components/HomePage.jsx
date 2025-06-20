// src/components/HomePage.jsx - Simplified TOME homepage
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
      <div className="ff-window max-w-2xl w-full p-8">
        {/* Main Title */}
        <div className="text-center space-y-8">
          <div className="ff-stat-window">
            <h1 className="text-white font-pixel text-6xl text-ff-shadow mb-4 tracking-wider">
              TOME
            </h1>
          </div>
          
          {/* Main Menu Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              className="ff-button ff-button-green w-full h-20 text-lg"
              onClick={() => setShowCreateModal(true)}
            >
              CREATE
            </button>
            
            <button 
              className="ff-button w-full h-20 text-lg"
              onClick={() => setShowJoinModal(true)}
            >
              JOIN
            </button>
          </div>

          {/* Admin Access */}
          <div className="pt-8">
            <button 
              className="ff-button text-xs opacity-50 hover:opacity-100 transition-opacity"
              onClick={() => setShowAdminPanel(true)}
            >
              DATABASE ADMIN
            </button>
          </div>
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
