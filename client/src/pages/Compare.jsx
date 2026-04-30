import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GitCompare, X, Plus, Check, Minus, Search, BookmarkPlus } from 'lucide-react';
import api from '../utils/api';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';
import styles from './Compare.module.css';

const fmt  = (n) => !n ? '—' : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;
const fmtP = (n) => !n ? '—' : `${(n/100000).toFixed(1)} LPA`;

const ROWS = [
  { key: 'location',        label: 'Location',         render: c => `${c.location.city}, ${c.location.state}` },
  { key: 'type',            label: 'Type',             render: c => c.type },
  { key: 'established',     label: 'Established',      render: c => c.established || '—' },
  { key: 'rating',          label: 'Rating',           render: c => `${c.rating} / 5`, highlight: true },
  { key: 'nirf',            label: 'NIRF Rank',        render: c => c.rankings?.nirf ? `#${c.rankings.nirf}` : '—', highlight: true, lower: true },
  { key: 'fees',            label: 'Fee Range',        render: c => `${fmt(c.fees.min)} – ${fmt(c.fees.max)}` },
  { key: 'placementRate',   label: 'Placement %',      render: c => c.placement?.placementRate ? `${c.placement.placementRate}%` : '—', highlight: true },
  { key: 'avgPkg',          label: 'Avg Package',      render: c => fmtP(c.placement?.averagePackage), highlight: true },
  { key: 'highPkg',         label: 'Highest Package',  render: c => fmtP(c.placement?.highestPackage), highlight: true },
  { key: 'exams',           label: 'Exams Accepted',   render: c => c.examAccepted?.join(', ') || '—' },
  { key: 'courses',         label: 'Course Streams',   render: c => c.courseTags?.slice(0,4).join(', ') || '—' },
  { key: 'recruiters',      label: 'Top Recruiters',   render: c => c.placement?.topRecruiters?.slice(0,3).join(', ') || '—' },
  { key: 'facilities',      label: 'Facilities',       render: c => c.facilities?.slice(0,4).join(', ') || '—' },
];

// Returns index of "best" value for highlight rows
function getBestIdx(row, colleges) {
  if (!row.highlight) return -1;
  const vals = colleges.map(c => {
    if (row.key === 'rating')        return c.rating || 0;
    if (row.key === 'nirf')          return c.rankings?.nirf || 9999;
    if (row.key === 'placementRate') return c.placement?.placementRate || 0;
    if (row.key === 'avgPkg')        return c.placement?.averagePackage || 0;
    if (row.key === 'highPkg')       return c.placement?.highestPackage || 0;
    return null;
  });
  if (vals.every(v => v === null)) return -1;
  return row.lower
    ? vals.indexOf(Math.min(...vals.filter(v => v !== 9999 && v !== null)))
    : vals.indexOf(Math.max(...vals.filter(v => v !== null)));
}

