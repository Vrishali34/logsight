import { useState } from 'react';
import { api } from './api';

export default function Login({ onLogin, onGoToRegister }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('ls_token', data.data.token);
      onLogin();
    } catch (err) {
      setError(
        err.message === 'Request failed'
          ? 'Server is starting up — please try again in 30 seconds'
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div style={{ background:'#1e1e30', padding:'40px', borderRadius:'12px', width:'380px', border:'1px solid #3a3a5c' }}>

        <h1 style={{ fontSize:'24px', marginBottom:'6px', color:'#a5b4fc' }}>LogSight</h1>
        <p style={{ color:'#8888aa', marginBottom:'28px', fontSize:'14px' }}>Sign in to your dashboard</p>

        <form onSubmit={handle} noValidate style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <input
            type="text"
            inputMode="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width:'100%' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            style={{ width:'100%' }}
          />

          {error && (
            <p style={{ color:'#f87171', fontSize:'13px', margin:0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ background:'#6366f1', color:'white', padding:'10px', borderRadius:'6px' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ marginTop:'20px', textAlign:'center', fontSize:'13px', color:'#8888aa' }}>
          Don't have an account?{' '}
          <span
            onClick={onGoToRegister}
            style={{ color:'#a5b4fc', cursor:'pointer', textDecoration:'underline' }}
          >
            Sign up
          </span>
        </p>

      </div>
    </div>
  );
}