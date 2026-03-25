import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  Activity, FileText, AlertTriangle, Briefcase, Upload, CheckCircle,
  Star, ArrowLeft, User, Users, Calendar, ShieldCheck, RotateCcw,
  Flag, Lock, DollarSign, Zap, MessageSquare, Plus, X, Clock,
  RefreshCw, CreditCard, Send, ChevronDown, ChevronUp, Download
} from 'lucide-react';

/* ─── Status pill ─────────────────────────────────────────────────────────── */
const StatusPill = ({ status }) => {
  const cfg = {
    active:            { bg: 'bg-blue-500/15 text-blue-400 border-blue-500/25',     dot: 'bg-blue-400',    label: 'Active'           },
    work_submitted:    { bg: 'bg-amber-500/15 text-amber-400 border-amber-500/25',  dot: 'bg-amber-400',   label: 'Under Review'     },
    completed:         { bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', dot: 'bg-emerald-400', label: 'Completed'    },
    pending_escrow:    { bg: 'bg-purple-500/15 text-purple-400 border-purple-500/25', dot: 'bg-purple-400', label: 'Awaiting Escrow' },
    in_dispute:        { bg: 'bg-red-500/15 text-red-400 border-red-500/25',        dot: 'bg-red-400',     label: 'In Dispute'       },
  };
  const c = cfg[status] || { bg: 'bg-white/10 text-white/50 border-white/10', dot: 'bg-white/30', label: status };
  return (
    <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border tracking-wide ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${status === 'active' ? 'animate-pulse' : ''}`} />
      {c.label}
    </span>
  );
};

/* ─── Change Request status badge ────────────────────────────────────────── */
const CRBadge = ({ status }) => {
  const map = {
    pending_freelancer: { cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25', label: '⏳ Awaiting Freelancer' },
    accepted:           { cls: 'bg-blue-500/15 text-blue-400 border-blue-500/25',       label: '✓ Accepted' },
    counter_offered:    { cls: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/25', label: '💬 Counter Offered' },
    payment_pending:    { cls: 'bg-orange-500/15 text-orange-400 border-orange-500/25', label: '💳 Payment Required' },
    locked:             { cls: 'bg-teal-500/15 text-teal-400 border-teal-500/25',       label: '🔒 Escrow Locked' },
    revised_submitted:  { cls: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25', label: '📤 Revision Submitted' },
    approved:           { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', label: '✅ Approved & Paid' },
    rejected:           { cls: 'bg-red-500/15 text-red-400 border-red-500/25',          label: '✗ Rejected' },
  };
  const s = map[status] || { cls: 'bg-white/10 text-white/40 border-white/10', label: status };
  return <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${s.cls}`}>{s.label}</span>;
};

/* ─── Timeline step ───────────────────────────────────────────────────────── */
const TimelineStep = ({ icon: Icon, label, sublabel, done, active, isLast }) => (
  <div className="flex gap-4 relative">
    {!isLast && (
      <div className={`absolute left-4 top-9 bottom-0 w-px ${done ? 'bg-indigo-500/40' : 'bg-white/[0.06]'}`} />
    )}
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-all z-10 ${
      done    ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400' :
      active  ? 'bg-white/10 border border-white/20 text-white/60' :
                'bg-white/[0.04] border border-white/[0.06] text-white/20'
    }`}>
      {done ? <CheckCircle size={14} /> : <Icon size={14} />}
    </div>
    <div className="pb-7">
      <p className={`text-sm font-semibold ${done ? 'text-white' : active ? 'text-white/50' : 'text-white/20'}`}>{label}</p>
      {sublabel && <p className="text-xs text-white/25 font-medium mt-0.5">{sublabel}</p>}
    </div>
  </div>
);

/* ─── Info card ───────────────────────────────────────────────────────────── */
const InfoCard = ({ icon: Icon, label, value, accent }) => (
  <div className="rounded-2xl p-4 border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
    <div className="flex items-center gap-2.5 mb-3">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon size={13} />
      </div>
      <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest">{label}</p>
    </div>
    <p className="text-sm font-bold text-white leading-snug">{value}</p>
  </div>
);

/* ─── Modal shell ─────────────────────────────────────────────────────────── */
const Modal = ({ onClose, children, accentClass = 'border-white/10' }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className={`relative bg-[#0c1120] border ${accentClass} rounded-[28px] p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto`}>
      {children}
    </div>
  </div>
);

/* ─── Input helper ────────────────────────────────────────────────────────── */
const Field = ({ label, children }) => (
  <div className="mb-4">
    <label className="block text-[10px] font-black text-white/35 uppercase tracking-widest mb-2">{label}</label>
    {children}
  </div>
);
const inputCls = 'w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm font-medium placeholder-white/20 focus:outline-none focus:border-indigo-500/40 transition-colors';

/* ═══════════════ CHANGE REQUEST CARD ════════════════════════════════════════ */
const ChangeRequestCard = ({ cr, isClient, isFreelancer, onAction, loading }) => {
  const [open, setOpen] = useState(cr.status !== 'approved' && cr.status !== 'rejected');
  const [showCounter, setShowCounter] = useState(false);
  const [counterAmount, setCounterAmount] = useState('');

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${
      cr.status === 'approved' ? 'border-emerald-500/20 bg-emerald-500/5' :
      cr.status === 'rejected' ? 'border-white/5 bg-white/[0.02] opacity-50' :
      'border-amber-500/20 bg-amber-500/5'
    }`}>
      {/* Header row */}
      <button
        className="w-full flex items-center justify-between gap-3 p-5 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <RefreshCw size={14} className="text-amber-400 flex-shrink-0" />
          <span className="text-sm font-bold text-white">Change Request #{cr.id}</span>
          <CRBadge status={cr.status} />
          <span className="text-emerald-400 text-sm font-black">${Number(cr.extra_amount).toLocaleString()}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-white/30 flex-shrink-0" /> : <ChevronDown size={16} className="text-white/30 flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4">
          {/* Details */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2">
            <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Description</p>
            <p className="text-sm text-white/70 leading-relaxed">{cr.description}</p>
            <div className="flex flex-wrap gap-4 pt-2">
              {cr.deadline && (
                <div className="flex items-center gap-1.5 text-xs text-white/40">
                  <Clock size={11} /> Deadline: {new Date(cr.deadline).toLocaleDateString()}
                </div>
              )}
              {cr.extra_escrow_status && (
                <div className={`flex items-center gap-1.5 text-xs font-bold ${
                  cr.extra_escrow_status === 'RELEASED' ? 'text-emerald-400' : 'text-yellow-400'
                }`}>
                  <Lock size={11} /> Escrow: {cr.extra_escrow_status}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons based on status & role */}
          <div className="flex flex-wrap gap-2">
            {/* Freelancer: accept / reject / counter when pending */}
            {isFreelancer && cr.status === 'pending_freelancer' && !showCounter && (
              <>
                <button
                  onClick={() => onAction('reject', cr.id)}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  <X size={12} /> Reject
                </button>
                <button
                  onClick={() => setShowCounter(true)}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-fuchsia-500/10 border border-fuchsia-500/25 text-fuchsia-400 hover:bg-fuchsia-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  <RefreshCw size={12} /> Counter Offer
                </button>
                <button
                  onClick={() => onAction('accept', cr.id)}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  <CheckCircle size={12} /> Accept
                </button>
              </>
            )}
            
            {/* Freelancer: counter input */}
            {isFreelancer && cr.status === 'pending_freelancer' && showCounter && (
              <div className="flex w-full items-center gap-2 mt-2">
                <div className="relative flex-1 max-w-[200px]">
                  <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="number" min="0" step="0.01" value={counterAmount} onChange={e => setCounterAmount(e.target.value)} placeholder="New Amount" className="w-full pl-8 pr-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:border-fuchsia-500/40" />
                </div>
                <button onClick={() => { onAction('counter', cr.id, { amount: parseFloat(counterAmount||0) }); setShowCounter(false); }} className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-xl text-white font-bold text-sm shadow-lg shadow-fuchsia-500/20 disabled:opacity-50" disabled={loading || !counterAmount}>Send</button>
                <button onClick={() => setShowCounter(false)} className="px-3 py-2 text-white/50 hover:text-white font-bold text-sm" disabled={loading}>Cancel</button>
              </div>
            )}

            {/* Client: review counter offer */}
            {isClient && cr.status === 'counter_offered' && (
              <>
                <button
                  onClick={() => onAction('reject', cr.id)}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  <X size={12} /> Decline Counter
                </button>
                <button
                  onClick={() => onAction('accept-counter', cr.id)}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  <CheckCircle size={12} /> Accept Counter
                </button>
              </>
            )}

            {/* Client: pay when accepted */}
            {isClient && cr.status === 'payment_pending' && (
              <button
                onClick={() => onAction('pay', cr.id)}
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}
              >
                <CreditCard size={14} /> Deposit ${Number(cr.extra_amount).toLocaleString()}
              </button>
            )}
            {/* Freelancer: submit revision when locked */}
            {isFreelancer && cr.status === 'locked' && (
              <button
                onClick={() => onAction('submit-revision', cr.id)}
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}
              >
                <Send size={14} /> Submit Revision
              </button>
            )}
            {/* Client: approve revision */}
            {isClient && cr.status === 'revised_submitted' && (
              <button
                onClick={() => onAction('approve-revision', cr.id)}
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.25)' }}
              >
                <CheckCircle size={14} /> Approve & Release ${Number(cr.extra_amount).toLocaleString()}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
const ProjectDashboard = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [changeRequests, setCR]       = useState([]);

  const [showApproveModal, setShowApproveModal]   = useState(false);
  const [showDisputeModal, setShowDisputeModal]   = useState(false);
  const [showCRModal, setShowCRModal]             = useState(false);
  const [disputeReason, setDisputeReason]         = useState('');
  const [disputeDesc,   setDisputeDesc]           = useState('');
  const [actionLoading, setActionLoading]         = useState(false);
  const [actionError,   setActionError]           = useState('');

  // Change request form
  const [crDesc,   setCrDesc]   = useState('');
  const [crAmount, setCrAmount] = useState('');
  const [crDate,   setCrDate]   = useState('');

  const navigate = useNavigate();

  const fetchProject = async () => {
    try {
      if (user?.role === 'admin') {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data);
      } else {
        const res = await api.get('/projects');
        const found = res.data.find(p => p.project_id === parseInt(id));
        if (found) setProject(found);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchCRs = async () => {
    try {
      const res = await api.get(`/change-requests/project/${id}`);
      setCR(res.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchProject();
    fetchCRs();
  }, [id]);

  /* ── actions ── */
  const confirmApproval = async () => {
    setActionLoading(true); setActionError('');
    try {
      await api.put(`/projects/${id}/approve`);
      setShowApproveModal(false);
      await fetchProject();
      navigate(`/projects/${id}/review`);
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Approval failed.');
      setActionLoading(false);
    }
  };



  const handleSubmitDispute = async () => {
    if (!disputeReason.trim() || !disputeDesc.trim()) return;
    setActionLoading(true);
    try {
      await api.post(`/projects/${id}/dispute`, { reason: disputeReason, description: disputeDesc });
      setShowDisputeModal(false);
      await fetchProject();
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to raise dispute.');
    } finally { setActionLoading(false); }
  };

  const handleCreateCR = async () => {
    if (!crDesc.trim() || !crAmount) return;
    setActionLoading(true); setActionError('');
    try {
      await api.post('/change-requests', {
        project_id: parseInt(id),
        description: crDesc.trim(),
        extra_amount: parseFloat(crAmount),
        deadline: crDate || null,
      });
      setShowCRModal(false);
      setCrDesc(''); setCrAmount(''); setCrDate('');
      await fetchCRs();
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to create change request.');
    } finally { setActionLoading(false); }
  };

  const handleCRAction = async (action, crId, data = null) => {
    setActionLoading(true);
    try {
      if (data) {
        await api.put(`/change-requests/${crId}/${action}`, data);
      } else {
        await api.put(`/change-requests/${crId}/${action}`);
      }
      await fetchCRs();
    } catch (err) {
      alert(err.response?.data?.detail || `Action "${action}" failed.`);
    } finally { setActionLoading(false); }
  };

  /* ── loading ── */
  if (loading) return (
    <div className="min-h-screen bg-[#070e1c] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  /* ── 404 ── */
  if (!project) return (
    <div className="min-h-screen bg-[#070e1c] flex items-center justify-center flex-col gap-4 text-center px-4">
      <AlertTriangle size={40} className="text-white/20" />
      <h2 className="text-lg font-bold text-white">Project not found</h2>
      <p className="text-sm text-white/35">No project with ID #{id} was found in your account.</p>
      <Link to="/dashboard" className="mt-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
        ← Back to Dashboard
      </Link>
    </div>
  );

  const isClient     = user?.role === 'client'     && user?.user_id === project.client_id;
  const isFreelancer = user?.role === 'freelancer' && user?.user_id === project.freelancer_id;
  const isCompleted  = project.status === 'completed';
  const isPendingEscrow = project.status === 'pending_escrow';
  const isInDispute  = project.status === 'in_dispute';
  const isSubmitted  = project.status === 'work_submitted';
  const isActive     = project.status === 'active';

  // Determine if there's an active change request blocking new ones
  const activeCR = changeRequests.find(cr =>
    ['pending_freelancer','accepted','payment_pending','locked','revised_submitted'].includes(cr.status)
  );

  const steps = [
    { icon: Briefcase,  label: 'Project Created',   sublabel: project.start_date ? new Date(project.start_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : null, done: true },
    { icon: Lock,       label: 'Escrow Funded',      sublabel: 'Client deposited funds',  done: !isPendingEscrow },
    { icon: Zap,        label: 'Work In Progress',   sublabel: 'Freelancer working',      done: ['active','work_submitted','completed','in_dispute'].includes(project.status) },
    { icon: Upload,     label: 'Work Delivered',     sublabel: 'Awaiting client review',  done: ['work_submitted','completed'].includes(project.status) },
    { icon: CheckCircle,label: 'Approved & Paid',    sublabel: 'Funds released',          done: isCompleted },
  ];

  return (
    <div className="min-h-screen bg-[#070e1c] pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* back */}
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-white/35 hover:text-white transition-colors mb-8 group">
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Dashboard
        </Link>

        {/* ── HEADER CARD ── */}
        <div className="rounded-[28px] p-7 mb-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg,rgba(99,102,241,0.08),rgba(99,102,241,0.02))', border: '1px solid rgba(99,102,241,0.15)' }}
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* top row */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                  <Briefcase size={15} />
                </div>
                <p className="text-xs font-bold text-indigo-400/70 uppercase tracking-widest">Project #{project.project_id}</p>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">{project.job_title || `Job #${project.job_id}`}</h1>
              {project.job_budget && (
                <p className="text-sm text-white/35 font-semibold mt-1 flex items-center gap-1.5">
                  <DollarSign size={13} />{Number(project.job_budget).toLocaleString()} contract value
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <StatusPill status={project.status} />
              {!isPendingEscrow && (
                <Link to={`/messages/${user.role === 'client' ? project.freelancer_id : project.client_id}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border border-indigo-500/25 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors">
                  <MessageSquare size={13} /> Message
                </Link>
              )}
            </div>
          </div>

          {/* info grid */}
          <div className="grid sm:grid-cols-3 gap-3 mb-6">
            <InfoCard icon={User}     label="Client"    value={isClient ? 'You' : (project.client_name || `User #${project.client_id}`)}         accent="bg-blue-500/15 border border-blue-500/20 text-blue-400" />
            <InfoCard icon={Users}    label="Freelancer" value={isFreelancer ? 'You' : (project.freelancer_name || `User #${project.freelancer_id}`)} accent="bg-emerald-500/15 border border-emerald-500/20 text-emerald-400" />
            <InfoCard icon={Calendar} label="Started"   value={project.start_date ? new Date(project.start_date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : 'Not started yet'} accent="bg-white/10 border border-white/10 text-white/50" />
          </div>

          {/* work notes & files */}
          {(project.work_notes || (project.submitted_files && project.submitted_files.length > 0)) && (
            <div className="mb-6 rounded-2xl p-5 border border-white/[0.07] bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={14} className="text-indigo-400" />
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Delivery Notes & Files</p>
              </div>
              
              {project.work_notes && (
                  <p className="text-sm text-white/70 font-medium leading-relaxed mb-4 p-4 bg-white/[0.03] border border-white/[0.05] rounded-xl italic">
                    "{project.work_notes}"
                  </p>
              )}
              
              {project.submitted_files && project.submitted_files.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2">
                      {project.submitted_files.map((file, i) => (
                          <a 
                              key={i} 
                              href={api.defaults.baseURL + file.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/10 transition-all group w-full sm:w-fit pr-6"
                          >
                              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                  <Download className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">{file.filename}</span>
                                 <span className="text-xs text-white/40">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                              </div>
                          </a>
                      ))}
                  </div>
              )}
            </div>
          )}

          {/* ── ACTION BAR ── */}
          <div className="flex flex-wrap items-center gap-3 pt-5 border-t border-white/[0.06]">
            {/* Freelancer: submit */}
            {isFreelancer && isActive && (
              <Link to={`/projects/${project.project_id}/submit`}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
                <Upload size={14} /> Submit Delivery
              </Link>
            )}
            {/* Client: fund escrow */}
            {isClient && isPendingEscrow && (
              <Link to={`/projects/${project.project_id}/escrow`}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}>
                <Lock size={14} /> Fund Escrow
              </Link>
            )}
            {/* Client: 3 actions on submission */}
            {isClient && isSubmitted && (
              <>
                <button onClick={() => setShowDisputeModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-red-500/25 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                  <Flag size={13} /> Raise Dispute
                </button>
                {!activeCR && (
                  <button onClick={() => setShowCRModal(true)} disabled={actionLoading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-amber-500/25 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50">
                    <RotateCcw size={13} /> Request Changes
                  </button>
                )}
                <button onClick={() => setShowApproveModal(true)}
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all active:scale-95 ml-auto"
                  style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 4px 20px rgba(16,185,129,0.25)' }}>
                  <CheckCircle size={14} /> Approve & Release
                </button>
              </>
            )}
            {/* Completed: review */}
            {isCompleted && (
              <Link to={`/projects/${project.project_id}/review`}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 4px 20px rgba(245,158,11,0.25)' }}>
                <Star size={14} /> Leave a Review
              </Link>
            )}
            {/* In dispute */}
            {isInDispute && (
              <div className="flex flex-col gap-1 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 w-full mt-2">
                <div className="flex items-center gap-2 text-sm font-black text-red-400"><Flag size={14} /> Under Dispute</div>
                <p className="text-xs font-bold text-red-300">This job is currently under dispute. Admin is reviewing the case.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── CHANGE REQUESTS SECTION ── */}
        {changeRequests.length > 0 && (
          <div className="rounded-[28px] p-7 mb-5"
            style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.12)' }}>
            <div className="flex items-center gap-2.5 mb-5">
              <RefreshCw size={15} className="text-violet-400" />
              <h2 className="text-sm font-bold text-violet-400/80 uppercase tracking-widest">
                Extra Work Requests ({changeRequests.length})
              </h2>
            </div>
            <div className="space-y-3">
              {changeRequests.map(cr => (
                <ChangeRequestCard
                  key={cr.id}
                  cr={cr}
                  isClient={isClient}
                  isFreelancer={isFreelancer}
                  onAction={handleCRAction}
                  loading={actionLoading}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── TIMELINE CARD ── */}
        <div className="rounded-[28px] p-7" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5 mb-7">
            <Activity size={15} className="text-white/30" />
            <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest">Progress Timeline</h2>
          </div>
          <div>
            {steps.map((step, i) => (
              <TimelineStep key={i} icon={step.icon} label={step.label} sublabel={step.sublabel}
                done={step.done} active={!step.done && (i === 0 || steps[i - 1]?.done)} isLast={i === steps.length - 1} />
            ))}
          </div>
        </div>
      </div>

      {/* ═══ APPROVE MODAL ═══ */}
      {showApproveModal && (
        <Modal onClose={() => { setShowApproveModal(false); setActionError(''); }} accentClass="border-emerald-500/20">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5"><ShieldCheck size={22} /></div>
          <h3 className="text-xl font-black text-white mb-2 tracking-tight">Approve & Release Funds</h3>
          <p className="text-sm text-white/40 font-medium leading-relaxed mb-6">
            Confirming approval will mark this project as <span className="text-emerald-400 font-bold">complete</span> and release the escrowed funds to the freelancer.
          </p>
          {actionError && <p className="text-red-400 text-xs font-bold mb-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20">{actionError}</p>}
          <div className="flex gap-3">
            <button onClick={() => { setShowApproveModal(false); setActionError(''); }}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold text-sm rounded-xl transition-all">Cancel</button>
            <button onClick={confirmApproval} disabled={actionLoading}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
              {actionLoading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Confirm Approval
            </button>
          </div>
        </Modal>
      )}

      {/* ═══ DISPUTE MODAL ═══ */}
      {showDisputeModal && (
        <Modal onClose={() => { setShowDisputeModal(false); setActionError(''); }} accentClass="border-red-500/20">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-5"><Flag size={22} /></div>
          <h3 className="text-xl font-black text-white mb-2 tracking-tight">Raise a Dispute</h3>
          <p className="text-sm text-white/35 font-medium leading-relaxed mb-6">
            Funds will remain <span className="text-red-400 font-bold">locked</span> until the dispute is reviewed.
          </p>
          {actionError && <p className="text-red-400 text-xs font-bold mb-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20">{actionError}</p>}
          <div className="space-y-3 mb-6">
            <input type="text" placeholder="Reason (e.g. Work not delivered as agreed)" value={disputeReason}
              onChange={e => setDisputeReason(e.target.value)} className={inputCls} style={{ borderColor:'rgba(239,68,68,0.2)' }} />
            <textarea rows={4} placeholder="Describe the issue in detail..." value={disputeDesc}
              onChange={e => setDisputeDesc(e.target.value)} className={`${inputCls} resize-none`} style={{ borderColor:'rgba(239,68,68,0.2)' }} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setShowDisputeModal(false); setActionError(''); }}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold text-sm rounded-xl transition-all">Cancel</button>
            <button onClick={handleSubmitDispute} disabled={actionLoading || !disputeReason.trim() || !disputeDesc.trim()}
              className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {actionLoading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Submit Dispute
            </button>
          </div>
        </Modal>
      )}

      {/* ═══ CHANGE REQUEST MODAL ═══ */}
      {showCRModal && (
        <Modal onClose={() => { setShowCRModal(false); setActionError(''); }} accentClass="border-violet-500/20">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-5"><RefreshCw size={22} /></div>
          <h3 className="text-xl font-black text-white mb-1 tracking-tight">Request Extra Work</h3>
          <p className="text-sm text-white/35 font-medium leading-relaxed mb-6">
            Describe the additional work and set an extra payment. The freelancer must accept, and you'll deposit the amount into a separate escrow before work begins.
          </p>
          {actionError && <p className="text-red-400 text-xs font-bold mb-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20">{actionError}</p>}
          <Field label="Change Description *">
            <textarea rows={4} placeholder="Describe the additional changes or features you need..."
              value={crDesc} onChange={e => setCrDesc(e.target.value)}
              className={`${inputCls} resize-none`} style={{ borderColor: 'rgba(139,92,246,0.2)' }} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Extra Amount ($) *">
              <div className="relative">
                <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                <input type="number" min="1" step="0.01" placeholder="e.g. 150"
                  value={crAmount} onChange={e => setCrAmount(e.target.value)}
                  className={`${inputCls} pl-9`} style={{ borderColor: 'rgba(139,92,246,0.2)' }} />
              </div>
            </Field>
            <Field label="Deadline (optional)">
              <div className="relative">
                <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="date" value={crDate} onChange={e => setCrDate(e.target.value)}
                  className={`${inputCls} pl-9`} style={{ borderColor: 'rgba(139,92,246,0.2)', colorScheme:'dark' }} />
              </div>
            </Field>
          </div>
          {/* Preview */}
          {crAmount && (
            <div className="mt-2 mb-5 p-4 rounded-xl bg-violet-500/8 border border-violet-500/15">
              <p className="text-xs text-violet-400/70 font-bold uppercase tracking-widest mb-1">Payment Flow Preview</p>
              <p className="text-xs text-white/50 leading-relaxed">
                Freelancer accepts → You deposit <span className="text-violet-300 font-bold">${parseFloat(crAmount||0).toLocaleString()}</span> into separate escrow → Freelancer works → You approve → Funds released.
              </p>
            </div>
          )}
          <div className="flex gap-3 mt-2">
            <button onClick={() => { setShowCRModal(false); setActionError(''); }}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold text-sm rounded-xl transition-all">Cancel</button>
            <button onClick={handleCreateCR} disabled={actionLoading || !crDesc.trim() || !crAmount}
              className="flex-1 py-3 font-bold text-sm rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-white"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}>
              {actionLoading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              <Send size={14} /> Send Request
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProjectDashboard;
