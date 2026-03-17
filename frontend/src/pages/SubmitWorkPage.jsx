import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Upload, Link2, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import PageBackground from '../components/PageBackground';

const SubmitWorkPage = () => {
 const { id } = useParams();
 const [project, setProject] = useState(null);
 const [workNotes, setWorkNotes] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const navigate = useNavigate();

 useEffect(() => {
 api.get('/projects').then(res => {
 const found = res.data.find(p => p.project_id === parseInt(id));
 if (found) setProject(found);
 }).catch(console.error);
 }, [id]);

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!workNotes.trim()) { setError('Please provide work notes before submitting.'); return; }
 setLoading(true);
 setError('');
 try {
 await api.post(`/projects/${id}/submit-work`, { work_notes: workNotes });
 navigate(`/projects/${id}`);
 } catch (err) {
 setError(err.response?.data?.detail || 'Error submitting work. Please try again.');
 } finally {
 setLoading(false);
 }
 };

 if (!project) return (
 <div className="min-h-screen pt-24 flex items-center justify-center">
 <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
 </div>
 );

 return (
 <div className="min-h-screen pt-20 relative">
 <PageBackground variant="dark" />
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
 <div className="mb-10">
 <Link to={`/projects/${id}`} className="inline-flex items-center gap-3 text-base font-bold text-blue-100/90 hover:text-white transition-all uppercase tracking-widest group">
 <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
 Back to Project Details
 </Link>
 </div>

 <div className="bg-[#111827]/40 backdrop-blur-3xl rounded-[3rem] border border-[#2563EB]/10 p-12 lg:p-16 animate-fade-in relative z-10 overflow-hidden text-center shadow-3xl">
 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full -mr-48 -mt-48 pointer-events-none"></div>
 
 <div className="relative z-10 mb-16">
 <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-[#2563EB]/20">
 <Upload className="w-12 h-12 text-white" />
 </div>
 <h1 className="text-6xl font-black text-white leading-none tracking-tighter uppercase mb-6">UPLOAD PAYLOAD</h1>
 <div className="flex items-center justify-center gap-4">
 <span className="h-[2px] w-12 bg-blue-500/30"></span>
 <p className="text-blue-100/90 font-bold text-base uppercase tracking-widest">
 PROJECT #{project.project_id} • SECURE UPLINK
 </p>
 </div>
 </div>

 {error && (
 <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2.5 animate-fade-in">
 <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
 {error}
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-8 relative z-10 text-left">
 {/* Work Notes */}
 <div className="bg-[#1e293b]/2 rounded-[2.5rem] p-10 border border-[#2563EB]/10 shadow-inner">
 <div className="flex justify-between items-center mb-8">
 <label className="block text-sm font-bold text-blue-500 uppercase tracking-[0.6em]">
 OPERATIONAL LOGS <span className="text-red-400">*</span>
 </label>
 <div className="flex flex-col items-end">
 <span className={`text-base font-bold uppercase tracking-widest ${workNotes.length > 20 ? 'text-emerald-400' : 'text-white/70'}`}>
 {workNotes.length} DATA NODES
 </span>
 <div className="h-1 w-24 bg-[#1e293b]/5 rounded-full overflow-hidden mt-1">
 <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.min(100, workNotes.length)}%` }}></div>
 </div>
 </div>
 </div>
 <textarea
 rows={10}
 value={workNotes}
 onChange={e => setWorkNotes(e.target.value)}
 placeholder="Log your operational output and provide objective links..."
 className="w-full px-8 py-6 bg-slate-950/60 backdrop-blur-3xl rounded-[2rem] border border-[#2563EB]/10 text-base text-white focus:outline-none focus:border-blue-500 transition-all font-medium placeholder-white/5 resize-none leading-relaxed italic"
 />
 </div>

 {/* Checklist */}
 <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[1.5rem] p-6 backdrop-blur-xl">
 <h4 className="text-base font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-3">
 <CheckCircle className="w-5 h-5" />
 WORK COMPLETION CHECKLIST:
 </h4>
 <ul className="space-y-3">
 {[
 'PROJECT REQUIREMENTS MET',
 'ALL ASSETS PROPERLY LINKED',
 'ACCESS PERMISSIONS VERIFIED',
 'DOCUMENTATION INCLUDED',
 ].map((item, i) => (
 <li key={i} className="flex items-start gap-3 text-base font-bold uppercase tracking-widest text-emerald-400/60">
 <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
 {item}
 </li>
 ))}
 </ul>
 </div>

 <div className="flex gap-4 pt-6 border-t border-[#2563EB]/10">
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
 <Upload className="w-5 h-5" />
 SUBMIT WORK
 </>
 )}
 </button>
 </div>
 </form>
 </div>
 </div>
 </div>
 );
};

export default SubmitWorkPage;
