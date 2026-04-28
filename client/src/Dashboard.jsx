import { useEffect, useState } from 'react';
import { api } from './api';
import Summary       from './Summary';
import TrendsChart   from './TrendsChart';
import ServicesTable from './ServicesTable';
import LogViewer     from './LogViewer';
import AlertsPanel   from './AlertsPanel';
import AIInsights    from './AIInsights';

export default function Dashboard({ onLogout }) {
  const [apps, setApps]               = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [hours, setHours]             = useState(24);
  const [newAppName, setNewAppName]   = useState('');
  const [tab, setTab]                 = useState('overview');
  const [newApiKey, setNewApiKey]     = useState(null); // shown in modal after creation
  const [copied, setCopied]           = useState(false);

  useEffect(() => {
    api.getApps().then(r => {
      setApps(r.apps);
      if (r.apps.length > 0) setSelectedApp(r.apps[0]);
    }).catch(() => onLogout());
  }, []);

  const createApp = async (e) => {
    e.preventDefault();
    if (!newAppName.trim()) return;
    const r = await api.createApp(newAppName.trim());
    setApps(prev => [r.app, ...prev]);
    setSelectedApp(r.app);
    setNewAppName('');
    setNewApiKey(r.app.api_key); // show modal with the key
  };

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TAB_STYLE = (active) => ({
    padding:'8px 18px', borderRadius:'6px', fontSize:'14px', fontWeight:500,
    background: active ? '#6366f1' : 'transparent',
    color: active ? 'white' : '#8888aa',
    border: active ? 'none' : '1px solid #3a3a5c',
    cursor:'pointer',
  });

  return (
    <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'28px 20px' }}>

      {/* ── API Key Modal (shown once after app creation) ── */}
      {newApiKey && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.7)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000
        }}>
          <div style={{
            background:'#1e1e30', borderRadius:'12px', padding:'32px',
            width:'480px', border:'1px solid #3a3a5c', boxShadow:'0 20px 60px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ color:'#a5b4fc', fontSize:'18px', marginBottom:'8px' }}>
              ✅ App Created Successfully
            </h3>
            <p style={{ color:'#8888aa', fontSize:'13px', marginBottom:'20px' }}>
              Copy your API key now. For security, we recommend storing it safely —
              you can always view it on your dashboard.
            </p>

            <div style={{
              background:'#13131f', borderRadius:'8px', padding:'14px',
              border:'1px solid #3a3a5c', marginBottom:'16px'
            }}>
              <p style={{ color:'#8888aa', fontSize:'11px', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                API Key
              </p>
              <p style={{
                color:'#a5b4fc', fontFamily:'monospace', fontSize:'13px',
                wordBreak:'break-all', margin:0
              }}>
                {newApiKey}
              </p>
            </div>

            <div style={{ display:'flex', gap:'10px' }}>
              <button
                onClick={() => copyKey(newApiKey)}
                style={{
                  flex:1, background: copied ? '#2e7d52' : '#6366f1',
                  color:'white', padding:'10px', borderRadius:'6px', fontSize:'14px'
                }}
              >
                {copied ? '✓ Copied!' : 'Copy API Key'}
              </button>
              <button
                onClick={() => { setNewApiKey(null); setCopied(false); }}
                style={{
                  flex:1, background:'#3a3a5c', color:'#e2e2f0',
                  padding:'10px', borderRadius:'6px', fontSize:'14px'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px' }}>
        <h1 style={{ fontSize:'22px', color:'#a5b4fc', fontWeight:700 }}>LogSight</h1>
        <button
          onClick={onLogout}
          style={{ background:'transparent', color:'#8888aa', border:'1px solid #3a3a5c', fontSize:'13px' }}
        >
          Sign out
        </button>
      </div>

      {/* ── App selector + create ── */}
      <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'16px', alignItems:'center' }}>
        <select
          value={selectedApp?.id || ''}
          onChange={e => setSelectedApp(apps.find(a => a.id === parseInt(e.target.value)))}
          style={{ minWidth:'200px' }}
        >
          {apps.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>

        <form onSubmit={createApp} style={{ display:'flex', gap:'8px' }}>
          <input
            placeholder="New app name…"
            value={newAppName}
            onChange={e => setNewAppName(e.target.value)}
            style={{ width:'180px' }}
          />
          <button type="submit" style={{ background:'#3a3a5c', color:'#e2e2f0' }}>+ App</button>
        </form>

        <select
          value={hours}
          onChange={e => setHours(parseInt(e.target.value))}
          style={{ width:'130px' }}
        >
          <option value={1}>Last 1 hour</option>
          <option value={6}>Last 6 hours</option>
          <option value={24}>Last 24 hours</option>
          <option value={168}>Last 7 days</option>
        </select>
      </div>

      {/* ── API Key display for selected app ── */}
      {selectedApp?.api_key && (
        <div style={{
          display:'flex', alignItems:'center', gap:'10px',
          background:'#13131f', borderRadius:'8px', padding:'10px 14px',
          border:'1px solid #2a2a4a', marginBottom:'20px', flexWrap:'wrap'
        }}>
          <span style={{ color:'#8888aa', fontSize:'12px', whiteSpace:'nowrap' }}>
            API Key:
          </span>
          <span style={{
            color:'#a5b4fc', fontFamily:'monospace', fontSize:'12px',
            flex:1, wordBreak:'break-all'
          }}>
            {selectedApp.api_key}
          </span>
          <button
            onClick={() => copyKey(selectedApp.api_key)}
            style={{
              background: copied ? '#2e7d52' : '#3a3a5c',
              color:'white', padding:'4px 12px', borderRadius:'4px',
              fontSize:'12px', whiteSpace:'nowrap'
            }}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'24px', flexWrap:'wrap' }}>
        {['overview','logs','alerts','ai'].map(t => (
          <button key={t} style={TAB_STYLE(tab === t)} onClick={() => setTab(t)}>
            {t === 'ai' ? 'AI Insights' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {!selectedApp && (
        <p style={{ color:'#8888aa' }}>Create your first app above to get started.</p>
      )}

      {selectedApp && tab === 'overview' && (
        <>
         <Summary       appId={selectedApp.id} hours={hours} apiKey={selectedApp.api_key} />
          <TrendsChart   appId={selectedApp.id} hours={hours} />
          <ServicesTable appId={selectedApp.id} hours={hours} />
        </>
      )}
      {selectedApp && tab === 'logs' && (
        <LogViewer appId={selectedApp.id} />
      )}
      {selectedApp && tab === 'alerts' && (
        <AlertsPanel appId={selectedApp.id} />
      )}
      {selectedApp && tab === 'ai' && (
        <AIInsights appId={selectedApp.id} hours={hours} />
      )}

    </div>
  );
}