import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, DollarSign, Send, Lightbulb, CheckCircle } from 'lucide-react';
import PageBackground from '../components/PageBackground';

const TIPS = [
 'Personalize your proposal — mention the client\'s specific needs',
 'Show relevant work samples or portfolio links',
 'Be realistic with your bid amount and delivery time',
 'Start with a compelling hook in the first 2 sentences',
];

const BidFormPage = () => {
 const { id } = useParams();
 const [job, setJob] = useState(null);
 const [formData, setFormData] = useState({
 proposal_text: '',
 bid_amount: '',
 delivery_days: '',
 });
 const [loading, setLoading] = useState(false);
 const [errors, setErrors] = useState({});
 const navigate = useNavigate();

 useEffect(() => {
 api.get(`/jobs/${id}`).then(res => setJob(res.data)).catch(console.error);
 }, [id]);

 const handleChange = (e) => {
 setFormData({ ...formData, [e.target.name]: e.target.value });
 if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
 };

 const validate = () => {
 const errs = {};
 if (!formData.proposal_text || formData.proposal_text.length < 50)
 errs.proposal_text = 'Proposal must be at least 50 characters.';
 if (!formData.bid_amount || parseFloat(formData.bid_amount) <= 0)
 errs.bid_amount = 'Please enter a valid bid amount.';
 return errs;
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 const errs = validate();
 if (Object.keys(errs).length) { setErrors(errs); return; }

 setLoading(true);
 try {
 await api.post('/bids', {
 job_id: parseInt(id),
 proposal_text: formData.proposal_text,
 bid_amount: parseFloat(formData.bid_amount),
 });
 navigate(`/jobs/${id}`);
 } catch (err) {
 setErrors({ general: err.response?.data?.detail || 'Error submitting proposal. Please try again.' });
 } finally {
 setLoading(false);
 }
 };

 if (!job) return (
 <div className="min-h-screen pt-24 bg-[#0f172a] flex items-center justify-center">
 <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
 </div>
 );

 const charCount = formData.proposal_text.length;

 return (
 <div className="min-h-screen pt-20 relative">
 <PageBackground variant="dark" />
 <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
 <div className="mb-10">
 <Link to={`/jobs/${id}`} className="inline-flex items-center gap-3 text-base font-bold text-blue-100/90 hover:text-white transition-all uppercase tracking-widest group">
 <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
 Back to Job Details
 </Link>
 </div>

 <div className="grid lg:grid-cols-3 gap-6">
 {/* Main Form */}
 <div className="lg:col-span-2">
 <div className="bg-[#1e293b]/40 backdrop-blur-2xl rounded-[3rem] border border-[#2563EB]/20 shadow-2xl p-10 animate-fade-in relative z-10 overflow-hidden">
 <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none"></div>
 
 <div className="mb-12 relative z-10">
 <h1 className="text-5xl font-black text-white mb-4 leading-none tracking-tighter uppercase">OPERATIONAL BID</h1>
 <div className="flex items-center gap-4">
 <span className="h-[2px] w-12 bg-blue-500/40"></span>
 <p className="text-blue-100/90 font-bold text-sm uppercase tracking-widest">MISSION TARGET: <span className="text-blue-400">{job.title.toUpperCase()}</span></p>
 </div>
 </div>

 {errors.general && (
 <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-fade-in">
 {errors.general}
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-6" noValidate>
 {/* Cover Letter */}
 <div className="relative z-10 bg-[#1e293b]/2 rounded-[2rem] p-8 border border-[#2563EB]/10 shadow-inner">
 <div className="flex justify-between items-center mb-8">
 <label className="block text-sm font-bold text-blue-500 uppercase tracking-[0.6em]">
 STRATEGIC PROPOSAL <span className="text-red-400">*</span>
 </label>
 <div className="flex flex-col items-end">
 <span className={`text-base font-bold uppercase tracking-widest ${charCount < 50 ? 'text-red-400' : 'text-emerald-400/60'}`}>
 {charCount} / 500 NODES
 </span>
 <div className="h-1 w-24 bg-[#1e293b]/5 rounded-full overflow-hidden mt-1">
 <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.min(100, (charCount/500)*100)}%` }}></div>
 </div>
 </div>
 </div>
 <textarea
 name="proposal_text"
 rows={10}
 value={formData.proposal_text}
 onChange={handleChange}
 placeholder="Describe your operational approach and why you're the optimal choice for this mission..."
 className={`w-full px-8 py-6 bg-slate-950/60 backdrop-blur-3xl rounded-[2rem] border text-base text-white focus:outline-none focus:border-blue-500 transition-all font-medium placeholder-white/5 resize-none leading-relaxed italic ${
 errors.proposal_text ? 'border-red-400/50 shadow-inner' : 'border-[#2563EB]/10'
 }`}
 />
 {errors.proposal_text && (
 <p className="mt-4 text-base font-bold text-red-400 uppercase tracking-widest px-4">{errors.proposal_text}</p>
 )}
 </div>

 {/* Pricing Row */}
 <div className="grid sm:grid-cols-2 gap-8 relative z-10">
 {/* Bid Amount */}
 <div className="bg-[#1e293b]/2 rounded-[2rem] p-8 border border-[#2563EB]/10 shadow-inner">
 <label className="block text-sm font-bold text-blue-500 uppercase tracking-[0.6em] mb-6">
 RESOURCE BID ($) <span className="text-red-400">*</span>
 </label>
 <div className="relative">
 <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-400" />
 <input
 name="bid_amount"
 type="number"
 min="1"
 step="0.01"
 value={formData.bid_amount}
 onChange={handleChange}
 placeholder="0.00"
 className={`w-full pl-16 pr-6 py-5 bg-slate-950/60 backdrop-blur-3xl rounded-[1.5rem] border text-lg text-white font-black focus:outline-none focus:border-blue-500 transition-all placeholder-white/10 ${
 errors.bid_amount ? 'border-red-400/50 shadow-inner' : 'border-[#2563EB]/10'
 }`}
 />
 </div>
 {errors.bid_amount && <p className="mt-4 text-base font-bold text-red-400 uppercase tracking-widest">{errors.bid_amount}</p>}
 <div className="flex items-center gap-3 mt-4">
 <span className="h-[1px] w-6 bg-[#1e293b]/10"></span>
 <p className="text-base font-bold text-white/70 uppercase tracking-widest">
 TARGET: <span className="text-blue-400">${Number(job.budget).toLocaleString()}</span>
 </p>
 </div>
 </div>

 {/* Delivery Days */}
 <div className="bg-[#1e293b]/2 rounded-[2rem] p-8 border border-[#2563EB]/10 shadow-inner">
 <label className="block text-sm font-bold text-blue-500 uppercase tracking-[0.6em] mb-6">
 SYNC WINDOW (DAYS)
 </label>
 <input
 name="delivery_days"
 type="number"
 min="1"
 value={formData.delivery_days}
 onChange={handleChange}
 placeholder="e.g. 14"
 className="w-full px-8 py-5 bg-slate-950/60 backdrop-blur-3xl rounded-[1.5rem] border border-[#2563EB]/10 text-lg text-white font-black focus:outline-none focus:border-blue-500 transition-all placeholder-white/10"
 />
 </div>
 </div>

 {/* Actions */}
 <div className="flex gap-4 pt-8 border-t border-[#2563EB]/10 relative z-10">
 <button
 type="button"
 onClick={() => navigate(-1)}
 className="px-10 py-4 border border-[#2563EB]/20 text-white font-bold text-base rounded-[1.5rem] hover:bg-[#1e293b]/5 transition-all active:scale-95 uppercase tracking-widest"
 >
 CANCEL
 </button>
 <button
 type="submit"
 disabled={loading}
 className="flex-1 flex items-center justify-center gap-4 bg-gradient-to-r from-[#2563EB] to-[#9B2C8C] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(155,44,140,0.6)] border border-blue-500/20 font-black py-4 rounded-[1.5rem] hover: transition-all active:scale-95 disabled:opacity-60 text-xs uppercase tracking-wider"
 >
 {loading ? (
 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 ) : (
 <>
 <Send className="w-5 h-5" />
 SUBMIT PROPOSAL
 </>
 )}
 </button>
 </div>
 </form>
 </div>
 </div>

 {/* Sidebar */}
 <div className="space-y-6">
 {/* Job Summary */}
 <div className="bg-[#1e293b]/40 backdrop-blur-xl rounded-[2rem] border border-[#2563EB]/20 p-6 animate-fade-in">
 <h3 className="text-base font-bold text-blue-400 uppercase tracking-widest mb-6">Job Summary</h3>
 <div className="space-y-4 text-base font-bold uppercase tracking-widest">
 <div className="flex justify-between items-center bg-[#1e293b]/5 p-3 rounded-xl">
 <span className="text-white/70">Client Budget</span>
 <span className="text-white">${Number(job.budget).toLocaleString()}</span>
 </div>
 <div className="flex justify-between items-center bg-[#1e293b]/5 p-3 rounded-xl">
 <span className="text-white/70">Deadline</span>
 <span className="text-white">{new Date(job.deadline).toLocaleDateString()}</span>
 </div>
 <div className="flex justify-between items-center bg-[#1e293b]/5 p-3 rounded-xl">
 <span className="text-white/70">Status</span>
 <span className="text-emerald-400">
 {job.status?.toUpperCase()}
 </span>
 </div>
 </div>
 </div>

 {/* Writing Tips */}
 <div className="bg-slate-950/60 backdrop-blur-3xl rounded-[3rem] p-10 border border-[#2563EB]/10 relative overflow-hidden shadow-3xl">
 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>
 <div className="flex items-center gap-4 mb-10">
 <Lightbulb className="w-8 h-8 text-blue-400" />
 <h3 className="text-sm font-bold text-blue-500 uppercase tracking-widest">SYNC PROTOCOLS</h3>
 </div>
 <ul className="space-y-8">
 {TIPS.map((tip, i) => (
 <li key={i} className="flex items-start gap-4 group">
 <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform" />
 <span className="text-blue-100/60 text-sm font-bold uppercase tracking-wider leading-relaxed italic opacity-60 group-hover:opacity-100 transition-opacity">"{tip.toUpperCase()}"</span>
 </li>
 ))}
 </ul>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};

export default BidFormPage;
