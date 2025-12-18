import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AdminProvider } from './contexts/AdminContext';
import { ToastProvider } from './contexts/ToastContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <AdminProvider>
        <App />
      </AdminProvider>
    </ToastProvider>
  </React.StrictMode>,
)
