import { useEffect, useState } from 'react';
import { api } from './api';

const LEVEL_COLORS = { error:'#f87171', warn:'#fbbf24', info:'#60a5fa', debug:'#8888aa' };

export default function LogViewer({ appId, hours }) {
  const [logs, setLogs]       = useState([]);
  const [level, setLevel]     = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => {
    if (!appId) return;
    setLoading(true);
    api.getLogs(appId, level, 50, hours)
      .then(r => setLogs(r.logs))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [appId, level, hours]);

  return (
    <div style={{ background:'#1e1e30', border:'1px solid #3a3a5c', borderRadius:'10px', padding:'20px', marginBottom:'28px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
        <div>
          <h3 style={{ fontSize:'14px', color:'#8888aa', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'2px' }}>
            Recent Logs
          </h3>
          <p style={{ fontSize:'11px', color:'#555577' }}>
            Last {hours === 168 ? '7 days' : `${hours} hour${hours === 1 ? '' : 's'}`}
          </p>
        </div>
        <select
          value={level}
          onChange={e => setLevel(e.target.value)}
          style={{ width:'130px' }}
        >
          <option value="">All levels</option>
          <option value="error">Error</option>
          <option value="warn">Warn</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>
      </div>

      {loading && <p style={{ color:'#8888aa' }}>Loading…</p>}

      {!loading && !logs.length && (
        <div style={{ textAlign:'center', padding:'24px' }}>
          <p style={{ color:'#8888aa', marginBottom:'6px' }}>No logs found.</p>
          <p style={{ color:'#555577', fontSize:'12px' }}>
            Try selecting a wider time window or a different level filter
          </p>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {logs.map(log => (
          <div key={log.id} style={{ display:'flex', gap:'12px', alignItems:'flex-start', padding:'10px', background:'#13131f', borderRadius:'8px', fontSize:'13px' }}>
            <span style={{ color: LEVEL_COLORS[log.level] || '#e2e2f0', fontWeight:700, minWidth:'44px', textTransform:'uppercase', fontSize:'11px', marginTop:'1px' }}>
              {log.level}
            </span>
            <span style={{ color:'#8888aa', minWidth:'160px', fontSize:'11px', marginTop:'1px' }}>
              {new Date(log.timestamp).toLocaleString()}
            </span>
            <span style={{ flex:1 }}>{log.message}</span>
            {log.service && (
              <span style={{ color:'#6366f1', fontSize:'11px', whiteSpace:'nowrap' }}>
                {log.service}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}