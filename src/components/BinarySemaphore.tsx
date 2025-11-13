import { useEffect, useRef, useState } from 'react'

interface Process {
  id: number
  state: 'waiting' | 'running' | 'completed'
  progress: number
  waitTime: number
}

function BinarySemaphore() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [processCount, setProcessCount] = useState(4)
  const [processes, setProcesses] = useState<Process[]>([])
  const [isRunning, setIsRunning] = useState(false)
  
  // Use refs to avoid stale closure issues
  const semaphoreRef = useRef(1)
  const currentProcessRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isRunning || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const interval = setInterval(() => {
      setProcesses((prevProcesses) => {
        const updatedProcesses = [...prevProcesses]
        let semValue = semaphoreRef.current
        let currentProc = currentProcessRef.current

        // Try to acquire lock if available
        if (currentProc === null && semValue === 1) {
          const waitingProc = updatedProcesses.find((p) => p.state === 'waiting')
          if (waitingProc) {
            semValue = 0 // Lock acquired (wait operation)
            currentProc = waitingProc.id
            waitingProc.state = 'running'
            semaphoreRef.current = semValue
            currentProcessRef.current = currentProc
          }
        }

        // Update running process
        const runningProc = updatedProcesses.find((p) => p.state === 'running')
        if (runningProc) {
          runningProc.progress += 2
          if (runningProc.progress >= 100) {
            runningProc.progress = 100
            runningProc.state = 'completed'
            semValue = 1 // Release lock (signal operation)
            currentProc = null
            semaphoreRef.current = semValue
            currentProcessRef.current = currentProc
          }
        }

        // Increment wait time for waiting processes
        updatedProcesses.forEach((proc) => {
          if (proc.state === 'waiting') {
            proc.waitTime += 1
          }
        })

        // Draw the updated state
        draw(ctx, canvas.width, canvas.height, updatedProcesses, semValue, currentProc)

        // Check if all processes are completed
        if (updatedProcesses.every((p) => p.state === 'completed')) {
          setIsRunning(false)
        }

        return updatedProcesses
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isRunning])

  const draw = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    procs: Process[],
    sem: number,
    currentProc: number | null
  ) => {
    ctx.clearRect(0, 0, width, height)

    // Draw title
    ctx.fillStyle = '#2c3e50'
    ctx.font = 'bold 18px Arial'
    ctx.fillText('Binary Semaphore (Mutex Lock)', 20, 30)

    // Draw mutex lock with enhanced visuals
    const lockX = 350
    const lockY = 50
    const lockSize = 80
    
    // Lock background
    ctx.fillStyle = sem === 1 ? '#d5f4e6' : '#fadbd8'
    ctx.fillRect(lockX - 10, lockY - 10, lockSize + 20, lockSize + 20)
    
    // Lock icon
    ctx.fillStyle = sem === 1 ? '#27ae60' : '#e74c3c'
    ctx.fillRect(lockX, lockY, lockSize, lockSize)
    ctx.strokeStyle = '#2c3e50'
    ctx.lineWidth = 4
    ctx.strokeRect(lockX, lockY, lockSize, lockSize)
    
    // Lock status text
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(sem === 1 ? '🔓' : '🔒', lockX + lockSize / 2, lockY + 35)
    ctx.font = 'bold 14px Arial'
    ctx.fillText(sem === 1 ? 'OPEN' : 'LOCKED', lockX + lockSize / 2, lockY + 60)
    
    // Draw semaphore value
    ctx.fillStyle = '#2c3e50'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`Semaphore Value: ${sem}`, lockX - 100, lockY + 40)

    // Draw critical section box
    const csX = 550
    const csY = 50
    const csW = 220
    const csH = 80
    
    const isOccupied = sem === 0
    ctx.fillStyle = isOccupied ? '#ffe6e6' : '#f0f0f0'
    ctx.fillRect(csX, csY, csW, csH)
    ctx.strokeStyle = isOccupied ? '#e74c3c' : '#95a5a6'
    ctx.lineWidth = 3
    ctx.strokeRect(csX, csY, csW, csH)
    
    ctx.fillStyle = '#2c3e50'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Critical Section', csX + csW / 2, csY + 30)
    
    if (currentProc !== null) {
      ctx.fillStyle = '#3498db'
      ctx.font = 'bold 20px Arial'
      ctx.fillText(`Process P${currentProc}`, csX + csW / 2, csY + 60)
    } else {
      ctx.fillStyle = '#7f8c8d'
      ctx.font = '14px Arial'
      ctx.fillText('(Empty)', csX + csW / 2, csY + 60)
    }

    // Draw processes
    const startY = 160
    const rowHeight = 50
    
    ctx.textAlign = 'left'
    procs.forEach((proc, idx) => {
      const y = startY + idx * rowHeight
      const isCurrentProc = proc.id === currentProc

      // Process ID with highlight
      ctx.fillStyle = isCurrentProc ? '#3498db' : '#2c3e50'
      ctx.font = 'bold 16px Arial'
      ctx.fillText(`P${proc.id}`, 20, y + 25)

      // State badge
      let stateColor, stateText
      if (proc.state === 'waiting') {
        stateColor = '#f39c12'
        stateText = 'WAITING'
      } else if (proc.state === 'running') {
        stateColor = '#3498db'
        stateText = 'IN CS'
      } else {
        stateColor = '#27ae60'
        stateText = 'DONE'
      }

      // State indicator with glow effect for running process
      if (isCurrentProc && proc.state === 'running') {
        ctx.shadowColor = stateColor
        ctx.shadowBlur = 15
      }
      
      ctx.fillStyle = stateColor
      ctx.fillRect(70, y + 5, 90, 30)
      ctx.shadowBlur = 0
      
      ctx.strokeStyle = '#2c3e50'
      ctx.lineWidth = 2
      ctx.strokeRect(70, y + 5, 90, 30)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(stateText, 115, y + 24)
      ctx.textAlign = 'left'

      // Progress bar
      const barX = 180
      const barW = 350
      ctx.fillStyle = '#ecf0f1'
      ctx.fillRect(barX, y + 5, barW, 30)
      
      // Progress fill with gradient for running process
      if (isCurrentProc && proc.state === 'running') {
        const gradient = ctx.createLinearGradient(barX, 0, barX + barW * (proc.progress / 100), 0)
        gradient.addColorStop(0, '#3498db')
        gradient.addColorStop(1, '#5dade2')
        ctx.fillStyle = gradient
      } else {
        ctx.fillStyle = proc.state === 'completed' ? '#27ae60' : '#3498db'
      }
      
      ctx.fillRect(barX, y + 5, barW * (proc.progress / 100), 30)
      ctx.strokeStyle = '#2c3e50'
      ctx.lineWidth = 2
      ctx.strokeRect(barX, y + 5, barW, 30)
      
      // Progress percentage
      ctx.fillStyle = '#2c3e50'
      ctx.font = 'bold 14px Arial'
      ctx.fillText(`${proc.progress}%`, barX + barW + 10, y + 25)

      // Wait time for waiting processes
      if (proc.state === 'waiting') {
        ctx.fillStyle = '#e67e22'
        ctx.font = '12px Arial'
        ctx.fillText(`⏱ Wait: ${(proc.waitTime / 10).toFixed(1)}s`, barX + barW + 70, y + 25)
      }

      // Arrow pointing to critical section for running process
      if (isCurrentProc && proc.state === 'running') {
        ctx.strokeStyle = '#3498db'
        ctx.lineWidth = 3
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(barX + barW, y + 20)
        ctx.lineTo(csX - 10, csY + csH / 2)
        ctx.stroke()
        ctx.setLineDash([])
        
        // Arrow head
        ctx.fillStyle = '#3498db'
        ctx.beginPath()
        ctx.moveTo(csX - 10, csY + csH / 2)
        ctx.lineTo(csX - 20, csY + csH / 2 - 5)
        ctx.lineTo(csX - 20, csY + csH / 2 + 5)
        ctx.closePath()
        ctx.fill()
      }
    })
  }

  const start = () => {
    const newProcesses: Process[] = []
    for (let i = 0; i < processCount; i++) {
      newProcesses.push({ id: i + 1, state: 'waiting', progress: 0, waitTime: 0 })
    }
    setProcesses(newProcesses)
    semaphoreRef.current = 1
    currentProcessRef.current = null
    setIsRunning(true)
  }

  const reset = () => {
    setIsRunning(false)
    setProcesses([])
    semaphoreRef.current = 1
    currentProcessRef.current = null
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  const waiting = processes.filter((p) => p.state === 'waiting').length
  const running = processes.filter((p) => p.state === 'running').length
  const completed = processes.filter((p) => p.state === 'completed').length
  const semaphore = semaphoreRef.current

  return (
    <section className="section">
      <div className="section-header">
        <h2>Binary Semaphore Simulation</h2>
        <p>Mutual exclusion with binary semaphore (mutex)</p>
      </div>
      <div className="simulation-container">
        <div className="controls">
          <label>
            Processes:{' '}
            <input
              type="number"
              value={processCount}
              onChange={(e) => setProcessCount(Number(e.target.value))}
              min="2"
              max="8"
              disabled={isRunning}
            />
          </label>
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
          <h3>Mutex Lock (Binary Semaphore):</h3>
          <p>A binary semaphore ensures mutual exclusion by allowing only one process in the critical section at a time.</p>
          <h3>Algorithm:</h3>
          <pre><code>{`wait(mutex):
    while (mutex == 0)
        ; // busy wait
    mutex = 0;

signal(mutex):
    mutex = 1;`}</code></pre>
          {processes.length > 0 && (
            <div className="stats-area">
              <h4>Live Status:</h4>
              <div className="stat-item">
                🔐 Lock Status: <strong style={{ color: semaphore === 1 ? '#27ae60' : '#e74c3c' }}>{semaphore === 1 ? 'UNLOCKED (Available)' : 'LOCKED (In Use)'}</strong>
              </div>
              <div className="stat-item">⏳ Waiting: <strong style={{ color: '#f39c12' }}>{waiting}</strong></div>
              <div className="stat-item">⚙️ In Critical Section: <strong style={{ color: '#3498db' }}>{running}</strong></div>
              <div className="stat-item">✅ Completed: <strong style={{ color: '#27ae60' }}>{completed}</strong></div>
              {running > 0 && currentProcessRef.current && (
                <div className="stat-item" style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                  🎯 <strong>Process P{currentProcessRef.current}</strong> is currently executing in the critical section
                </div>
              )}
            </div>
          )}
          <h3 style={{ marginTop: '20px' }}>Key Features:</h3>
          <ul>
            <li><strong>Mutual Exclusion:</strong> Only one process can be in the critical section at a time</li>
            <li><strong>Binary Value:</strong> Semaphore is either 0 (locked) or 1 (unlocked)</li>
            <li><strong>Wait Operation:</strong> Process waits if mutex is 0, then sets it to 0 (acquires lock)</li>
            <li><strong>Signal Operation:</strong> Process sets mutex to 1 (releases lock)</li>
            <li><strong>Visual Feedback:</strong> Lock icon, critical section highlighting, and process arrows</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default BinarySemaphore
