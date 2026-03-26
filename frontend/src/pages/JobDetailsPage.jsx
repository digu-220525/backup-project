import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
  CheckCircle, XCircle, Send, Star, Briefcase, AlertTriangle, 
  ArrowLeft, User, Calendar, DollarSign, MessageSquare
} from 'lucide-react';
import PageBackground from '../components/PageBackground';

const STYLES = `
@keyframes fadeUp {
  0% { opacity: 0; transform: translateY(15px); }
  100% { opacity: 1; transform: translateY(0); }
}
`;

const BidCard = ({ bid, onAccept, isJobOpen, jobOwnerId, currentUserId, userMap }) => {
  const isOwner = currentUserId === jobOwnerId;
  const colors = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-violet-600',
    'from-pink-500 to-rose-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-blue-600',
  ];
  const colorClass = colors[bid.freelancer_id % colors.length];

  return (
    <div className={`bg-white/[0.02] backdrop-blur-xl rounded-[24px] border transition-all duration-300 relative group mb-5 overflow-hidden ${bid.status === 'accepted' ? 'border-emerald-500/40 shadow-[0_20px_50px_rgba(16,185,129,0.12)]' : 'border-white/[0.08] hover:bg-white/[0.04] hover:border-white/[0.15]'}`}>
      {/* Subtle hover glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="p-6 sm:p-8">
        {/* Header row: avatar + name + budget */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
          {/* Left: avatar + name + metrics */}
          <div className="flex items-start gap-5">
            <div className={`w-14 h-14 bg-gradient-to-br ${colorClass} rounded-[18px] flex items-center justify-center text-white font-black text-xl shadow-xl flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
              {userMap?.[bid.freelancer_id]?.name?.charAt(0) || String(bid.freelancer_id).charAt(0)}
            </div>
            <div>
              {/* Name + badge row */}
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-bold text-white text-xl tracking-tight group-hover:text-indigo-300 transition-colors">
                  {userMap?.[bid.freelancer_id]?.name || `Freelancer #${bid.freelancer_id}`}
                </h4>
                {bid._badge === 'Top Match' && (
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    Top Match
                  </span>
                )}
                {bid._badge === 'Recommended' && (
                  <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                    Recommended
                  </span>
                )}
              </div>
              {/* Metric pills */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-[10px] font-black text-white/80 tracking-wide">
                    {Number(bid._stats?.rating || 3).toFixed(1)} <span className="text-white/40">Rating</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  <span className="text-[10px] font-black text-white/80 tracking-wide">
                    {Number((bid._stats?.successRate || 0) * 100).toFixed(0)}% <span className="text-white/40">Success</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  <span className="text-[10px] font-black text-white/80 tracking-wide">
                    {bid._stats?.completedProjects || 0} <span className="text-white/40">Projects</span>
                  </span>
                </div>
                {bid._stats?.hourlyRate > 0 && (
                  <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                    <DollarSign className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] font-black text-white/80 tracking-wide">
                      {bid._stats.hourlyRate}/hr <span className="text-white/40">Rate</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: bid amount + score */}
          <div className="sm:text-right flex-shrink-0">
            <div className="text-3xl font-black text-white tracking-tighter">${Number(bid.bid_amount || 0).toLocaleString()}</div>
            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">Proposed Budget</div>
            <div className="text-[10px] font-black text-white/40 tracking-widest mt-1">
              Score: {Number((bid._stats?.finalScore || 0) * 100).toFixed(1)}
            </div>
          </div>
        </div>

        {/* Cover letter */}
        <div className="bg-white/[0.02] rounded-2xl p-6 mb-8 border border-white/[0.05] relative overflow-hidden group/letter">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-[30px] rounded-full -mr-12 -mt-12 pointer-events-none" />
          <h5 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Cover Letter</h5>
          <p className="text-[15px] text-slate-300 leading-relaxed font-medium relative z-10">
            {bid.proposal_text || 'No cover letter provided.'}
          </p>
        </div>

        {/* Footer: status badge + actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-[0.15em] ${
            bid.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' :
            bid.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
            'bg-white/5 text-slate-400 border-white/10'
          }`}>
            {bid.status === 'accepted' && <CheckCircle className="w-4 h-4" />}
            {bid.status === 'accepted' ? 'Awarded' : bid.status === 'rejected' ? 'Declined' : 'Pending Review'}
          </div>

          {isOwner && isJobOpen && bid.status === 'pending' && (
            <button
              onClick={() => onAccept(bid.bid_id)}
              className="flex items-center gap-2.5 bg-white text-black hover:bg-slate-100 text-sm font-bold px-7 py-3 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97] shadow-xl shadow-white/5"
            >
              <CheckCircle className="w-4 h-4" />
              Accept Proposal
            </button>
          )}

          {bid.status === 'accepted' && bid.project_id && (
            <Link
              to={`/messages/${bid.freelancer_id}`}
              className="flex items-center gap-2.5 text-white text-sm font-bold px-7 py-3 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97] hover:brightness-110"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.32)' }}
            >
              <MessageSquare className="w-4 h-4" />
              Quick Chat
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const JobDetailsPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [bids, setBids] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const jobRes = await api.get(`/jobs/${id}`);
        setJob(jobRes.data);
        const bidsRes = await api.get(`/bids/job/${id}`);
        setBids(bidsRes.data);
        
        const usersRes = await api.get('/auth/users').catch(() => null);
        if (usersRes?.data) {
          const map = {};
          usersRes.data.forEach(u => map[u.user_id] = u);
          setUserMap(map);
        }

        if (user?.role === 'client' && user?.user_id === jobRes.data.client_id) {
          api.post(`/bids/job/${id}/read-all`).catch(() => {});
        }

        // Fetch projects to find the one associated with this gig
        const projectsRes = await api.get('/projects').catch(() => ({ data: [] }));
        const jobProject = projectsRes.data.find(p => p.job_id === parseInt(id));
        if (jobProject) {
          setBids(prev => prev.map(b => b.status === 'accepted' ? { ...b, project_id: jobProject.project_id } : b));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
    const interval = setInterval(fetchJobData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [id, user]);

  // ── Ranking algorithm (must be before early returns to obey Rules of Hooks) ──
  const rankedBids = useMemo(() => {
    if (!bids.length) return [];

    // ── Global normalisers ──────────────────────────────────────────────────
    const validProjects = bids.map(b => userMap[b.freelancer_id]?.projects_done || 0);
    const maxCompletedProjects = Math.max(...validProjects, 1);

    const validBidAmounts = bids.map(b => Number(b.bid_amount)).filter(v => v > 0);
    const lowestBidAmount = validBidAmounts.length > 0 ? Math.min(...validBidAmounts) : 1;

    const validHourlyRates = bids
      .map(b => Number(userMap[b.freelancer_id]?.hourly_rate || 0))
      .filter(v => v > 0);
    const minHourlyRate = validHourlyRates.length > 0 ? Math.min(...validHourlyRates) : null;

    // ── Score each bid ──────────────────────────────────────────────────────
    const scoredBids = bids.map(bid => {
      const freelancer = userMap[bid.freelancer_id] || {};
      const rating = freelancer.rating || 3;                     // default 3/5 if missing
      const completedProjects = freelancer.projects_done || 0;
      const totalProposals = freelancer.proposals_given || 0;
      const freelancerBid = Number(bid.bid_amount) || lowestBidAmount;
      const hourlyRate = Number(freelancer.hourly_rate || 0);

      const ratingScore     = rating / 5;
      const successRate     = totalProposals > 0 ? completedProjects / totalProposals : 0;
      const projectsScore   = completedProjects / maxCompletedProjects;
      const priceScore      = freelancerBid > 0 ? lowestBidAmount / freelancerBid : 0;
      // Lower hourly rate = higher score; if no rate set use neutral 0.5
      const hourlyRateScore = (minHourlyRate && hourlyRate > 0) ? minHourlyRate / hourlyRate : 0.5;

      // Weights: rating 35%, success 25%, projects 15%, bid price 15%, hourly rate 10%
      const finalScore =
        0.35 * ratingScore +
        0.25 * successRate +
        0.15 * projectsScore +
        0.15 * priceScore +
        0.10 * hourlyRateScore;

      return {
        ...bid,
        _stats: { rating, completedProjects, totalProposals, successRate, finalScore, hourlyRate },
      };
    });

    // ── Sort: primary = finalScore desc, tie-break 1 = bid_amount asc, tie-break 2 = bid_id asc ──
    scoredBids.sort((a, b) => {
      const scoreDiff = b._stats.finalScore - a._stats.finalScore;
      if (Math.abs(scoreDiff) > 0.0001) return scoreDiff;          // different scores
      const bidDiff = Number(a.bid_amount) - Number(b.bid_amount); // lower bid wins tie
      if (bidDiff !== 0) return bidDiff;
      return a.bid_id - b.bid_id;                                   // earlier proposal wins
    });

    return scoredBids.map((bid, index) => ({
      ...bid,
      _badge: index === 0 ? 'Top Match' : (index <= 3 && scoredBids.length >= 2 ? 'Recommended' : null),
    }));
  }, [bids, userMap]);

  const handleAcceptBid = async (bidId) => {
    try {
      await api.put(`/bids/${bidId}/accept`);
      const res = await api.post(`/projects`, { job_id: job.job_id });
      navigate(`/projects/${res.data.project_id}/escrow`);
    } catch (err) {
      alert(err.response?.data?.detail || 'Error accepting bid');
      // If the bid was withdrawn, gracefully remove it from the list so the client isn't blocked.
      if (err.response?.status === 404 || err.response?.data?.detail?.includes('withdrawn')) {
        setBids(prev => prev.filter(b => b.bid_id !== bidId));
      }
    }
  };

  const [withdrawing, setWithdrawing] = useState(false);
  const handleWithdraw = async () => {
    const myBid = bids.find(b => b.freelancer_id === user?.user_id);
    if (!myBid || myBid.status !== 'pending') return;
    if (!window.confirm('Withdraw your proposal? This cannot be undone.')) return;
    setWithdrawing(true);
    try {
      await api.delete(`/bids/${myBid.bid_id}`);
      setBids(prev => prev.filter(b => b.bid_id !== myBid.bid_id));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to withdraw proposal.');
    } finally {
      setWithdrawing(false);
    }
  };

  const [limitEdit, setLimitEdit] = useState(null);
  const [savingLimit, setSavingLimit] = useState(false);
  const handleSaveLimit = async () => {
    const val = parseInt(limitEdit, 10);
    if (!val || val < 1) return;
    setSavingLimit(true);
    try {
      const res = await api.patch(`/jobs/${job.job_id}`, { max_proposals: val });
      setJob(res.data);
      setLimitEdit(null);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update limit.');
    } finally {
      setSavingLimit(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-24 relative bg-[#070e1c]">
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/5 rounded w-24"></div>
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
            <div className="h-8 bg-white/10 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-white/10 rounded w-1/2 mb-8"></div>
            <div className="h-24 bg-white/10 rounded w-full mb-4"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!gig) return (
    <div className="min-h-screen pt-24 relative flex items-center justify-center bg-[#070e1c]">
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-white/30 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-300">Gig not found</h2>
        <Link to="/gigs" className="text-indigo-400 hover:text-indigo-300 font-medium mt-2 inline-block">← Back to gigs</Link>
      </div>
    </div>
  );

  const isClientOwner = user?.role === 'client' && user?.user_id === job.client_id;
  const isFreelancer = user?.role === 'freelancer';
  const hasBid = bids.some(b => b.freelancer_id === user?.user_id);
  const myBid = bids.find(b => b.freelancer_id === user?.user_id);
  const daysLeft = Math.floor((new Date(job.deadline) - Date.now()) / (1000 * 60 * 60 * 24));
  const maxProposals = job.max_proposals ?? 40;
  const limitReached = bids.length >= maxProposals;
  const fillPct = Math.min((bids.length / maxProposals) * 100, 100);
  const fillColor = fillPct >= 100 ? '#f87171' : fillPct >= 75 ? '#fb923c' : '#34d399';

  return (
    <div className="min-h-screen pt-24 pb-20 relative bg-[#070e1c] text-white">
      <style>{STYLES}</style>
      <PageBackground variant="dark" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" style={{ animation: 'fadeUp 0.5s ease' }}>
        
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link to="/gigs" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Gig Search
          </Link>
        </div>

        {/* Gig Header Card */}
        <div className="bg-white/[0.02] backdrop-blur-2xl rounded-[32px] border border-white/[0.08] shadow-2xl p-9 sm:p-14 mb-8 relative overflow-hidden group">
          {/* Subtle glow behind card content */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/[0.08] blur-[120px] rounded-full pointer-events-none -mr-40 -mt-40 transition-opacity duration-700 group-hover:opacity-100" />
          
          <div className="relative z-10 text-center sm:text-left">
            <div className="flex flex-col gap-5 mb-8">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <div className={`flex items-center gap-2.5 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${
                  job.status === 'open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  job.status === 'in_progress' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                  job.status === 'in_dispute' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  'bg-white/5 text-slate-300 border-white/10'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${job.status === 'open' ? 'bg-emerald-400 animate-pulse' : 'bg-current'}`} />
                  {job.status === 'in_progress' ? 'Active' : job.status === 'open' ? 'Open Status' : job.status === 'in_dispute' ? 'Under Dispute' : job.status}
                </div>
                <div className="text-[10px] font-black text-white/30 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 uppercase tracking-[0.2em]">
                  Gig Reference #{job.job_id}
                </div>
              </div>
              
              {job.status === 'in_dispute' && (
                <div className="w-full sm:max-w-md p-4 rounded-2xl border border-red-500/30 bg-red-500/10 flex flex-col gap-1 mx-auto sm:mx-0">
                  <div className="flex items-center gap-2 text-sm font-black text-red-400">
                    <AlertTriangle size={16} /> Disputed Project
                  </div>
                  <p className="text-xs font-bold text-red-300/80 leading-relaxed">
                    This project is currently under formal dispute review by nexlance administration.
                  </p>
                </div>
              )}
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tighter mb-8 bg-gradient-to-br from-white via-white to-white/60 bg-clip-text text-transparent">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-8 text-xs font-black uppercase tracking-[0.2em] text-white/40">
              <div className="flex items-center gap-3 group/author cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover/author:bg-indigo-500 group-hover/author:text-white transition-all">
                  <User className="w-4 h-4" />
                </div>
                <span className="group-hover/author:text-white transition-colors">{userMap[job.client_id]?.name || `Client #${job.client_id}`}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <span>{new Date(job.created_at).toLocaleDateString('en-US', { day:'numeric', month:'long', year:'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 relative z-10">
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/[0.02] backdrop-blur-xl rounded-[28px] border border-emerald-500/20 p-8 shadow-xl group hover:scale-[1.02] transition-all">
            <p className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.2em] mb-3">Project Budget</p>
            <p className="text-4xl font-black text-white flex items-center gap-1 tracking-tighter">
              <span className="text-emerald-400 animate-pulse">$</span>{Number(job.budget).toLocaleString()}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/[0.02] backdrop-blur-xl rounded-[28px] border border-indigo-500/20 p-8 shadow-xl group hover:scale-[1.02] transition-all">
            <p className="text-[10px] font-black text-indigo-500/50 uppercase tracking-[0.2em] mb-3">Time Constraints</p>
            <p className="text-2xl font-black text-white tracking-tight mb-2">
              {new Date(job.deadline).toLocaleDateString('en-US', { day:'numeric', month:'short' })}
            </p>
            <p className={`text-[10px] font-black uppercase tracking-widest ${daysLeft < 7 ? 'text-red-400' : 'text-indigo-400/70'}`}>
              {daysLeft > 0 ? `${daysLeft} days remaining` : 'Deadline passed'}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-pink-500/10 to-pink-500/[0.02] backdrop-blur-xl rounded-[28px] border border-pink-500/20 p-8 shadow-xl group hover:scale-[1.02] transition-all">
            <p className="text-[10px] font-black text-pink-500/50 uppercase tracking-[0.2em] mb-3">Proposals</p>
            <div className="flex items-baseline gap-2 mb-3">
              <p className="text-4xl font-black text-white tracking-tighter">{bids.length}</p>
              <p className="text-lg font-bold text-white/30">/ {maxProposals}</p>
            </div>
            {/* fill bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${fillPct}%`, background: fillColor }}
              />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest mt-2"
              style={{ color: fillColor }}>
              {limitReached ? 'Proposal limit reached' : `${maxProposals - bids.length} slots remaining`}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white/[0.02] backdrop-blur-xl rounded-[32px] border border-white/[0.08] p-8 sm:p-12 mb-8 relative z-10">
          <h2 className="text-lg font-bold text-white mb-6 tracking-tight">Gig Description</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
              {job.description}
            </p>
          </div>

          {/* Freelancer: submit / blocked / already applied + withdraw */}
          {isFreelancer && job.status === 'open' && !hasBid && !limitReached && (
            <div className="mt-12 pt-10 border-t border-white/5 flex sm:justify-end">
              <Link
                to={`/gigs/${job.job_id}/bid`}
                className="w-full sm:w-auto inline-flex justify-center items-center gap-3 text-white font-black uppercase tracking-[0.2em] px-10 py-4 rounded-[20px] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)', boxShadow: '0 8px 30px rgba(99,102,241,0.3)', fontSize:'12px' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.5)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 8px 30px rgba(99,102,241,0.3)'}
              >
                <Send className="w-4 h-4" />
                Submit Proposal
              </Link>
            </div>
          )}

          {/* Limit reached — apply blocked */}
          {isFreelancer && job.status === 'open' && !hasBid && limitReached && (
            <div className="mt-10 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3 p-5 bg-red-500/10 border border-red-500/25 rounded-2xl">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-red-300 text-sm font-bold">Proposal limit reached</p>
                  <p className="text-red-400/60 text-xs mt-0.5">
                    This gig has received the maximum of {maxProposals} proposals and is no longer accepting applications.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Already applied + optional withdraw */}
          {isFreelancer && hasBid && (
            <div className="mt-10 pt-8 border-t border-white/10 space-y-3">
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <p className="text-emerald-300 text-sm font-medium">You have already submitted a proposal for this job.</p>
              </div>
              {myBid?.status === 'pending' && job.status === 'open' && (
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawing}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 text-sm font-bold transition-all duration-200 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  {withdrawing ? 'Withdrawing…' : 'Withdraw Proposal'}
                </button>
              )}
            </div>
          )}

          {!user && job.status === 'open' && (
            <div className="mt-10 pt-8 border-t border-white/10">
              <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-indigo-200 text-sm font-medium">Sign in to submit a proposal for this job.</p>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Link to="/login" className="flex-1 sm:flex-none text-center text-sm font-semibold text-white bg-white/10 border border-white/20 px-6 py-2.5 rounded-xl hover:bg-white/20 transition-all">Sign In</Link>
                  <Link to="/signup" className="flex-1 sm:flex-none text-center text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-400 px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25">Join Free</Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Proposals List */}
        <div style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}>
          {isClientOwner && (
            <>
              {/* Header + inline limit editor */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Proposals <span className="text-slate-400 text-base font-medium ml-2">{bids.length} / {maxProposals}</span>
                </h2>
                {/* Limit editor */}
                <div className="flex items-center gap-2">
                  {limitEdit !== null ? (
                    <>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={limitEdit}
                        onChange={e => setLimitEdit(e.target.value)}
                        className="w-20 px-3 py-1.5 bg-white/5 border border-white/15 rounded-xl text-sm font-bold text-white text-center focus:outline-none focus:border-indigo-500/50"
                      />
                      <button
                        onClick={handleSaveLimit}
                        disabled={savingLimit}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all disabled:opacity-50"
                      >
                        {savingLimit ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={() => setLimitEdit(null)}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/40 hover:text-white text-xs font-bold rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setLimitEdit(String(maxProposals))}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 text-xs font-bold rounded-xl transition-all"
                    >
                      ✎ Adjust Limit
                    </button>
                  )}
                </div>
              </div>

              {rankedBids.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10 border-dashed p-12 text-center">
                  <Briefcase className="w-10 h-10 text-white/20 mx-auto mb-4" />
                  <p className="text-slate-300 font-semibold mb-1">No proposals yet</p>
                  <p className="text-slate-400 text-sm">Proposals from freelancers will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rankedBids.map(bid => (
                    <BidCard 
                      key={bid.bid_id} 
                      bid={bid} 
                      onAccept={handleAcceptBid}
                      isJobOpen={job.status === 'open'}
                      jobOwnerId={job.client_id}
                      currentUserId={user?.user_id}
                      userMap={userMap}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default JobDetailsPage;
