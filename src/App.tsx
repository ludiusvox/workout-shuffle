import { useState } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import { 
  Dumbbell, 
  Footprints, 
  Calendar,
  MapPin,
  Flame,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react'

type WorkoutType = 'Lifting' | 'Hiking' | 'Rest'

interface Workout {
  id: string
  type: WorkoutType
  miles?: number
}

// Keep the days of the week static
const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]

function App() {
  // Defaulting to 144kg 
  const [weight, setWeight] = useState(144)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  
  // Workouts are now completely separate from the day names
  const [workouts, setWorkouts] = useState<Workout[]>([
    { id: 'w1', type: 'Lifting' },
    { id: 'w2', type: 'Hiking' },
    { id: 'w3', type: 'Lifting' }, // Added an optional 3rd lifting day
    { id: 'w4', type: 'Rest' },
    { id: 'w5', type: 'Lifting' },
    { id: 'w6', type: 'Hiking' },
    { id: 'w7', type: 'Rest' }
  ])

  const calculateCalories = (workout: Workout): number => {
    if (workout.type === 'Rest') return 0
    // Adjusted lifting MET from 6.0 to 5.0 for heavy strength training with longer rest periods
    let met = workout.type === 'Lifting' ? 5.0 : 3.5
    let duration = workout.type === 'Lifting' ? 60 : (workout.miles || 0) * 20
    return Math.round((met * 3.5 * weight) / 200 * duration)
  }

  const weeklyTotal = workouts.reduce((sum, workout) => sum + calculateCalories(workout), 0)
  const handleReorder = (newWorkouts: Workout[]) => setWorkouts(newWorkouts)
  
  const updateWorkout = (id: string, updates: Partial<Workout>) => {
    setWorkouts(workouts.map(w => w.id === id ? { ...w, ...updates } : w))
  }

  const getIcon = (type: WorkoutType) => {
    switch (type) {
      case 'Lifting': return <Dumbbell size={20} />
      case 'Hiking': return <Footprints size={20} />
      case 'Rest': return <Calendar size={20} />
    }
  }

  const getTypeColor = (type: WorkoutType) => {
    switch (type) {
      case 'Lifting': return '#e94560'
      case 'Hiking': return '#10b981'
      case 'Rest': return '#f59e0b'
    }
  }

  return (
    <div className={`app-container ${isDarkTheme ? 'dark-theme' : 'light-theme'}`} style={{ background: isDarkTheme ? '#0f0f1a' : '#f0f2f5', minHeight: '100vh', color: isDarkTheme ? '#fff' : '#111' }}>
      {/* Utility Buttons */}
      <div className="controls-overlay" style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 100, display: 'flex', gap: '0.5rem' }}>
        <button className="theme-toggle" onClick={() => setIsDarkTheme(!isDarkTheme)} style={{ padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
          {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{ padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
        >
          {sidebarCollapsed ? <Menu size={24} /> : <X size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ padding: '1rem', borderRight: `1px solid ${isDarkTheme ? '#333' : '#ddd'}` }}>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <Flame size={32} color="#e94560" />
          {!sidebarCollapsed && <h1>Workout Shuffle</h1>}
        </div>

        <div className="weight-input" style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Weight (kg)</label>
          <input 
            type="number" 
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', background: isDarkTheme ? '#2a2a3e' : '#fff', color: 'inherit', border: `1px solid ${isDarkTheme ? '#444' : '#ccc'}` }}
          />
        </div>

        <div className="summary">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Weekly Total</h2>
          <div className="total-calories" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
            <Flame size={24} color="#e94560" />
            {!sidebarCollapsed && <span>{weeklyTotal.toLocaleString()} kcal</span>}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}
        style={{ 
          padding: '1rem',
          maxWidth: '600px',
          margin: '0 auto',
          touchAction: 'pan-y'
        }}
      >
        <header className="toolbar" style={{ marginTop: '3rem', marginBottom: '2rem' }}>
          <h2>Weekly Schedule</h2>
          <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Use handles to drag workouts across days</p>
        </header>

        <Reorder.Group 
          axis="y" 
          values={workouts} 
          onReorder={handleReorder}
          className="days-list"
          style={{ listStyle: 'none', padding: 0 }}
        >
          {workouts.map((workout, index) => {
            const controls = useDragControls()
            const dayName = DAYS_OF_WEEK[index] // Dynamically assign the day name based on position

            return (
              <Reorder.Item 
                key={workout.id}
                value={workout}
                dragListener={false} 
                dragControls={controls}
                className={`day-card ${workout.type.toLowerCase()}`}
                style={{ 
                  '--type-color': getTypeColor(workout.type),
                  position: 'relative',
                  marginBottom: '1rem',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  background: isDarkTheme ? '#1a1a2e' : '#ffffff', // Fixed card background
                  color: isDarkTheme ? '#ffffff' : '#111111', // Explicit text color fix for light mode
                  borderLeft: `6px solid ${getTypeColor(workout.type)}`,
                  boxShadow: isDarkTheme ? '0 4px 6px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.05)',
                  userSelect: 'none'
                } as any}
              >
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDarkTheme ? '#333' : '#eee'}`, paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className="day-name" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{dayName}</span>
                  
                  <div 
                    className="drag-handle" 
                    onPointerDown={(e) => controls.start(e)}
                    style={{ 
                      cursor: 'grab', 
                      touchAction: 'none', 
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      color: getTypeColor(workout.type)
                    }}
                  >
                    <ChevronUp size={18} style={{ marginBottom: '-6px' }} />
                    <ChevronDown size={18} />
                  </div>
                </div>

                <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="card-type" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {getIcon(workout.type)}
                    {/* Added a dropdown to swap workout types easily */}
                    <select 
                      value={workout.type}
                      onChange={(e) => updateWorkout(workout.id, { type: e.target.value as WorkoutType })}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: 'inherit', 
                        fontSize: '1rem', 
                        fontWeight: '600',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="Lifting" style={{ color: '#000' }}>Lifting</option>
                      <option value="Hiking" style={{ color: '#000' }}>Hiking</option>
                      <option value="Rest" style={{ color: '#000' }}>Rest</option>
                    </select>
                  </div>

                  {workout.type === 'Hiking' && (
                    <div className="miles-input" style={{ display: 'flex', alignItems: 'center', background: isDarkTheme ? '#2a2a3e' : '#f0f2f5', padding: '4px 8px', borderRadius: '6px' }}>
                      <MapPin size={14} />
                      <input 
                        type="number"
                        value={workout.miles || ''}
                        onChange={(e) => updateWorkout(workout.id, { miles: Number(e.target.value) })}
                        style={{ width: '50px', marginLeft: '0.5rem', background: 'transparent', border: 'none', color: 'inherit', outline: 'none' }}
                        placeholder="Mi"
                      />
                    </div>
                  )}
                </div>

                <div className="card-stats" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '1rem', opacity: 0.8 }}>
                  <span className="calories" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Flame size={14} color="#e94560" /> {calculateCalories(workout)} kcal
                  </span>
                  {workout.type !== 'Rest' && (
                    <span>{workout.type === 'Lifting' ? '60m' : `${(workout.miles || 0) * 20}m`}</span>
                  )}
                </div>
              </Reorder.Item>
            )
          })}
        </Reorder.Group>
      </main>
    </div>
  )
}

export default App