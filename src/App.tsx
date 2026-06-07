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
  Lifting: { Leisurely: 3.5, Moderate: 5.0, Vigorous: 6.0, Extreme: 8.0 },
  Hiking: { Leisurely: 3.5, Moderate: 5.5, Vigorous: 7.5, Extreme: 9.5 },
  Bicycling: { Leisurely: 4.0, Moderate: 8.0, Vigorous: 10.0, Extreme: 12.0 },
  Rest: { Leisurely: 1.0, Moderate: 1.0, Vigorous: 1.0, Extreme: 1.0 }
}

// Pace mapping: minutes per mile based on intensity
const PACE_MAP: Record<'Hiking' | 'Bicycling', Record<Intensity, number>> = {
  Hiking: {
    Leisurely: 30, // 2.0 mph
    Moderate: 20,   // 3.0 mph
    Vigorous: 15,   // 4.0 mph
    Extreme: 12     // 5.0 mph
  },
  Bicycling: {
    Leisurely: 6,   // 10 mph
    Moderate: 4.5, // 13.3 mph
    Vigorous: 4,   // 15 mph
    Extreme: 3     // 20 mph
  }
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true) // Default to collapsed on mobile
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [activeTab, setActiveTab] = useState<'schedule' | 'nutrition'>('schedule')

  // Basic mobile detection
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

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
    if (workout.type === 'Rest') return 0;

    const weightNum = Number(weight) || 0;
    const intensity = workout.intensity || 'Moderate';
    const restMet = 1.0;

    let workoutDuration = 0;
    let workoutMet = INTENSITY_METS[workout.type][intensity];

    // Determine workout duration
    if (workout.durationMinutes) {
      workoutDuration = workout.durationMinutes;
    } else if (workout.miles) {
      const pace = PACE_MAP[workout.type as 'Hiking' | 'Bicycling'][intensity];
      workoutDuration = workout.miles * pace;
    } else {
      workoutDuration = 60; // Default 60m for Lifting
    }

    // ACSM Formula for Net Calories (Additional burn above resting):
    // (Workout MET - Rest MET) * 3.5 * Weight_kg * Duration_min / 200
    const netMet = Math.max(0, workoutMet - restMet);
    const netBurn = (netMet * 3.5 * weightNum * workoutDuration) / 200;

    return Math.round(netBurn);
  }

  const weeklyTotal = workouts.reduce((sum, workout) => sum + calculateCalories(workout), 0)
  
  const handleReorder = (newWorkouts: Workout[]) => setWorkouts(newWorkouts)
  
  const updateWorkout = (id: string, updates: Partial<Workout>) => {
    setWorkouts(workouts.map(w => {
      if (w.id === id) {
        // If type is changing, clear the input values to prevent "60 mins" becoming "60 miles"
        if (updates.type && updates.type !== w.type) {
          return { ...w, ...updates, miles: undefined, durationMinutes: undefined };
        }
        return { ...w, ...updates };
      }
      return w;
    }))
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
      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}
        style={{
          padding: '1rem',
          borderRight: `1px solid ${themeColors.border}`,
          background: themeColors.cardBg,
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          width: sidebarCollapsed ? (isMobile ? '0px' : '60px') : '250px',
          transition: 'width 0.3s ease, background-color 0.3s ease',
          overflowY: 'auto',
          zIndex: 1000,
          display: isMobile && sidebarCollapsed ? 'none' : 'block'
        }}
      >
        <div className="logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Flame size={32} color="#e94560" />
            {!sidebarCollapsed && <h1>Workout Shuffle</h1>}
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: themeColors.text,
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={24} />
            </button>
          )}
        </div>

        <div className="weight-input" style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: isDarkTheme ? themeColors.text : '#000', fontWeight: isDarkTheme ? 400 : 600 }}>Weight (kg)</label>
          <input 
            type="number" 
            value={weight === '' ? '' : weight} // Allow empty string for clearing
            onChange={(e) => setWeight(e.target.value === '' ? '' as any : Number(e.target.value))}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', background: themeColors.inputBg, color: isDarkTheme ? themeColors.text : '#000', border: `1px solid ${themeColors.border}`, transition: 'background-color 0.3s ease' }}
          />
        </div>

        <div className="summary">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: isDarkTheme ? themeColors.text : '#000', fontWeight: isDarkTheme ? 400 : 700 }}>Weekly Total</h2>
          <div className="total-calories" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', padding: '0.6rem', background: isDarkTheme ? '#2a2a3e' : '#e2e8f0', borderRadius: '6px', borderLeft: `3px solid ${isDarkTheme ? '#555' : '#000'}` }}>
            <Flame size={24} color={isDarkTheme ? "#555" : "#000"} />
            {!sidebarCollapsed && <span style={{ color: isDarkTheme ? themeColors.text : '#000' }}>{weeklyTotal.toLocaleString()} kcal</span>}
          </div>

          {/* Daily Nutrition Breakdown */}
          {!sidebarCollapsed && (
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>Daily Targets</h3>
              {workouts.map((w, i) => {
                const activeBurn = calculateCalories(w);

                if (activeBurn === 0) return null;

                // Calculate pre/post load recommendations based on ACTIVE burn
                const preLoad = Math.round(activeBurn * 0.3);
                const postLoad = Math.round(activeBurn * 0.4);
                
                return (
                  <div key={w.id} style={{ marginBottom: '0.75rem', padding: '0.6rem', background: isDarkTheme ? '#2a2a3e' : '#e2e8f0', borderRadius: '6px', borderLeft: `3px solid ${getTypeColor(w.type)}` }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', color: themeColors.text }}>{DAYS_OF_WEEK[i]} ({w.type})</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: isDarkTheme ? 0.85 : 1.0 }}>
                      <span style={{ color: isDarkTheme ? '#3b82f6' : '#2563eb', fontWeight: isDarkTheme ? 400 : 600 }}>Pre-load: {preLoad} kcal</span>
                      <span style={{ color: isDarkTheme ? '#10b981' : '#059669', fontWeight: isDarkTheme ? 400 : 600 }}>Post-load: {postLoad} kcal</span>
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
          padding: '1rem 0', // Removed horizontal padding to allow cards to go wider
          maxWidth: '100%',
          margin: '0', // Align to left
          touchAction: 'pan-y',
          marginLeft: isMobile ? '0' : (sidebarCollapsed ? '70px' : '260px'),
          transition: 'margin-left 0.3s ease, background-color 0.3s ease',
          backgroundColor: themeColors.bg // Explicitly set to ensure it updates with theme toggle
        }}
      >
        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: `1px solid ${themeColors.border}`, paddingBottom: '0.5rem', paddingLeft: '1rem', paddingRight: '1rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <button 
            onClick={() => setActiveTab('schedule')}
            style={{ 
              background: activeTab === 'schedule' ? themeColors.cardBg : 'transparent', 
              border: 'none', 
              padding: '8px 12px',
              borderRadius: '6px', 
              cursor: 'pointer', 
              fontWeight: activeTab === 'schedule' ? 'bold' : 'normal',
              color: activeTab === 'schedule' ? '#e94560' : themeColors.text,
              boxShadow: activeTab === 'schedule' ? `0 2px 4px rgba(0,0,0,${isDarkTheme ? 0.3 : 0.1})` : 'none',
              transition: 'background-color 0.3s ease, color 0.3s ease',
              fontSize: '0.9rem'
            }}
          >
            Schedule
          </button>
          <button 
            onClick={() => setActiveTab('nutrition')}
            style={{ 
              background: activeTab === 'nutrition' ? themeColors.cardBg : 'transparent', 
              border: 'none', 
              padding: '8px 12px',
              borderRadius: '6px', 
              cursor: 'pointer', 
              fontWeight: activeTab === 'nutrition' ? 'bold' : 'normal',
              color: activeTab === 'nutrition' ? '#e94560' : themeColors.text,
              boxShadow: activeTab === 'nutrition' ? `0 2px 4px rgba(0,0,0,${isDarkTheme ? 0.3 : 0.1})` : 'none',
              transition: 'background-color 0.3s ease, color 0.3s ease',
              fontSize: '0.9rem'
            }}
          >
            Nutrition & Instructions
          </button>
        </div>

        {/* Utility Buttons - Moved below tabs */}
        <div className="controls-row" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
          <button
            className="theme-toggle"
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', background: themeColors.cardBg, border: `1px solid ${themeColors.border}`, transition: 'background-color 0.3s ease', color: themeColors.text, fontSize: '0.8rem' }}
          >
            {isDarkTheme ? <Sun size={16} /> : <Moon size={16} />}
            {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', background: themeColors.cardBg, border: `1px solid ${themeColors.border}`, transition: 'background-color 0.3s ease', color: themeColors.text, fontSize: '0.8rem' }}
          >
            <Menu size={16} />
            Stats & Weight
          </button>
        </div>

        {activeTab === 'schedule' && (
          <>
            <header className="toolbar" style={{ marginBottom: '2rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
              <h2>Weekly Schedule</h2>
              <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Use handles to drag workouts across days</p>
            </header>

            <Reorder.Group 
              axis="y" 
              values={workouts} 
              onReorder={handleReorder}
              className="days-list"
              style={{ listStyle: 'none', padding: '0 0.5rem' }} // Minimal padding for cards
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
                  <strong style={{ display: 'block', marginBottom: '0.3rem', color: themeColors.text }}>Net Active Calorie Burn</strong>
                  <code style={{ fontSize: '0.85rem', opacity: 0.9 }}>(MET - 1.0) × 3.5 × (Weight_kg / 200) × Duration_min</code>
                </div>
                <div style={{ padding: '0.6rem', background: isDarkTheme ? '#1a1a2e' : '#ffffff', borderRadius: '6px', border: `1px solid ${themeColors.border}` }}>
                  <strong style={{ display: 'block', marginBottom: '0.3rem', color: themeColors.text }}>Additional Daily Intake</strong>
                  <code style={{ fontSize: '0.85rem', opacity: 0.9 }}>Total Net Calories (rounded)</code>
                </div>
                <div style={{ padding: '0.6rem', background: isDarkTheme ? '#1a1a2e' : '#ffffff', borderRadius: '6px', border: `1px solid ${themeColors.border}` }}>
                  <strong style={{ display: 'block', marginBottom: '0.3rem', color: themeColors.text }}>Pre-Workout Fueling</strong>
                  <code style={{ fontSize: '0.85rem', opacity: 0.9 }}>~30% of Net Burn (1-2 hrs before)</code>
                </div>
                <div style={{ padding: '0.6rem', background: isDarkTheme ? '#1a1a2e' : '#ffffff', borderRadius: '6px', border: `1px solid ${themeColors.border}` }}>
                  <strong style={{ display: 'block', marginBottom: '0.3rem', color: themeColors.text }}>Post-Workout Recovery</strong>
                  <code style={{ fontSize: '0.85rem', opacity: 0.9 }}>~40% of Net Burn (within 60 mins after)</code>
                </div>
                <div style={{ padding: '0.6rem', background: isDarkTheme ? '#1a1a2e' : '#ffffff', borderRadius: '6px', border: `1px solid ${themeColors.border}` }}>
                  <strong style={{ display: 'block', marginBottom: '0.3rem', color: themeColors.text }}>Weekly Active Total</strong>
                  <code style={{ fontSize: '0.85rem', opacity: 0.9 }}>Sum of all daily Net Active Calories</code>
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
