import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bookmark, BookmarkCheck, GitCompare, IndianRupee, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import styles from './CollegeCard.module.css';

const fmt = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;

const TYPE_COLORS = { Government: 'badge-green', Private: 'badge-blue', Deemed: 'badge-gold', Autonomous: 'badge-purple' };

export default function CollegeCard({ college }) {
  const { user, toggleSave, isSaved }              = useAuth();
  const { addToCompare, removeFromCompare, isInCompare, compareList } = useCompare();
  const saved     = isSaved(college._id);
  const inCompare = isInCompare(college._id);
  const canAdd    = !inCompare && compareList.length < 3;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) { window.location.href = '/login'; return; }
    await toggleSave(college._id);
  };

  const handleCompare = (e) => {
    e.preventDefault();
    inCompare ? removeFromCompare(college._id) : addToCompare(college);
  };

  return (
    <Link to={`/colleges/${college._id}`} className={`${styles.card} card`}>
      <div className={styles.imageWrap}>
        <img
          src={college.image || 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=70'}
          alt={college.name}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.overlay} />
        <div className={styles.topLeft}>
          <span className={`badge ${TYPE_COLORS[college.type] || 'badge-muted'}`}>{college.type}</span>
          {college.rankings?.nirf && <span className="badge badge-gold">NIRF #{college.rankings.nirf}</span>}
        </div>
        <div className={styles.topRight}>
          <button className={`${styles.iconBtn} ${saved ? styles.saved : ''}`} onClick={handleSave} title={saved ? 'Unsave' : 'Save'}>
            {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
          </button>
          <button
            className={`${styles.iconBtn} ${inCompare ? styles.inCompare : ''} ${!canAdd && !inCompare ? styles.disabled : ''}`}
            onClick={handleCompare}
            title={inCompare ? 'Remove from compare' : compareList.length >= 3 ? 'Compare list full (max 3)' : 'Add to compare'}
          >
            <GitCompare size={15} />
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{college.name}</h3>
        <p className={styles.loc}><MapPin size={12} />{college.location.city}, {college.location.state}</p>

        <div className={styles.rating}>
          {[1,2,3,4,5].map(i => (
            <span key={i} className={`star ${i <= Math.round(college.rating) ? '' : 'empty'}`}>★</span>
          ))}
          <span className={styles.ratingNum}>{college.rating}</span>
          <span className={styles.ratingCount}>({college.totalReviews || 0})</span>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <IndianRupee size={13} style={{ color: 'var(--accent)' }} />
            <div>
              <p className={styles.statLbl}>Fees/yr</p>
              <p className={styles.statVal}>{fmt(college.fees.min)}–{fmt(college.fees.max)}</p>
            </div>
          </div>
          {college.placement?.averagePackage && (
            <div className={styles.stat}>
              <TrendingUp size={13} style={{ color: 'var(--green)' }} />
              <div>
                <p className={styles.statLbl}>Avg Pkg</p>
                <p className={styles.statVal}>{fmt(college.placement.averagePackage)} LPA</p>
              </div>
            </div>
          )}
        </div>

        {college.courseTags?.length > 0 && (
          <div className={styles.tags}>
            {college.courseTags.slice(0, 3).map(t => <span key={t} className={styles.tag}>{t}</span>)}
            {college.courseTags.length > 3 && <span className={styles.tag}>+{college.courseTags.length - 3}</span>}
          </div>
        )}
      </div>
    </Link>
  );
}