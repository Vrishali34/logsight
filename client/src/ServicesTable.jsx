import { useEffect, useState } from 'react';
import { api } from './api';

export default function ServicesTable({ appId, hours }) {
  const [services, setServices] = useState([]);

  useEffect(() => {
    if (!appId) return;
    api.getServices(appId, hours).then(r => setServices(r.services)).catch(() => {});
  }, [appId, hours]);

  if (!services.length) return <p style={{ color:'#8888aa' }}>No service data yet.</p>;

  return (
    <div style={{ background:'#1e1e30', border:'1px solid #3a3a5c', borderRadius:'10px', padding:'20px', marginBottom:'28px' }}>
      <h3 style={{ marginBottom:'16px', fontSize:'14px', color:'#8888aa', textTransform:'uppercase', letterSpacing:'0.05em' }}>Services</h3>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'14px' }}>
        <thead>
          <tr style={{ borderBottom:'1px solid #3a3a5c', color:'#8888aa', textAlign:'left' }}>
            <th style={{ padding:'8px 0' }}>Service</th>
            <th style={{ padding:'8px 0' }}>Total</th>
            <th style={{ padding:'8px 0' }}>Errors</th>
            <th style={{ padding:'8px 0' }}>Error Rate</th>
          </tr>
        </thead>
        <tbody>
          {services.map(s => {
            const rate = parseFloat(s.error_rate_percent) || 0;
            const color = rate > 20 ? '#f87171' : rate > 5 ? '#fbbf24' : '#34d399';
            return (
              <tr key={s.service} style={{ borderBottom:'1px solid #2a2a3c' }}>
                <td style={{ padding:'10px 0', fontWeight:500 }}>{s.service}</td>
                <td style={{ padding:'10px 0', color:'#8888aa' }}>{s.total}</td>
                <td style={{ padding:'10px 0', color:'#f87171' }}>{s.errors}</td>
                <td style={{ padding:'10px 0', color, fontWeight:600 }}>{s.error_rate_percent}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}