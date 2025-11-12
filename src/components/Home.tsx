function Home() {
  return (
    <section className="section">
      <div className="welcome-card">
        <h2>Welcome to OS Simulator</h2>
        <p>A professional platform for visualizing and understanding core operating system concepts through interactive simulations.</p>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🔌</span>
            <h3>Socket Programming</h3>
            <p>Visualize client-server communication with handshake protocols and message exchange</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔢</span>
            <h3>Semaphores</h3>
            <p>Binary & counting semaphores for process synchronization and mutual exclusion</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🍽️</span>
            <h3>Classic Problems</h3>
            <p>Dining Philosophers with deadlock avoidance strategies and visual resource allocation</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📅</span>
            <h3>CPU Scheduling</h3>
            <p>FCFS, SJF, Priority scheduling with Gantt charts and performance metrics</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Home
