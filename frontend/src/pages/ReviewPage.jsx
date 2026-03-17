import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Star, ArrowLeft, CheckCircle, ThumbsUp } from 'lucide-react';
import PageBackground from '../components/PageBackground';

const StarPicker = ({ rating, onChange }) => (
 <div className="flex items-center gap-2">
 {[1, 2, 3, 4, 5].map(star => (
 <button
 key={star}
 type="button"
 onClick={() => onChange(star)}
 className={`transition-transform hover:scale-125 active:scale-110 ${star <= rating ? 'text-amber-400' : 'text-slate-200'}`}
 >
 <Star className={`w-8 h-8 ${star <= rating ? 'fill-amber-400' : 'fill-current'}`} />
 </button>
 ))}
 <span className="ml-2 text-sm font-medium text-slate-600">
 {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent!'}
 </span>
 </div>
);

const ReviewPage = () => {
 const { id } = useParams();
 const { user } = useContext(AuthContext);
 const [project, setProject] = useState(null);
 const [rating, setRating] = useState(5);
 const [hoverRating, setHoverRating] = useState(0);
 const [comment, setComment] = useState('');
 const [loading, setLoading] = useState(false);
 const [submitted, setSubmitted] = useState(false);
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
 if (!comment.trim()) { setError('Please write a comment before submitting.'); return; }
 setLoading(true);
 setError('');

 const revieweeId = user.user_id === project.client_id ? project.freelancer_id : project.client_id;

 try {
 await api.post('/reviews', {
 project_id: parseInt(id),
 reviewee_id: revieweeId,
 rating: parseInt(rating),
 comment: comment,
 });
 setSubmitted(true);
 setTimeout(() => navigate('/dashboard'), 2500);
 } catch (err) {
 setError(err.response?.data?.detail || 'Error submitting review. Please try again.');
 } finally {
 setLoading(false);
 }
 };

 if (!project) return (
 <div className="min-h-screen pt-24 relative flex items-center justify-center">
 <PageBackground variant="dark" />
 <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
 </div>
 );

 if (submitted) return (
 <div className="min-h-screen pt-24 relative flex items-center justify-center">
 <PageBackground variant="dark" />
 <div className="text-center max-w-sm mx-auto px-4 animate-slide-up relative z-10">
 <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">REVIEW SUBMITTED</h2>
 <p className="text-blue-100/90 text-base font-bold uppercase tracking-widest mb-8 leading-relaxed">Thank you for your feedback. Reputation updated across the platform.</p>
 <div className="flex items-center justify-center gap-3 text-emerald-400 font-bold text-base uppercase tracking-widest">
 <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
 <span>Syncing Dashboard...</span>
 </div>
 </div>
 </div>
 );

 return (
 <div className="min-h-screen pt-20 relative">
 <PageBackground variant="dark" />
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
 <div className="mb-10">
 <Link to={`/projects/${id}`} className="inline-flex items-center gap-3 text-base font-bold text-blue-100/90 hover:text-white transition-all uppercase tracking-widest group">
 <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
 Back to Project Dashboard
 </Link>
 </div>

 <div className="bg-[#111827]/40 backdrop-blur-3xl rounded-[3rem] border border-[#2563EB]/10 p-12 animate-fade-in relative z-10 overflow-hidden text-center shadow-3xl">
 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[150px] rounded-full -mr-48 -mt-48 pointer-events-none"></div>
 
 <div className="relative z-10 mb-16">
 <div className="w-24 h-24 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-amber-500/20">
 <Star className="w-12 h-12 text-amber-500 fill-amber-500/20" />
 </div>
 <h1 className="text-6xl font-black text-white leading-none tracking-tighter uppercase mb-6">ASSESS OPS</h1>
 <div className="flex items-center justify-center gap-4">
 <span className="h-[2px] w-12 bg-amber-500/30"></span>
 <p className="text-blue-100/90 font-bold text-sm uppercase tracking-widest">
 MISSION #{id} PERFORMANCE PROTOCOL
 </p>
 </div>
 </div>

 {error && (
 <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-fade-in">
 {error}
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-10 relative z-10 text-left">
 {/* Star Rating */}
 <div className="flex flex-col items-center bg-[#1e293b]/2 rounded-[2.5rem] p-10 border border-[#2563EB]/10 shadow-inner">
 <label className="block text-sm font-bold text-amber-500 uppercase tracking-[0.6em] mb-10 text-center">
 EXPERIENCE MAGNITUDE
 </label>
 <div className="flex flex-col items-center gap-6">
 <div className="flex items-center gap-6">
 {[1, 2, 3, 4, 5].map(star => (
 <button
 key={star}
 type="button"
 onClick={() => setRating(star)}
 onMouseEnter={() => setHoverRating(star)}
 onMouseLeave={() => setHoverRating(0)}
 className="transition-all hover:scale-125 active:scale-110 duration-300"
 >
 <Star
 className={`w-16 h-16 transition-all duration-500 ${
 star <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'fill-white/5 text-white/5 border-[#2563EB]/10'
 }`}
 />
 </button>
 ))}
 </div>
 <div className="bg-[#1e293b]/5 px-8 py-3 rounded-full border border-[#2563EB]/10 mt-4">
 <p className="text-sm font-bold text-white uppercase tracking-widest leading-none">
 {(hoverRating || rating) === 1 ? 'Poor' : 
 (hoverRating || rating) === 2 ? 'Fair' : 
 (hoverRating || rating) === 3 ? 'Good' : 
 (hoverRating || rating) === 4 ? 'Very Good' : 'Elite Class Experience ⭐'}
 </p>
 </div>
 </div>
 </div>

 {/* Comment */}
 <div className="bg-[#1e293b]/2 rounded-[2.5rem] p-10 border border-[#2563EB]/10 shadow-inner">
 <div className="flex justify-between items-center mb-8">
 <label className="block text-sm font-bold text-blue-500 uppercase tracking-[0.6em]">
 MISSION BRIEF
 </label>
 <div className="flex flex-col items-end">
 <span className={`text-base font-bold uppercase tracking-widest ${comment.length > 20 ? 'text-emerald-400' : 'text-white/70'}`}>
 {comment.length} DATA NODES
 </span>
 <div className="h-1 w-24 bg-[#1e293b]/5 rounded-full overflow-hidden mt-1">
 <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.min(100, comment.length)}%` }}></div>
 </div>
 </div>
 </div>
 <textarea
 className={`w-full px-8 py-6 bg-slate-950/60 backdrop-blur-3xl rounded-[2rem] border text-base text-white focus:outline-none focus:border-blue-500 transition-all font-medium placeholder-white/5 resize-none leading-relaxed italic ${
 error && !comment ? 'border-red-400/50 shadow-inner' : 'border-[#2563EB]/10'
 }`}
 rows={6}
 value={comment}
 onChange={e => setComment(e.target.value)}
 placeholder="Log your mission assessment here..."
 />
 </div>

 {/* Quick phrases */}
 <div className="px-10">
 <p className="text-base font-bold text-white/70 uppercase tracking-widest mb-6">PRESET LOG ENTRIES:</p>
 <div className="flex flex-wrap gap-4">
 {[
 'SYNERGY OPTIMIZED',
 'TIMESTAMP NOMINAL',
 'OBJECTIVES EXCEEDED',
 'ELITE COLLABORATION',
 'QUALITY VERIFIED',
 ].map(phrase => (
 <button
 key={phrase}
 type="button"
 onClick={() => setComment(prev => prev ? prev + ' ' + phrase : phrase)}
 className="text-base font-bold uppercase tracking-widest bg-[#1e293b]/2 border border-[#2563EB]/10 text-blue-400/60 px-6 py-3 rounded-2xl hover:border-blue-400 hover:text-white hover:bg-blue-600 transition-all duration-300"
 >
 {phrase}
 </button>
 ))}
 </div>
 </div>

 {/* Submit */}
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
 className="flex-1 flex items-center justify-center gap-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black py-4 rounded-[1.5rem] hover: transition-all active:scale-95 disabled:opacity-60 text-xs uppercase tracking-wider"
 >
 {loading ? (
 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 ) : (
 <>
 <CheckCircle className="w-5 h-5" />
 SUBMIT REVIEW
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

export default ReviewPage;
