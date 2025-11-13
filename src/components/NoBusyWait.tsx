import { useEffect, useRef, useState } from 'react'

interface Process {
  id: number
  state: 'ready' | 'running' | 'sleeping' | 'completed'
  progress: number
}

interface Semaphore {
  value: number
  queue: number[]
}

function NoBusyWait() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [processCount, setProcessCount] = useState(4)
  const [processes, setProcesses] = useState<Process[]>([])
  const [semaphore, setSemaphore] = useState<Semaphore>({ value: 1, queue: [] })
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (!isRunning || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const interval = setInterval(() => {
      setProcesses((prevProcesses) => {
        const newProcesses = [...prevProcesses]
        let newSemaphore: Semaphore = { ...semaphore }

        // Check if there's a running process
        const runningProc = newProcesses.find(p => p.state === 'running')
        
        if (runningProc) {
          // Semaphore is 0 while a process is running
          newSemaphore.value = 0
          
          // Progress the running process
          runningProc.progress += 2
          if (runningProc.progress >= 100) {
            runningProc.progress = 100
            runningProc.state = 'completed'
            // Signal: Semaphore returns to 1 when process completes
            newSemaphore.value = 1
            
            // Check if there's a next waiting process and wake it immediately
            let wakeId = newSemaphore.queue.length > 0 ? newSemaphore.queue.shift() : undefined
            if (wakeId === undefined) {
              const nextSleep = newProcesses.find(p => p.state === 'sleeping')
              wakeId = nextSleep?.id
            }
            if (wakeId !== undefined) {
              const wakeProc = newProcesses.find(p => p.id === wakeId)
              if (wakeProc && wakeProc.state === 'sleeping') {
                wakeProc.state = 'running'
                // Wait: Semaphore becomes 0 as new process starts running
                newSemaphore.value = 0
              }
            }
          }
        } else if (newSemaphore.value === 1) {
          // No process running and semaphore is available, wake the next process
          let wakeId = newSemaphore.queue.length > 0 ? newSemaphore.queue.shift() : undefined
          if (wakeId === undefined) {
            const nextSleep = newProcesses.find(p => p.state === 'sleeping')
            wakeId = nextSleep?.id
          }
          if (wakeId !== undefined) {
            const wakeProc = newProcesses.find(p => p.id === wakeId)
            if (wakeProc && wakeProc.state === 'sleeping') {
              wakeProc.state = 'running'
              // Wait: Semaphore becomes 0 as process starts running
              newSemaphore.value = 0
            }
          }
        }

        setSemaphore(newSemaphore)
        draw(ctx, canvas.width, canvas.height, newProcesses, newSemaphore)

        if (newProcesses.every((p) => p.state === 'completed')) {
          setIsRunning(false)
        }

        return newProcesses
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isRunning, semaphore])

  const draw = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    procs: Process[],
    sem: Semaphore
  ) => {
    ctx.clearRect(0, 0, width, height)

    // Draw semaphore info
    ctx.fillStyle = '#2c3e50'
    ctx.font = 'bold 20px Arial'
    ctx.fillText(`Semaphore Value: ${sem.value}`, 20, 30)
    ctx.fillText(`Wait Queue: [${sem.queue.join(', ')}]`, 20, 60)

    // Draw processes
    const startY = 90
    procs.forEach((proc, idx) => {
      const y = startY + idx * 45

      ctx.fillStyle = '#2c3e50'
      ctx.font = 'bold 14px Arial'
      ctx.fillText(`P${proc.id}`, 20, y + 20)

      let stateColor
      let stateText = proc.state.toUpperCase()
      if (proc.state === 'ready') stateColor = '#f39c12'
      else if (proc.state === 'running') stateColor = '#3498db'
      else if (proc.state === 'sleeping') {
        stateColor = '#9b59b6'
        stateText = 'SLEEP'
      } else stateColor = '#27ae60'

      ctx.fillStyle = stateColor
      ctx.fillRect(60, y, 100, 30)
      ctx.strokeStyle = '#2c3e50'
      ctx.strokeRect(60, y, 100, 30)
      ctx.fillStyle = '#fff'
      ctx.font = '12px Arial'
      ctx.fillText(stateText, 80, y + 20)

      // Progress bar
      ctx.fillStyle = '#ecf0f1'
      ctx.fillRect(180, y, 300, 30)
      ctx.fillStyle = '#3498db'
      ctx.fillRect(180, y, 300 * (proc.progress / 100), 30)
      ctx.strokeStyle = '#2c3e50'
      ctx.strokeRect(180, y, 300, 30)
      ctx.fillStyle = '#2c3e50'
      ctx.fillText(`${proc.progress}%`, 500, y + 20)
    })
  }

  const start = () => {
    const newProcesses: Process[] = []
    const q: number[] = []
    for (let i = 0; i < processCount; i++) {
      const id = i + 1
      newProcesses.push({ id, state: 'sleeping', progress: 0 })
      q.push(id)
    }
    setProcesses(newProcesses)
    setSemaphore({ value: 1, queue: q })
    setIsRunning(true)
  }

  const reset = () => {
    setIsRunning(false)
    setProcesses([])
    setSemaphore({ value: 1, queue: [] })
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  const ready = processes.filter((p) => p.state === 'ready').length
  const running = processes.filter((p) => p.state === 'running').length
  const sleeping = processes.filter((p) => p.state === 'sleeping').length
  const completed = processes.filter((p) => p.state === 'completed').length

  return (
    <section className="section">
      <div className="section-header">
        <h2>No Busy Wait (Sleep/Wakeup)</h2>
        <p>Efficient synchronization without CPU spinning</p>
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
          <h3>Algorithm:</h3>
          <pre><code>{`wait(S):
    S.value--;
    if (S.value < 0) {
        add process to S.list;
        sleep();
    }

signal(S):
    S.value++;
    if (S.value <= 0) {
        remove process P from S.list;
        wakeup(P);
    }`}</code></pre>
          {processes.length > 0 && (
            <div className="stats-area">
              <h4>Status:</h4>
              <div className="stat-item">Ready: <strong style={{ color: '#f39c12' }}>{ready}</strong></div>
              <div className="stat-item">Running: <strong style={{ color: '#3498db' }}>{running}</strong></div>
              <div className="stat-item">Sleeping (No CPU): <strong style={{ color: '#9b59b6' }}>{sleeping}</strong></div>
              <div className="stat-item">Completed: <strong style={{ color: '#27ae60' }}>{completed}</strong></div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default NoBusyWait
