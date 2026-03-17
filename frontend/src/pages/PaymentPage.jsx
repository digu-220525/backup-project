import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
 CheckCircle, AlertTriangle, Building, DollarSign, CreditCard, Lock, ShieldCheck, ArrowLeft, Calendar, Hash
} from 'lucide-react';
import PageBackground from '../components/PageBackground';

const PaymentPage = () => {
 const { id } = useParams(); // project_id
 const [job, setJob] = useState(null);
 const [loading, setLoading] = useState(false);
 const [verifying, setVerifying] = useState(false);
 const [error, setError] = useState('');
 const [success, setSuccess] = useState(false);
 const [authPassword, setAuthPassword] = useState('');
 const navigate = useNavigate();

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const projRes = await api.get('/projects');
        const project = projRes.data.find(p => p.project_id === parseInt(id));
        if (project) {
          if (project.status === 'completed') {
             setSuccess(true);
             return;
          }
          if (project.status !== 'work_submitted') {
            setError('DATA LINK FAILURE: Work not yet submitted. Access to payment node denied.');
            setTimeout(() => navigate(`/projects/${id}`), 3000);
            return;
          }
          const jobRes = await api.get(`/jobs/${project.job_id}`);
          setJob(jobRes.data);
        } else {
           navigate('/dashboard');
        }
      } catch (err) {
        console.error(err);
        navigate('/dashboard');
      }
    };
    fetchBudget();
  }, [id, navigate]);

 const handleProcessPayment = async (e) => {
 e.preventDefault();
 if (!job) return;
 setVerifying(true);
 setError('');
 
 try {
 // 1. Verify Authorization Password
 await api.post('/auth/verify-password', { password: authPassword });

    // 2. Process Final Approval & Synergy
    await api.put(`/projects/${id}/approve`);

 // 3. Create Transaction Record
 await api.post('/payments', {
 project_id: parseInt(id),
 amount: job.budget
 });

 setSuccess(true);
 // Notify freelancer is simulated here
 console.log('Notification sent to freelancer: Payment received for project', id);

 setTimeout(() => navigate('/dashboard'), 3000);
 } catch (err) {
 setError(err.response?.data?.detail || 'AUTHENTICATION FAILED. PLEASE VERIFY CREDENTIALS.');
 } finally {
 setVerifying(false);
 }
 };

 if (!job && !success) return (
 <div className="min-h-screen pt-24 relative flex items-center justify-center">
 <PageBackground variant="dark" />
 <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
 </div>
 );

 if (success) return (
 <div className="min-h-screen fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-3xl animate-fade-in">
 <div className="text-center max-w-lg mx-auto px-8 py-16 bg-[#1e293b]/5 rounded-[3rem] border border-emerald-500/30 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
 
 <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
 <CheckCircle className="w-12 h-12 text-emerald-400" />
 </div>
 <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">PAYMENT SUCCESSFUL</h2>
 <p className="text-blue-100/90 text-base font-bold uppercase tracking-widest mb-8 leading-relaxed">
 Authorization confirmed. Funds have been released to the freelancer. 
 Mission protocols updated to COMPLETED.
 </p>
 
 <div className="pt-8 border-t border-[#2563EB]/10">
 <div className="flex items-center justify-center gap-3 text-emerald-400 font-bold text-base uppercase tracking-widest">
 <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
 <span>Syncing Dashboard...</span>
 </div>
 </div>
 </div>
 </div>
 );

 return (
 <div className="min-h-screen pt-20 relative">
 <PageBackground variant="dark" />
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
 <div className="mb-10">
 <Link to="/dashboard" className="inline-flex items-center gap-3 text-base font-bold text-blue-100/90 hover:text-white transition-all uppercase tracking-widest group">
 <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
 VantagePoint Hub / Secure Checkout
 </Link>
 </div>

 <div className="grid lg:grid-cols-3 gap-8 items-start">
 {/* Checkout Form */}
 <div className="lg:col-span-2">
 <div className="bg-[#111827]/40 backdrop-blur-3xl rounded-[3rem] border border-[#2563EB]/10 shadow-3xl p-12 lg:p-16 animate-fade-in relative overflow-hidden">
 <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full -ml-48 -mt-48 pointer-events-none"></div>
 
 <div className="flex items-center gap-8 mb-16 pb-16 border-b border-[#2563EB]/10">
 <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[1.8rem] flex items-center justify-center border border-[#2563EB]/20">
 <Lock className="w-10 h-10 text-white" />
 </div>
 <div>
 <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none mb-4">SECURE CHECKOUT</h1>
 <div className="flex items-center gap-4">
 <span className="h-[2px] w-12 bg-blue-500/40"></span>
 <p className="text-blue-100/90 font-bold text-base font-black uppercase tracking-widest">TRANSACTION NODE ALPHA-V09</p>
 </div>
 </div>
 </div>

 {error && (
 <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-base font-bold uppercase text-red-400 flex items-center gap-4 animate-shake tracking-widest">
 <AlertTriangle className="w-5 h-5" />
 {error}
 </div>
 )}

 <form onSubmit={handleProcessPayment} className="space-y-8">
 {/* Method Selection (Visual Only) */}
 <div className="grid grid-cols-2 gap-4 mb-10">
 <div className="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-4 flex flex-col items-center gap-3 cursor-pointer">
 <CreditCard className="w-6 h-6 text-blue-400" />
 <span className="text-[8px] font-black text-white uppercase tracking-widest">Credit / Debit Card</span>
 </div>
 <div className="bg-[#1e293b]/5 border border-[#2563EB]/20 rounded-2xl p-4 flex flex-col items-center gap-3 opacity-40 cursor-not-allowed">
 <Building className="w-6 h-6 text-white/90" />
 <span className="text-[8px] font-black text-white/90 uppercase tracking-widest">Net Banking</span>
 </div>
 </div>

 <div className="space-y-6">
 <div>
 <label className="block text-base font-bold text-white/80 uppercase tracking-widest mb-3 ml-4">Card Number</label>
 <div className="relative">
 <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10" />
 <input 
 type="text" 
 placeholder="4242 4242 4242 4242"
 className="w-full bg-[#1e293b]/5 border border-[#2563EB]/20 rounded-2xl px-16 py-5 text-white font-black tracking-[0.2em] text-xs focus:border-blue-500 outline-none transition-all"
 required
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-6">
 <div>
 <label className="block text-base font-bold text-white/80 uppercase tracking-widest mb-3 ml-4">Expiry Date</label>
 <div className="relative">
 <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10" />
 <input 
 type="text" 
 placeholder="MM / YY"
 className="w-full bg-[#1e293b]/5 border border-[#2563EB]/20 rounded-2xl px-16 py-5 text-white font-black tracking-[0.2em] text-xs text-center focus:border-blue-500 outline-none transition-all"
 required
 />
 </div>
 </div>
 <div>
 <label className="block text-base font-bold text-white/80 uppercase tracking-widest mb-3 ml-4">CVV / CVC</label>
 <div className="relative">
 <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10" />
 <input 
 type="password" 
 placeholder="•••"
 className="w-full bg-[#1e293b]/5 border border-[#2563EB]/20 rounded-2xl px-16 py-5 text-white font-black tracking-[0.2em] text-xs text-center focus:border-blue-500 outline-none transition-all"
 required
 />
 </div>
 </div>
 </div>

 <div className="pt-8 border-t border-[#2563EB]/10 space-y-6">
 <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-6">
 <label className="block text-base font-bold text-blue-400 uppercase tracking-widest mb-4">Secure Authorization Password</label>
 <input 
 type="password" 
 placeholder="Enter your VantagePoint password to authorize"
 value={authPassword}
 onChange={(e) => setAuthPassword(e.target.value)}
 className="w-full bg-black/40 border border-[#2563EB]/20 rounded-xl px-6 py-4 text-white font-bold text-xs focus:border-blue-500 outline-none transition-all placeholder:text-white/10"
 required
 />
 <p className="text-[8px] font-black text-blue-100/70 uppercase tracking-widest mt-4 flex items-center gap-2">
 <ShieldCheck className="w-3 h-3" />
 Cross-referencing encryption protocols for security
 </p>
 </div>

 <button 
 type="submit"
 disabled={verifying}
 className="w-full flex items-center justify-center gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white font-black py-6 rounded-[2rem] disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest text-sm group"
 >
 {verifying ? (
 <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
 ) : (
 <>
 <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
 AUTHORIZE PAYMENT - ${Number(job?.budget).toLocaleString()}
 </>
 )}
 </button>
 </div>
 </div>
 </form>
 </div>
 </div>

 {/* Side Info */}
 <div className="space-y-6">
 <div className="bg-slate-900/60 backdrop-blur-2xl rounded-[3rem] border border-[#2563EB]/20 p-10 shadow-2xl">
 <h3 className="text-base font-bold text-blue-400 uppercase tracking-widest mb-8 flex items-center gap-3">
 <DollarSign className="w-5 h-5 text-emerald-400" />
 BILLING SUMMARY
 </h3>
 
 <div className="space-y-6 mb-10 text-base font-bold uppercase tracking-widest text-white/90">
 <div className="flex justify-between items-start gap-6">
 <span className="text-white/70">PROJECT</span>
 <span className="text-right text-white leading-relaxed max-w-[150px]">
 {job?.title}
 </span>
 </div>
 <div className="flex justify-between items-center bg-[#1e293b]/5 p-4 rounded-2xl">
 <span className="text-white/70">CONTRACT BUDGET</span>
 <span className="text-white">${Number(job?.budget).toLocaleString()}</span>
 </div>
 <div className="flex justify-between items-center bg-[#1e293b]/5 p-4 rounded-2xl border border-blue-500/20">
 <span className="text-white/70">PLATFORM FEE</span>
 <span className="text-emerald-400">FREE // 0.00</span>
 </div>
 </div>

 <div className="pt-8 border-t border-[#2563EB]/10 flex justify-between items-center">
 <span className="text-base font-bold text-white/70 uppercase tracking-widest">TOTAL CHARGE</span>
 <span className="text-4xl font-black text-white">${Number(job?.budget).toLocaleString()}</span>
 </div>
 </div>

 <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[2.5rem] backdrop-blur-xl">
 <p className="text-blue-200/30 text-sm font-bold uppercase tracking-wider leading-relaxed italic">
 By authorizing this payment, you confirm the completion of project objectives. 
 Funds will be isolated and then transferred via VantagePoint secure protocols. 
 All transactions are monitored by neural encryption.
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};

export default PaymentPage;
