import { useEffect, useRef, useState } from 'react'

type Algorithm = 'fcfs' | 'sjf' | 'priority' | 'rr'

interface Process {
  id: number
  arrival: number
  burst: number
  priority: number
  remaining: number
  start: number
  finish: number
  waiting: number
  turnaround: number
}

interface TimelineItem {
  processId: number
  start: number
  duration: number
}

function Scheduling() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [algorithm, setAlgorithm] = useState<Algorithm>('fcfs')
  const [processes, setProcesses] = useState<Process[]>([
    { id: 1, arrival: 0, burst: 5, priority: 2, remaining: 5, start: -1, finish: 0, waiting: 0, turnaround: 0 },
    { id: 2, arrival: 1, burst: 3, priority: 1, remaining: 3, start: -1, finish: 0, waiting: 0, turnaround: 0 },
    { id: 3, arrival: 2, burst: 8, priority: 3, remaining: 8, start: -1, finish: 0, waiting: 0, turnaround: 0 },
  ])
  const [timeQuantum, setTimeQuantum] = useState(2)
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [avgWaiting, setAvgWaiting] = useState(0)
  const [avgTurnaround, setAvgTurnaround] = useState(0)

  const algorithmInfo = {
    fcfs: {
      name: 'First-Come, First-Served (FCFS)',
      description: 'Processes are executed in the order they arrive. Simple but can cause convoy effect.',
      type: 'Non-preemptive',
    },
    sjf: {
      name: 'Shortest Job First (SJF)',
      description: 'Process with shortest burst time is executed first. Optimal for minimizing average waiting time.',
      type: 'Non-preemptive',
    },
    priority: {
      name: 'Priority Scheduling',
      description: 'Processes are executed based on priority. Lower priority number = higher priority.',
      type: 'Non-preemptive',
    },
    rr: {
      name: 'Round Robin (RR)',
      description: 'Each process gets a fixed time quantum. Fair and prevents starvation.',
      type: 'Preemptive',
    },
  }

  useEffect(() => {
    if (timeline.length > 0 && canvasRef.current) {
      drawGanttChart()
    }
  }, [timeline])

  const addProcess = () => {
    const newId = processes.length > 0 ? Math.max(...processes.map(p => p.id)) + 1 : 1
    setProcesses([...processes, {
      id: newId,
      arrival: 0,
      burst: Math.floor(Math.random() * 8) + 2,
      priority: 1,
      remaining: 0,
      start: -1,
      finish: 0,
      waiting: 0,
      turnaround: 0
    }])
  }

  const removeProcess = (id: number) => {
    setProcesses(processes.filter(p => p.id !== id))
  }

  const updateProcess = (id: number, field: string, value: number) => {
    setProcesses(processes.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const runScheduling = () => {
    const procsCopy = processes.map(p => ({ ...p, remaining: p.burst }))
    let newTimeline: TimelineItem[] = []

    switch (algorithm) {
      case 'fcfs':
        newTimeline = runFCFS(procsCopy)
        break
      case 'sjf':
        newTimeline = runSJF(procsCopy)
        break
      case 'priority':
        newTimeline = runPriority(procsCopy)
        break
      case 'rr':
        newTimeline = runRoundRobin(procsCopy)
        break
    }

    calculateStats(procsCopy)
    setTimeline(newTimeline)
  }

  const runFCFS = (procs: Process[]): TimelineItem[] => {
    const sorted = [...procs].sort((a, b) => a.arrival - b.arrival)
    const timeline: TimelineItem[] = []
    let currentTime = 0

    sorted.forEach(proc => {
      if (currentTime < proc.arrival) {
        currentTime = proc.arrival
      }
      proc.start = currentTime
      timeline.push({ processId: proc.id, start: currentTime, duration: proc.burst })
      currentTime += proc.burst
      proc.finish = currentTime
    })

    return timeline
  }

  const runSJF = (procs: Process[]): TimelineItem[] => {
    const queue = [...procs]
    const timeline: TimelineItem[] = []
    let currentTime = 0

    while (queue.length > 0) {
      const available = queue.filter(p => p.arrival <= currentTime)

      if (available.length === 0) {
        currentTime = Math.min(...queue.map(p => p.arrival))
        continue
      }

      available.sort((a, b) => a.burst - b.burst)
      const proc = available[0]

      proc.start = currentTime
      timeline.push({ processId: proc.id, start: currentTime, duration: proc.burst })
      currentTime += proc.burst
      proc.finish = currentTime

      queue.splice(queue.indexOf(proc), 1)
    }

    return timeline
  }

  const runPriority = (procs: Process[]): TimelineItem[] => {
    const queue = [...procs]
    const timeline: TimelineItem[] = []
    let currentTime = 0

    while (queue.length > 0) {
      const available = queue.filter(p => p.arrival <= currentTime)

      if (available.length === 0) {
        currentTime = Math.min(...queue.map(p => p.arrival))
        continue
      }

      available.sort((a, b) => a.priority - b.priority)
      const proc = available[0]

      proc.start = currentTime
      timeline.push({ processId: proc.id, start: currentTime, duration: proc.burst })
      currentTime += proc.burst
      proc.finish = currentTime

      queue.splice(queue.indexOf(proc), 1)
    }

    return timeline
  }

  const runRoundRobin = (procs: Process[]): TimelineItem[] => {
    const queue = procs.map(p => ({ ...p, remaining: p.burst }))
    const timeline: TimelineItem[] = []
    const readyQueue: Process[] = []
    let currentTime = 0

    while (queue.some(p => p.remaining > 0)) {
      // Add newly arrived processes
      const newArrivals = queue.filter(p => p.arrival === currentTime && p.remaining > 0 && !readyQueue.includes(p))
      readyQueue.push(...newArrivals)

      if (readyQueue.length === 0) {
        currentTime++
        continue
      }

      const proc = readyQueue.shift()!

      if (proc.start === -1) {
        proc.start = currentTime
      }

      const execTime = Math.min(timeQuantum, proc.remaining)
      timeline.push({ processId: proc.id, start: currentTime, duration: execTime })

      currentTime += execTime
      proc.remaining -= execTime

      // Add processes that arrived during execution
      const arrivedDuring = queue.filter(p =>
        p.arrival > (currentTime - execTime) &&
        p.arrival <= currentTime &&
        p.remaining > 0 &&
        !readyQueue.includes(p) &&
        p !== proc
      )
      readyQueue.push(...arrivedDuring)

      if (proc.remaining > 0) {
        readyQueue.push(proc)
      } else {
        proc.finish = currentTime
      }
    }

    return timeline
  }

  const calculateStats = (procs: Process[]) => {
    procs.forEach(proc => {
      proc.turnaround = proc.finish - proc.arrival
      proc.waiting = proc.turnaround - proc.burst
    })

    const avgW = procs.reduce((sum, p) => sum + p.waiting, 0) / procs.length
    const avgT = procs.reduce((sum, p) => sum + p.turnaround, 0) / procs.length

    setAvgWaiting(avgW)
    setAvgTurnaround(avgT)
    setProcesses(procs)
  }

  const drawGanttChart = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw title
    ctx.fillStyle = '#2c3e50'
    ctx.font = 'bold 18px Arial'
    ctx.fillText('Gantt Chart:', 20, 30)

    const maxTime = Math.max(...timeline.map(t => t.start + t.duration))
    const scale = (canvas.width - 100) / maxTime
    const barHeight = 50
    const startY = 60

    // Draw timeline
    timeline.forEach((item) => {
      const x = 50 + item.start * scale
      const w = item.duration * scale

      const colors = ['#3498db', '#27ae60', '#e74c3c', '#f39c12', '#9b59b6', '#16a085', '#e67e22', '#1abc9c']
      ctx.fillStyle = colors[item.processId % colors.length]
      ctx.fillRect(x, startY, w, barHeight)
      ctx.strokeStyle = '#2c3e50'
      ctx.lineWidth = 2
      ctx.strokeRect(x, startY, w, barHeight)

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`P${item.processId}`, x + w / 2, startY + barHeight / 2 + 5)

      ctx.fillStyle = '#2c3e50'
      ctx.font = '12px Arial'
      ctx.fillText(item.start.toString(), x, startY + barHeight + 20)
    })

    // Final time marker
    const lastItem = timeline[timeline.length - 1]
    const endTime = lastItem.start + lastItem.duration
    const endX = 50 + endTime * scale
    ctx.fillText(endTime.toString(), endX, startY + barHeight + 20)

    // Draw legend
    const legendY = startY + barHeight + 50
    ctx.font = '14px Arial'
    ctx.fillText('Processes:', 20, legendY)

    const uniqueProcesses = [...new Set(timeline.map(t => t.processId))]
    uniqueProcesses.forEach((pid, idx) => {
      const colors = ['#3498db', '#27ae60', '#e74c3c', '#f39c12', '#9b59b6', '#16a085', '#e67e22', '#1abc9c']
      ctx.fillStyle = colors[pid % colors.length]
      ctx.fillRect(20 + idx * 80, legendY + 10, 20, 20)
      ctx.strokeStyle = '#2c3e50'
      ctx.strokeRect(20 + idx * 80, legendY + 10, 20, 20)
      ctx.fillStyle = '#2c3e50'
      ctx.fillText(`P${pid}`, 45 + idx * 80, legendY + 25)
    })
  }

  const reset = () => {
    setTimeline([])
    setAvgWaiting(0)
    setAvgTurnaround(0)
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  const currentInfo = algorithmInfo[algorithm]

  return (
    <section className="section">
      <div className="section-header">
        <h2>CPU Scheduling Algorithms</h2>
        <p>Compare different scheduling strategies</p>
      </div>

      <div className="scheduling-tabs">
        <button className={`tab-btn ${algorithm === 'fcfs' ? 'active' : ''}`} onClick={() => setAlgorithm('fcfs')}>
          FCFS
        </button>
        <button className={`tab-btn ${algorithm === 'sjf' ? 'active' : ''}`} onClick={() => setAlgorithm('sjf')}>
          SJF
        </button>
        <button className={`tab-btn ${algorithm === 'priority' ? 'active' : ''}`} onClick={() => setAlgorithm('priority')}>
          Priority
        </button>
        <button className={`tab-btn ${algorithm === 'rr' ? 'active' : ''}`} onClick={() => setAlgorithm('rr')}>
          Round Robin
        </button>
      </div>

      <div className="simulation-container">
        <div className="controls">
          <button className="btn-primary" onClick={addProcess}>
            Add Process
          </button>
          <button className="btn-primary" onClick={runScheduling}>
            Start Scheduling
          </button>
          <button className="btn-secondary" onClick={reset}>
            Reset
          </button>
          {algorithm === 'rr' && (
            <label style={{ marginLeft: '10px' }}>
              Time Quantum:{' '}
              <input
                type="number"
                value={timeQuantum}
                onChange={(e) => setTimeQuantum(Number(e.target.value))}
                min="1"
                max="10"
                style={{ width: '70px' }}
              />
            </label>
          )}
        </div>

        <div className="process-input-area">
          <h3>Process Queue</h3>
          <div className="process-list">
            {processes.map((proc) => (
              <div key={proc.id} className="process-item">
                <span style={{ fontWeight: 600 }}>P{proc.id}</span>
                <label>
                  Arrival:{' '}
                  <input
                    type="number"
                    value={proc.arrival}
                    onChange={(e) => updateProcess(proc.id, 'arrival', Number(e.target.value))}
                    min="0"
                    className="input-sm"
                  />
                </label>
                <label>
                  Burst:{' '}
                  <input
                    type="number"
                    value={proc.burst}
                    onChange={(e) => updateProcess(proc.id, 'burst', Number(e.target.value))}
                    min="1"
                    className="input-sm"
                  />
                </label>
                {algorithm === 'priority' && (
                  <label>
                    Priority:{' '}
                    <input
                      type="number"
                      value={proc.priority}
                      onChange={(e) => updateProcess(proc.id, 'priority', Number(e.target.value))}
                      min="1"
                      className="input-sm"
                    />
                  </label>
                )}
                <button className="btn-remove" onClick={() => removeProcess(proc.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="visualization">
          <canvas ref={canvasRef} width={800} height={600}></canvas>
        </div>

        <div className="info-panel">
          <h3>{currentInfo.name}</h3>
          <p>
            <strong>Type:</strong> {currentInfo.type}
          </p>
          <p>{currentInfo.description}</p>
          {timeline.length > 0 && (
            <div className="stats-area">
              <h4>Statistics:</h4>
              <div className="stat-item">
                Average Waiting Time: <strong>{avgWaiting.toFixed(2)}</strong>
              </div>
              <div className="stat-item">
                Average Turnaround Time: <strong>{avgTurnaround.toFixed(2)}</strong>
              </div>
              <h4 style={{ marginTop: '15px' }}>Process Details:</h4>
              {processes.map((p) => (
                <div key={p.id} className="stat-item">
                  P{p.id}: Waiting = {p.waiting}, Turnaround = {p.turnaround}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Scheduling
