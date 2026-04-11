import React from 'react'
import axios from 'axios';

import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './firebase';
axios.defaults.baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://codecampusbacnend.onrender.com');
import { BrowserRouter } from 'react-router-dom' // Import BrowserRouter


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Option 1: Wrap the whole App component here */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)