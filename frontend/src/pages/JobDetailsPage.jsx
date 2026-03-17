import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
 CheckCircle, XCircle, Send, Star, Briefcase, AlertTriangle, 
 ArrowLeft, User, Calendar, DollarSign
} from 'lucide-react';
import PageBackground from '../components/PageBackground';

const BidCard = ({ bid, onAccept, isJobOpen, jobOwnerId, currentUserId }) => {
 const isOwner = currentUserId === jobOwnerId;

 return (
 <div className={`bg-[#111827]/40 backdrop-blur-3xl rounded-[3rem] border p-10 transition-all duration-500 overflow-hidden relative group shadow-3xl ${
 bid.status === 'accepted' ? 'border-emerald-500/30' : 'border-[#2563EB]/10 hover:bg-[#1e293b]/40'
 }`}>
 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
 
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-10 relative z-10">
 <div className="flex items-center gap-6">
 <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[1.5rem] flex items-center justify-center text-white font-black text-2xl flex-shrink-0 border border-[#2563EB]/20">
 {bid.freelancer_id?.toString().charAt(0)}
 </div>
 <div>
 <h4 className="font-black text-white text-xl tracking-tighter uppercase leading-none mb-2">OPERATIVE #{bid.freelancer_id}</h4>
 <div className="flex items-center gap-3">
 <div className="flex bg-[#1e293b]/5 px-3 py-1 rounded-lg border border-[#2563EB]/10">
 <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
 </div>
 <span className="text-sm text-blue-100/70 font-black uppercase tracking-widest">RANK: ELITE VERIFIED</span>
 </div>
 </div>
 </div>
 <div className="sm:text-right flex-shrink-0">
 <div className="text-4xl font-black text-white tracking-tighter leading-none">${Number(bid.bid_amount).toLocaleString()}</div>
 <div className="text-sm font-bold text-white/70 uppercase tracking-widest mt-3">OPERATIONAL BID</div>
 </div>
 </div>

 <div className="bg-[#1e293b]/2 backdrop-blur-3xl rounded-[2rem] p-8 mb-10 border border-[#2563EB]/10 relative z-10 shadow-inner">
 <p className="text-base text-slate-300 leading-relaxed font-medium italic opacity-80 group-hover:opacity-100 transition-opacity">
 "{bid.proposal_text || 'No strategic brief provided for this mission initialization.'}"
 </p>
 </div>

 <div className="flex items-center justify-between relative z-10">
 <div className={`flex items-center gap-3 px-6 py-2.5 rounded-full border text-base font-bold uppercase tracking-widest ${
 bid.status === 'accepted' ? 'bg-emerald-600 text-white border-emerald-400' :
 bid.status === 'rejected' ? 'bg-red-900/40 text-red-400 border-red-500/40' :
 'bg-[#1e293b]/5 text-blue-400/60 border-[#2563EB]/20'
 }`}>
 <div className={`w-2 h-2 rounded-full animate-pulse ${bid.status === 'accepted' ? 'bg-[#1e293b]' : 'bg-current'}`}></div>
 {bid.status === 'accepted' ? 'MISSION AWARDED' : bid.status || 'PENDING EVALUATION'}
 </div>

 {isOwner && isJobOpen && bid.status === 'pending' && (
 <button
 onClick={() => onAccept(bid.bid_id)}
 className="flex items-center gap-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(155,44,140,0.6)] border border-blue-500/20 text-sm font-bold px-10 py-5 rounded-[1.5rem] hover: transition-all active:scale-95 uppercase tracking-wider"
 >
 <CheckCircle className="w-5 h-5" />
 INITIALIZE COLLAB
 </button>
 )}
 </div>
 </div>
 );
};

const JobDetailsPage = () => {
 const { id } = useParams();
 const { user } = useContext(AuthContext);
 const [job, setJob] = useState(null);
 const [bids, setBids] = useState([]);
 const [loading, setLoading] = useState(true);
 const navigate = useNavigate();

 useEffect(() => {
 const fetchJobData = async () => {
  try {
    const jobRes = await api.get(`/jobs/${id}`);
    setJob(jobRes.data);
    const bidsRes = await api.get(`/bids/job/${id}`);
    setBids(bidsRes.data);
    
    // If client is the owner, mark bids as read
    if (user?.role === 'client' && user?.user_id === jobRes.data.client_id) {
      api.post(`/bids/job/${id}/read-all`).catch(err => console.error(err));
    }
  } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 };
 fetchJobData();
 }, [id]);

 const handleAcceptBid = async (bidId) => {
 try {
 await api.put(`/bids/${bidId}/accept`);
 await api.post(`/projects`, { job_id: job.job_id });
 navigate('/dashboard');
 } catch (err) {
 alert(err.response?.data?.detail || 'Error accepting bid');
 }
 };

 if (loading) return (
 <div className="min-h-screen pt-24 relative">
 <PageBackground variant="light" />
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
 <div className="animate-pulse space-y-4">
 <div className="h-4 bg-slate-200 rounded w-24"></div>
 <div className="bg-[#1e293b]/70 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-card">
 <div className="h-8 bg-slate-200 rounded w-3/4 mb-4"></div>
 <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
 <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
 <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
 <div className="h-4 bg-slate-200 rounded w-2/3"></div>
 </div>
 </div>
 </div>
 </div>
 );

 if (!job) return (
 <div className="min-h-screen pt-24 relative flex items-center justify-center">
 <PageBackground variant="light" />
 <div className="text-center">
 <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
 <h2 className="text-xl font-semibold text-slate-700">Job not found</h2>
 <Link to="/jobs" className="text-blue-600 font-medium mt-2 inline-block">← Back to jobs</Link>
 </div>
 </div>
 );

 const isClientOwner = user?.role === 'client' && user?.user_id === job.client_id;
 const isFreelancer = user?.role === 'freelancer';
 const hasBid = bids.some(b => b.freelancer_id === user?.user_id);
 const daysLeft = Math.floor((new Date(job.deadline) - Date.now()) / (1000 * 60 * 60 * 24));

 return (
 <div className="min-h-screen pt-20 relative">
 <PageBackground variant="dark" />
 <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
 {/* Breadcrumb */}
 <div className="mb-10">
 <Link to="/jobs" className="inline-flex items-center gap-3 text-base font-bold text-blue-100/90 hover:text-white transition-all uppercase tracking-widest group">
 <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
 Return to Job Search
 </Link>
 </div>

 {/* Job Header Card */}
 <div className="bg-[#111827]/40 backdrop-blur-3xl rounded-[3rem] border border-[#2563EB]/10 shadow-3xl p-12 mb-12 animate-fade-in relative z-10 overflow-hidden">
 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full -mr-48 -mt-48 pointer-events-none"></div>
 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 relative z-10">
 <div className="flex-1 min-w-0">
 <div className="flex flex-wrap items-center gap-4 mb-8">
 <div className={`flex items-center gap-3 px-6 py-2 rounded-full border text-base font-bold uppercase tracking-widest ${
 job.status === 'open' ? 'bg-emerald-600 text-white border-emerald-400' :
 job.status === 'in_progress' ? 'bg-blue-600 text-white border-blue-400' :
 'bg-[#1e293b]/5 text-slate-300 border-[#2563EB]/20'
 }`}>
 <div className="w-2 h-2 bg-[#1e293b] rounded-full animate-pulse"></div>
 {job.status === 'in_progress' ? 'MISSION ACTIVE' : job.status === 'open' ? 'OPEN FOR SYNC' : job.status}
 </div>
 <div className="bg-[#1e293b]/5 text-blue-100/70 border border-[#2563EB]/10 px-6 py-2 rounded-full text-base font-bold uppercase tracking-widest">ADDR: {job.job_id}</div>
 </div>
 <h1 className="text-6xl font-black text-white leading-none tracking-tighter uppercase mb-8">
 {job.title}
 </h1>
 <div className="flex flex-wrap items-center gap-10 text-base font-bold text-blue-200/30 uppercase tracking-widest">
 <div className="flex flex-col gap-2">
 <span className="text-white/10">COMMANDER</span>
 <span className="flex items-center gap-3 text-blue-200/60 font-black">
 <User className="w-4 h-4 text-blue-500/40" />
 NODE #{job.client_id}
 </span>
 </div>
 <div className="flex flex-col gap-2">
 <span className="text-white/10">TIMESTAMP</span>
 <span className="flex items-center gap-3 text-blue-200/60 font-black">
 <Calendar className="w-4 h-4 text-blue-500/40" />
 {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* Stats Row */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 bg-[#1e293b]/5 backdrop-blur-md rounded-[2rem] mb-12 border border-[#2563EB]/10 relative z-10">
 <div>
 <p className="text-base font-bold text-white/70 uppercase tracking-widest mb-3">Project Budget</p>
 <p className="text-4xl font-black text-white flex items-center gap-2 tracking-tighter">
 <DollarSign className="w-8 h-8 text-emerald-400" />
 {Number(job.budget).toLocaleString()}
 </p>
 </div>
 <div>
 <p className="text-base font-bold text-white/70 uppercase tracking-widest mb-3">Project Deadline</p>
 <p className="text-xl font-black text-white uppercase tracking-tight">{new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
 <p className={`text-base font-bold mt-2 uppercase tracking-widest ${daysLeft < 7 ? 'text-red-400 animate-pulse' : 'text-blue-400/60'}`}>
 {daysLeft > 0 ? `${daysLeft} DAYS REMAINING` : 'DEADLINE PASSED'}
 </p>
 </div>
 <div>
 <p className="text-base font-bold text-white/70 uppercase tracking-widest mb-3">Received Proposals</p>
 <p className="text-4xl font-black text-white tracking-tighter">{bids.length}</p>
 </div>
 </div>

 {/* Description */}
 <div className="mb-16 relative z-10">
 <h2 className="text-sm font-bold text-blue-500 uppercase tracking-[0.6em] mb-8">MISSION OBJECTIVES</h2>
 <div className="bg-[#1e293b]/2 backdrop-blur-3xl rounded-[2rem] p-10 border border-[#2563EB]/10 shadow-inner">
 <p className="text-slate-300 text-xl leading-relaxed whitespace-pre-wrap font-medium italic opacity-80">
 "{job.description}"
 </p>
 </div>
 </div>

 {/* Freelancer Actions */}
 {isFreelancer && job.status === 'open' && !hasBid && (
 <div className="border-t border-[#2563EB]/10 pt-10 flex justify-end relative z-10">
 <Link 
 to={`/jobs/${job.job_id}/bid`} 
 className="inline-flex items-center gap-4 bg-gradient-to-r from-[#2563EB] to-[#9B2C8C] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(155,44,140,0.6)] border border-blue-500/20 font-black px-12 py-5 rounded-[2rem] hover: transition-all active:scale-95 text-xs uppercase tracking-wider"
 >
 <Send className="w-5 h-5" />
 SUBMIT PROPOSAL
 </Link>
 </div>
 )}

 {isFreelancer && hasBid && (
 <div className="border-t border-slate-100 pt-6">
 <div className="flex items-center gap-2.5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
 <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
 <p className="text-emerald-700 text-sm font-medium">You have already submitted a proposal for this job.</p>
 </div>
 </div>
 )}

 {!user && job.status === 'open' && (
 <div className="border-t border-slate-100 pt-6">
 <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
 <p className="text-blue-700 text-sm mb-3">Sign in or create an account to submit a proposal</p>
 <div className="flex gap-3 justify-center">
 <Link to="/login" className="text-sm font-semibold text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all">Sign In</Link>
 <Link to="/signup" className="text-sm font-semibold text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-all">Join Free</Link>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Proposals (visible to job owner or if you've bid) */}
 <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
 {(isClientOwner || (isFreelancer && hasBid)) && (
 <>
 <div className="flex items-center justify-between mb-8">
 <h2 className="text-2xl font-black text-white tracking-tighter uppercase">
 Current Proposals <span className="text-blue-500 tracking-widest ml-4">[{bids.length}]</span>
 </h2>
 </div>

 {bids.length === 0 ? (
 <div className="bg-[#1e293b] rounded-2xl border border-slate-100 border-dashed p-12 text-center">
 <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
 <p className="text-slate-300 font-medium">No proposals yet</p>
 <p className="text-slate-300 text-sm mt-1">Proposals from freelancers will appear here.</p>
 </div>
 ) : (
 <div className="space-y-4">
 {bids.map(bid => (
 <BidCard 
 key={bid.bid_id} 
 bid={bid} 
 onAccept={handleAcceptBid}
 isJobOpen={job.status === 'open'}
 jobOwnerId={job.client_id}
 currentUserId={user?.user_id}
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
