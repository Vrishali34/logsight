import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from './api';

export default function TrendsChart({ appId, hours }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!appId) return;
    api.getTrends(appId, hours).then(r => {
      setData(r.trends.map(t => ({
        hour:   new Date(t.hour).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
        total:  parseInt(t.total),
        errors: parseInt(t.errors),
      })));
    }).catch(() => {});
  }, [appId, hours]);

  if (!data.length) return <p style={{ color:'#8888aa' }}>No trend data yet.</p>;

  return (
    <div style={{ background:'#1e1e30', border:'1px solid #3a3a5c', borderRadius:'10px', padding:'20px', marginBottom:'28px' }}>
      <h3 style={{ marginBottom:'16px', fontSize:'14px', color:'#8888aa', textTransform:'uppercase', letterSpacing:'0.05em' }}>Log Volume — Last {hours}h</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <XAxis dataKey="hour" stroke="#555577" tick={{ fill:'#8888aa', fontSize:11 }} />
          <YAxis stroke="#555577" tick={{ fill:'#8888aa', fontSize:11 }} />
          <Tooltip contentStyle={{ background:'#1e1e30', border:'1px solid #3a3a5c', borderRadius:'8px' }} />
          <Legend />
          <Line type="monotone" dataKey="total"  stroke="#6366f1" strokeWidth={2} dot={false} name="Total" />
          <Line type="monotone" dataKey="errors" stroke="#f87171" strokeWidth={2} dot={false} name="Errors" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}