import { useEffect, useRef, useState } from 'react'

interface Philosopher {
  id: number
  state: 'thinking' | 'hungry' | 'eating'
  thinkTime: number
  eatTime: number
  hasLeft: boolean
  hasRight: boolean
}

interface Chopstick {
  available: boolean
}

function DiningPhilosopher() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [philosopherCount, setPhilosopherCount] = useState(5)
  const [solution, setSolution] = useState<'none' | 'asymmetric' | 'arbitrator'>('asymmetric')
  const [philosophers, setPhilosophers] = useState<Philosopher[]>([])
  const [chopsticks, setChopsticks] = useState<Chopstick[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!isRunning || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const interval = setInterval(() => {
      setPhilosophers((prevPhilosophers) => {
        // If paused, render current frame and skip state updates
        if (paused) {
          draw(ctx, canvas.width, canvas.height, prevPhilosophers, chopsticks, true)
          return prevPhilosophers
        }

        const newPhilosophers = [...prevPhilosophers]
        const newChopsticks = [...chopsticks]

        newPhilosophers.forEach((phil, i) => {
          // Philosopher i holds chopstick i (left) and chopstick (i+1)%N (right)
          const leftChop = i
          const rightChop = (i + 1) % philosopherCount

          if (phil.state === 'thinking') {
            phil.thinkTime++
            if (phil.thinkTime > 10) {
              phil.state = 'hungry'
              phil.thinkTime = 0
            }
          } else if (phil.state === 'hungry') {
            if (solution === 'asymmetric') {
              // Even-indexed philosophers pick left then right, odd pick right then left
              if (i % 2 === 0) {
                tryPickup(phil, newChopsticks, leftChop, rightChop, 'left')
              } else {
                tryPickup(phil, newChopsticks, rightChop, leftChop, 'right')
              }
            } else if (solution === 'arbitrator') {
              // Only one can try at a time
              if (i === 0 || !newPhilosophers.slice(0, i).some(p => p.state === 'eating')) {
                tryPickup(phil, newChopsticks, leftChop, rightChop, 'left')
              }
            } else {
              // No solution - can deadlock
              tryPickup(phil, newChopsticks, leftChop, rightChop, 'left')
            }
          } else if (phil.state === 'eating') {
            phil.eatTime++
            if (phil.eatTime > 15) {
              newChopsticks[leftChop].available = true
              newChopsticks[rightChop].available = true
              phil.state = 'thinking'
              phil.eatTime = 0
              phil.hasLeft = false
              phil.hasRight = false
            }
          }
        })

  setChopsticks(newChopsticks)
  draw(ctx, canvas.width, canvas.height, newPhilosophers, newChopsticks, false)

        return newPhilosophers
      })
    }, 200)

    return () => clearInterval(interval)
  }, [isRunning, philosopherCount, solution, chopsticks, paused])

  // firstSide indicates whether the 'first' index corresponds to the left or right chopstick
  const tryPickup = (
    phil: Philosopher,
    chopsticks: Chopstick[],
    first: number,
    second: number,
    firstSide: 'left' | 'right' = 'left'
  ) => {
    if (!phil.hasLeft && !phil.hasRight) {
      if (chopsticks[first].available) {
        chopsticks[first].available = false
        if (firstSide === 'left') phil.hasLeft = true
        else phil.hasRight = true
      }
    } else {
      // Determine which side is still needed and map it to the second index
      const secondSide: 'left' | 'right' = firstSide === 'left' ? 'right' : 'left'
      const needsRight = !phil.hasRight && secondSide === 'right'
      const needsLeft = !phil.hasLeft && secondSide === 'left'
      if ((needsRight || needsLeft) && chopsticks[second].available) {
        chopsticks[second].available = false
        if (secondSide === 'right') phil.hasRight = true
        else phil.hasLeft = true
        // Only enter eating if BOTH chopsticks are held AND both corresponding chopstick availability flags are false
        const leftIndex = phil.id
        const rightIndex = (phil.id + 1) % philosopherCount
        const leftHeld = phil.hasLeft && !chopsticks[leftIndex].available
        const rightHeld = phil.hasRight && !chopsticks[rightIndex].available
        if (leftHeld && rightHeld) {
          phil.state = 'eating'
        }
      }
    }
  }

  const draw = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    phils: Philosopher[],
    chops: Chopstick[],
    isPaused: boolean = false
  ) => {
    ctx.clearRect(0, 0, width, height)

    const centerX = width / 2
    const centerY = height / 2
    const tableRadius = 100
    const philRadius = 160
    const chopstickDistance = 120

    // Draw table
    ctx.fillStyle = '#8B4513'
    ctx.beginPath()
    ctx.arc(centerX, centerY, tableRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#2c3e50'
    ctx.lineWidth = 3
    ctx.stroke()

    // Calculate philosopher positions
    const philPositions = []
    for (let i = 0; i < philosopherCount; i++) {
      const angle = (i * 2 * Math.PI / philosopherCount) - Math.PI / 2
      philPositions.push({
        x: centerX + Math.cos(angle) * philRadius,
        y: centerY + Math.sin(angle) * philRadius,
        angle: angle
      })
    }

    // Draw chopsticks BETWEEN philosophers
    for (let i = 0; i < philosopherCount; i++) {
      // Chopstick i is between philosopher (i-1) and philosopher i (1-based: between P(i-1) and P(i))
      const prevI = (i - 1 + philosopherCount) % philosopherCount

      // Position chopstick between the two philosophers (prevI and i)
      let angle1 = philPositions[prevI].angle
      let angle2 = philPositions[i].angle

      // Normalize angles to avoid averaging across the seam
      if (angle2 < angle1) {
        angle2 += 2 * Math.PI
      }

      const angle = (angle1 + angle2) / 2
      const chopX = centerX + Math.cos(angle) * chopstickDistance
      const chopY = centerY + Math.sin(angle) * chopstickDistance

      // Check if this chopstick is being held
      // Chopstick i can be held by philosopher i (as left) or philosopher prevI (as right)
      const isHeldByI = phils[i].hasLeft
      const isHeldByPrev = phils[prevI].hasRight
      
      const isAvailable = chops[i].available
      
      // Color: green if available, red if taken, yellow if being picked up
      let color
      if (isAvailable) {
        color = '#27ae60' // Available (green)
      } else {
        color = '#e74c3c' // Taken (red)
      }

      // Draw chopstick with rotation to point between philosophers
      ctx.save()
      ctx.translate(chopX, chopY)
      ctx.rotate(angle + Math.PI / 2)
      
      // Add glow effect if held
      if (!isAvailable) {
        ctx.shadowColor = color
        ctx.shadowBlur = 15
      }
      
      ctx.fillStyle = color
      ctx.fillRect(-4, -20, 8, 40)
      ctx.strokeStyle = '#2c3e50'
      ctx.lineWidth = 2
      ctx.strokeRect(-4, -20, 8, 40)
      
      ctx.shadowBlur = 0
      ctx.restore()

      // Draw chopstick label
      ctx.fillStyle = '#2c3e50'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`C${i + 1}`, chopX, chopY)

      // Draw connection lines to show who holds this chopstick
      if (!isAvailable) {
        ctx.setLineDash([5, 5])
        ctx.lineWidth = 2
        // Draw lines to the philosophers actually holding this chopstick
        if (isHeldByI) {
          ctx.strokeStyle = 'rgba(231, 76, 60, 0.6)'
          ctx.beginPath()
          ctx.moveTo(chopX, chopY)
          ctx.lineTo(philPositions[i].x, philPositions[i].y)
          ctx.stroke()
        }

        if (isHeldByPrev) {
          ctx.strokeStyle = 'rgba(231, 76, 60, 0.6)'
          ctx.beginPath()
          ctx.moveTo(chopX, chopY)
          ctx.lineTo(philPositions[prevI].x, philPositions[prevI].y)
          ctx.stroke()
        }
        
        ctx.setLineDash([])
      }
    }

  // Draw philosophers
    for (let i = 0; i < philosopherCount; i++) {
      const pos = philPositions[i]
      const phil = phils[i]
      
      let color
      if (phil.state === 'thinking') color = '#3498db'
      else if (phil.state === 'hungry') color = '#f39c12'
      else color = '#27ae60'

      // Add glow effect for eating philosophers
      if (phil.state === 'eating') {
        ctx.shadowColor = color
        ctx.shadowBlur = 20
      }

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 35, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.strokeStyle = '#2c3e50'
      ctx.lineWidth = 3
      ctx.stroke()

      // Philosopher number
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 22px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`P${i + 1}`, pos.x, pos.y)

      // State label
      ctx.fillStyle = '#2c3e50'
      ctx.font = 'bold 13px Arial'
      ctx.fillText(phil.state.toUpperCase(), pos.x, pos.y + 55)

  // Show which chopsticks this philosopher holds (P(i) holds C(i) and C(i+1))
  const leftChop = i
  const rightChop = (i + 1) % philosopherCount
      
      ctx.font = '11px Arial'
      ctx.fillStyle = '#555'
      
      if (phil.hasLeft || phil.hasRight) {
        const holding = []
        if (phil.hasLeft) holding.push(`C${leftChop + 1}`)
        if (phil.hasRight) holding.push(`C${rightChop + 1}`)
        
        if (holding.length > 0) {
          ctx.fillText(`Holding: ${holding.join(', ')}`, pos.x, pos.y + 70)
        }
      }
    }

    // Draw paused overlay
    if (isPaused) {
      ctx.fillStyle = 'rgba(0,0,0,0.25)'
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 28px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Paused', width / 2, 30)
    }

    // Draw legend
    const legendX = 20
    const legendY = height - 80
    
    ctx.fillStyle = '#f8f9fa'
    ctx.fillRect(legendX - 10, legendY - 10, 280, 70)
    ctx.strokeStyle = '#dee2e6'
    ctx.lineWidth = 2
    ctx.strokeRect(legendX - 10, legendY - 10, 280, 70)
    
    ctx.font = 'bold 13px Arial'
    ctx.fillStyle = '#2c3e50'
    ctx.textAlign = 'left'
    ctx.fillText('Legend:', legendX, legendY + 5)
    
    ctx.font = '11px Arial'
    ctx.fillStyle = '#27ae60'
    ctx.fillRect(legendX, legendY + 15, 12, 12)
    ctx.fillStyle = '#2c3e50'
    ctx.fillText('Available Chopstick', legendX + 18, legendY + 25)
    
    ctx.fillStyle = '#e74c3c'
    ctx.fillRect(legendX, legendY + 35, 12, 12)
    ctx.fillStyle = '#2c3e50'
    ctx.fillText('In Use Chopstick', legendX + 18, legendY + 45)
    
    ctx.fillStyle = '#3498db'
    ctx.beginPath()
    ctx.arc(legendX + 165, legendY + 21, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#2c3e50'
    ctx.fillText('Thinking', legendX + 178, legendY + 25)
    
    ctx.fillStyle = '#f39c12'
    ctx.beginPath()
    ctx.arc(legendX + 165, legendY + 41, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#2c3e50'
    ctx.fillText('Hungry', legendX + 178, legendY + 45)

    // Draw info box for chopstick mapping
    const infoX = width - 290
    const infoY = 20
    
    ctx.fillStyle = '#e3f2fd'
    ctx.fillRect(infoX, infoY, 270, 100)
    ctx.strokeStyle = '#2196f3'
    ctx.lineWidth = 2
    ctx.strokeRect(infoX, infoY, 270, 100)
    
    ctx.fillStyle = '#1565c0'
    ctx.font = 'bold 13px Arial'
    ctx.fillText('Chopstick Ownership:', infoX + 10, infoY + 20)
    
    ctx.fillStyle = '#2c3e50'
    ctx.font = '11px Arial'
    ctx.fillText('Each philosopher P(i) needs:', infoX + 10, infoY + 40)
    ctx.fillText('• Left chopstick: C(i)', infoX + 20, infoY + 55)
    ctx.fillText('• Right chopstick: C(i+1)', infoX + 20, infoY + 70)
    ctx.fillText('Chopstick C(i) is between P(i) and P(i+1)', infoX + 10, infoY + 90)
  }

  const start = () => {
    const newPhilosophers: Philosopher[] = []
    const newChopsticks: Chopstick[] = []

    for (let i = 0; i < philosopherCount; i++) {
      newPhilosophers.push({
        id: i,
        state: 'thinking',
        thinkTime: 0,
        eatTime: 0,
        hasLeft: false,
        hasRight: false
      })
      newChopsticks.push({ available: true })
    }

    setPhilosophers(newPhilosophers)
    setChopsticks(newChopsticks)
    setIsRunning(true)
  }

  const reset = () => {
    setIsRunning(false)
    setPhilosophers([])
    setChopsticks([])
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  const thinking = philosophers.filter((p) => p.state === 'thinking').length
  const hungry = philosophers.filter((p) => p.state === 'hungry').length
  const eating = philosophers.filter((p) => p.state === 'eating').length

  return (
    <section className="section">
      <div className="section-header">
        <h2>Dining Philosopher Problem</h2>
        <p>Classic synchronization problem with deadlock prevention</p>
      </div>
      <div className="simulation-container">
        <div className="controls">
          <label>
            Philosophers:{' '}
            <input
              type="number"
              value={philosopherCount}
              onChange={(e) => setPhilosopherCount(Number(e.target.value))}
              min="3"
              max="7"
              disabled={isRunning}
            />
          </label>
          <label>
            Solution:{' '}
            <select value={solution} onChange={(e) => setSolution(e.target.value as any)} disabled={isRunning}>
              <option value="none">No Solution (Deadlock)</option>
              <option value="asymmetric">Asymmetric Solution</option>
              <option value="arbitrator">Arbitrator Solution</option>
            </select>
          </label>
          <button
            className="btn-secondary"
            onClick={() => setPaused((p) => !p)}
            disabled={!isRunning}
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button className="btn-primary" onClick={start} disabled={isRunning}>
            Start Simulation
          </button>
          <button className="btn-secondary" onClick={reset}>
            Reset
          </button>
        </div>
        <div className="visualization">
          <canvas ref={canvasRef} width={800} height={600}></canvas>
        </div>
        <div className="info-panel">
          <h3>Problem Description:</h3>
          <p>Philosophers sit at a round table. Between each pair is one chopstick. A philosopher needs both adjacent chopsticks to eat.</p>
          
          <h3>Chopstick Mapping:</h3>
          <ul>
            <li><strong>Philosopher P(i)</strong> needs <strong>Chopstick C(i)</strong> (left) and <strong>Chopstick C(i+1)</strong> (right)</li>
            <li><strong>Chopstick C(i)</strong> is positioned between P(i) and P(i+1)</li>
            <li>Example: P1 holds C1 (left) and C2 (right)</li>
          </ul>

          {philosophers.length > 0 && (
            <div className="stats-area">
              <h4>Status:</h4>
              <div className="stat-item">💭 Thinking: <strong style={{ color: '#3498db' }}>{thinking}</strong></div>
              <div className="stat-item">🍽️ Hungry: <strong style={{ color: '#f39c12' }}>{hungry}</strong></div>
              <div className="stat-item">🍜 Eating: <strong style={{ color: '#27ae60' }}>{eating}</strong></div>
              <div className="stat-item">🛡️ Solution: <strong>{solution === 'none' ? 'None (Can Deadlock)' : solution === 'asymmetric' ? 'Asymmetric Pickup' : 'Arbitrator'}</strong></div>
            </div>
          )}
          
          <h3>Solutions Explained:</h3>
          <ul>
            <li><strong>No Solution:</strong> All pick left first → potential circular wait deadlock</li>
            <li><strong>Asymmetric:</strong> Even philosophers pick left first, odd pick right first → breaks circular wait</li>
            <li><strong>Arbitrator:</strong> Only one philosopher can attempt pickup at a time → mutual exclusion</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default DiningPhilosopher
