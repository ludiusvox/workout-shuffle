import { useState } from 'react'
import { Reorder, AnimatePresence } from 'framer-motion'
import { 
  Dumbbell, 
  Footprints, 
  Calendar,
  Scale,
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

  const handleReorder = (newDays: Day[]) => {
    setDays(newDays)
  }

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

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed)
  const toggleTheme = () => setIsDarkTheme(!isDarkTheme)

  return (
    <div className={`app-container ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      {/* Theme Toggle Button */}
      <button 
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Sidebar Toggle Button */}
      <button 
        className={`sidebar-toggle ${sidebarCollapsed ? 'collapsed' : ''}`}
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {sidebarCollapsed ? <Menu size={24} /> : <X size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="logo">
          <Flame size={32} />
          {!sidebarCollapsed && <h1>Workout Shuffle</h1>}
        </div>

        <div className="weight-input">
          <label htmlFor="weight">Weight (kg)</label>
          <input 
            type="number" 
            id="weight"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            min="50"
            max="300"
          />
        </div>

        <div className="summary">
          <h2>Weekly Total</h2>
          <div className="total-calories">
            <Flame size={24} color="#e94560" />
            {!sidebarCollapsed && <span>{weeklyTotal.toLocaleString()} kcal</span>}
          </div>
        </div>

        <nav className="stats-nav">
          <div className="stat-item">
            <Dumbbell size={16} />
            {!sidebarCollapsed && <span>Lifting Days: {days.filter(d => d.type === 'Lifting').length}</span>}
          </div>
          <div className="stat-item">
            <Footprints size={16} />
            {!sidebarCollapsed && <span>Hiking Days: {days.filter(d => d.type === 'Hiking').length}</span>}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <header className="toolbar">
          <h2>Weekly Schedule</h2>
          {!sidebarCollapsed && <p>Drag to reorder your workout days</p>}
        </header>

        <Reorder.Group 
          axis="y" 
          values={days} 
          onReorder={handleReorder}
          className="days-list"
        >
          {days.map((day) => (
            <Reorder.Item 
              key={day.id}
              value={day}
              className={`day-card ${day.type.toLowerCase()}`}
              style={{ '--type-color': getTypeColor(day.type) } as React.CSSProperties}
            >
              <div className="card-header">
                <span className="day-name">{day.name}</span>
                <div className="drag-handle">
                  <ChevronDown size={16} />
                  <ChevronUp size={16} />
                </div>
              </div>

              <div className="card-type">
                {getIcon(day.type)}
                <span>{day.type}</span>
              </div>

              {day.type === 'Hiking' && (
                <div className="miles-input">
                  <MapPin size={14} />
                  <input 
                    type="number"
                    placeholder="Miles"
                    value={day.miles || ''}
                    onChange={(e) => updateDayMiles(day.id, Number(e.target.value))}
                    min="0.5"
                    max="20"
                    step="0.1"
                  />
                </div>
              )}

              <div className="card-stats">
                <span className="calories">
                  <Flame size={14} color="#e94560" />
                  {calculateCalories(day).toLocaleString()} kcal
                </span>
                {day.type !== 'Rest' && (
                  <span className="duration">
                    {day.type === 'Lifting' ? '60 min' : `${(day.miles || 0) * 20} min`}
                  </span>
                )}
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </main>
    </div>
  )
}

export default App
