import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
  Briefcase, DollarSign, Star, TrendingUp, Clock, 
  Plus, ArrowRight, ExternalLink, CheckCircle, 
  AlertCircle, Activity, Users, X, Info, XCircle
} from 'lucide-react';
import PageBackground from '../components/PageBackground';

const StatCard = ({ icon, label, value, sub, color, bgColor }) => (
  <div className="bg-[#111827]/40 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-[#2563EB]/10 shadow-2xl hover:border-blue-500/30 transition-all duration-500 group relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-32 h-32 ${bgColor} blur-[60px] rounded-full -mr-12 -mt-12 opacity-20 group-hover:opacity-40 transition-opacity`}></div>
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-xs text-blue-300/40 font-black uppercase tracking-widest mb-3">{label}</p>
        <p className="text-4xl font-black text-white tracking-tighter leading-none">{value}</p>
        {sub && <p className="text-xs text-white/70 font-bold uppercase tracking-widest mt-3 flex items-center gap-2">
          <TrendingUp className="w-3 h-3 text-emerald-500/50" />
          {sub}
        </p>}
      </div>
      <div className={`p-4 bg-[#1e293b]/5 rounded-2xl ${color} border border-[#2563EB]/10 group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
      </div>
    </div>
  </div>
);

const ProjectCard = ({ project, priority = false }) => {
  const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    active: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    work_submitted: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  return (
    <div className={`bg-[#111827]/40 backdrop-blur-3xl rounded-[2.5rem] border ${priority ? 'border-orange-500/40 shadow-[0_0_40px_rgba(249,115,22,0.1)]' : 'border-[#2563EB]/10'} p-8 shadow-2xl hover:bg-[#1e293b]/40 transition-all duration-500 group relative overflow-hidden`}>
      {priority && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
      )}
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black text-white tracking-tight group-hover:text-blue-400 transition-colors uppercase">Mission #{project.project_id}</h3>
            {priority && <span className="flex w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>}
          </div>
          <p className="text-sm text-blue-100/70 font-black uppercase tracking-widest mt-2">SECURE SYNC: {project.job_id}</p>
        </div>
        <span className={`text-base font-bold px-5 py-2 rounded-full uppercase tracking-wider border ${statusColors[project.status] || 'bg-[#1e293b]/5 text-white/90 border-[#2563EB]/20'}`}>
          {project.status?.replace('_', ' ')?.toUpperCase() || 'OFFLINE'}
        </span>
      </div>
      <div className="flex items-center justify-between pt-8 border-t border-[#2563EB]/10 relative z-10">
        <div className="flex items-center gap-3 text-sm text-white/80 font-black uppercase tracking-widest">
          {project.status === 'work_submitted' ? (
            <span className="text-orange-400/60 flex items-center gap-2">
              <Info className="w-4 h-4" /> ACTION REQUIRED // SUBMISSION READY
            </span>
          ) : (
            <><Clock className="w-4 h-4 text-blue-500/40" /> Transmission Active</>
          )}
        </div>
        <Link
          to={`/projects/${project.project_id}`}
          className="flex items-center gap-3 text-sm font-bold text-blue-500 hover:text-white transition-all uppercase tracking-wider group/link"
        >
          OPEN INTERFACE <ArrowRight className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

const JobCardDash = ({ job, hasNewBids, onDelete }) => (
  <div className={`bg-[#111827]/40 backdrop-blur-3xl border ${hasNewBids ? 'border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.05)]' : 'border-[#2563EB]/10'} rounded-[2.5rem] p-8 hover:bg-slate-900/60 transition-all duration-500 group relative overflow-hidden`}>
    {hasNewBids && (
      <div className="absolute inset-x-0 top-0 h-[2px] bg-emerald-500/50 blur-[2px]"></div>
    )}
    <div className="flex items-start justify-between mb-6">
      <div>
        <h3 className="text-base font-bold text-white uppercase tracking-widest group-hover:text-blue-400 transition-colors line-clamp-1 flex-1 pr-4">{job.title}</h3>
        {hasNewBids && (
          <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            <TrendingUp className="w-3 h-3" /> NEW PROPOSALS DETECTED
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-widest flex-shrink-0 border ${
          job.status === 'open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
        }`}>
          {job.status}
        </span>
        <button 
          onClick={() => onDelete(job.job_id)}
          className="p-2 text-white/10 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          title="Hide from dashboard"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
    <div className="flex items-center justify-between pt-6 border-t border-[#2563EB]/10">
      <div className="flex flex-col">
        <span className="text-sm font-bold text-white/70 uppercase tracking-widest mb-1">ALLOCATION</span>
        <span className="flex items-center gap-2 text-lg font-black text-white tracking-tighter">
          <DollarSign className="w-4 h-4 text-emerald-400/60" />
          {Number(job.budget).toLocaleString()}
        </span>
      </div>
      <Link
        to={`/jobs/${job.job_id}`}
        className="flex items-center gap-3 bg-[#1e293b]/5 hover:bg-blue-600 px-6 py-3 rounded-2xl text-base font-bold text-white transition-all uppercase tracking-widest border border-[#2563EB]/10 hover:border-blue-400"
      >
        INTERFACE <ExternalLink className="w-3.5 h-3.5" />
      </Link>
    </div>
  </div>
);
const BidCardFreelancer = ({ bid }) => (
  <div className={`bg-[#111827]/40 backdrop-blur-3xl border ${bid.status === 'accepted' ? 'border-emerald-500/30' : bid.status === 'rejected' ? 'border-red-500/20' : 'border-[#2563EB]/10'} rounded-[2.5rem] p-8 hover:bg-slate-900/60 transition-all duration-500 group relative overflow-hidden`}>
    <div className="flex items-start justify-between mb-6">
      <div>
        <h3 className="text-base font-bold text-white uppercase tracking-widest group-hover:text-blue-400 transition-colors">Job #{bid.job_id}</h3>
        <p className="text-sm text-white/80 font-black uppercase tracking-widest mt-2">BID AMOUNT</p>
        <p className="text-xl font-black text-white tracking-tighter">${Number(bid.bid_amount).toLocaleString()}</p>
      </div>
      <span className={`text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border ${
        bid.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
        bid.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
        'bg-blue-500/10 text-blue-400 border-blue-500/20'
      }`}>
        {bid.status}
      </span>
    </div>
    <div className="flex items-center justify-between pt-6 border-t border-[#2563EB]/10">
      <div className="flex flex-col">
        <span className="text-sm font-bold text-white/70 uppercase tracking-widest mb-1">PROPOSAL</span>
        <p className="text-sm text-white/60 line-clamp-1 italic">"{bid.proposal_text}"</p>
      </div>
      <Link
        to={`/jobs/${bid.job_id}`}
        className="flex items-center gap-3 bg-[#1e293b]/5 hover:bg-blue-600 px-6 py-3 rounded-2xl text-base font-bold text-white transition-all uppercase tracking-widest border border-[#2563EB]/10 hover:border-blue-400"
      >
        VIEW JOB <ExternalLink className="w-3.5 h-3.5" />
      </Link>
    </div>
  </div>
);

const SkeletonStat = () => (
  <div className="bg-[#1e293b]/40 rounded-3xl p-8 border border-[#2563EB]/10 animate-pulse">
    <div className="h-4 bg-[#1e293b]/5 rounded w-24 mb-4"></div>
    <div className="h-10 bg-[#1e293b]/5 rounded w-16"></div>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [jobBids, setJobBids] = useState({}); // {jobId: [bids]}
  const [loading, setLoading] = useState(true);
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [activeTab, setActiveTab] = useState('active_projects'); 

  const fetchData = async () => {
    try {
      const projRes = await api.get('/projects');
      setProjects(projRes.data);

      const reviewsRes = await api.get(`/reviews/user/${user.user_id}`);
      setReviews(reviewsRes.data);

      if (user.role === 'client') {
        const jobRes = await api.get('/jobs');
        const clientJobs = jobRes.data.filter(j => j.client_id === user.user_id);
        setItems(clientJobs);

        // Fetch bids for all jobs to check for new ones
        const bidsData = {};
        for (const job of clientJobs) {
          try {
            const bRes = await api.get(`/bids/job/${job.job_id}`);
            bidsData[job.job_id] = bRes.data;
          } catch (e) {
            console.error(`Error fetching bids for job ${job.job_id}`, e);
          }
        }
        setJobBids(bidsData);
      } else if (user.role === 'freelancer') {
        const bidRes = await api.get('/bids/my');
        setItems(bidRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Hide this mission from your dashboard? Database records will persist.')) return;
    try {
      await api.patch(`/jobs/${id}`, { is_hidden_by_client: true });
      fetchData();
    } catch (err) {
      console.error('Error hiding job:', err);
    }
  };

  if (!user) return null;

  const activeProjects = projects.filter(p => p.status !== 'completed');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const visibleJobs = items.filter(j => !j.is_hidden_by_client && j.status !== 'completed');
  const historyJobs = items.filter(j => j.status === 'completed');

  // ACTION CENTER LOGIC (Smart Inbox)
  const actionCenterItems = user.role === 'client' 
    ? activeProjects.filter(p => p.status === 'work_submitted' && p.client_id === user.user_id)
    : activeProjects.filter(p => p.status === 'active' && p.freelancer_id === user.user_id);
  
  const hiddableJobs = user.role === 'client' ? visibleJobs : items.filter(b => b.status === 'pending');

  const jobsWithNewBids = user.role === 'client' 
    ? visibleJobs.filter(j => jobBids[j.job_id]?.some(b => !b.is_read))
    : [];

  const operationsCount = user.role === 'client' 
    ? (actionCenterItems.length + jobsWithNewBids.length)
    : actionCenterItems.length;

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : '0.0';

  const freelancerStats = [
    { label: 'Active Projects', value: activeProjects.length, sub: 'ongoing work', icon: <Activity className="w-5 h-5" />, color: 'text-blue-400', bgColor: 'bg-blue-500' },
    { label: 'Completed Jobs', value: completedProjects.length, sub: 'all time', icon: <CheckCircle className="w-5 h-5" />, color: 'text-emerald-400', bgColor: 'bg-emerald-500' },
    { label: 'Total Earned', value: `$${completedProjects.length * 1000}`, sub: 'est. revenue', icon: <DollarSign className="w-5 h-5" />, color: 'text-amber-400', bgColor: 'bg-amber-500' },
    { label: 'Avg Rating', value: `${avgRating}★`, sub: `from ${reviews.length} missions`, icon: <Star className="w-5 h-5" />, color: 'text-purple-400', bgColor: 'bg-purple-500' },
  ];

  const clientStats = [
    { label: 'Posted Jobs', value: items.length, sub: 'total listings', icon: <Briefcase className="w-5 h-5" />, color: 'text-blue-400', bgColor: 'bg-blue-500' },
    { label: 'Active Projects', value: activeProjects.length, sub: 'in progress', icon: <Activity className="w-5 h-5" />, color: 'text-emerald-400', bgColor: 'bg-emerald-500' },
    { label: 'Total Spent', value: `$${projects.filter(p => p.status === 'completed').length * 1500}`, sub: 'platform budget', icon: <DollarSign className="w-5 h-5" />, color: 'text-amber-400', bgColor: 'bg-amber-500' },
    { label: 'Avg Rating', value: `${avgRating}★`, sub: `from ${reviews.length} operatives`, icon: <Star className="w-5 h-5" />, color: 'text-purple-400', bgColor: 'bg-purple-500' },
  ];

  const stats = user.role === 'freelancer' ? freelancerStats : clientStats;

  return (
    <div className="min-h-screen pt-20 relative">
      <PageBackground variant="dark" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-16 relative">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 blur-[150px] rounded-full pointer-events-none"></div>
          <div className="relative z-10 flex flex-col gap-2">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none uppercase">
              <span className="text-white/70">SYSTEM //</span> {user?.name?.split(' ')?.[0] || 'USER'}
            </h1>
            <div className="flex items-center gap-4 mt-4">
              <span className="h-[2px] w-12 bg-blue-500/40"></span>
              <p className="text-blue-100/90 font-bold text-sm uppercase tracking-widest">
                {user.role === 'client' ? "COMMAND CENTER ACTIVE" : "OPERATIVE INTERFACE ACTIVE"}
              </p>
            </div>
          </div>
          {user.role === 'client' && (
            <Link 
              to="/jobs/new" 
              className="group inline-flex items-center gap-4 bg-[#1e293b] text-[#e2e8f0] font-bold px-10 py-5 rounded-full hover:scale-105 transition-all active:scale-95 text-xs uppercase tracking-wider"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              Initialize New Mission
            </Link>
          )}
        </div>

        {/* Profile Hero */}
        <div className="bg-[#111827]/40 backdrop-blur-3xl rounded-[3rem] border border-[#2563EB]/10 p-12 mb-16 relative overflow-hidden shadow-3xl group/hero">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none group-hover/hero:bg-blue-600/10 transition-colors duration-700"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-500 rounded-3xl flex items-center justify-center text-white text-5xl font-black shadow-2xl border border-[#2563EB]/20">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-4">
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{user?.name}</h2>
                <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-1 rounded-full flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">{user.role}</span>
                </div>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed max-w-2xl italic opacity-70">
                "{user.bio || 'Credentials verified. System interface initialized for tactical project management.'}"
              </p>
            </div>
            <Link 
              to={`/profile/${user.user_id}`}
              className="px-8 py-4 bg-[#1e293b]/5 border border-[#2563EB]/20 rounded-2xl text-white font-bold text-base uppercase tracking-widest hover:bg-[#1e293b]/10 transition-all"
            >
              MODIFY PROFILE
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {loading ? [...Array(4)].map((_, i) => <SkeletonStat key={i} />) : stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#111827]/40 backdrop-blur-3xl p-2 rounded-[2.5rem] border border-[#2563EB]/10 mb-16 w-full max-w-4xl mx-auto shadow-4xl relative overflow-hidden group">
          {[
            { 
              id: 'active_projects', 
              label: 'OPERATIONS', 
              count: operationsCount, 
              desc: user.role === 'client' ? 'Action Required' : 'Active Duty', 
              highlight: operationsCount > 0 
            },
            { 
              id: 'my_postings', 
              label: user.role === 'client' ? 'DEPLOYMENTS' : 'PROPOSALS', 
              count: hiddableJobs.length, 
              desc: user.role === 'client' ? 'Live Listings' : 'Active Bids' 
            },
            { 
              id: 'history', 
              label: 'ARCHIVE', 
              count: completedProjects.length, 
              desc: 'Cold Storage' 
            }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-6 px-4 rounded-[2rem] transition-all duration-500 relative z-10 ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg scale-100' 
                  : 'text-white/80 hover:text-white/60 hover:bg-[#1e293b]/5 scale-95'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-bold uppercase tracking-widest">{tab.label}</span>
                {tab.highlight && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>}
              </div>
              <span className={`text-sm font-bold uppercase tracking-widest opacity-40 ${activeTab === tab.id ? 'text-white/60' : ''}`}>
                {tab.count} {tab.desc}
              </span>
              {activeTab === tab.id && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#1e293b]/30 rounded-full blur-sm"></div>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            
            {/* Action Center - Operations Tab */}
            {(activeTab === 'active_projects' || user.role === 'freelancer') && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                    {user.role === 'client' ? 'PRIORITY OPERATIONS' : 'CURRENT ASSIGNMENTS'}
                  </h2>
                </div>

                {loading ? <SkeletonStat /> : (user.role === 'client' ? [...actionCenterItems, ...jobsWithNewBids].length : activeProjects.length) === 0 ? (
                  <div className="bg-[#1e293b]/40 backdrop-blur-2xl rounded-[3rem] border border-[#2563EB]/10 border-dashed p-24 text-center">
                    <Activity className="w-12 h-12 text-white/5 mx-auto mb-6" />
                    <p className="text-blue-200/10 text-base font-bold uppercase tracking-widest">No active mission overrides detected.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {user.role === 'freelancer' ? (
                      activeProjects.map(p => <ProjectCard key={p.project_id} project={p} />)
                    ) : (
                      <>
                        {actionCenterItems.map(p => <ProjectCard key={p.project_id} project={p} priority={true} />)}
                        {jobsWithNewBids.map(j => <JobCardDash key={j.job_id} job={j} hasNewBids={true} onDelete={handleDeleteJob} />)}
                        {/* Show other active projects that AREN'T in action center if user wants? Manual says display ONLY those meeting criteria. */}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Deployments / Proposals Tab */}
            {activeTab === 'my_postings' && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                    {user.role === 'client' ? 'Live Link Postings' : 'Active Mission Proposals'}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.role === 'client' ? (
                    (showAllJobs ? visibleJobs : visibleJobs.slice(0, 4)).map(job => (
                      <JobCardDash key={job.job_id} job={job} hasNewBids={jobBids[job.job_id]?.some(b => !b.is_read)} onDelete={handleDeleteJob} />
                    ))
                  ) : (
                    items.filter(b => b.status === 'pending').map(bid => (
                      <BidCardFreelancer key={bid.bid_id} bid={bid} />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Archive Tab */}
            {activeTab === 'history' && (
              <div className="animate-fade-in divide-y divide-white/5">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase">Mission Archives</h2>
                </div>
                {completedProjects.length === 0 ? (
                  <div className="bg-[#1e293b]/40 rounded-[3rem] p-24 text-center border border-[#2563EB]/10 border-dashed">
                    <p className="text-blue-200/10 text-base font-bold uppercase tracking-widest">Cold storage empty.</p>
                  </div>
                ) : (
                  <div className="space-y-4 pt-8">
                    {completedProjects.map(p => (
                      <div key={p.project_id} className="bg-[#1e293b]/[0.02] border border-[#2563EB]/10 p-8 rounded-3xl flex justify-between items-center group hover:bg-[#1e293b]/[0.04] transition-all duration-500 hover:scale-[1.01] shadow-xl">
                        <div>
                          <p className="text-base font-bold text-emerald-500/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                             <CheckCircle className="w-3.5 h-3.5" /> MISSION COMPLETE
                          </p>
                          <h4 className="text-2xl font-black text-white uppercase tracking-tighter">{p.job_title || `MISSION #${p.job_id}`}</h4>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-base font-bold text-white/70 uppercase tracking-widest">ALLOCATION:</span>
                            <span className="text-base font-bold text-blue-400 tracking-tight">${p.job_budget || '0.00'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                           <div className="px-5 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-sm font-bold uppercase tracking-widest">
                             ARCHIVED
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column Links */}
          <div className="space-y-8">
            <div className="bg-[#111827]/40 backdrop-blur-3xl rounded-[3rem] border border-[#2563EB]/10 p-12 shadow-3xl sticky top-24">
              <h3 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-10 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 opacity-40" />
                TACTICAL LINKS
              </h3>
              <div className="space-y-4">
                {(user.role === 'client' ? [
                  { label: 'INITIALIZE MISSION', to: '/jobs/new', icon: <Plus />, primary: true },
                  { label: 'OPERATIVE LIST', to: '/freelancers', icon: <Users /> },
                ] : [
                  { label: 'SCOUT MISSIONS', to: '/jobs', icon: <Briefcase />, primary: true },
                  { label: 'ELITE PROFILE', to: `/profile/${user.user_id}`, icon: <Star /> },
                ]).map(action => (
                  <Link
                    key={action.label}
                    to={action.to}
                    className={`flex items-center gap-6 px-8 py-5 rounded-2xl text-base font-bold uppercase tracking-widest transition-all duration-300 ${
                      action.primary ? 'bg-blue-600 text-white hover:bg-blue-500' : 'text-white/90 border border-[#2563EB]/10 hover:bg-[#1e293b]/5 hover:text-white'
                    }`}
                  >
                    {React.cloneElement(action.icon, { className: 'w-4 h-4' })}
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
