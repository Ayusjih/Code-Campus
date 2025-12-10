import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './firebase';
import { BrowserRouter } from 'react-router-dom' // Import BrowserRouter

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Option 1: Wrap the whole App component here */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)