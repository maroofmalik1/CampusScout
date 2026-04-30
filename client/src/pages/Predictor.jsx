import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Search, MapPin, TrendingUp, IndianRupee, Info } from 'lucide-react';
import api from '../utils/api';
import styles from './Predictor.module.css';

const EXAMS = [
  { value:'JEE Advanced', label:'JEE Advanced', max:50000,   desc:'For IITs' },
  { value:'JEE Main',     label:'JEE Main',     max:1000000, desc:'For NITs, IIITs, GFTIs' },
  { value:'CAT',          label:'CAT',          max:300000,  desc:'For IIMs & top B-schools' },
  { value:'BITSAT',       label:'BITSAT',       max:400,     desc:'For BITS campuses' },
  { value:'VITEEE',       label:'VITEEE',       max:200000,  desc:'For VIT campuses' },
  { value:'GATE',         label:'GATE',         max:1000,    desc:'For M.Tech admissions' },
  { value:'XAT',          label:'XAT',          max:100000,  desc:'For XLRI & other B-schools' },
];

const fmt   = (n) => !n ? '—' : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;
const fmtP  = (n) => !n ? '—' : `${(n/100000).toFixed(1)} LPA`;

export default function Predictor() {
  const [exam, setExam]       = useState('JEE Main');
  const [rank, setRank]       = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const selectedExam = EXAMS.find(e => e.value === exam);

  const predict = async () => {
    if (!rank || isNaN(rank) || Number(rank) < 1) { setError('Please enter a valid rank.'); return; }
    setError(''); setLoading(true); setResults(null);
    try {
      const { data } = await api.get('/colleges/predict/results', { params: { exam, rank } });
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  const getChance = (college, rankNum) => {
    const rate = college.placement?.placementRate || 80;
    if (rankNum <= 1000  && college.rating >= 4.5) return { label: 'High Chance',   color: 'var(--green)' };
    if (rankNum <= 5000  && college.rating >= 4.0) return { label: 'Good Chance',   color: 'var(--accent)' };
    if (rankNum <= 20000 && college.rating >= 3.5) return { label: 'Moderate',      color: 'var(--blue)' };
    return { label: 'Possible', color: 'var(--purple)' };
  };

  return (
    <div className="page">
      <div className="container">
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroIcon}><Sparkles size={32} /></div>
          <h1 className={styles.heroTitle}>College Predictor</h1>
          <p className={styles.heroSub}>Enter your exam and rank to discover which colleges you can get into</p>
        </div>

        {/* Form */}
        <div className={styles.formCard}>
          <div className={styles.formGrid}>
            <div>
              <label className={styles.lbl}>Select Exam</label>
              <div className={styles.examGrid}>
                {EXAMS.map(e => (
                  <button
                    key={e.value}
                    className={`${styles.examBtn} ${exam===e.value ? styles.examActive : ''}`}
                    onClick={() => setExam(e.value)}
                  >
                    <span className={styles.examName}>{e.label}</span>
                    <span className={styles.examDesc}>{e.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={styles.lbl}>Your Rank</label>
              <input
                className="input"
                type="number"
                min="1"
                max={selectedExam?.max}
                placeholder={`Enter rank (1 – ${selectedExam?.max?.toLocaleString()})`}
                value={rank}
                onChange={e => setRank(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && predict()}
                style={{ fontSize:'1.1rem', padding:'14px' }}
              />
              <p className={styles.rankHint}>
                <Info size={12} /> Rank range for {exam}: 1 – {selectedExam?.max?.toLocaleString()}
              </p>

              {error && <p className="alert alert-error" style={{ marginTop:12 }}>{error}</p>}

              <button className={`btn btn-primary ${styles.predictBtn}`} onClick={predict} disabled={loading || !rank}>
                {loading ? (
                  <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ width:16, height:16, border:'2px solid rgba(0,0,0,.3)', borderTopColor:'rgba(0,0,0,.8)', borderRadius:'50%', animation:'spin .7s linear infinite', display:'inline-block' }} />
                    Predicting…
                  </span>
                ) : <><Sparkles size={16} /> Predict My Colleges</>}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="animate-fade" style={{ marginTop:40 }}>
            <div className={styles.resultsHeader}>
              <h2 className={styles.resultsTitle}>
                Colleges for <span style={{ color:'var(--accent)' }}>{results.criteria.exam}</span> Rank <span style={{ color:'var(--accent)' }}>{Number(results.criteria.rank).toLocaleString()}</span>
              </h2>
              <p style={{ color:'var(--text-muted)', fontSize:'.85rem', marginTop:6 }}>
                {results.colleges.length} colleges found · Based on rating ≥ {results.criteria.minRating}
              </p>
            </div>

            {results.colleges.length === 0 ? (
              <div className="empty-state">
                <Search size={48} />
                <h3>No colleges found</h3>
                <p>Try a different exam or adjust your rank</p>
              </div>
            ) : (
              <div className={styles.resultsList}>
                {results.colleges.map((c, idx) => {
                  const chance = getChance(c, Number(results.criteria.rank));
                  return (
                    <Link to={`/colleges/${c._id}`} key={c._id} className={`card ${styles.resultCard}`}>
                      <div className={styles.cardRank}>#{idx + 1}</div>
                      <img
                        src={c.image||'https://images.unsplash.com/photo-1562774053-701939374585?w=300&q=60'}
                        alt={c.name} className={styles.cardImg}
                      />
                      <div className={styles.cardBody}>
                        <div style={{ display:'flex', alignItems:'flex-start', gap:10, flexWrap:'wrap' }}>
                          <h3 className={styles.cardName}>{c.name}</h3>
                          <span className={styles.chanceTag} style={{ borderColor:chance.color, color:chance.color, background:`${chance.color}15` }}>
                            {chance.label}
                          </span>
                        </div>
                        <p className={styles.cardLoc}><MapPin size={12} />{c.location.city}, {c.location.state}</p>
                        <div className={styles.cardStats}>
                          <span><IndianRupee size={12} />{fmt(c.fees?.min)}–{fmt(c.fees?.max)}/yr</span>
                          {c.placement?.averagePackage && <span><TrendingUp size={12} />{fmtP(c.placement.averagePackage)} avg pkg</span>}
                          <span>⭐ {c.rating}</span>
                          {c.rankings?.nirf && <span>NIRF #{c.rankings.nirf}</span>}
                        </div>
                        {c.courseTags?.length > 0 && (
                          <div className={styles.cardTags}>
                            {c.courseTags.slice(0,3).map(t => <span key={t} className={styles.cardTag}>{t}</span>)}
                          </div>
                        )}
                      </div>
                      <div className={styles.cardArrow}>→</div>
                    </Link>
                  );
                })}
              </div>
            )}

            <div className={styles.disclaimer}>
              <Info size={14} />
              <p>Results are based on rating and exam acceptance. Actual admission depends on seat availability, category reservations, and cut-off lists released by each institution.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}