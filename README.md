# OS Concepts Simulator

A professional, sleek React TypeScript web application for visualizing and simulating fundamental operating system concepts.

## 🚀 Features

### Simulations Included

1. **Socket Programming** - Client-server communication with TCP three-way handshake visualization
2. **Counting Semaphore** - Resource pool management with multiple instances
3. **Binary Semaphore** - Mutual exclusion (mutex) demonstration
4. **Dining Philosopher Problem** - Classic synchronization problem with deadlock solutions
5. **No Busy Wait** - Sleep/Wakeup mechanism for efficient synchronization
6. **CPU Scheduling Algorithms**:
   - FCFS (First-Come, First-Served)
   - SJF (Shortest Job First)
   - Priority Scheduling
   - Round Robin

## 🎨 Design Highlights

- **Modern, Professional UI** with gradient backgrounds and smooth animations
- **Interactive Canvas Visualizations** for real-time algorithm demonstrations
- **Responsive Design** that works on desktop and mobile devices
- **TypeScript** for type safety and better developer experience
- **Component-Based Architecture** with React hooks for state management

## 🛠️ Tech Stack

- **React 18.3** - Modern UI library
- **TypeScript 5.6** - Type-safe JavaScript
- **Vite 5.4** - Fast build tool and dev server
- **HTML5 Canvas** - For algorithm visualizations
- **CSS3** - Custom styling with CSS variables and animations

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Usage

1. Open your browser to `http://localhost:3000`
2. Navigate using the top menu buttons
3. Select a simulation/algorithm to explore
4. Adjust parameters using the controls
5. Click "Start Simulation" to begin
6. Watch the real-time visualization
7. Reset and try different configurations

## 📚 Educational Value

This simulator helps students and developers understand:
- Process synchronization mechanisms
- Deadlock prevention strategies
- CPU scheduling algorithms and their trade-offs
- Network communication protocols
- Resource allocation and management

## 🎬 Features by Section

### Socket Programming
- Visual TCP handshake (SYN, SYN-ACK, ACK)
- Data transmission simulation
- Connection lifecycle demonstration

### Semaphores
- Counting semaphore with configurable resources
- Binary semaphore (mutex) implementation
- Visual process state tracking (Waiting, Running, Completed)
- Progress bars for each process

### Dining Philosopher
- Circular table visualization
- Multiple solution strategies:
  - No solution (demonstrates deadlock)
  - Asymmetric solution
  - Arbitrator solution
- Real-time philosopher states (Thinking, Hungry, Eating)

### CPU Scheduling
- Gantt chart visualization
- Algorithm comparison
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
