import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
 FileText, Tag, ArrowRight, CheckCircle, ArrowLeft, Briefcase, DollarSign, Calendar
} from 'lucide-react';
import PageBackground from '../components/PageBackground';

const CATEGORIES = [
 'Web Development', 'UI/UX Design', 'Mobile Apps', 'AI & Machine Learning',
 'Data Science', 'Content Writing', 'Digital Marketing', 'Cybersecurity',
 'Backend Development', 'DevOps', 'Blockchain', 'Video Editing',
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
 });
 const [errors, setErrors] = useState({});
 const [loading, setLoading] = useState(false);
 const [step, setStep] = useState(1);

 const handleChange = (e) => {
 setFormData({ ...formData, [e.target.name]: e.target.value });
 if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
 };

 const validateStep1 = () => {
 const errs = {};
 if (!formData.title || formData.title.length < 10) errs.title = 'Title must be at least 10 characters.';
 if (!formData.description || formData.description.length < 50)
 errs.description = 'Please provide a detailed description (at least 50 characters).';
 return errs;
 };

 const validateStep2 = () => {
 const errs = {};
 if (!formData.budget || parseFloat(formData.budget) <= 0) errs.budget = 'Please enter a valid budget.';
 if (!formData.deadline) errs.deadline = 'Please select a deadline.';
 const today = new Date().toISOString().split('T')[0];
 if (formData.deadline && formData.deadline <= today) errs.deadline = 'Deadline must be in the future.';
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
 };
 await api.post('/jobs', payload);
 navigate('/dashboard');
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
 <div className="min-h-screen pt-20 relative">
 <PageBackground variant="dark" />
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
 <div className="mb-10">
 <Link to="/dashboard" className="inline-flex items-center gap-3 text-base font-bold text-blue-100/90 hover:text-white transition-all uppercase tracking-widest group">
 <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
 Back to Dashboard
 </Link>
 </div>

 {/* Header */}
 <div className="bg-[#111827]/40 backdrop-blur-3xl rounded-[3rem] border border-[#2563EB]/10 p-12 mb-10 relative z-10 overflow-hidden shadow-3xl">
 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full -mr-48 -mt-48 pointer-events-none"></div>
 
 <div className="flex items-center gap-8 mb-12 relative z-10">
 <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.8rem] flex items-center justify-center border border-[#2563EB]/20">
 <Briefcase className="w-10 h-10 text-white" />
 </div>
 <div>
 <h1 className="text-5xl font-black text-white leading-none tracking-tighter uppercase mb-4">COMMISSION MISSION</h1>
 <div className="flex items-center gap-4">
 <span className="h-[2px] w-12 bg-blue-500/40"></span>
 <p className="text-blue-100/90 font-bold text-sm uppercase tracking-widest">OPERATIONAL DEPLOYMENT INTERFACE</p>
 </div>
 </div>
 </div>

 {/* Step Indicator */}
 <div className="flex items-center gap-6 mb-16 relative z-10">
 {[1, 2].map((s) => (
 <React.Fragment key={s}>
 <button
 type="button"
 className={`flex items-center gap-4 px-8 py-4 rounded-[1.5rem] text-sm font-bold uppercase tracking-wider transition-all duration-500 border ${
 step === s 
 ? 'bg-blue-600 text-white border-blue-400 scale-105' 
 : step > s 
 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
 : 'bg-[#1e293b]/5 text-blue-100/70 border-[#2563EB]/10'
 }`}
 onClick={() => s < step && setStep(s)}
 >
 {step > s ? <CheckCircle className="w-5 h-5" /> : <span className="w-6 h-6 flex items-center justify-center bg-black/40 rounded-full border border-[#2563EB]/20">{s}</span>}
 {s === 1 ? 'MISSION DETAILS' : 'RESOURCES & WINDOW'}
 </button>
 {s < 2 && <div className={`flex-1 h-[2px] rounded-full transition-all duration-700 ${step > 1 ? 'bg-emerald-500' : 'bg-[#1e293b]/5'}`}></div>}
 </React.Fragment>
 ))}
 </div>

 {errors.general && (
 <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-fade-in">
 {errors.general}
 </div>
 )}

 {/* Step 1 */}
 {step === 1 && (
 <div className="space-y-8 animate-fade-in relative z-10">
 {/* Title */}
 <div>
 <label className="block text-base font-bold text-blue-400 uppercase tracking-widest mb-4">
 JOB TITLE <span className="text-red-400">*</span>
 </label>
 <div className="relative">
 <FileText className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500/40" />
 <input
 name="title"
 value={formData.title}
 onChange={handleChange}
 placeholder="e.g. Need a React developer for a marketplace..."
 className={`w-full pl-16 pr-6 py-4 bg-[#1e293b]/40 backdrop-blur-xl rounded-[1.5rem] border text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-bold placeholder-white/10 ${
 errors.title ? 'border-red-400/50' : 'border-[#2563EB]/20'
 }`}
 />
 </div>
 {errors.title && <p className="mt-2 text-base font-bold text-red-400 uppercase tracking-widest">{errors.title}</p>}
 </div>

 {/* Category */}
 <div>
 <label className="block text-sm font-bold text-blue-500 uppercase tracking-[0.6em] mb-6">
 MISSION CATEGORY
 </label>
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
 {CATEGORIES.slice(0, 9).map(cat => (
 <button
 key={cat}
 type="button"
 onClick={() => setFormData({ ...formData, category: cat })}
 className={`px-6 py-4 text-base font-bold uppercase tracking-wider rounded-2xl border transition-all duration-500 ${
 formData.category === cat
 ? 'bg-blue-600 text-white border-blue-400'
 : 'bg-[#111827]/40 border-[#2563EB]/10 text-blue-100/70 hover:border-blue-500/40 hover:text-blue-400'
 }`}
 >
 {cat}
 </button>
 ))}
 </div>
 </div>

 {/* Description */}
 <div>
 <div className="flex justify-between items-center mb-6">
 <label className="block text-sm font-bold text-blue-500 uppercase tracking-[0.6em]">
 MISSION PARAMETERS <span className="text-red-400">*</span>
 </label>
 <span className={`text-base font-bold uppercase tracking-widest ${formData.description.length < 50 ? 'text-white/70' : 'text-emerald-400/60'}`}>
 {formData.description.length} DATA NODES
 </span>
 </div>
 <textarea
 name="description"
 rows={8}
 value={formData.description}
 onChange={handleChange}
 placeholder="Describe mission objectives and required output..."
 className={`w-full px-8 py-6 bg-[#111827]/40 backdrop-blur-3xl rounded-[2rem] border text-base text-white focus:outline-none focus:border-blue-500 transition-all font-medium placeholder-white/5 resize-none leading-relaxed italic ${
 errors.description ? 'border-red-400/50 shadow-inner' : 'border-[#2563EB]/10'
 }`}
 />
 {errors.description && <p className="mt-4 text-base font-bold text-red-400 uppercase tracking-widest px-4">{errors.description}</p>}
 </div>

 {/* Skills */}
 <div>
 <label className="block text-base font-bold text-blue-400 uppercase tracking-widest mb-4">
 REQUIRED SKILLS <span className="text-white/70 font-black tracking-widest">(OPTIONAL)</span>
 </label>
 <div className="relative">
 <Tag className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500/40" />
 <input
 name="skills"
 value={formData.skills}
 onChange={handleChange}
 placeholder="e.g. React, Node.js, Tailwind..."
 className="w-full pl-16 pr-6 py-4 bg-[#1e293b]/40 backdrop-blur-xl rounded-[1.5rem] border border-[#2563EB]/20 text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-bold placeholder-white/10"
 />
 </div>
 </div>

 <button
 type="button"
 onClick={handleNext}
 className="w-full flex items-center justify-center gap-4 bg-gradient-to-r from-[#2563EB] to-[#9B2C8C] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(155,44,140,0.6)] border border-blue-500/20 font-black py-5 rounded-[2rem] hover: transition-all active:scale-[0.98] uppercase tracking-wider text-xs"
 >
 CONTINUE TO NEXT STEP <ArrowRight className="w-5 h-5" />
 </button>
 </div>
 )}

 {/* Step 2 */}
 {step === 2 && (
 <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in relative z-10" noValidate>
 <div className="grid sm:grid-cols-2 gap-8">
 {/* Budget */}
 <div>
 <label className="block text-base font-bold text-blue-400 uppercase tracking-widest mb-4">
 BUDGET (USD) <span className="text-red-400">*</span>
 </label>
 <div className="relative">
 <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
 <input
 name="budget"
 type="number"
 min="1"
 step="1"
 value={formData.budget}
 onChange={handleChange}
 placeholder="Amount in USD..."
 className={`w-full pl-16 pr-6 py-4 bg-[#1e293b]/40 backdrop-blur-xl rounded-[1.5rem] border text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-bold placeholder-white/10 ${
 errors.budget ? 'border-red-400/50' : 'border-[#2563EB]/20'
 }`}
 />
 </div>
 {errors.budget && <p className="mt-2 text-base font-bold text-red-400 uppercase tracking-widest">{errors.budget}</p>}
 </div>

 {/* Deadline */}
 <div>
 <label className="block text-base font-bold text-blue-400 uppercase tracking-widest mb-4">
 DEADLINE <span className="text-red-400">*</span>
 </label>
 <div className="relative">
 <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500/40" />
 <input
 name="deadline"
 type="date"
 min={minDateStr}
 value={formData.deadline}
 onChange={handleChange}
 className={`w-full pl-16 pr-6 py-4 bg-[#1e293b]/40 backdrop-blur-xl rounded-[1.5rem] border text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-bold ${
 errors.deadline ? 'border-red-400/50' : 'border-[#2563EB]/20'
 }`}
 />
 </div>
 {errors.deadline && <p className="mt-2 text-base font-bold text-red-400 uppercase tracking-widest">{errors.deadline}</p>}
 </div>
 </div>

 {/* Experience Level */}
 <div>
 <label className="block text-base font-bold text-blue-400 uppercase tracking-widest mb-4">
 EXPERIENCE LEVEL REQUIRED
 </label>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 {[
 { value: 'entry', label: 'Entry Level', desc: 'Beginner friendly' },
 { value: 'intermediate', label: 'Intermediate', desc: 'Sector specialists' },
 { value: 'expert', label: 'Expert Tier', desc: 'Sovereign masters' },
 ].map(lvl => (
 <button
 key={lvl.value}
 type="button"
 onClick={() => setFormData({ ...formData, experience_level: lvl.value })}
 className={`p-6 text-left rounded-[1.5rem] border transition-all duration-300 ${
 formData.experience_level === lvl.value
 ? 'bg-blue-600/10 border-blue-400 text-white'
 : 'bg-[#1e293b]/5 border-[#2563EB]/10 text-blue-100/90 hover:border-blue-500/30'
 }`}
 >
 <p className="text-base font-bold uppercase tracking-widest leading-none mb-1.5">{lvl.label}</p>
 <p className="text-sm font-bold text-blue-100/70 uppercase tracking-tighter">{lvl.desc}</p>
 </button>
 ))}
 </div>
 </div>

 {/* Summary */}
 <div className="bg-[#1e293b]/5 border border-[#2563EB]/10 rounded-[1.5rem] p-6 backdrop-blur-md">
 <h4 className="text-base font-bold text-blue-400 uppercase tracking-widest mb-3">JOB SUMMARY:</h4>
 <p className="text-sm text-white font-bold uppercase tracking-widest line-clamp-1">{formData.title}</p>
 <p className="text-sm text-blue-100/90 mt-1 line-clamp-2 italic">"{formData.description}"</p>
 </div>

 <div className="flex gap-4 pt-4">
 <button
 type="button"
 onClick={() => setStep(1)}
 className="px-10 py-5 border border-[#2563EB]/20 text-white font-bold text-base rounded-[1.5rem] hover:bg-[#1e293b]/5 transition-all active:scale-95 uppercase tracking-widest"
 >
 ← BACK
 </button>
 <button
 type="submit"
 disabled={loading}
 className="flex-1 flex items-center justify-center gap-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black py-5 rounded-[1.5rem] hover: transition-all active:scale-95 disabled:opacity-60 text-xs uppercase tracking-wider"
 >
 {loading ? (
 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 ) : (
 <>POST JOB NOW <CheckCircle className="w-5 h-5" /></>
 )}
 </button>
 </div>
 </form>
 )}
 </div>
 </div>
 </div>
 );
};

export default NewJobPage;
