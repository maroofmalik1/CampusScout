import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { GraduationCap, Menu, X, BookmarkCheck, GitCompare, LogOut, ChevronDown } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout }      = useAuth();
  const { compareList }       = useCompare();
  const navigate              = useNavigate();
  const location              = useLocation();
  const [menuOpen, setMenuOpen]       = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => { logout(); setDropdownOpen(false); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>

        <Link to="/" className={styles.logo}>
          <GraduationCap size={28} strokeWidth={1.5} />
          <span className={styles.logoText}>campus<span className={styles.logoAccent}>scout</span></span>
        </Link>

        <div className={styles.links}>
          <Link to="/"          className={`${styles.link} ${isActive('/')          ? styles.active : ''}`}>Colleges</Link>
          <Link to="/compare"   className={`${styles.link} ${isActive('/compare')   ? styles.active : ''}`}>
            Compare {compareList.length > 0 && <span className={styles.badge}>{compareList.length}</span>}
          </Link>
          <Link to="/predictor" className={`${styles.link} ${isActive('/predictor') ? styles.active : ''}`}>Predictor</Link>
        </div>

        <div className={styles.actions}>
          {compareList.length > 0 && (
            <Link to="/compare" className={`btn btn-outline btn-sm ${styles.compareBtn}`}>
              <GitCompare size={14} /> Compare ({compareList.length})
            </Link>
          )}

          {user ? (
            <div className={styles.userMenu} onMouseLeave={() => setDropdownOpen(false)}>
              <button className={styles.userBtn} onClick={() => setDropdownOpen(!dropdownOpen)} onMouseEnter={() => setDropdownOpen(true)}>
                <div className={styles.avatar}>{user.name?.[0]?.toUpperCase()}</div>
                <span className={styles.userName}>{user.name?.split(' ')[0]}</span>
                <ChevronDown size={14} />
              </button>
              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <p className={styles.dropdownName}>{user.name}</p>
                    <p className={styles.dropdownEmail}>{user.email}</p>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <Link to="/saved" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <BookmarkCheck size={15} /> Saved Colleges
                  </Link>
                  <button className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>
                    <LogOut size={15} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authBtns}>
              <Link to="/login"    className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          <button className={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/"          className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Colleges</Link>
          <Link to="/compare"   className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Compare {compareList.length > 0 && `(${compareList.length})`}</Link>
          <Link to="/predictor" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Predictor</Link>
          {user ? (
            <>
              <Link to="/saved" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Saved Colleges</Link>
              <button className={styles.mobileLink} onClick={() => { handleLogout(); setMenuOpen(false); }}>Log Out</button>
            </>
          ) : (
            <>
              <Link to="/login"    className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}