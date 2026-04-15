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

interface Day {
  id: string
  name: string
  type: WorkoutType
  miles?: number
}

function App() {
  const [weight, setWeight] = useState(143)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [days, setDays] = useState<Day[]>([
    { id: 'mon', name: 'Monday', type: 'Lifting' },
    { id: 'tue', name: 'Tuesday', type: 'Hiking' },
    { id: 'wed', name: 'Wednesday', type: 'Rest' },
    { id: 'thu', name: 'Thursday', type: 'Lifting' },
    { id: 'fri', name: 'Friday', type: 'Hiking' },
    { id: 'sat', name: 'Saturday', type: 'Rest' },
    { id: 'sun', name: 'Sunday', type: 'Rest' }
  ])

  const calculateCalories = (day: Day): number => {
    if (day.type === 'Rest') return 0
    let met = day.type === 'Lifting' ? 6.0 : 3.5
    let duration = day.type === 'Lifting' ? 60 : (day.miles || 0) * 20
    return Math.round((met * 3.5 * weight) / 200 * duration)
  }

  const weeklyTotal = days.reduce((sum, day) => sum + calculateCalories(day), 0)
  const handleReorder = (newDays: Day[]) => setDays(newDays)
  
  const updateDayMiles = (id: string, miles: number) => {
    setDays(days.map(d => d.id === id ? { ...d, miles } : d))
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
    <div className={`app-container ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      {/* Utility Buttons */}
      <div className="controls-overlay" style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 100, display: 'flex', gap: '0.5rem' }}>
        <button className="theme-toggle" onClick={() => setIsDarkTheme(!isDarkTheme)}>
          {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? <Menu size={24} /> : <X size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="logo">
          <Flame size={32} />
          {!sidebarCollapsed && <h1>Workout Shuffle</h1>}
        </div>

        <div className="weight-input">
          <label>Weight (kg)</label>
          <input 
            type="number" 
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
          />
        </div>

        <div className="summary">
          <h2>Weekly Total</h2>
          <div className="total-calories">
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
          minHeight: '100vh',
          touchAction: 'pan-y' // Vital for mobile scrolling
        }}
      >
        <header className="toolbar" style={{ marginTop: '3rem' }}>
          <h2>Weekly Schedule</h2>
          <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Use handles to drag</p>
        </header>

        <Reorder.Group 
          axis="y" 
          values={days} 
          onReorder={handleReorder}
          className="days-list"
          style={{ listStyle: 'none', padding: 0 }}
        >
          {days.map((day) => {
            const controls = useDragControls()

            return (
              <Reorder.Item 
                key={day.id}
                value={day}
                dragListener={false} 
                dragControls={controls}
                className={`day-card ${day.type.toLowerCase()}`}
                style={{ 
                  '--type-color': getTypeColor(day.type),
                  position: 'relative',
                  marginBottom: '1rem',
                  padding: '1rem',
                  borderRadius: '12px',
                  background: isDarkTheme ? '#1a1a2e' : '#fff',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  userSelect: 'none'
                } as any}
              >
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="day-name" style={{ fontWeight: 'bold' }}>{day.name}</span>
                  
                  {/* Drag Handle - Optimized for Touch */}
                  <div 
                    className="drag-handle" 
                    onPointerDown={(e) => controls.start(e)}
                    style={{ 
                      cursor: 'grab', 
                      touchAction: 'none', 
                      padding: '10px', // Larger hit area for mobile
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      color: getTypeColor(day.type)
                    }}
                  >
                    <ChevronUp size={18} />
                    <ChevronDown size={18} />
                  </div>
                </div>

                <div className="card-type" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
                  {getIcon(day.type)}
                  <span>{day.type}</span>
                </div>

                {day.type === 'Hiking' && (
                  <div className="miles-input" style={{ marginBottom: '0.5rem' }}>
                    <MapPin size={14} />
                    <input 
                      type="number"
                      value={day.miles || ''}
                      onChange={(e) => updateDayMiles(day.id, Number(e.target.value))}
                      style={{ width: '60px', marginLeft: '0.5rem' }}
                      placeholder="Mi"
                    />
                  </div>
                )}

                <div className="card-stats" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span className="calories">
                    <Flame size={14} color="#e94560" /> {calculateCalories(day)} kcal
                  </span>
                  {day.type !== 'Rest' && (
                    <span>{day.type === 'Lifting' ? '60m' : `${(day.miles || 0) * 20}m`}</span>
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