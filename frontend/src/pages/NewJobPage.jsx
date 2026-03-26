import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import {
  FileText, Tag, ArrowRight, CheckCircle, ArrowLeft,
  Briefcase, DollarSign, Calendar, AlertCircle, Sparkles,
  Zap, Globe, Users, Clock
} from 'lucide-react';
import PageBackground from '../components/PageBackground';

/* ── keyframes ── */
const STYLES = `
@keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes spinR    { to{transform:rotate(360deg)} }
@keyframes shimmer  { from{transform:translateX(-100%) skewX(-12deg)} to{transform:translateX(220%) skewX(-12deg)} }
`;

const CATEGORIES = [
  'Web Development', 'UI/UX Design', 'Mobile Apps', 'AI & Machine Learning',
  'Data Science', 'Content Writing', 'Digital Marketing', 'Cybersecurity',
  'Backend Development', 'DevOps', 'Blockchain', 'Video Editing',
];

/* ── shared input style ── */
const iBase = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 12,
  color: '#fff',
  width: '100%',
  outline: 'none',
  transition: 'all .2s ease',
  fontSize: 14,
  fontWeight: 500,
};
const focusIn = e => { e.target.style.border = '1px solid rgba(99,102,241,0.55)'; e.target.style.background = 'rgba(99,102,241,0.06)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.10)'; };
const focusOut = e => { e.target.style.border = '1px solid rgba(255,255,255,0.10)'; e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.boxShadow = 'none'; };
const focusErr = e => { e.target.style.border = '1px solid rgba(239,68,68,0.50)'; e.target.style.background = 'rgba(239,68,68,0.05)'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.08)'; };

