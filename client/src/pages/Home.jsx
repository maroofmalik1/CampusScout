import React, { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';
import api from '../utils/api';
import CollegeCard from '../components/CollegeCard';
import styles from './Home.module.css';

const SORTS = [
  { value: 'rating',    label: '⭐ Top Rated' },
  { value: 'ranking',   label: '🏆 Best Ranked' },
  { value: 'fees_asc',  label: '💰 Fees: Low → High' },
  { value: 'fees_desc', label: '💰 Fees: High → Low' },
  { value: 'name',      label: '🔤 A to Z' },
];

const QUICK_COURSES = ['Engineering', 'Management', 'Medical', 'Science', 'Arts', 'Law', 'Design'];

export default function Home() {
  const [colleges, setColleges]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showFilters, setShowFilters]   = useState(false);
  const [filterOptions, setFilterOptions] = useState({ states: [], types: [], courses: [] });
  const [pagination, setPagination]     = useState({ page: 1, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({
    search: '', state: '', course: '', type: '', sort: 'rating', feesMin: '', feesMax: '',
  });

  useEffect(() => {
    api.get('/colleges/filters').then(({ data }) => setFilterOptions(data));
  }, []);

  const fetchColleges = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 9 };
      Object.keys(params).forEach(k => { if (!params[k] && params[k] !== 0) delete params[k]; });
      const { data } = await api.get('/colleges', { params });
      setColleges(data.colleges);
      setPagination({ page: data.page, total: data.total, totalPages: data.totalPages });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(() => fetchColleges(1), 300);
    return () => clearTimeout(t);
  }, [fetchColleges]);

  const set = (key, val) => setFilters(p => ({ ...p, [key]: val }));
  const clear = () => setFilters({ search: '', state: '', course: '', type: '', sort: 'rating', feesMin: '', feesMax: '' });
  const activeCount = [filters.state, filters.course, filters.type, filters.feesMin, filters.feesMax].filter(Boolean).length;

  const Skeleton = () => (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: 180 }} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="skeleton" style={{ height: 18, width: '75%' }} />
        <div className="skeleton" style={{ height: 13, width: '45%' }} />
        <div className="skeleton" style={{ height: 13, width: '55%' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div className="skeleton" style={{ height: 52 }} />
          <div className="skeleton" style={{ height: 52 }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className="container">
          <p className={styles.tag}>🎓 India's Premier College Discovery Platform</p>
          <h1 className={styles.title}>Find Your <span className={styles.accent}>Dream College</span></h1>
          <p className={styles.sub}>Discover, compare and apply to India's best colleges — engineering, management, medical & more.</p>

          <div className={styles.searchWrap}>
            <Search size={20} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search colleges, cities, states…"
              value={filters.search}
              onChange={e => set('search', e.target.value)}
            />
            {filters.search && (
              <button className={styles.searchClear} onClick={() => set('search', '')}>
                <X size={15} />
              </button>
            )}
          </div>

          <div className={styles.quickRow}>
            {QUICK_COURSES.map(c => (
              <button
                key={c}
                className={`${styles.chip} ${filters.course === c ? styles.chipActive : ''}`}
                onClick={() => set('course', filters.course === c ? '' : c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="container">
        <div className={styles.bar}>
          <p className={styles.count}><strong>{pagination.total}</strong> colleges found</p>
          <div className={styles.barRight}>
            <select className="select" style={{ width: 'auto' }} value={filters.sort} onChange={e => set('sort', e.target.value)}>
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button className={`btn btn-secondary btn-sm ${showFilters ? 'btn-outline' : ''}`} onClick={() => setShowFilters(v => !v)}>
              <SlidersHorizontal size={14} /> Filters {activeCount > 0 && <span className={styles.filterBadge}>{activeCount}</span>}
            </button>
            {activeCount > 0 && <button className="btn btn-ghost btn-sm" onClick={clear}><X size={13} />Clear</button>}
          </div>
        </div>

        {showFilters && (
          <div className={styles.panel}>
            <div className={styles.panelGrid}>
              <div>
                <label className={styles.lbl}>State</label>
                <select className="select" value={filters.state} onChange={e => set('state', e.target.value)}>
                  <option value="">All States</option>
                  {filterOptions.states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={styles.lbl}>Course</label>
                <select className="select" value={filters.course} onChange={e => set('course', e.target.value)}>
                  <option value="">All Courses</option>
                  {filterOptions.courses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={styles.lbl}>Type</label>
                <select className="select" value={filters.type} onChange={e => set('type', e.target.value)}>
                  <option value="">All Types</option>
                  {['Government','Private','Deemed','Autonomous'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={styles.lbl}>Min Fees (₹)</label>
                <input className="input" type="number" placeholder="e.g. 100000" value={filters.feesMin} onChange={e => set('feesMin', e.target.value)} />
              </div>
              <div>
                <label className={styles.lbl}>Max Fees (₹)</label>
                <input className="input" type="number" placeholder="e.g. 500000" value={filters.feesMax} onChange={e => set('feesMax', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid-3" style={{ marginTop: 24 }}>{[...Array(9)].map((_, i) => <Skeleton key={i} />)}</div>
        ) : colleges.length === 0 ? (
          <div className="empty-state">
            <Search size={48} /><h3>No colleges found</h3><p>Try adjusting your search or filters</p>
            <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={clear}>Clear Filters</button>
          </div>
        ) : (
          <div className="grid-3 animate-fade" style={{ marginTop: 24 }}>
            {colleges.map(c => <CollegeCard key={c._id} college={c} />)}
          </div>
        )}

        {pagination.totalPages > 1 && !loading && (
          <div className={styles.pagination}>
            <button className="btn btn-secondary btn-sm" disabled={pagination.page === 1} onClick={() => fetchColleges(pagination.page - 1)}>
              <ChevronLeft size={15} /> Prev
            </button>
            <div className={styles.pages}>
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button key={i+1} className={`${styles.pg} ${pagination.page === i+1 ? styles.pgActive : ''}`} onClick={() => fetchColleges(i+1)}>
                  {i+1}
                </button>
              ))}
            </div>
            <button className="btn btn-secondary btn-sm" disabled={pagination.page === pagination.totalPages} onClick={() => fetchColleges(pagination.page + 1)}>
              Next <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}