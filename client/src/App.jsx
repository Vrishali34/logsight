import { useState } from 'react'
import Login     from './Login'
import Dashboard from './Dashboard'
import './index.css'

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('ls_token'))

  const handleLogout = () => {
    localStorage.removeItem('ls_token')
    setAuthed(false)
  }

  return authed
    ? <Dashboard onLogout={handleLogout} />
    : <Login onLogin={() => setAuthed(true)} />
}