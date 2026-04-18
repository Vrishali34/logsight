import { useEffect, useState } from 'react';
import { api } from './api';
import Summary      from './Summary';
import TrendsChart  from './TrendsChart';
import ServicesTable from './ServicesTable';
import LogViewer    from './LogViewer';
import AlertsPanel  from './AlertsPanel';

export default function Dashboard({ onLogout }) {
  const [apps, setApps]         = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [hours, setHours]       = useState(24);
  const [newAppName, setNewAppName] = useState('');
  const [tab, setTab]           = useState('overview');

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

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px' }}>
        <h1 style={{ fontSize:'22px', color:'#a5b4fc', fontWeight:700 }}>LogSight</h1>
        <button onClick={onLogout} style={{ background:'transparent', color:'#8888aa', border:'1px solid #3a3a5c', fontSize:'13px' }}>
          Sign out
        </button>
      </div>

      {/* App selector + create */}
      <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'24px', alignItems:'center' }}>
        <select value={selectedApp?.id || ''} onChange={e => setSelectedApp(apps.find(a => a.id === parseInt(e.target.value)))} style={{ minWidth:'200px' }}>
          {apps.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>

        <form onSubmit={createApp} style={{ display:'flex', gap:'8px' }}>
          <input placeholder="New app name…" value={newAppName} onChange={e => setNewAppName(e.target.value)} style={{ width:'180px' }} />
          <button type="submit" style={{ background:'#3a3a5c', color:'#e2e2f0' }}>+ App</button>
        </form>

        <select value={hours} onChange={e => setHours(parseInt(e.target.value))} style={{ width:'130px' }}>
          <option value={1}>Last 1 hour</option>
          <option value={6}>Last 6 hours</option>
          <option value={24}>Last 24 hours</option>
          <option value={168}>Last 7 days</option>
        </select>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'24px', flexWrap:'wrap' }}>
        {['overview','logs','alerts'].map(t => (
          <button key={t} style={TAB_STYLE(tab === t)} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {!selectedApp && (
        <p style={{ color:'#8888aa' }}>Create your first app above to get started.</p>
      )}

      {selectedApp && tab === 'overview' && (
        <>
          <Summary       appId={selectedApp.id} hours={hours} />
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
    </div>
  );
}