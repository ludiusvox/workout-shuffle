import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PenTool, 
  Layers, 
  Settings, 
  Download, 
  Undo, 
  Redo,
  ZoomIn,
  ZoomOut,
  Grid3X3
} from 'lucide-react'

function App() {
  const [activeTool, setActiveTool] = useState<'pen' | 'layers' | 'settings'>('pen')
  const [zoomLevel, setZoomLevel] = useState(100)

  return (
    <div className="app-container">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 60, damping: 15 }}
        className="sidebar"
      >
        <div className="logo">
          <PenTool size={32} />
          <h1>Design Tool</h1>
        </div>

        <nav className="tools-nav">
          <button 
            className={`tool-btn ${activeTool === 'pen' ? 'active' : ''}`}
            onClick={() => setActiveTool('pen')}
          >
            <PenTool size={20} />
            Pen Tool
          </button>

          <button 
            className={`tool-btn ${activeTool === 'layers' ? 'active' : ''}`}
            onClick={() => setActiveTool('layers')}
          >
            <Layers size={20} />
            Layers
          </button>

          <button 
            className={`tool-btn ${activeTool === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTool('settings')}
          >
            <Settings size={20} />
            Settings
          </button>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Toolbar */}
        <header className="toolbar">
          <div className="toolbar-group">
            <button 
              className="tool-icon"
              onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}
            >
              <ZoomOut size={18} />
            </button>

            <span className="zoom-display">{zoomLevel}%</span>

            <button 
              className="tool-icon"
              onClick={() => setZoomLevel(Math.min(400, zoomLevel + 25))}
            >
              <ZoomIn size={18} />
            </button>
          </div>

          <div className="toolbar-group">
            <button className="tool-icon" title="Undo">
              <Undo size={18} />
            </button>

            <button className="tool-icon" title="Redo">
              <Redo size={18} />
            </button>

            <button className="tool-icon" title="Grid View">
              <Grid3X3 size={18} />
            </button>

            <button className="btn-primary">
              <Download size={16} />
              Export
            </button>
          </div>
        </header>

        {/* Canvas Area */}
        <motion.div 
          className="canvas-area"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="canvas-grid">
            {[...Array(9)].map((_, i) => (
              <motion.div 
                key={i}
                className="grid-cell"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
            ))}
          </div>

          <AnimatePresence>
            {activeTool === 'pen' && (
              <motion.div 
                className="tool-info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <PenTool size={48} />
                <h3>Pen Tool Active</h3>
                <p>Start drawing on the canvas to create your design elements.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Status Bar */}
        <footer className="status-bar">
          <span>Ready</span>
          <span>{zoomLevel}% Zoom</span>
          <span>Design Tool UI v0.0.1</span>
        </footer>
      </main>
    </div>
  )
}

export default App
