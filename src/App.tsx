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
  Moon,
  Bike
} from 'lucide-react'

type WorkoutType = 'Lifting' | 'Hiking' | 'Bicycling' | 'Rest'
type Intensity = 'Leisurely' | 'Moderate' | 'Vigorous' | 'Extreme'

interface Workout {
  id: string
  type: WorkoutType
  intensity?: Intensity
  miles?: number
  durationMinutes?: number // Explicit duration for accurate calorie tracking
}

// Keep the days of the week static
const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]

// MET values mapped by activity type and intensity level based on ACSM standards
const INTENSITY_METS: Record<WorkoutType, Record<Intensity, number>> = {
  Lifting: { Leisurely: 4.0, Moderate: 5.0, Vigorous: 6.5, Extreme: 8.0 },
  Hiking: { Leisurely: 3.5, Moderate: 5.0, Vigorous: 7.0, Extreme: 9.0 },
  Bicycling: { Leisurely: 4.0, Moderate: 6.0, Vigorous: 8.0, Extreme: 10.0 },
  Rest: { Leisurely: 1.2, Moderate: 1.2, Vigorous: 1.2, Extreme: 1.2 }
}

// Extracted component to fix React hook rules violation (hooks cannot be called inside loops)
function WorkoutItem({ 
  workout, 
  index, 
  themeColors, 
  isDarkTheme, 
  getTypeColor, 
  getIcon, 
  updateWorkout, 
  calculateCalories 
}: {
  workout: Workout
  index: number
  themeColors: any
  isDarkTheme: boolean
  getTypeColor: (type: WorkoutType) => string
  getIcon: (type: WorkoutType) => React.ReactNode
  updateWorkout: (id: string, updates: Partial<Workout>) => void
  calculateCalories: (workout: Workout) => number
}) {
  const controls = useDragControls()
  const dayName = DAYS_OF_WEEK[index]

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
        background: themeColors.cardBg,
        color: themeColors.text,
        borderLeft: `6px solid ${getTypeColor(workout.type)}`,
        boxShadow: isDarkTheme ? '0 4px 6px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.05)',
        userSelect: 'none'
      } as any}
    >
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${themeColors.border}`, paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
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
        <div className="card-type" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {getIcon(workout.type)}
            <select 
              value={workout.type}
              onChange={(e) => updateWorkout(workout.id, { type: e.target.value as WorkoutType })}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: themeColors.text,
                fontSize: '1rem', 
                fontWeight: '600',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="Lifting" style={{ color: '#000' }}>Lifting</option>
              <option value="Hiking" style={{ color: '#000' }}>Hiking</option>
              <option value="Bicycling" style={{ color: '#000' }}>Bicycling</option>
              <option value="Rest" style={{ color: '#000' }}>Rest</option>
            </select>
          </div>

          {workout.type !== 'Rest' && (
            <div className="intensity-selector" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', opacity: 0.7, width: '60px' }}>Intensity:</span>
              <select 
                value={workout.intensity || 'Moderate'}
                onChange={(e) => updateWorkout(workout.id, { intensity: e.target.value as Intensity })}
                style={{ 
                  background: themeColors.inputBg, 
                  border: `1px solid ${themeColors.border}`, 
                  color: themeColors.text,
                  fontSize: '0.85rem', 
                  padding: '4px 6px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="Leisurely">Leisurely</option>
                <option value="Moderate">Moderate</option>
                <option value="Vigorous">Vigorous</option>
                <option value="Extreme">Extreme</option>
              </select>
            </div>
          )}
        </div>

        {workout.type !== 'Rest' && (
          <div className="duration-input" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: themeColors.inputBg, padding: '4px 8px', borderRadius: '6px', border: `1px solid ${themeColors.border}` }}>
            <span style={{ fontSize: '0.9rem' }}>{workout.type === 'Hiking' || workout.type === 'Bicycling' ? 'Mi:' : 'Min:'}</span>
            <input 
              type="number"
              value={workout.miles ?? workout.durationMinutes ?? ''} // Allow empty string for clearing
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  updateWorkout(workout.id, { miles: undefined, durationMinutes: undefined });
                } else {
                  const numVal = Number(val);
                  if (workout.type === 'Hiking' || workout.type === 'Bicycling') {
                    updateWorkout(workout.id, { miles: numVal });
                  } else {
                    updateWorkout(workout.id, { durationMinutes: numVal });
                  }
                }
              }}
              style={{ width: '50px', background: 'transparent', border: 'none', color: 'inherit', outline: 'none' }}
            />
          </div>
        )}
      </div>

      <div className="card-stats" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '1rem', opacity: 0.8 }}>
        <span className="calories" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Flame size={14} color="#e94560" /> {calculateCalories(workout)} kcal
        </span>
      </div>
    </Reorder.Item>
  )
}

function App() {
  const [weight, setWeight] = useState<number | ''>(80) // Allow empty string for clearing
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [activeTab, setActiveTab] = useState<'schedule' | 'nutrition'>('schedule')
  
  // Updated all default workouts to Rest
  const [workouts, setWorkouts] = useState<Workout[]>([
    { id: 'w1', type: 'Rest' },
    { id: 'w2', type: 'Rest' },
    { id: 'w3', type: 'Rest' },
    { id: 'w4', type: 'Rest' },
    { id: 'w5', type: 'Rest' },
    { id: 'w6', type: 'Rest' },
    { id: 'w7', type: 'Rest' }
  ])

  // MET (Metabolic Equivalent of Task) values represent energy cost per minute.
  const calculateCalories = (workout: Workout): number => {
    if (workout.type === 'Rest') return 0
    
    const intensity = workout.intensity || 'Moderate';
    let met = INTENSITY_METS[workout.type][intensity];

    // Use explicit durationMinutes, fallback to calculated estimate from miles for hiking/biking
    let duration = workout.durationMinutes || 60
    if (!workout.durationMinutes && (workout.type === 'Hiking' || workout.type === 'Bicycling')) {
      duration = (workout.miles || 0) * 20 // ~3mph hike or ~15mph bike pace estimate
    }

    // ACSM Formula: Calories Burned = MET × 3.5 × (Weight_kg / 200) × Duration_min
    const weightNum = Number(weight) || 0;
    const caloriesBurned = ((met * 3.5 * weightNum) / 200) * duration;
    return Math.round(caloriesBurned);
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
      case 'Bicycling': return <Bike size={20} />
      case 'Rest': return <Calendar size={20} />
    }
  }

  const getTypeColor = (type: WorkoutType) => {
    switch (type) {
      case 'Lifting': return '#e94560'
      case 'Hiking': return '#10b981'
      case 'Bicycling': return '#3b82f6' // Blue for biking
      case 'Rest': return '#f59e0b'
    }
  }

  const themeColors = {
    bg: isDarkTheme ? '#0f0f1a' : '#f0f2f5',
    text: isDarkTheme ? '#fff' : '#111',
    cardBg: isDarkTheme ? '#1a1a2e' : '#ffffff',
    border: isDarkTheme ? '#333' : '#ddd',
    inputBg: isDarkTheme ? '#2a2a3e' : '#fff',
  }

  return (
    <div className="app-container" style={{ background: themeColors.bg, minHeight: '100vh', color: themeColors.text, transition: 'background-color 0.3s ease, color 0.3s ease' }}>
      {/* Utility Buttons */}
      <div className="controls-overlay" style={{ position: 'fixed', top: '1rem', right: 'calc(1rem + 0.5in)', zIndex: 100, display: 'flex', gap: '0.5rem' }}>
        <button className="theme-toggle" onClick={() => setIsDarkTheme(!isDarkTheme)} style={{ padding: '8px', borderRadius: '8px', cursor: 'pointer', background: themeColors.cardBg, border: `1px solid ${themeColors.border}`, transition: 'background-color 0.3s ease', color: themeColors.text }}>
          {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{ padding: '8px', borderRadius: '8px', cursor: 'pointer', background: themeColors.cardBg, border: `1px solid ${themeColors.border}`, transition: 'background-color 0.3s ease', color: themeColors.text }}
        >
          {sidebarCollapsed ? <Menu size={24} /> : <X size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ padding: '1rem', borderRight: `1px solid ${themeColors.border}`, background: themeColors.cardBg, height: '100vh', position: 'fixed', left: 0, top: 0, width: sidebarCollapsed ? '60px' : '250px', transition: 'width 0.3s ease, background-color 0.3s ease', overflowY: 'auto' }}>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <Flame size={32} color="#e94560" />
          {!sidebarCollapsed && <h1>Workout Shuffle</h1>}
        </div>

        <div className="weight-input" style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Weight (kg)</label>
          <input 
            type="number" 
            value={weight === '' ? '' : weight} // Allow empty string for clearing
            onChange={(e) => setWeight(e.target.value === '' ? '' as any : Number(e.target.value))}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', background: themeColors.inputBg, color: 'inherit', border: `1px solid ${themeColors.border}`, transition: 'background-color 0.3s ease' }}
          />
        </div>

        <div className="summary">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Weekly Total</h2>
          <div className="total-calories" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', padding: '0.6rem', background: isDarkTheme ? '#2a2a3e' : '#f8f9fa', borderRadius: '6px', borderLeft: `3px solid #555` }}>
            <Flame size={24} color="#555" />
            {!sidebarCollapsed && <span style={{ color: themeColors.text }}>{weeklyTotal.toLocaleString()} kcal</span>}
          </div>

          {/* Daily Nutrition Breakdown */}
          {!sidebarCollapsed && (
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>Daily Targets</h3>
              {workouts.map((w, i) => {
                const burn = calculateCalories(w);
                if (burn === 0) return null;
                
                // Calculate pre/post load recommendations based on workout intensity/type
                const preLoad = Math.round(burn * 0.3); // ~30% before workout
                const postLoad = Math.round(burn * 0.4); // ~40% after workout
                
                return (
                  <div key={w.id} style={{ marginBottom: '0.75rem', padding: '0.6rem', background: isDarkTheme ? '#2a2a3e' : '#f8f9fa', borderRadius: '6px', borderLeft: `3px solid ${getTypeColor(w.type)}` }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', color: themeColors.text }}>{DAYS_OF_WEEK[i]} ({w.type})</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.85 }}>
                      <span style={{ color: '#3b82f6' }}>Pre-load: {preLoad} kcal</span>
                      <span style={{ color: '#10b981' }}>Post-load: {postLoad} kcal</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}
        style={{ 
          padding: '1rem',
          maxWidth: '600px',
          margin: '0 auto',
          touchAction: 'pan-y',
          marginLeft: sidebarCollapsed ? '70px' : '260px',
          transition: 'margin-left 0.3s ease, background-color 0.3s ease',
          backgroundColor: themeColors.bg // Explicitly set to ensure it updates with theme toggle
        }}
      >
        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: `1px solid ${themeColors.border}`, paddingBottom: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('schedule')}
            style={{ 
              background: activeTab === 'schedule' ? themeColors.cardBg : 'transparent', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              fontWeight: activeTab === 'schedule' ? 'bold' : 'normal',
              color: activeTab === 'schedule' ? '#e94560' : themeColors.text,
              boxShadow: activeTab === 'schedule' ? `0 2px 4px rgba(0,0,0,${isDarkTheme ? 0.3 : 0.1})` : 'none',
              transition: 'background-color 0.3s ease, color 0.3s ease'
            }}
          >
            Schedule
          </button>
          <button 
            onClick={() => setActiveTab('nutrition')}
            style={{ 
              background: activeTab === 'nutrition' ? themeColors.cardBg : 'transparent', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              fontWeight: activeTab === 'nutrition' ? 'bold' : 'normal',
              color: activeTab === 'nutrition' ? '#e94560' : themeColors.text,
              boxShadow: activeTab === 'nutrition' ? `0 2px 4px rgba(0,0,0,${isDarkTheme ? 0.3 : 0.1})` : 'none',
              transition: 'background-color 0.3s ease, color 0.3s ease'
            }}
          >
            Nutrition & Instructions
          </button>
        </div>

        {activeTab === 'schedule' && (
          <>
            <header className="toolbar" style={{ marginBottom: '2rem' }}>
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
              {workouts.map((workout, index) => (
                <WorkoutItem 
                  key={workout.id}
                  workout={workout}
                  index={index}
                  themeColors={themeColors}
                  isDarkTheme={isDarkTheme}
                  getTypeColor={getTypeColor}
                  getIcon={getIcon}
                  updateWorkout={updateWorkout}
                  calculateCalories={calculateCalories}
                />
              ))}
            </Reorder.Group>
          </>
        )}

        {activeTab === 'nutrition' && (
          <div className="nutrition-tab" style={{ background: themeColors.cardBg, padding: '2rem', borderRadius: '12px', boxShadow: isDarkTheme ? '0 4px 6px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.05)', border: `1px solid ${themeColors.border}`, maxHeight: '60vh', overflowY: 'auto', transition: 'background-color 0.3s ease' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#e94560' }}>Nutrition & Instructions</h2>
            
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>🔥 Calorie Burn Over Time</h3>
              <p style={{ lineHeight: 1.6, opacity: 0.9 }}>
                Your body burns calories continuously, but the rate depends heavily on intensity and duration. 
                The formula used here is based on METs (Metabolic Equivalent of Task). For example, heavy lifting (~5.0 MET) burns roughly <strong>~7-8 kcal/min</strong> at 144kg, while moderate hiking (~4.0 MET) burns slightly less per minute but over longer durations. Bicycling (~6.0 MET) increases the burn rate significantly due to large muscle group engagement and sustained cardiovascular demand.
                <br/><br/>
                <em>Note:</em> Rest periods between sets significantly impact net calorie burn. While your heart rate drops during rest, your body continues to expend energy recovering (EPOC - Excess Post-exercise Oxygen Consumption). To maximize burn, keep rest periods under 90 seconds for hypertrophy, or extend them to 2-3 minutes for maximal strength efforts where recovery is prioritized over caloric expenditure.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>⏳ Digestion Times & Nutrient Loading</h3>
              <p style={{ lineHeight: 1.6, opacity: 0.9, marginBottom: '1rem' }}>
                Food doesn't instantly become fuel. Timing your meals around workouts is crucial for performance and recovery:
              </p>
              <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.8, opacity: 0.9 }}>
                <li><strong>Simple Carbs (Fruit, Gels):</strong> Digest in 30-60 mins. Ideal for quick energy pre-workout.</li>
                <li><strong>Complex Carbs & Protein (Oats, Chicken, Rice):</strong> Take 2-4 hours to fully digest and absorb into the bloodstream as glucose/amino acids.</li>
                <li><strong>Fats:</strong> Slowest digesters (4-6+ hours). Best consumed away from workout windows to avoid gastrointestinal distress.</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>📥 How to Load Calories (Instructional Guide)</h3>
              <p style={{ lineHeight: 1.6, opacity: 0.9, marginBottom: '1rem' }}>
                To effectively "load" calories for your next session without feeling heavy or sluggish:
              </p>
              <ol style={{ paddingLeft: '1.5rem', lineHeight: 1.8, opacity: 0.9 }}>
                <li><strong>Pre-Workout (2 hrs before):</strong> Consume a balanced meal of complex carbs and moderate protein. Example: Oatmeal with whey protein.</li>
                <li><strong>Intra-Workout (During long sessions {'>'}60m):</strong> Sip on electrolytes or simple sugars if intensity is high to maintain glycogen stores.</li>
                <li><strong>Post-Workout (Within 30-45 mins):</strong> Prioritize fast-digesting carbs and protein to spike insulin slightly and shuttle nutrients into muscle tissue. Example: Banana + Protein Shake.</li>
              </ol>
            </section>

            <div style={{ padding: '1rem', background: isDarkTheme ? '#2a2a3e' : '#f0f2f5', borderRadius: '8px', borderLeft: '4px solid #e94560', transition: 'background-color 0.3s ease' }}>
              <p style={{ fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.8 }}>
                💡 Pro Tip: Track your weekly total in the Schedule tab. If you're aiming for a deficit, ensure your nutrition loading aligns with your active days to prevent overcompensation on rest days.
              </p>
            </div>

            {/* Formulas Card */}
            <div style={{ padding: '1rem', background: isDarkTheme ? '#2a2a3e' : '#f0f2f5', borderRadius: '8px', borderLeft: '4px solid #3b82f6', transition: 'background-color 0.3s ease', marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: themeColors.text }}>📐 Formulas & Calculations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ padding: '0.6rem', background: isDarkTheme ? '#1a1a2e' : '#ffffff', borderRadius: '6px', border: `1px solid ${themeColors.border}` }}>
                  <strong style={{ display: 'block', marginBottom: '0.3rem', color: themeColors.text }}>Calorie Burn (MET Formula)</strong>
                  <code style={{ fontSize: '0.85rem', opacity: 0.9 }}>MET × 3.5 × (Weight_kg / 200) × Duration_min</code>
                </div>
                <div style={{ padding: '0.6rem', background: isDarkTheme ? '#1a1a2e' : '#ffffff', borderRadius: '6px', border: `1px solid ${themeColors.border}` }}>
                  <strong style={{ display: 'block', marginBottom: '0.3rem', color: themeColors.text }}>Total Workout Calories</strong>
                  <code style={{ fontSize: '0.85rem', opacity: 0.9 }}>Calories Burned (rounded)</code>
                </div>
                <div style={{ padding: '0.6rem', background: isDarkTheme ? '#1a1a2e' : '#ffffff', borderRadius: '6px', border: `1px solid ${themeColors.border}` }}>
                  <strong style={{ display: 'block', marginBottom: '0.3rem', color: themeColors.text }}>Pre-Workout Load</strong>
                  <code style={{ fontSize: '0.85rem', opacity: 0.9 }}>~30% of Total Burn (1-2 hrs before)</code>
                </div>
                <div style={{ padding: '0.6rem', background: isDarkTheme ? '#1a1a2e' : '#ffffff', borderRadius: '6px', border: `1px solid ${themeColors.border}` }}>
                  <strong style={{ display: 'block', marginBottom: '0.3rem', color: themeColors.text }}>Post-Workout Load</strong>
                  <code style={{ fontSize: '0.85rem', opacity: 0.9 }}>~40% of Total Burn (within 60 mins after)</code>
                </div>
                <div style={{ padding: '0.6rem', background: isDarkTheme ? '#1a1a2e' : '#ffffff', borderRadius: '6px', border: `1px solid ${themeColors.border}` }}>
                  <strong style={{ display: 'block', marginBottom: '0.3rem', color: themeColors.text }}>Weekly Total</strong>
                  <code style={{ fontSize: '0.85rem', opacity: 0.9 }}>Sum of all daily workout calories</code>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
