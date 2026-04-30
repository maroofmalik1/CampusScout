import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export default function Login() {
  const [form, setForm]       = useState({ email:'', password:'' });
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const set = (k,v) => setForm(p => ({...p,[k]:v}));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <GraduationCap size={28} style={{ color:'var(--accent)' }} />
          <span className={styles.logoText}>campus<span style={{ color:'var(--accent)' }}>scout</span></span>
        </div>
        <h2 className={styles.title}>Welcome back</h2>
        <p className={styles.sub}>Sign in to your account to continue</p>

        {error && <p className="alert alert-error">{error}</p>}

        <form onSubmit={submit} className={styles.form}>
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
                type={showPw ? 'text' : 'password'} placeholder="Your password"
                value={form.password} onChange={e=>set('password',e.target.value)} required
              />
              <button type="button" className={styles.eyeBtn} onClick={()=>setShowPw(v=>!v)}>
                {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className={styles.footer}>
          Don't have an account? <Link to="/register" className={styles.footerLink}>Sign up free</Link>
        </p>
      </div>
    </div>
  );
}