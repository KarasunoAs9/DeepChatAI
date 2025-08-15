import React from 'react'
import ReactDOM from 'react-dom/client'
import Index from '@/index'
import '@/index.css'
import { AuthProvider } from '@/AuthContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <Index />
    </AuthProvider>
  </React.StrictMode>,
)
