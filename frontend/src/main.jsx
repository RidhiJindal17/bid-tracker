import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Global browser-runtime promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  
  // Safely detect and suppress known external browser-extension errors
  if (
    reason &&
    (reason.pathPrefix === '/site_integration' || 
     reason.msg === 'permission error' ||
     (typeof reason === 'object' && reason.code === 403 && reason.msg === 'permission error'))
  ) {
    // Calling preventDefault() instructs the browser runtime to skip printing the uncaught promise error log
    event.preventDefault();
    console.warn(
      '[Runtime Security Safeguard] Intercepted and silenced external browser extension/sidebar exception:',
      reason
    );
    return;
  }

  // Developer logging for actual app exceptions
  console.error('[Unhandled Promise Rejection]:', reason);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
