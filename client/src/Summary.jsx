import { useEffect, useState } from 'react';
import { api } from './api';

const Card = ({ label, value, color }) => (
  <div style={{
    background:'#1e1e30', border:'1px solid #3a3a5c', borderRadius:'10px',
    padding:'20px', width:'100%'
  }}>
    <p style={{ color:'#8888aa', fontSize:'12px', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
      {label}
    </p>
    <p style={{ fontSize:'28px', fontWeight:'700', color: color || '#e2e2f0' }}>
      {value ?? '—'}
    </p>
  </div>
);

export default function Summary({ appId, hours, apiKey }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appId) return;
    setLoading(true);
    api.getSummary(appId, hours)
      .then(r => setData(r.summary))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [appId, hours]);

  if (loading) {
    return (
      <div style={{ display:'flex', gap:'14px', flexWrap:'wrap', marginBottom:'28px' }}>
        {['Error Rate','Total Logs','Errors','Warnings','Info','Debug'].map(label => (
          <div key={label} style={{
            background:'#1e1e30', border:'1px solid #3a3a5c', borderRadius:'10px',
            padding:'20px', flex:1, minWidth:'140px'
          }}>
            <p style={{ color:'#8888aa', fontSize:'12px', marginBottom:'6px', textTransform:'uppercase' }}>{label}</p>
            <p style={{ fontSize:'28px', fontWeight:'700', color:'#3a3a5c' }}>—</p>
          </div>
        ))}
      </div>
    );
  }

  // Fix 6 — null means no data, not 0%
  const hasData = parseInt(data?.total) > 0;
  const rate = parseFloat(data?.error_rate_percent);
  const rateColor = rate > 20 ? '#f87171' : rate > 5 ? '#fbbf24' : '#34d399';

  // Fix 6 — show — instead of 0% when there are no logs
  const errorRateDisplay = !hasData
    ? '—'
    : `${data.error_rate_percent ?? 0}%`;

  return (
    <>
      {/* Metric cards */}
     <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:'14px', marginBottom:'28px' }}>
        <Card
          label="Error Rate"
          value={errorRateDisplay}
          color={hasData ? rateColor : '#8888aa'}
        />
        <Card label="Total Logs" value={data?.total}    />
        <Card label="Errors"     value={data?.errors}   color="#f87171" />
        <Card label="Warnings"   value={data?.warnings} color="#fbbf24" />
        <Card label="Info"       value={data?.info}     color="#60a5fa" />
        <Card label="Debug"      value={data?.debug}    color="#8888aa" />
      </div>

      {/* Fix 5 — empty state with instructions when no logs yet */}
      {!hasData && (
        <div style={{
          background:'#1e1e30', border:'1px dashed #3a3a5c', borderRadius:'10px',
          padding:'28px', marginBottom:'28px', textAlign:'center'
        }}>
          <p style={{ fontSize:'28px', marginBottom:'12px' }}>📡</p>
          <p style={{ color:'#a5b4fc', fontSize:'16px', fontWeight:600, marginBottom:'8px' }}>
            No logs yet — here's how to send your first one
          </p>
          <p style={{ color:'#8888aa', fontSize:'13px', marginBottom:'20px' }}>
            Copy your API key above and send a log from your terminal or application
          </p>

          {/* Code snippet */}
          <div style={{
            background:'#13131f', borderRadius:'8px', padding:'16px',
            textAlign:'left', border:'1px solid #2a2a4a', maxWidth:'600px', margin:'0 auto'
          }}>
            <p style={{ color:'#8888aa', fontSize:'11px', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
              Send a test log from your terminal
            </p>
            <code style={{ color:'#a5b4fc', fontSize:'12px', lineHeight:'1.8', whiteSpace:'pre-wrap', wordBreak:'break-all' }}>
            {`curl -X POST https://logsight.onrender.com/api/logs \\
            -H "Content-Type: application/json" \\
            -H "x-api-key: ${apiKey || 'YOUR_API_KEY'}" \\
            -d '{"level":"error","message":"Test error","service":"my-service"}'`}
            </code>
          </div>

          <p style={{ color:'#555577', fontSize:'12px', marginTop:'16px' }}>
            Once you send a log, this dashboard will update automatically
          </p>
        </div>
      )}
    </>
  );
}