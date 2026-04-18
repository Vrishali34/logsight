import { useEffect, useState } from 'react';
import { api } from './api';

export default function AlertsPanel({ appId }) {
  const [rules, setRules]           = useState([]);
  const [threshold, setThreshold]   = useState('');
  const [cooldown, setCooldown]     = useState('10');
  const [error, setError]           = useState('');

  const load = () => {
    if (!appId) return;
    api.getAlerts(appId).then(r => setRules(r.rules)).catch(() => {});
  };

  useEffect(() => { load(); }, [appId]);

  const create = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.createAlert({ app_id: appId, metric: 'error_rate', threshold: parseFloat(threshold), cooldown_minutes: parseInt(cooldown) });
      setThreshold('');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    await api.deleteAlert(id, appId);
    load();
  };

  return (
    <div style={{ background:'#1e1e30', border:'1px solid #3a3a5c', borderRadius:'10px', padding:'20px', marginBottom:'28px' }}>
      <h3 style={{ marginBottom:'16px', fontSize:'14px', color:'#8888aa', textTransform:'uppercase', letterSpacing:'0.05em' }}>Alert Rules</h3>

      <form onSubmit={create} style={{ display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'20px', alignItems:'flex-end' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
          <label style={{ fontSize:'12px', color:'#8888aa' }}>Error rate threshold (%)</label>
          <input type="number" min="0" max="100" placeholder="e.g. 30" value={threshold}
            onChange={e => setThreshold(e.target.value)} required style={{ width:'180px' }} />
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
          <label style={{ fontSize:'12px', color:'#8888aa' }}>Cooldown (minutes)</label>
          <input type="number" min="1" value={cooldown}
            onChange={e => setCooldown(e.target.value)} style={{ width:'130px' }} />
        </div>
        <button type="submit" style={{ background:'#6366f1', color:'white', height:'36px' }}>
          Add Rule
        </button>
        {error && <p style={{ color:'#f87171', fontSize:'13px', width:'100%' }}>{error}</p>}
      </form>

      {!rules.length && <p style={{ color:'#8888aa', fontSize:'14px' }}>No alert rules yet.</p>}
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {rules.map(r => (
          <div key={r.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px', background:'#13131f', borderRadius:'8px', fontSize:'13px' }}>
            <div>
              <span style={{ color:'#a5b4fc', fontWeight:600 }}>error_rate &gt; {r.threshold}%</span>
              <span style={{ color:'#8888aa', marginLeft:'16px' }}>cooldown: {r.cooldown_minutes}m</span>
              {r.last_triggered && (
                <span style={{ color:'#fbbf24', marginLeft:'16px', fontSize:'11px' }}>
                  last fired: {new Date(r.last_triggered).toLocaleString()}
                </span>
              )}
            </div>
            <button onClick={() => remove(r.id)} style={{ background:'#3a1a1a', color:'#f87171', padding:'4px 12px', fontSize:'12px' }}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}