const LABEL = {
  fontSize: 11, fontWeight: 700, letterSpacing: '.12em',
  textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
  display: 'block', marginBottom: 8,
};
const ERR = ({ msg }) => msg ? (
  <p style={{ fontSize: 12, color: '#f87171', fontWeight: 500, marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
    <AlertCircle size={12} /> {msg}
  </p>
) : null;

/* ── Step pills ── */
const STEPS = [
  { num: 1, label: 'Gig Details' },
  { num: 2, label: 'Budget & Deadline' },
];

const NewJobPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    category: '',
    experience_level: 'any',
    skills: '',
    max_proposals: 40,
  });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);

  const SUGGESTED_SKILLS = [
    // Frontend
    'React', 'Next.js', 'Vue.js', 'Angular', 'JavaScript', 'TypeScript', 'HTML/CSS', 'Tailwind CSS',
    // Backend
    'Node.js', 'Python', 'PHP', 'Java', 'Django', 'MongoDB', 'PostgreSQL', 'MySQL',
    // Mobile & DevOps
    'Flutter', 'React Native', 'Android', 'iOS', 'AWS', 'Docker', 'Git',
    // Design & Tools
    'Figma', 'UI/UX Design', 'Graphic Design', 'WordPress',
    // Non-tech
    'SEO', 'Copywriting', 'Content Writing', 'Social Media', 'Video Editing',
  ];

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed || selectedSkills.includes(trimmed)) return;
    const updated = [...selectedSkills, trimmed];
    setSelectedSkills(updated);
    setFormData(prev => ({ ...prev, skills: updated.join(', ') }));
  };

  const removeSkill = (skill) => {
    const updated = selectedSkills.filter(s => s !== skill);
    setSelectedSkills(updated);
    setFormData(prev => ({ ...prev, skills: updated.join(', ') }));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(skillInput);
      setSkillInput('');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateStep1 = () => {
    const errs = {};
    if (!formData.title || formData.title.length < 10)
      errs.title = 'Title must be at least 10 characters.';
    if (!formData.description || formData.description.length < 50)
      errs.description = 'Please provide a detailed description (at least 50 characters).';
    return errs;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!formData.budget || parseFloat(formData.budget) <= 0)
      errs.budget = 'Please enter a valid budget.';
    if (!formData.deadline)
      errs.deadline = 'Please select a deadline.';
    const today = new Date().toISOString().split('T')[0];
    if (formData.deadline && formData.deadline <= today)
      errs.deadline = 'Deadline must be in the future.';
    return errs;
  };

  const handleNext = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        budget: parseFloat(formData.budget),
        deadline: formData.deadline,
        category: formData.category,
        experience_level: formData.experience_level,
        max_proposals: formData.max_proposals,
      };
      await api.post('/jobs', payload);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1600);
    } catch (err) {
      setErrors({ general: err.response?.data?.detail || 'Error posting job. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="min-h-screen pt-24 pb-20 relative">
      <style>{STYLES}</style>
      <PageBackground variant="dark" />

      <div className="max-w-[760px] mx-auto px-4 relative z-10">

        {/* Back */}
        <Link to="/dashboard"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.38)', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 28, transition: 'color .2s' }}
          onMouseOver={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
          onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}>
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-center gap-5 mb-10" style={{ animation: 'fadeUp .5s ease' }}>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20 flex-shrink-0">
            <Briefcase size={26} color="#fff" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter leading-none mb-2 uppercase">Create Gig</h1>
            <p className="text-white/40 text-[13px] font-bold uppercase tracking-[0.2em]">Build your dream team today</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-10" style={{ animation: 'fadeUp .5s ease .05s both' }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all duration-500 ${step >= s.num ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 scale-110' : 'bg-white/5 text-white/20 border border-white/10'
                  }`}>
                  {step > s.num ? <CheckCircle size={18} /> : s.num}
                </div>
                <span className={`text-xs font-black uppercase tracking-[0.2em] transition-colors duration-500 ${step >= s.num ? 'text-white' : 'text-white/20'}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-6 rounded-full transition-all duration-700 ${step > s.num ? 'bg-gradient-to-r from-indigo-500 to-emerald-500 opacity-40' : 'bg-white/10'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── MAIN CARD ── */}
        <div style={{
          background: 'rgba(255,255,255,0.033)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 24, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.50)',
          overflow: 'hidden', animation: 'fadeUp .5s ease .1s both',
        }}>
          {/* ── SUCCESS ── */}
          {success ? (
            <div className="p-20 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full -mr-16 -mt-16" />
              <div className="w-20 h-20 rounded-[28px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8 shadow-2xl scale-110">
                <CheckCircle size={40} className="text-emerald-400" />
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Gig Launched!</h2>
              <p className="text-white/40 text-sm font-bold uppercase tracking-[0.2em]">Preparing your dashboard now…</p>
            </div>
          ) : (
            <div style={{ padding: '34px 36px 36px' }}>

              {/* General error */}
              {errors.general && (
                <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.22)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                  <AlertCircle size={15} color="#f87171" style={{ flexShrink: 0 }} />
                  <p style={{ color: '#f87171', fontSize: 13, fontWeight: 500, margin: 0 }}>{errors.general}</p>
                </div>
              )}

              {/* ════ STEP 1 ════ */}
              {step === 1 && (
                <div style={{ animation: 'fadeUp .4s ease' }}>
                  {/* Title */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={LABEL}>Gig Title <span style={{ color: '#f87171' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <FileText size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.20)', pointerEvents: 'none' }} />
                      <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Build a React dashboard with authentication"
                        style={{ ...iBase, padding: '13px 16px 13px 42px' }}
                        onFocus={errors.title ? focusErr : focusIn}
                        onBlur={focusOut}
                      />
                    </div>
                    <ERR msg={errors.title} />
                  </div>

                  {/* Category */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={LABEL}>Category</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                      {CATEGORIES.map(cat => (
                        <button key={cat} type="button"
                          onClick={() => setFormData({ ...formData, category: cat })}
                          style={{
                            padding: '10px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                            textAlign: 'center', cursor: 'pointer', transition: 'all .2s',
                            background: formData.category === cat ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.04)',
                            border: formData.category === cat ? '1px solid rgba(99,102,241,0.52)' : '1px solid rgba(255,255,255,0.08)',
                            color: formData.category === cat ? '#a5b4fc' : 'rgba(255,255,255,0.48)',
                          }}
                          onMouseOver={e => { if (formData.category !== cat) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.72)'; } }}
                          onMouseOut={e => { if (formData.category !== cat) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.48)'; } }}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label style={{ ...LABEL, marginBottom: 0 }}>Description <span style={{ color: '#f87171' }}>*</span></label>
                      <span style={{ fontSize: 11, color: formData.description.length >= 50 ? '#34d399' : 'rgba(255,255,255,0.25)' }}>
                        {formData.description.length} / 50+ chars
                      </span>
                    </div>
                    <textarea
                      name="description"
                      rows={5}
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your project in detail — what you need, what success looks like, any technical requirements, and the expected outcome…"
                      style={{ ...iBase, padding: '14px 16px', resize: 'vertical', lineHeight: 1.65 }}
                      onFocus={errors.description ? focusErr : focusIn}
                      onBlur={focusOut}
                    />
                    <ERR msg={errors.description} />
                  </div>

                  {/* Skills */}
                  <div style={{ marginBottom: 8 }}>
                    <label style={LABEL}>Required Skills <span style={{ color: 'rgba(255,255,255,0.26)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>

                    {/* Selected skill tags */}
                    {selectedSkills.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                        {selectedSkills.map(skill => (
                          <span key={skill} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '5px 10px', borderRadius: 20,
                            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)',
                            color: '#a5b4fc', fontSize: 12, fontWeight: 600,
                          }}>
                            {skill}
                            <button type="button" onClick={() => removeSkill(skill)} style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: 'rgba(165,180,252,0.6)', padding: 0, lineHeight: 1,
                              fontSize: 14, display: 'flex', alignItems: 'center',
                            }}>×</button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Type and add custom skill */}
                    <div style={{ position: 'relative', marginBottom: 10 }}>
                      <Tag size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.20)', pointerEvents: 'none' }} />
                      <input
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillKeyDown}
                        placeholder='Type a skill and press Enter to add…'
                        style={{ ...iBase, padding: '13px 16px 13px 42px' }}
                        onFocus={focusIn} onBlur={e => { focusOut(e); if (skillInput.trim()) { addSkill(skillInput); setSkillInput(''); } }}
                      />
                    </div>

                    {/* Suggested chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {SUGGESTED_SKILLS.filter(s => !selectedSkills.includes(s)).map(skill => (
                        <button key={skill} type="button"
                          onClick={() => addSkill(skill)}
                          style={{
                            padding: '5px 11px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                            cursor: 'pointer', transition: 'all .18s',
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                            color: 'rgba(255,255,255,0.45)',
                          }}
                          onMouseOver={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; e.currentTarget.style.color = '#a5b4fc'; }}
                          onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                        >
                          + {skill}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Next button */}
                  <button type="button" onClick={handleNext}
                    className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl text-white font-black uppercase tracking-[0.2em] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group/next mt-10"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 10px 30px rgba(99,102,241,0.3)', fontSize: '12px' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 15px 40px rgba(99,102,241,0.5)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 10px 30px rgba(99,102,241,0.3)'}
                  >
                    <span className="absolute inset-0 translate-x-[-100%] group-hover/next:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
                    Step Forward <ArrowRight size={18} className="group-hover/next:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              {/* ════ STEP 2 ════ */}
              {step === 2 && (
                <form onSubmit={handleSubmit} noValidate style={{ animation: 'fadeUp .4s ease' }}>
                  {/* Budget + Deadline row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div>
                      <label style={LABEL}>Budget (USD) <span style={{ color: '#f87171' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <DollarSign size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#34d399', pointerEvents: 'none' }} />
                        <input
                          name="budget"
                          type="number"
                          min="1"
                          step="1"
                          value={formData.budget}
                          onChange={handleChange}
                          placeholder="e.g. 1500"
                          style={{ ...iBase, padding: '13px 16px 13px 42px' }}
                          onFocus={errors.budget ? focusErr : focusIn}
                          onBlur={focusOut}
                        />
                      </div>
                      <ERR msg={errors.budget} />
                    </div>

                    <div>
                      <label style={LABEL}>Deadline <span style={{ color: '#f87171' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <Calendar size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.22)', pointerEvents: 'none' }} />
                        <input
                          name="deadline"
                          type="date"
                          min={minDateStr}
                          value={formData.deadline}
                          onChange={handleChange}
                          style={{ ...iBase, padding: '13px 16px 13px 42px', colorScheme: 'dark' }}
                          onFocus={errors.deadline ? focusErr : focusIn}
                          onBlur={focusOut}
                        />
                      </div>
                      <ERR msg={errors.deadline} />
                    </div>
                  </div>

                  {/* Experience level */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={LABEL}>Freelancer Experience Level</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                      {[
                        { value: 'entry', label: 'Entry Level', desc: 'Learning & growing', icon: '🌱' },
                        { value: 'intermediate', label: 'Intermediate', desc: 'Some experience', icon: '⚡' },
                        { value: 'expert', label: 'Expert', desc: 'Top professionals', icon: '🏆' },
                      ].map(lvl => (
                        <button key={lvl.value} type="button"
                          onClick={() => setFormData({ ...formData, experience_level: lvl.value })}
                          style={{
                            padding: '14px 10px', borderRadius: 12, textAlign: 'center', cursor: 'pointer',
                            transition: 'all .2s',
                            background: formData.experience_level === lvl.value ? 'rgba(99,102,241,0.16)' : 'rgba(255,255,255,0.04)',
                            border: formData.experience_level === lvl.value ? '1px solid rgba(99,102,241,0.50)' : '1px solid rgba(255,255,255,0.08)',
                          }}>
                          <div style={{ fontSize: 18, marginBottom: 5 }}>{lvl.icon}</div>
                          <p style={{ color: formData.experience_level === lvl.value ? '#a5b4fc' : 'rgba(255,255,255,0.65)', fontWeight: 700, fontSize: 12, margin: '0 0 2px' }}>{lvl.label}</p>
                          <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, margin: 0 }}>{lvl.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Max Proposals */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label style={{ ...LABEL, marginBottom: 0 }}>Proposal Limit</label>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#a5b4fc' }}>
                        {formData.max_proposals} max
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={formData.max_proposals}
                      onChange={e => setFormData({ ...formData, max_proposals: Number(e.target.value) })}
                      style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer', height: 6 }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>10 (strict)</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>100 (open)</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)', marginTop: 6 }}>
                      Applications will be blocked once this limit is reached. Prevents proposal spam.
                    </p>
                  </div>

                  {/* Gig summary preview */}
                  <div style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 22 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>Gig Summary</p>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: 14, margin: 0, flex: 1 }}>{formData.title || '—'}</p>
                      {formData.category && (
                        <span style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.22)', color: '#a5b4fc', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{formData.category}</span>
                      )}
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.50)', fontSize: 13, margin: 0, lineHeight: 1.55 }}>
                      {formData.description.slice(0, 120)}{formData.description.length > 120 ? '…' : ''}
                    </p>
                  </div>

                  {/* Trust badges */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9, marginBottom: 26 }}>
                    {[
                      { icon: <Zap size={13} color="#fbbf24" />, text: 'Goes live instantly', sub: 'Post → visible now' },
                      { icon: <Globe size={13} color="#60a5fa" />, text: 'Global freelancers', sub: '50K+ professionals' },
                      { icon: <Users size={13} color="#a78bfa" />, text: 'Smart matching', sub: 'AI-powered picks' },
                    ].map(b => (
                      <div key={b.text} style={{ padding: '11px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
                        <div style={{ marginBottom: 4 }}>{b.icon}</div>
                        <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 11, fontWeight: 600, margin: '0 0 2px' }}>{b.text}</p>
                        <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, margin: 0 }}>{b.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-4 mt-10">
                    <button type="button" onClick={() => setStep(1)}
                      className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all duration-300 text-[11px]"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>

                    <button type="submit" disabled={loading}
                      className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-black uppercase tracking-[0.2em] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group/submit"
                      style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)', boxShadow: '0 10px 30px rgba(99,102,241,0.3)', fontSize: '12px', opacity: loading ? 0.7 : 1 }}
                      onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 15px 40px rgba(99,102,241,0.5)'; }}
                      onMouseLeave={e => { if (!loading) e.currentTarget.style.boxShadow = '0 10px 30px rgba(99,102,241,0.3)'; }}
                    >
                      <span className="absolute inset-0 translate-x-[-100%] group-hover/submit:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
                      {loading
                        ? <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Publishing…</>
                        : <><CheckCircle size={18} /> Publish Project</>
                      }
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}
        </div>

        {/* Pro tip */}
        {!success && step === 1 && (
          <div style={{ marginTop: 18, padding: '13px 16px', borderRadius: 12, background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)', display: 'flex', alignItems: 'flex-start', gap: 11, animation: 'fadeUp .5s ease .2s both' }}>
            <Sparkles size={14} color="#60a5fa" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ color: 'rgba(96,165,250,0.78)', fontSize: 12, fontWeight: 500, margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: '#60a5fa' }}>Pro tip:</strong> Gigs with detailed descriptions and a clear scope receive up to 3× more quality proposals. Include your tech stack, deliverables, and timeline expectations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewJobPage;