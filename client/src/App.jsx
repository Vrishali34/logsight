import { useState } from 'react';
import Login     from './Login';
import Register  from './Register';
import Dashboard from './Dashboard';
import './index.css';

export default function App() {
  const [screen, setScreen] = useState(
    localStorage.getItem('ls_token') ? 'dashboard' : 'login'
  );

  const handleLogout = () => {
    localStorage.removeItem('ls_token');
    setScreen('login');
  };

  if (screen === 'dashboard') {
    return <Dashboard onLogout={handleLogout} />;
  }

  if (screen === 'register') {
    return (
      <Register
        onRegistered={() => setScreen('dashboard')}
        onBackToLogin={() => setScreen('login')}
      />
    );
  }

  return (
    <Login
      onLogin={() => setScreen('dashboard')}
      onGoToRegister={() => setScreen('register')}
    />
  );
}