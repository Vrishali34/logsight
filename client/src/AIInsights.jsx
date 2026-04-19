import { useState } from 'react';
import { api } from './api';

export default function AIInsights({ appId, hours }) {
  const [insights, setInsights] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [fetched, setFetched]   = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    setError('');
    setInsights('');
    try {
      const res = await api.getInsights(appId, hours);
      setInsights(res.insights);
      setFetched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background:'#1e1e30', border:'1px solid #3a3a5c', borderRadius:'10px', padding:'24px' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
        <div>
          <h3 style={{ fontSize:'16px', color:'#a5b4fc', marginBottom:'4px' }}>AI Insights</h3>
          <p style={{ fontSize:'13px', color:'#8888aa' }}>
            Llama 3 via Groq analyses your last {hours}h of log data
          </p>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading}
          style={{ background:'#6366f1', color:'white', padding:'10px 20px', fontSize:'14px', borderRadius:'8px' }}
        >
          {loading ? 'Analysing…' : fetched ? '↻ Refresh' : '✦ Analyse'}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ padding:'32px', textAlign:'center' }}>
          <p style={{ color:'#8888aa', marginBottom:'8px' }}>Groq is reading your logs…</p>
          <p style={{ color:'#555577', fontSize:'12px' }}>Usually takes 1–2 seconds</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{ padding:'16px', background:'#2a1a1a', borderRadius:'8px', border:'1px solid #5a2a2a' }}>
          <p style={{ color:'#f87171', fontSize:'14px' }}>{error}</p>
        </div>
      )}

      {/* Insights result */}
      {insights && !loading && (
        <div style={{ padding:'20px', background:'#13131f', borderRadius:'8px', border:'1px solid #2a2a4a' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
            <span style={{ fontSize:'16px' }}>✦</span>
            <span style={{ fontSize:'12px', color:'#6366f1', fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase' }}>
              AI Analysis — Llama 3 (Groq)
            </span>
          </div>
          <p style={{ color:'#d4d4f0', fontSize:'14px', lineHeight:'1.8', whiteSpace:'pre-wrap' }}>
            {insights}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!fetched && !loading && !error && (
        <div style={{ padding:'40px', textAlign:'center', border:'1px dashed #3a3a5c', borderRadius:'8px' }}>
          <p style={{ fontSize:'32px', marginBottom:'12px' }}>✦</p>
          <p style={{ color:'#8888aa', fontSize:'14px', marginBottom:'6px' }}>
            Click Analyse to get an AI-powered summary of your app's health
          </p>
          <p style={{ color:'#555577', fontSize:'12px' }}>
            Powered by Llama 3 on Groq — fast, free, and running on LPU hardware
          </p>
        </div>
      )}

    </div>
  );
}