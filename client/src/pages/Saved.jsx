import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Trash2, GitCompare, ExternalLink, MapPin, TrendingUp, IndianRupee } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';

const fmt  = (n) => !n ? '—' : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;
const fmtP = (n) => !n ? '—' : `${(n/100000).toFixed(1)} LPA`;

export default function Saved() {
  const { user }    = useAuth();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const navigate    = useNavigate();
  const [colleges, setColleges]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [comparisons, setComparisons] = useState([]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    Promise.all([
      api.get('/users/saved'),
      api.get('/users/comparisons'),
    ]).then(([s, c]) => {
      setColleges(s.data.savedColleges);
      setComparisons(c.data.comparisons);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, [user, navigate]);

  const unsave = async (id) => {
    await api.post(`/users/saved/${id}`);
    setColleges(p => p.filter(c => c._id !== id));
  };

  if (loading) return <div className="page container"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom:32 }}>
          <h1 style={{ display:'flex', alignItems:'center', gap:12, fontSize:'clamp(1.5rem,3vw,2rem)', marginBottom:8 }}>
            <Bookmark size={24} style={{ color:'var(--accent)' }} /> Saved Items
          </h1>
          <p style={{ color:'var(--text-secondary)' }}>Your bookmarked colleges and saved comparisons</p>
        </div>

        {/* Saved Colleges */}
        <section style={{ marginBottom:48 }}>
          <h2 style={{ fontSize:'1.2rem', marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
            Saved Colleges <span style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-muted)', fontSize:'.75rem', padding:'2px 10px', borderRadius:20 }}>{colleges.length}</span>
          </h2>

          {colleges.length === 0 ? (
            <div className="empty-state">
              <Bookmark size={40} />
              <h3>No saved colleges yet</h3>
              <p>Click the bookmark icon on any college to save it here</p>
              <Link to="/" className="btn btn-outline" style={{ marginTop:16 }}>Browse Colleges</Link>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {colleges.map(c => {
                const inCompare = isInCompare(c._id);
                return (
                  <div key={c._id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:16, display:'flex', alignItems:'center', gap:16, transition:'all var(--transition)' }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border-hover)'}
                    onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
                  >
                    <img
                      src={c.image||'https://images.unsplash.com/photo-1562774053-701939374585?w=200&q=60'}
                      alt={c.name}
                      style={{ width:80, height:60, objectFit:'cover', borderRadius:'var(--radius-sm)', flexShrink:0 }}
                    />
                    <div style={{ flex:1, minWidth:0 }}>
                      <Link to={`/colleges/${c._id}`} style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:'1rem', color:'var(--text-primary)', textDecoration:'none', display:'block', marginBottom:4 }}>
                        {c.name}
                      </Link>
                      <p style={{ color:'var(--text-muted)', fontSize:'.8rem', display:'flex', alignItems:'center', gap:4, marginBottom:8 }}>
                        <MapPin size={11} />{c.location?.city}, {c.location?.state}
                      </p>
                      <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                        <span style={{ display:'flex', alignItems:'center', gap:4, color:'var(--text-secondary)', fontSize:'.8rem' }}>
                          <IndianRupee size={12} style={{ color:'var(--accent)' }} />{fmt(c.fees?.min)}–{fmt(c.fees?.max)}/yr
                        </span>
                        {c.placement?.averagePackage && (
                          <span style={{ display:'flex', alignItems:'center', gap:4, color:'var(--text-secondary)', fontSize:'.8rem' }}>
                            <TrendingUp size={12} style={{ color:'var(--green)' }} />{fmtP(c.placement.averagePackage)} avg pkg
                          </span>
                        )}
                        <span style={{ fontSize:'.8rem', color:'var(--text-secondary)' }}>⭐ {c.rating}</span>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8, flexShrink:0, flexWrap:'wrap', justifyContent:'flex-end' }}>
                      <button
                        className={`btn btn-secondary btn-sm ${inCompare ? 'btn-outline' : ''}`}
                        onClick={() => inCompare ? removeFromCompare(c._id) : addToCompare(c)}
                        title="Add to compare"
                      >
                        <GitCompare size={13} />{inCompare ? 'Remove' : 'Compare'}
                      </button>
                      <Link to={`/colleges/${c._id}`} className="btn btn-secondary btn-sm">
                        <ExternalLink size={13} /> View
                      </Link>
                      <button className="btn btn-ghost btn-sm" onClick={() => unsave(c._id)} title="Remove from saved" style={{ color:'var(--red)' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Saved Comparisons */}
        <section>
          <h2 style={{ fontSize:'1.2rem', marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
            Saved Comparisons <span style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-muted)', fontSize:'.75rem', padding:'2px 10px', borderRadius:20 }}>{comparisons.length}</span>
          </h2>

          {comparisons.length === 0 ? (
            <div className="empty-state" style={{ padding:'40px 0' }}>
              <GitCompare size={40} />
              <h3>No saved comparisons</h3>
              <p>Compare colleges and save the comparison for later</p>
              <Link to="/compare" className="btn btn-outline" style={{ marginTop:16 }}>Start Comparing</Link>
            </div>
          ) : (
            <div className="grid-2">
              {comparisons.map((comp, i) => (
                <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20 }}>
                  <p style={{ fontWeight:600, marginBottom:8 }}>{comp.name}</p>
                  <p style={{ color:'var(--text-muted)', fontSize:'.75rem', marginBottom:14 }}>
                    {new Date(comp.createdAt).toLocaleDateString('en-IN',{year:'numeric',month:'short',day:'numeric'})} · {comp.colleges?.length || 0} colleges
                  </p>
                  <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:16 }}>
                    {comp.colleges?.map(c => (
                      <div key={c._id||c} style={{ display:'flex', alignItems:'center', gap:8, color:'var(--text-secondary)', fontSize:'.85rem' }}>
                        <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', flexShrink:0 }} />
                        {c.name || 'College'}
                      </div>
                    ))}
                  </div>
                  <Link
                    to={`/compare?ids=${comp.colleges?.map(c=>c._id||c).join(',')}`}
                    className="btn btn-outline btn-sm"
                    style={{ width:'100%', justifyContent:'center' }}
                  >
                    <GitCompare size={13} /> View Comparison
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}