function Home() {
  return (
    <section className="section">
      <div className="welcome-card">
        <h2>Welcome to OS Concepts Simulator</h2>
        <p>Explore and visualize fundamental operating system concepts through interactive simulations.</p>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🔌</span>
            <h3>Socket Programming</h3>
            <p>Client-Server communication patterns</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔢</span>
            <h3>Semaphores</h3>
            <p>Synchronization mechanisms</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🍽️</span>
            <h3>Classic Problems</h3>
            <p>Dining Philosopher & more</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📅</span>
            <h3>CPU Scheduling</h3>
            <p>FCFS, SJF, Priority, Round Robin</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Home