export default function Compare() {
  const { compareList, addToCompare, removeFromCompare, clearCompare } = useCompare();
  const { user }      = useAuth();
  const [details, setDetails]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');
  const [results, setResults]   = useState([]);
  const [searching, setSearching] = useState(false);
  const [saved, setSaved]       = useState(false);
  const [compName, setCompName] = useState('');
  const [showSave, setShowSave] = useState(false);

  useEffect(() => {
    if (compareList.length === 0) { setDetails([]); return; }
    setLoading(true);
    const ids = compareList.map(c => c._id).join(',');
    api.get(`/colleges/compare?ids=${ids}`)
      .then(({ data }) => setDetails(data.colleges))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [compareList]);

  useEffect(() => {
    if (!search.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get('/colleges', { params: { search, limit: 5 } });
        setResults(data.colleges.filter(c => !compareList.find(x => x._id === c._id)));
      } catch {} finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [search, compareList]);

  const handleSaveComparison = async () => {
    if (!user) { window.location.href = '/login'; return; }
    if (!compName.trim()) return;
    try {
      await api.post('/users/comparisons', { name: compName, collegeIds: compareList.map(c => c._id) });
      setSaved(true); setShowSave(false); setCompName('');
    } catch (err) { console.error(err); }
  };

  return (
    <div className="page">
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}><GitCompare size={28} /> Compare Colleges</h1>
            <p className={styles.sub}>Select up to 3 colleges to compare side-by-side</p>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {saved && <span className="badge badge-green"><Check size={12} /> Comparison saved!</span>}
            {compareList.length >= 2 && !saved && (
              <>
                {showSave ? (
                  <div style={{ display:'flex', gap:8 }}>
                    <input className="input" style={{ width:200 }} placeholder="Name this comparison" value={compName} onChange={e=>setCompName(e.target.value)} />
                    <button className="btn btn-primary btn-sm" onClick={handleSaveComparison}>Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={()=>setShowSave(false)}>Cancel</button>
                  </div>
                ) : (
                  <button className="btn btn-secondary btn-sm" onClick={()=>setShowSave(true)}>
                    <BookmarkPlus size={13} /> Save Comparison
                  </button>
                )}
              </>
            )}
            {compareList.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={clearCompare}><X size={13} /> Clear All</button>
            )}
          </div>
        </div>

        {/* Search to add */}
        {compareList.length < 3 && (
          <div className={styles.searchBox}>
            <div className={styles.searchWrap}>
              <Search size={16} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Search and add a college to compare…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button style={{ background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',padding:'0 12px' }} onClick={()=>setSearch('')}><X size={14}/></button>}
            </div>
            {results.length > 0 && (
              <div className={styles.searchResults}>
                {results.map(c => (
                  <button key={c._id} className={styles.searchResult} onClick={() => { addToCompare(c); setSearch(''); setResults([]); }}>
                    <div>
                      <p className={styles.resultName}>{c.name}</p>
                      <p className={styles.resultSub}>{c.location.city}, {c.location.state} · {c.type}</p>
                    </div>
                    <Plus size={16} style={{ color:'var(--accent)', flexShrink:0 }} />
                  </button>
                ))}
              </div>
            )}
            {searching && <p style={{ color:'var(--text-muted)', padding:'12px 0', fontSize:'.85rem' }}>Searching…</p>}
          </div>
        )}

        {compareList.length === 0 ? (
          <div className="empty-state" style={{ marginTop:60 }}>
            <GitCompare size={56} />
            <h3>No colleges selected</h3>
            <p>Search above or use the bookmark icon on any college card to add to comparison</p>
            <Link to="/" className="btn btn-outline" style={{ marginTop:20 }}>Browse Colleges</Link>
          </div>
        ) : loading ? (
          <div className="spinner" />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.labelCol}>Feature</th>
                  {details.map(c => (
                    <th key={c._id} className={styles.collegeCol}>
                      <div className={styles.colHeader}>
                        <button className={styles.removeBtn} onClick={() => removeFromCompare(c._id)} title="Remove">
                          <X size={13} />
                        </button>
                        <img src={c.image||'https://images.unsplash.com/photo-1562774053-701939374585?w=300&q=60'} alt={c.name} className={styles.colImg} />
                        <Link to={`/colleges/${c._id}`} className={styles.colName}>{c.name}</Link>
                        <span className={`badge badge-muted`} style={{ fontSize:'.7rem' }}>{c.type}</span>
                      </div>
                    </th>
                  ))}
                  {compareList.length < 3 && (
                    <th className={styles.collegeCol}>
                      <div className={`${styles.colHeader} ${styles.addCol}`}>
                        <Plus size={28} style={{ opacity:.3 }} />
                        <p style={{ color:'var(--text-muted)', fontSize:'.8rem' }}>Add a college</p>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {ROWS.map(row => {
                  const bestIdx = getBestIdx(row, details);
                  return (
                    <tr key={row.key} className={styles.row}>
                      <td className={styles.rowLabel}>{row.label}</td>
                      {details.map((c, i) => (
                        <td key={c._id} className={`${styles.cell} ${i===bestIdx ? styles.best : ''}`}>
                          <span>{row.render(c)}</span>
                          {i===bestIdx && row.highlight && <span className={styles.bestBadge}><Check size={10} /> Best</span>}
                        </td>
                      ))}
                      {compareList.length < 3 && <td className={styles.cell} />}
                    </tr>
                  );
                })}
                <tr className={styles.row}>
                  <td className={styles.rowLabel}>Action</td>
                  {details.map(c => (
                    <td key={c._id} className={styles.cell}>
                      <Link to={`/colleges/${c._id}`} className="btn btn-outline btn-sm">View Details</Link>
                    </td>
                  ))}
                  {compareList.length < 3 && <td className={styles.cell} />}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}