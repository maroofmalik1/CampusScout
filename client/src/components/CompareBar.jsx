import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { X, GitCompare, Trash2 } from 'lucide-react';
import styles from './CompareBar.module.css';

export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();
  if (compareList.length === 0) return null;

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.label}><GitCompare size={15} /><span>Compare</span></div>
        <div className={styles.chips}>
          {compareList.map(c => (
            <div key={c._id} className={styles.chip}>
              <span className={styles.chipName}>{c.name}</span>
              <button className={styles.chipX} onClick={() => removeFromCompare(c._id)}><X size={11} /></button>
            </div>
          ))}
          {[...Array(3 - compareList.length)].map((_, i) => (
            <div key={i} className={`${styles.chip} ${styles.empty}`}><span>+ Add</span></div>
          ))}
        </div>
        <div className={styles.btns}>
          <button className="btn btn-ghost btn-sm" onClick={clearCompare}><Trash2 size={13} />Clear</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/compare')} disabled={compareList.length < 2}>
            Compare Now →
          </button>
        </div>
      </div>
    </div>
  );
}