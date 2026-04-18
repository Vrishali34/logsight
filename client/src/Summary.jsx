import { useEffect, useState } from 'react';
import { api } from './api';

const Card = ({ label, value, color }) => (
  <div style={{ background:'#1e1e30', border:'1px solid #3a3a5c', borderRadius:'10px', padding:'20px', flex:1, minWidth:'140px' }}>
    <p style={{ color:'#8888aa', fontSize:'12px', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</p>
    <p style={{ fontSize:'28px', fontWeight:'700', color: color || '#e2e2f0' }}>{value ?? '—'}</p>
  </div>
);

export default function Summary({ appId, hours }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!appId) return;
    api.getSummary(appId, hours).then(r => setData(r.summary)).catch(() => {});
  }, [appId, hours]);

  if (!data) return <p style={{ color:'#8888aa' }}>Loading summary…</p>;

  const rate = parseFloat(data.error_rate_percent);
  const rateColor = rate > 20 ? '#f87171' : rate > 5 ? '#fbbf24' : '#34d399';

  return (
    <div style={{ display:'flex', gap:'14px', flexWrap:'wrap', marginBottom:'28px' }}>
      <Card label="Error Rate"   value={`${data.error_rate_percent ?? 0}%`} color={rateColor} />
      <Card label="Total Logs"   value={data.total} />
      <Card label="Errors"       value={data.errors}   color="#f87171" />
      <Card label="Warnings"     value={data.warnings} color="#fbbf24" />
      <Card label="Info"         value={data.info}     color="#60a5fa" />
      <Card label="Debug"        value={data.debug}    color="#8888aa" />
    </div>
  );
}