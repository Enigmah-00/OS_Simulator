# OS Simulator

A professional, production-ready React TypeScript web application for visualizing and understanding fundamental operating system concepts through interactive simulations.

![OS Simulator](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![Vite](https://img.shields.io/badge/Vite-5.4-purple) ![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 Features

### Interactive Simulations

1. **🔌 Socket Programming**
   - Complete TCP handshake visualization (SYN, SYN-ACK, ACK)
   - Post-handshake data exchange with acknowledgments
   - Real-time connection state tracking
   - Message queue and statistics panel

2. **🔢 Counting Semaphore**
   - Resource pool management with configurable capacity
   - Multiple process synchronization
   - Visual state tracking (waiting, running, completed)

3. **🔒 Binary Semaphore**
   - Mutual exclusion (mutex) demonstration
   - Critical section visualization
   - Lock/unlock mechanism with visual indicators

4. **🍽️ Dining Philosopher Problem**
   - Classic deadlock scenario visualization
   - Multiple solution strategies:
     - No solution (deadlock demonstration)
     - Asymmetric pickup order
     - Arbitrator (single point of control)
   - Visual chopstick ownership with colored indicators
   - State tracking (thinking, hungry, eating)
   - Pause/resume functionality

5. **⏸️ No Busy Wait (Sleep/Wakeup)**
   - Efficient process synchronization without busy waiting
   - Sleep queue management
   - Sequential wake-up mechanism

6. **📅 CPU Scheduling Algorithms**
   - **FCFS** (First-Come, First-Served)
   - **SJF** (Shortest Job First)
   - **Priority Scheduling** (Preemptive & Non-preemptive)
   - **Round Robin** with configurable time quantum
   - Interactive Gantt chart visualization
   - Performance metrics (Average Waiting Time, Turnaround Time)

## 🎨 Design Highlights

- **Sleek, Classic Design** with professional gradient backgrounds
- **Smooth Animations** using cubic-bezier easing for polished interactions
- **Interactive Canvas Visualizations** for real-time algorithm demonstrations
- **Responsive Design** optimized for desktop, tablet, and mobile devices
- **TypeScript** for type safety and enhanced developer experience
- **Component-Based Architecture** with React hooks and modern patterns
- **Accessibility Features** including focus states and proper contrast
- **Production-Ready** with optimized performance and clean code

## 🛠️ Tech Stack

- **React 18.3** - Modern UI library with hooks
- **TypeScript 5.6** - Type-safe JavaScript superset
- **Vite 5.4** - Lightning-fast build tool and dev server
- **HTML5 Canvas** - Hardware-accelerated algorithm visualizations
- **CSS3** - Custom styling with CSS variables, gradients, and animations

## 📦 Installation & Setup

```bash
# Clone the repository
git clone https://github.com/Enigmah-00/OS_Simulator.git

# Navigate to project directory
cd OS_Simulator

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Getting Started

1. Open your browser to `http://localhost:5173` (Vite default port)
2. Navigate between simulations using the navigation menu
3. Select a simulation to explore
4. Adjust parameters using the interactive controls
5. Click **Start Simulation** to begin
6. Observe real-time visualizations
7. Reset and experiment with different configurations

## 📚 Educational Value

This simulator is designed to help students, developers, and educators understand:

- **Process Synchronization** - Semaphores, mutexes, and sleep/wakeup mechanisms
- **Deadlock Prevention** - Classic dining philosopher problem with multiple solutions
- **CPU Scheduling** - Algorithm comparison with visual Gantt charts and metrics
- **Network Protocols** - TCP handshake and data exchange visualization
- **Resource Management** - Concurrent access control and allocation strategies

## 🎬 Detailed Features

### 🔌 Socket Programming
- Complete 13-phase TCP lifecycle visualization
- Three-way handshake (SYN → SYN-ACK → ACK)
- Post-handshake message exchange with ACK responses
- Connection state machine tracking
- Message queue with statistics (sent, processed, acknowledged)
- Adjustable animation speed

### 🔒 Semaphores
**Counting Semaphore:**
- Configurable resource pool capacity
- Multiple concurrent processes
- Visual queue for waiting processes
- Real-time state tracking (Waiting, Running, Completed)
- Progress bars with gradient effects

**Binary Semaphore:**
- Mutex (mutual exclusion) demonstration
- Lock/unlock visualization
- Critical section occupancy display
- Single-process access enforcement

### 🍽️ Dining Philosopher Problem
- Circular table with 5 philosophers
- Visual chopstick ownership with colored lines
- Three solution strategies:
  1. **No Solution** - Demonstrates deadlock potential
  2. **Asymmetric** - Last philosopher picks right first
  3. **Arbitrator** - Central controller manages access
- Philosopher states: Thinking (blue) → Hungry (yellow) → Eating (green)
- Pause/resume control
### ⏸️ No Busy Wait (Sleep/Wakeup)
- Efficient synchronization without CPU spinning
- Sequential wake-up mechanism
- Process sleep queue visualization
- Single-process execution at a time
- Visual state transitions

### 📅 CPU Scheduling Algorithms
- **FCFS** - Simple first-come, first-served order
- **SJF** - Shortest job executes first (optimal for average waiting time)
- **Priority** - Process priority-based scheduling
- **Round Robin** - Time-quantum based fair scheduling
- Interactive Gantt chart with color-coded processes
- Detailed metrics:
  - Average Waiting Time
  - Average Turnaround Time
  - Individual process statistics
- Dynamic process addition/removal
- Configurable parameters (priority, burst time, arrival time, quantum)

## 🏗️ Project Structure

```
OS_Simulator/
├── src/
│   ├── components/
│   │   ├── BinarySemaphore.tsx
│   │   ├── CountingSemaphore.tsx
│   │   ├── DiningPhilosopher.tsx
│   │   ├── Home.tsx
│   │   ├── NoBusyWait.tsx
│   │   ├── Scheduling.tsx
│   │   └── SocketProgramming.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Enigmah-00**
- GitHub: [@Enigmah-00](https://github.com/Enigmah-00)

## 🙏 Acknowledgments

- Inspired by classic operating system textbooks and university curricula
- Built with modern web technologies for educational purposes
- Special thanks to the React and TypeScript communities

## 📸 Screenshots

Visit the [live demo](#) to see the simulator in action!

---

**⭐ Star this repository if you find it helpful!**

**🐛 Found a bug? Open an issue!**

**💡 Have a suggestion? We'd love to hear it!**
- Process queue management
- Statistics (Average Waiting Time, Turnaround Time)
- Dynamic process addition

## 🔧 Development

Built with modern React patterns:
- Functional components with hooks
- TypeScript for type safety
- useEffect for canvas animations
- useState for state management
- CSS modules for styling

## 📝 License

Educational Purpose - Free to use and modify

## 👨‍💻 Author

Created for OS Presentation - 2025

---

**Note**: This is a client-side only application. All simulations run in the browser with no backend required.
