import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './Components/Auth/AuthContext.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import DevOverlay from './DevOverlay.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <DevOverlay />
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
