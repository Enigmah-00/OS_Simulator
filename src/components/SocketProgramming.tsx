import { useEffect, useRef, useState } from 'react'

function SocketProgramming() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  
  // Messaging visualization states
  const messagingCanvasRef = useRef<HTMLCanvasElement>(null)
  type MsgStatus = 'queued' | 'sending' | 'processing' | 'ack' | 'done'
  interface Message {
    id: number
    lane: number
    x: number // packet position from client -> server
    ackX: number // ack position from server -> client
    status: MsgStatus
    processTicks: number
    timestamp: number
  }
  const [messages, setMessages] = useState<Message[]>([])
  const [msgAnimating, setMsgAnimating] = useState(false)
  const [msgCounter, setMsgCounter] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(1.0)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !isAnimating) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    draw(ctx, canvas.width, canvas.height)

    if (phase < 7) {
      const timer = setTimeout(() => setPhase(prev => prev + 1), 1500)
      return () => clearTimeout(timer)
    } else {
      setIsAnimating(false)
    }
  }, [phase, isAnimating])

  // Messaging animation loop
  useEffect(() => {
    if (!msgAnimating || !messagingCanvasRef.current) return
    const canvas = messagingCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const serverX = 100
    const clientX = 580
    const boxY = 30
    const boxW = 120
    const boxH = 90
    const baseY = 170
    const laneGap = 40
    const baseSpeed = 4

    let lastTime = Date.now()
    const animate = () => {
      const now = Date.now()
      const deltaTime = (now - lastTime) / 16.67 // normalize to 60fps
      lastTime = now
      
      const speed = baseSpeed * animationSpeed * deltaTime

      setMessages(prev => {
        const updated = prev.map(m => ({ ...m }))
        let anyActive = false
        
        updated.forEach(m => {
          if (m.status === 'queued') {
            // Check if lane is free
            const laneOccupied = updated.some(
              msg => msg.id !== m.id && msg.lane === m.lane && 
              (msg.status === 'sending' || msg.status === 'processing') && 
              msg.x > clientX - 50
            )
            if (!laneOccupied) {
              m.status = 'sending'
            }
            anyActive = true
          } else if (m.status === 'sending') {
            m.x -= speed
            if (m.x <= serverX + boxW + 10) {
              m.status = 'processing'
              m.processTicks = Math.floor(20 / animationSpeed)
              m.x = serverX + boxW + 10
            }
            anyActive = true
          } else if (m.status === 'processing') {
            m.processTicks -= deltaTime
            if (m.processTicks <= 0) {
              m.status = 'ack'
              m.ackX = serverX + boxW
            }
            anyActive = true
          } else if (m.status === 'ack') {
            m.ackX += speed
            if (m.ackX >= clientX - 5) {
              m.status = 'done'
            } else {
              anyActive = true
            }
          }
        })

        // draw
        const stats = {
          total: updated.length,
          queued: updated.filter(m => m.status === 'queued').length,
          inFlight: updated.filter(m => m.status === 'sending' || m.status === 'processing').length,
          processing: updated.filter(m => m.status === 'processing').length,
          completed: updated.filter(m => m.status === 'done').length
        }
        
        drawMessaging(ctx, canvas.width, canvas.height, updated, {
          serverX, clientX, boxY, boxW, boxH, baseY, laneGap
        }, stats)

        if (!anyActive) {
          setMsgAnimating(false)
        }
        return updated
      })

      if (msgAnimating) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [msgAnimating, animationSpeed])

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height)

    // Draw server
    drawBox(ctx, 100, 150, 120, 100, '#3498db', 'Server')

    // Draw client
    drawBox(ctx, 580, 150, 120, 100, '#27ae60', 'Client')

    // Draw connection phases
    if (phase >= 1) {
      drawArrow(ctx, 220, 180, 580, 180, '#e74c3c', 'SYN')
    }
    if (phase >= 2) {
      drawArrow(ctx, 580, 200, 220, 200, '#f39c12', 'SYN-ACK')
    }
    if (phase >= 3) {
      drawArrow(ctx, 220, 220, 580, 220, '#27ae60', 'ACK')
    }
    if (phase >= 4) {
      ctx.fillStyle = '#2c3e50'
      ctx.font = 'bold 16px Arial'
      ctx.fillText('Connection Established', 280, 280)
    }
    if (phase >= 5) {
      drawArrow(ctx, 220, 300, 580, 300, '#9b59b6', 'Data')
    }
    if (phase >= 6) {
      drawArrow(ctx, 580, 320, 220, 320, '#16a085', 'ACK')
    }
  }

  const drawBox = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    label: string
  ) => {
    ctx.fillStyle = color
    ctx.fillRect(x, y, width, height)
    ctx.strokeStyle = '#2c3e50'
    ctx.lineWidth = 3
    ctx.strokeRect(x, y, width, height)

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 18px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(label, x + width / 2, y + height / 2 + 5)
  }

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    label: string
  ) => {
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()

    // Arrowhead
    const angle = Math.atan2(y2 - y1, x2 - x1)
    ctx.beginPath()
    ctx.moveTo(x2, y2)
    ctx.lineTo(x2 - 10 * Math.cos(angle - Math.PI / 6), y2 - 10 * Math.sin(angle - Math.PI / 6))
    ctx.lineTo(x2 - 10 * Math.cos(angle + Math.PI / 6), y2 - 10 * Math.sin(angle + Math.PI / 6))
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()

    // Label
    ctx.fillStyle = '#2c3e50'
    ctx.font = '14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(label, (x1 + x2) / 2, y1 - 10)
  }

  // Messaging drawing helpers (separate canvas)
  function drawMessaging(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    msgs: Message[],
    layout: { serverX: number, clientX: number, boxY: number, boxW: number, boxH: number, baseY: number, laneGap: number },
    stats: { total: number, queued: number, inFlight: number, processing: number, completed: number }
  ) {
    const { serverX, clientX, boxY, boxW, boxH, baseY, laneGap } = layout
    ctx.clearRect(0, 0, width, height)
    
    // Draw endpoints with enhanced styling
    drawBox(ctx, serverX, boxY, boxW, boxH, '#3498db', 'Server')
    drawBox(ctx, clientX, boxY, boxW, boxH, '#27ae60', 'Client')

    // Draw connection line
    ctx.strokeStyle = '#34495e'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(serverX + boxW, boxY + boxH / 2)
    ctx.lineTo(clientX, boxY + boxH / 2)
    ctx.stroke()

    // Guide lines for lanes
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = '#bdc3c7'
    ctx.lineWidth = 1
    for (let l = 0; l < 3; l++) {
      const y = baseY + l * laneGap
      ctx.beginPath()
      ctx.moveTo(serverX + boxW, y)
      ctx.lineTo(clientX, y)
      ctx.stroke()
    }
    ctx.setLineDash([])

    // Draw queue indicator on client side
    const queuedMsgs = msgs.filter(m => m.status === 'queued')
    if (queuedMsgs.length > 0) {
      ctx.fillStyle = '#f39c12'
      ctx.font = 'bold 11px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`Queue: ${queuedMsgs.length}`, clientX + boxW / 2, boxY + boxH + 16)
    }

    // Draw processing indicator on server side
    if (stats.processing > 0) {
      ctx.fillStyle = '#3498db'
      ctx.font = 'bold 11px Arial'
      ctx.textAlign = 'center'
      const dots = '.'.repeat((Math.floor(Date.now() / 300) % 3) + 1)
      ctx.fillText(`Processing${dots}`, serverX + boxW / 2, boxY + boxH + 16)
    }

    // Draw messages and ACKs
    msgs.forEach(m => {
      const y = baseY + m.lane * laneGap
      
      if (m.status === 'queued') {
        // Show queued message at client
        drawPacket(ctx, clientX + boxW - 20, y, `M${m.id}`, '#95a5a6', 0.6)
      } else if (m.status === 'sending' || m.status === 'processing') {
        // Packet from client -> server
        const alpha = m.status === 'processing' ? 0.5 : 1.0
        drawPacket(ctx, m.x, y, `M${m.id}`, '#9b59b6', alpha)
        
        // Draw tail effect for sending
        if (m.status === 'sending') {
          ctx.strokeStyle = 'rgba(155, 89, 182, 0.3)'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(m.x + 17, y)
          ctx.lineTo(Math.min(m.x + 40, clientX), y)
          ctx.stroke()
        }
      }
      
      if (m.status === 'ack' || m.status === 'done') {
        // ACK from server -> client
        const alpha = m.status === 'done' ? 0.3 : 1.0
        drawPacket(ctx, m.ackX, y + 16, `ACK${m.id}`, '#16a085', alpha)
        
        // Draw tail effect for ack
        if (m.status === 'ack') {
          ctx.strokeStyle = 'rgba(22, 160, 133, 0.3)'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(Math.max(m.ackX - 40, serverX + boxW), y + 16)
          ctx.lineTo(m.ackX - 17, y + 16)
          ctx.stroke()
        }
      }
    })

    // Stats panel
    ctx.fillStyle = '#ecf0f1'
    ctx.fillRect(10, height - 70, 240, 60)
    ctx.strokeStyle = '#34495e'
    ctx.lineWidth = 2
    ctx.strokeRect(10, height - 70, 240, 60)
    
    ctx.fillStyle = '#2c3e50'
    ctx.font = 'bold 13px Arial'
    ctx.textAlign = 'left'
    ctx.fillText('Message Statistics:', 20, height - 50)
    ctx.font = '11px Arial'
    ctx.fillText(`Total: ${stats.total} | Queued: ${stats.queued} | In-Flight: ${stats.inFlight} | Done: ${stats.completed}`, 20, height - 30)

    // Legend
    ctx.fillStyle = '#2c3e50'
    ctx.font = 'bold 12px Arial'
    ctx.textAlign = 'left'
    ctx.fillText('Legend:', width - 240, height - 50)
    
    ctx.fillStyle = '#9b59b6'; ctx.fillRect(width - 230, height - 35, 14, 14)
    ctx.fillStyle = '#2c3e50'; ctx.font = '11px Arial'; ctx.fillText('Request', width - 210, height - 24)
    
    ctx.fillStyle = '#16a085'; ctx.fillRect(width - 150, height - 35, 14, 14)
    ctx.fillStyle = '#2c3e50'; ctx.fillText('ACK', width - 130, height - 24)
  }

  function drawPacket(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, color: string, alpha = 1.0) {
    ctx.globalAlpha = alpha
    ctx.fillStyle = color
    const w = 34, h = 16
    const r = 6
    const rx = x - w / 2
    const ry = y - h / 2
    ctx.beginPath()
    ctx.moveTo(rx + r, ry)
    ctx.lineTo(rx + w - r, ry)
    ctx.quadraticCurveTo(rx + w, ry, rx + w, ry + r)
    ctx.lineTo(rx + w, ry + h - r)
    ctx.quadraticCurveTo(rx + w, ry + h, rx + w - r, ry + h)
    ctx.lineTo(rx + r, ry + h)
    ctx.quadraticCurveTo(rx, ry + h, rx, ry + h - r)
    ctx.lineTo(rx, ry + r)
    ctx.quadraticCurveTo(rx, ry, rx + r, ry)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 10px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, x, y)
    ctx.globalAlpha = 1.0
  }

  const startSimulation = () => {
    setPhase(0)
    setIsAnimating(true)
  }

  // Messaging controls
  const addMessage = () => {
    if (!msgAnimating) {
      setMsgAnimating(true)
    }
    setMessages(prev => {
      const id = msgCounter + 1
      const lane = (id - 1) % 3
      const m: Message = {
        id,
        lane,
        x: 580, // clientX
        ackX: 100 + 120, // serverX + boxW (will be used later)
        status: 'queued',
        processTicks: 0,
        timestamp: Date.now()
      }
      return [...prev, m]
    })
    setMsgCounter(c => c + 1)
  }

  const startMessaging = () => {
    if (messages.length === 0) {
      // enqueue a few default messages
      setMessages([
        { id: 1, lane: 0, x: 580, ackX: 220, status: 'queued', processTicks: 0, timestamp: Date.now() },
        { id: 2, lane: 1, x: 580, ackX: 220, status: 'queued', processTicks: 0, timestamp: Date.now() + 100 },
        { id: 3, lane: 2, x: 580, ackX: 220, status: 'queued', processTicks: 0, timestamp: Date.now() + 200 },
      ])
      setMsgCounter(3)
    }
    setMsgAnimating(true)
  }

  const pauseMessaging = () => {
    setMsgAnimating(false)
  }

  const resetMessaging = () => {
    setMsgAnimating(false)
    setMessages([])
    setMsgCounter(0)
    if (messagingCanvasRef.current) {
      const ctx = messagingCanvasRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, messagingCanvasRef.current.width, messagingCanvasRef.current.height)
      }
    }
  }

  const reset = () => {
    setPhase(0)
    setIsAnimating(false)
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
  }

  return (
    <section className="section">
      <div className="section-header">
        <h2>Socket Programming Simulation</h2>
        <p>Visualize client-server communication using sockets</p>
      </div>
      <div className="simulation-container">
        <div className="controls">
          <button className="btn-primary" onClick={startSimulation}>
            Start Connection
          </button>
          <button className="btn-secondary" onClick={reset}>
            Reset
          </button>
        </div>
        <div className="visualization">
          <canvas ref={canvasRef} width={800} height={600}></canvas>
        </div>

        {/* Messaging section */}
        <div style={{ 
          marginTop: '32px', 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '2px solid #dee2e6'
        }}>
          <div className="controls" style={{ marginBottom: '16px', alignItems: 'center' }}>
            <h3 style={{ margin: 0, marginRight: '20px', color: '#2c3e50' }}>
              📡 Message Exchange Layer
            </h3>
            <button 
              className="btn-primary" 
              onClick={msgAnimating ? pauseMessaging : startMessaging}
              style={{ marginRight: '8px' }}
            >
              {msgAnimating ? '⏸ Pause' : '▶ Start Messaging'}
            </button>
            <button 
              className="btn-primary" 
              onClick={addMessage}
              style={{ marginRight: '8px' }}
            >
              ➕ Add Message
            </button>
            <button 
              className="btn-secondary" 
              onClick={resetMessaging}
            >
              🔄 Reset
            </button>
            <div style={{ 
              marginLeft: 'auto', 
              display: 'flex', 
              alignItems: 'center',
              gap: '10px'
            }}>
              <label style={{ fontSize: '13px', color: '#34495e', fontWeight: '500' }}>
                Speed:
              </label>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.1"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                style={{ width: '100px' }}
              />
              <span style={{ 
                fontSize: '12px', 
                color: '#7f8c8d',
                minWidth: '30px',
                textAlign: 'center'
              }}>
                {animationSpeed.toFixed(1)}x
              </span>
            </div>
          </div>
          <div className="visualization" style={{ margin: 0 }}>
            <canvas ref={messagingCanvasRef} width={800} height={280}></canvas>
          </div>
        </div>

        <div className="info-panel">
          <h3>Algorithm Steps:</h3>
          <ol>
            <li>Server creates socket and binds to port</li>
            <li>Server listens for connections</li>
            <li>Client creates socket and connects</li>
            <li>Three-way handshake (SYN, SYN-ACK, ACK)</li>
            <li>Data exchange with message queuing and acknowledgments</li>
            <li>Connection termination</li>
          </ol>
          <h3 style={{ marginTop: '20px' }}>Message Exchange Features:</h3>
          <ul>
            <li><strong>Queue Management:</strong> Messages wait in queue before transmission</li>
            <li><strong>Lane Allocation:</strong> Three parallel lanes prevent collision</li>
            <li><strong>Processing Delay:</strong> Server processing time simulation</li>
            <li><strong>Acknowledgments:</strong> Bi-directional confirmation mechanism</li>
            <li><strong>Real-time Stats:</strong> Track message flow and completion</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default SocketProgramming
