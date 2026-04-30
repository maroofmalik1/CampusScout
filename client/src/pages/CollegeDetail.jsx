import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Calendar, ArrowLeft, Bookmark, BookmarkCheck, GitCompare, TrendingUp, Users, Award, ChevronRight, Building2, Send } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import styles from './CollegeDetail.module.css';

const fmt  = (n) => !n ? 'N/A' : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;
const fmtP = (n) => !n ? 'N/A' : `${(n/100000).toFixed(1)} LPA`;
const TABS = ['Overview','Courses','Placements','Reviews'];

export default function CollegeDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { user, toggleSave, isSaved }              = useAuth();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const [college, setCollege]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('Overview');
  const [review, setReview]     = useState({ author: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg]   = useState('');

  useEffect(() => {
    if (user?.name) setReview(r => ({ ...r, author: user.name }));
  }, [user]);

  useEffect(() => {
    setLoading(true);
    api.get(`/colleges/${id}`)
      .then(({ data }) => setCollege(data.college))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSave = async () => {
    if (!user) { navigate('/login'); return; }
    await toggleSave(college._id);
  };

  const handleCompare = () =>
    isInCompare(college._id) ? removeFromCompare(college._id) : addToCompare(college);

  const submitReview = async () => {
    if (!review.author || !review.comment) { setReviewMsg('Please fill all fields.'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/colleges/${id}/reviews`, review);
      setCollege(p => ({ ...p, reviews: [data.review, ...(p.reviews||[])], rating: data.rating, totalReviews: (p.totalReviews||0)+1 }));
      setReview(r => ({ ...r, comment: '' }));
      setReviewMsg('✅ Review submitted!');
      setTab('Reviews');
    } catch { setReviewMsg('❌ Failed to submit. Try again.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="page container">
      <div className="skeleton" style={{ height: 280, borderRadius: 16, marginBottom: 24 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
        </div>
        <div className="skeleton" style={{ height: 280, borderRadius: 12 }} />
      </div>
    </div>
  );
  if (!college) return null;

  const saved     = isSaved(college._id);
  const inCompare = isInCompare(college._id);

  return (
    <div className="page">
      {/* Banner */}
      <div className={styles.banner} style={{ backgroundImage: `url(${college.image || 'https://images.unsplash.com/photo-1562774053-701939374585?w=1400&q=70'})` }}>
        <div className={styles.bannerOverlay} />
        <div className={`container ${styles.bannerContent}`}>
          <button className={`btn btn-ghost btn-sm ${styles.back}`} onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Back
          </button>
          <div className={styles.badges}>
            <span className="badge badge-gold">{college.type}</span>
            {college.rankings?.nirf && <span className="badge badge-green">NIRF #{college.rankings.nirf}</span>}
            {college.rankings?.qs  && <span className="badge badge-blue">QS #{college.rankings.qs}</span>}
          </div>
          <h1 className={styles.bannerTitle}>{college.name}</h1>
          <div className={styles.bannerMeta}>
            <span><MapPin size={13} /> {college.location.city}, {college.location.state}</span>
            <span><Calendar size={13} /> Est. {college.established}</span>
            <span><Star size={13} fill="currentColor" /> {college.rating} ({college.totalReviews} reviews)</span>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Tabs row */}
        <div className={styles.tabRow}>
          <div className={styles.tabs}>
            {TABS.map(t => (
              <button key={t} className={`${styles.tab} ${tab===t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
          <div className={styles.tabActions}>
            <button className={`btn btn-secondary btn-sm ${inCompare ? 'btn-outline' : ''}`} onClick={handleCompare}>
              <GitCompare size={13} />{inCompare ? 'Remove' : 'Compare'}
            </button>
            <button className={`btn ${saved ? 'btn-outline' : 'btn-primary'} btn-sm`} onClick={handleSave}>
              {saved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        <div className={styles.layout}>
          {/* Main */}
          <div className={styles.main}>

            {/* OVERVIEW */}
            {tab === 'Overview' && (
              <div className="animate-fade">
                <div className={styles.section}>
                  <h2 className={styles.sTitle}>About</h2>
                  <p className={styles.desc}>{college.description}</p>
                </div>
                <div className={styles.statGrid}>
                  {college.placement?.placementRate && (
                    <div className={styles.statBox}>
                      <TrendingUp size={22} className={styles.si} />
                      <p className={styles.sv}>{college.placement.placementRate}%</p>
                      <p className={styles.sl}>Placement Rate</p>
                    </div>
                  )}
                  {college.placement?.averagePackage && (
                    <div className={styles.statBox}>
                      <Award size={22} className={styles.si} />
                      <p className={styles.sv}>{fmtP(college.placement.averagePackage)}</p>
                      <p className={styles.sl}>Avg Package</p>
                    </div>
                  )}
                  {college.placement?.highestPackage && (
                    <div className={styles.statBox}>
                      <Award size={22} className={styles.si} />
                      <p className={styles.sv}>{fmtP(college.placement.highestPackage)}</p>
                      <p className={styles.sl}>Highest Pkg</p>
                    </div>
                  )}
                  <div className={styles.statBox}>
                    <Users size={22} className={styles.si} />
                    <p className={styles.sv}>{fmt(college.fees.min)}</p>
                    <p className={styles.sl}>Starting Fees</p>
                  </div>
                </div>
                {college.facilities?.length > 0 && (
                  <div className={styles.section}>
                    <h2 className={styles.sTitle}>Facilities</h2>
                    <div className={styles.facilities}>
                      {college.facilities.map(f => (
                        <span key={f} className={styles.facility}><ChevronRight size={12} />{f}</span>
                      ))}
                    </div>
                  </div>
                )}
                {college.examAccepted?.length > 0 && (
                  <div className={styles.section}>
                    <h2 className={styles.sTitle}>Exams Accepted</h2>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {college.examAccepted.map(e => <span key={e} className="badge badge-blue">{e}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* COURSES */}
            {tab === 'Courses' && (
              <div className="animate-fade">
                <h2 className={styles.sTitle} style={{ marginBottom:20 }}>Courses Offered</h2>
                {college.courses?.length > 0 ? (
                  <div className={styles.table}>
                    <div className={`${styles.tRow} ${styles.tHead}`}>
                      <span>Course</span><span>Duration</span><span>Fees/yr</span><span>Seats</span>
                    </div>
                    {college.courses.map((c,i) => (
                      <div key={i} className={styles.tRow}>
                        <span className={styles.cName}>{c.name}</span>
                        <span>{c.duration||'—'}</span>
                        <span style={{ color:'var(--accent)', fontWeight:600 }}>{fmt(c.fees)}</span>
                        <span>{c.seats||'—'}</span>
                      </div>
                    ))}
                  </div>
                ) : <p style={{ color:'var(--text-muted)' }}>No course data available.</p>}
                {college.courseTags?.length > 0 && (
                  <div style={{ marginTop:20 }}>
                    <p style={{ color:'var(--text-muted)', fontSize:'.8rem', marginBottom:8 }}>Streams</p>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {college.courseTags.map(t => <span key={t} className="badge badge-muted">{t}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PLACEMENTS */}
            {tab === 'Placements' && (
              <div className="animate-fade">
                <h2 className={styles.sTitle} style={{ marginBottom:20 }}>Placement Statistics</h2>
                {college.placement ? (
                  <>
                    <div className={styles.plGrid}>
                      <div className={styles.plCard}>
                        <p className={styles.plVal}>{college.placement.placementRate||'N/A'}%</p>
                        <p className={styles.plLbl}>Placement Rate</p>
                        <div className={styles.prog}><div className={styles.progFill} style={{ width:`${college.placement.placementRate||0}%` }} /></div>
                      </div>
                      <div className={styles.plCard}>
                        <p className={styles.plVal}>{fmtP(college.placement.averagePackage)}</p>
                        <p className={styles.plLbl}>Average Package</p>
                      </div>
                      <div className={styles.plCard}>
                        <p className={styles.plVal}>{fmtP(college.placement.highestPackage)}</p>
                        <p className={styles.plLbl}>Highest Package</p>
                      </div>
                    </div>
                    {college.placement.topRecruiters?.length > 0 && (
                      <div className={styles.section}>
                        <h3 className={styles.sTitle} style={{ fontSize:'1rem' }}>Top Recruiters</h3>
                        <div className={styles.recruiters}>
                          {college.placement.topRecruiters.map(r => (
                            <div key={r} className={styles.recruiter}>
                              <Building2 size={14} /><span>{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : <p style={{ color:'var(--text-muted)' }}>Placement data not available.</p>}
              </div>
            )}

            {/* REVIEWS */}
            {tab === 'Reviews' && (
              <div className="animate-fade">
                <div className={styles.writeReview}>
                  <h3 className={styles.sTitle} style={{ fontSize:'1rem', marginBottom:14 }}>Write a Review</h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    <input className="input" placeholder="Your name" value={review.author} onChange={e => setReview(r=>({...r,author:e.target.value}))} />
                    <div>
                      <p style={{ color:'var(--text-muted)', fontSize:'.78rem', marginBottom:6 }}>Rating</p>
                      <div style={{ display:'flex', gap:4 }}>
                        {[1,2,3,4,5].map(n => (
                          <button key={n} style={{ background:'none', border:'none', cursor:'pointer', fontSize:28, color: n<=review.rating ? 'var(--accent)':'var(--border)', transition:'all .15s' }} onClick={() => setReview(r=>({...r,rating:n}))}>★</button>
                        ))}
                      </div>
                    </div>
                    <textarea className="textarea" placeholder="Share your experience…" value={review.comment} onChange={e => setReview(r=>({...r,comment:e.target.value}))} />
                    {reviewMsg && <p className={`alert ${reviewMsg.startsWith('❌') ? 'alert-error':'alert-success'}`}>{reviewMsg}</p>}
                    <button className="btn btn-primary" onClick={submitReview} disabled={submitting}>
                      <Send size={13} />{submitting ? 'Submitting…' : 'Submit Review'}
                    </button>
                  </div>
                </div>
                <div style={{ marginTop:32 }}>
                  <h3 className={styles.sTitle} style={{ fontSize:'1rem', marginBottom:16 }}>All Reviews ({college.totalReviews||0})</h3>
                  {college.reviews?.length > 0 ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                      {college.reviews.map((r,i) => (
                        <div key={i} className={styles.revCard}>
                          <div className={styles.revHead}>
                            <div className={styles.revAv}>{r.author?.[0]?.toUpperCase()}</div>
                            <div>
                              <p style={{ fontWeight:600, fontSize:'.9rem' }}>{r.author}</p>
                              <p style={{ color:'var(--text-muted)', fontSize:'.75rem' }}>{new Date(r.date).toLocaleDateString('en-IN',{year:'numeric',month:'short',day:'numeric'})}</p>
                            </div>
                            <div className="stars" style={{ marginLeft:'auto' }}>
                              {[1,2,3,4,5].map(n=><span key={n} className={`star ${n<=r.rating?'':'empty'}`}>★</span>)}
                            </div>
                          </div>
                          <p style={{ color:'var(--text-secondary)', fontSize:'.88rem', lineHeight:1.6 }}>{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state" style={{ padding:'32px 0' }}>
                      <Star size={32} /><h3>No reviews yet</h3><p>Be the first to share your experience</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={`card ${styles.sCard}`}>
              <h3 className={styles.sCardTitle}>Quick Info</h3>
              {[
                ['Type',        college.type],
                ['Established', college.established],
                ['City',        college.location.city],
                ['Rating',      `${college.rating} / 5`],
                college.rankings?.nirf && ['NIRF Rank', `#${college.rankings.nirf}`],
                college.rankings?.qs  && ['QS Rank',   `#${college.rankings.qs}`],
              ].filter(Boolean).map(([k,v]) => (
                <div key={k} className={styles.infoRow}>
                  <span className={styles.infoKey}>{k}</span>
                  <strong className={styles.infoVal}>{v}</strong>
                </div>
              ))}
            </div>
            <div className={`card ${styles.sCard}`}>
              <h3 className={styles.sCardTitle}>Fee Range</h3>
              <p className={styles.feeRange}>{fmt(college.fees.min)} – {fmt(college.fees.max)}</p>
              <p style={{ color:'var(--text-muted)', fontSize:'.75rem', marginTop:4 }}>per annum</p>
            </div>
            {college.examAccepted?.length > 0 && (
              <div className={`card ${styles.sCard}`}>
                <h3 className={styles.sCardTitle}>Exams Accepted</h3>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {college.examAccepted.map(e => <span key={e} className="badge badge-gold">{e}</span>)}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}