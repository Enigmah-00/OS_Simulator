import { useState } from 'react'
import Home from './components/Home'
import SocketProgramming from './components/SocketProgramming'
import CountingSemaphore from './components/CountingSemaphore'
import BinarySemaphore from './components/BinarySemaphore'
import DiningPhilosopher from './components/DiningPhilosopher'
import NoBusyWait from './components/NoBusyWait'
import Scheduling from './components/Scheduling'
import './App.css'

type Section = 'home' | 'socket' | 'counting-semaphore' | 'binary-semaphore' | 'dining-philosopher' | 'no-busy-wait' | 'scheduling'

function App() {
  const [activeSection, setActiveSection] = useState<Section>('home')

  const navItems = [
    { id: 'home' as Section, icon: '🏠', label: 'Home' },
    { id: 'socket' as Section, icon: '🔌', label: 'Socket Programming' },
    { id: 'counting-semaphore' as Section, icon: '🔢', label: 'Counting Semaphore' },
    { id: 'binary-semaphore' as Section, icon: '🔒', label: 'Binary Semaphore' },
    { id: 'dining-philosopher' as Section, icon: '🍽️', label: 'Dining Philosopher' },
    { id: 'no-busy-wait' as Section, icon: '⏸️', label: 'No Busy Wait' },
    { id: 'scheduling' as Section, icon: '📅', label: 'Scheduling' },
  ]

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <Home />
      case 'socket':
        return <SocketProgramming />
      case 'counting-semaphore':
        return <CountingSemaphore />
      case 'binary-semaphore':
        return <BinarySemaphore />
      case 'dining-philosopher':
        return <DiningPhilosopher />
      case 'no-busy-wait':
        return <NoBusyWait />
      case 'scheduling':
        return <Scheduling />
      default:
        return <Home />
    }
  }

  return (
    <div className="container">
      <header>
        <div className="logo-container">
          <span className="logo-icon">⚙️</span>
          <h1>OS Simulator</h1>
        </div>
        <p className="subtitle">Professional Operating System Concepts Visualization</p>
      </header>

      <nav className="main-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-btn ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => setActiveSection(item.id)}
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <main className="content">
        {renderSection()}
      </main>

      <footer>
        <p>&copy; 2025 OS Simulator | Built for Education & Understanding</p>
      </footer>
    </div>
  )
}

export default App
