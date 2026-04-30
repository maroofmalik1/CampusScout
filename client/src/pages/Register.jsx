import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export default function Register() {
  const [form, setForm]       = useState({ name:'', email:'', password:'' });
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { register }          = useAuth();
  const navigate              = useNavigate();

  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const pwStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6)  return { label:'Too short', color:'var(--red)',   w:'25%' };
    if (p.length < 8)  return { label:'Weak',       color:'var(--accent)',w:'50%' };
    if (p.length < 12) return { label:'Good',       color:'var(--blue)', w:'75%' };
    return               { label:'Strong',     color:'var(--green)',w:'100%' };
  };
  const strength = pwStrength();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <GraduationCap size={28} style={{ color:'var(--accent)' }} />
          <span className={styles.logoText}>campus<span style={{ color:'var(--accent)' }}>scout</span></span>
        </div>
        <h2 className={styles.title}>Create an account</h2>
        <p className={styles.sub}>Start discovering your dream college today</p>

        {error && <p className="alert alert-error">{error}</p>}

        <form onSubmit={submit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Full Name</label>
            <div className={styles.inputWrap}>
              <User size={16} className={styles.inputIcon} />
              <input
                className={`input ${styles.iconInput}`}
                type="text" placeholder="Your full name"
                value={form.name} onChange={e=>set('name',e.target.value)} required
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                className={`input ${styles.iconInput}`}
                type="email" placeholder="you@example.com"
                value={form.email} onChange={e=>set('email',e.target.value)} required
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                className={`input ${styles.iconInput}`}
                type={showPw ? 'text':'password'} placeholder="Min. 6 characters"
                value={form.password} onChange={e=>set('password',e.target.value)} required
              />
              <button type="button" className={styles.eyeBtn} onClick={()=>setShowPw(v=>!v)}>
                {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
            {strength && (
              <div style={{ marginTop:8 }}>
                <div style={{ background:'var(--bg-elevated)', height:4, borderRadius:2, overflow:'hidden' }}>
                  <div style={{ width:strength.w, height:'100%', background:strength.color, borderRadius:2, transition:'all .3s' }} />
                </div>
                <p style={{ color:strength.color, fontSize:'.72rem', marginTop:4 }}>{strength.label}</p>
              </div>
            )}
          </div>
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to="/login" className={styles.footerLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}