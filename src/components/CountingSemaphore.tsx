import { useEffect, useRef, useState } from 'react'

interface Process {
  id: number
  state: 'waiting' | 'running' | 'completed'
  progress: number
}

function CountingSemaphore() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [resources, setResources] = useState(3)
  const [processCount, setProcessCount] = useState(5)
  const [_processes, setProcesses] = useState<Process[]>([])
  const [semaphore, setSemaphore] = useState(3)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (!isRunning || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const interval = setInterval(() => {
      setProcesses((prevProcesses) => {
        let currentSemaphore = semaphore
        const updatedProcesses = prevProcesses.map((proc) => {
          if (proc.state === 'waiting' && currentSemaphore > 0) {
            currentSemaphore--
            return { ...proc, state: 'running' as const }
          } else if (proc.state === 'running') {
            const newProgress = proc.progress + 2
            if (newProgress >= 100) {
              currentSemaphore++
              return { ...proc, state: 'completed' as const, progress: 100 }
            }
            return { ...proc, progress: newProgress }
          }
          return proc
        })

        setSemaphore(currentSemaphore)
        draw(ctx, canvas.width, canvas.height, updatedProcesses, currentSemaphore)

        if (updatedProcesses.every((p) => p.state === 'completed')) {
          setIsRunning(false)
        }

        return updatedProcesses
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isRunning, semaphore])

  const draw = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    procs: Process[],
    sem: number
  ) => {
    ctx.clearRect(0, 0, width, height)

    // Draw semaphore value
    ctx.fillStyle = '#2c3e50'
    ctx.font = 'bold 24px Arial'
    ctx.fillText(`Semaphore Value: ${sem}`, 20, 40)

    // Draw resources
    ctx.font = 'bold 18px Arial'
    ctx.fillText('Available Resources:', 20, 80)
    for (let i = 0; i < resources; i++) {
      const color = i < sem ? '#27ae60' : '#e74c3c'
      ctx.fillStyle = color
      ctx.fillRect(220 + i * 60, 60, 50, 50)
      ctx.strokeStyle = '#2c3e50'
      ctx.lineWidth = 2
      ctx.strokeRect(220 + i * 60, 60, 50, 50)
    }

    // Draw processes
    const startY = 140
    procs.forEach((proc, idx) => {
      const y = startY + idx * 40

      ctx.fillStyle = '#2c3e50'
      ctx.font = '14px Arial'
      ctx.fillText(`P${proc.id}`, 20, y + 20)

      let stateColor
      if (proc.state === 'waiting') stateColor = '#f39c12'
      else if (proc.state === 'running') stateColor = '#3498db'
      else stateColor = '#27ae60'

      ctx.fillStyle = stateColor
      ctx.fillRect(60, y, 100, 25)
      ctx.strokeStyle = '#2c3e50'
      ctx.strokeRect(60, y, 100, 25)
      ctx.fillStyle = '#fff'
      ctx.fillText(proc.state.toUpperCase(), 80, y + 18)

      // Progress bar
      ctx.fillStyle = '#ecf0f1'
      ctx.fillRect(180, y, 300, 25)
      ctx.fillStyle = '#3498db'
      ctx.fillRect(180, y, 300 * (proc.progress / 100), 25)
      ctx.strokeStyle = '#2c3e50'
      ctx.strokeRect(180, y, 300, 25)
      ctx.fillStyle = '#2c3e50'
      ctx.fillText(`${proc.progress}%`, 500, y + 18)
    })
  }

  const start = () => {
    const newProcesses: Process[] = []
    for (let i = 0; i < processCount; i++) {
      newProcesses.push({ id: i + 1, state: 'waiting', progress: 0 })
    }
    setProcesses(newProcesses)
    setSemaphore(resources)
    setIsRunning(true)
  }

  const reset = () => {
    setIsRunning(false)
    setProcesses([])
    setSemaphore(resources)
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  return (
    <section className="section">
      <div className="section-header">
        <h2>Counting Semaphore Simulation</h2>
        <p>Manage access to a resource pool with multiple instances</p>
      </div>
      <div className="simulation-container">
        <div className="controls">
          <label>
            Resources:{' '}
            <input
              type="number"
              value={resources}
              onChange={(e) => setResources(Number(e.target.value))}
              min="1"
              max="10"
              disabled={isRunning}
            />
          </label>
          <label>
            Processes:{' '}
            <input
              type="number"
              value={processCount}
              onChange={(e) => setProcessCount(Number(e.target.value))}
              min="1"
              max="10"
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
          <h3>Algorithm:</h3>
          <pre>
            <code>
              {`wait(S):
    while (S <= 0);
    S--;

signal(S):
    S++;`}
            </code>
          </pre>
        </div>
      </div>
    </section>
  )
}

export default CountingSemaphore
