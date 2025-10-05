import React from 'react'
import ReactDOM from 'react-dom/client'
import MinecraftPanel from './main.tsx'
import './style.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MinecraftPanel />
  </React.StrictMode>,
)
