import { useState } from 'react';
import { api } from './api';

export default function Register({ onRegistered, onBackToLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setError('Please enter a password');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.register(email, password);
      const data = await api.login(email, password);
      localStorage.setItem('ls_token', data.data.token);
      onRegistered();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const eyeBtn = {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    userSelect: 'none',
  };

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div style={{ background:'#1e1e30', padding:'40px', borderRadius:'12px', width:'380px', border:'1px solid #3a3a5c' }}>

        <h1 style={{ fontSize:'24px', marginBottom:'6px', color:'#a5b4fc' }}>LogSight</h1>
        <p style={{ color:'#8888aa', marginBottom:'28px', fontSize:'14px' }}>Create your account</p>

        <form onSubmit={handle} noValidate style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

          {/* Email — type text to avoid Safari pattern validation */}
          <input
            type="text"
            inputMode="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width:'100%' }}
          />

          {/* Password */}
          <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              pattern=".*"
              style={{ width:'100%', paddingRight:'36px' }}
            />
            <button
              type="button"
              style={eyeBtn}
              onClick={() => setShowPass(p => !p)}
            >
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>

          {/* Confirm Password */}
          <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
            <input
              type={showConf ? 'text' : 'password'}
              placeholder="Confirm password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password"
              pattern=".*"
              style={{ width:'100%', paddingRight:'36px' }}
            />
            <button
              type="button"
              style={eyeBtn}
              onClick={() => setShowConf(p => !p)}
            >
              {showConf ? '🙈' : '👁️'}
            </button>
          </div>

          {error && (
            <p style={{ color:'#f87171', fontSize:'13px', margin:0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ background:'#6366f1', color:'white', padding:'10px', borderRadius:'6px' }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={{ marginTop:'20px', textAlign:'center', fontSize:'13px', color:'#8888aa' }}>
          Already have an account?{' '}
          <span
            onClick={onBackToLogin}
            style={{ color:'#a5b4fc', cursor:'pointer', textDecoration:'underline' }}
          >
            Sign in
          </span>
        </p>

      </div>
    </div>
  );
}