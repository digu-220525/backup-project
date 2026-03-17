import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  Edit2, Save, X, Star, User, ArrowLeft, CheckCircle, Mail, Clock, Briefcase, Award, Lock, AlertCircle
} from 'lucide-react';
import PageBackground from '../components/PageBackground';

const StarRating = ({ rating, max = 5 }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(max)].map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-white/[0.08]'}`}
      />
    ))}
  </div>
);

const ReviewCard = ({ review }) => (
  <div className="group relative overflow-hidden rounded-[2rem] border border-white/[0.06] bg-slate-950/40 backdrop-blur-xl p-7 transition-all duration-500 hover:bg-white/[0.03] hover:border-white/[0.1]"
    style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 12px 32px rgba(0,0,0,0.4)' }}>
    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/[0.04] blur-[40px] rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
    <div className="flex items-start justify-between mb-5 relative z-10">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-sm border border-white/[0.08]">
          {review.reviewer_id?.toString().charAt(0) || 'C'}
        </div>
        <div>
          <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Client #{review.reviewer_id}
          </p>
          <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-0.5">
            {new Date(review.created_at || Date.now()).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex bg-white/[0.04] px-2.5 py-1.5 rounded-xl border border-white/[0.05] gap-0.5">
        <StarRating rating={review.rating} />
      </div>
    </div>
    <div className="relative pl-5 z-10">
      <div className="absolute left-0 top-0 w-[2px] h-full bg-gradient-to-b from-blue-500/30 to-transparent rounded-full"></div>
      <p className="text-sm text-slate-300/75 font-medium leading-relaxed italic group-hover:text-slate-200/90 transition-colors">
        "{review.comment || 'Excellent work delivered on time. Highly recommended.'}"
      </p>
    </div>
  </div>
);

const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser, fetchUserProfile } = useContext(AuthContext);
  const [profileUser, setProfileUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [editForm, setEditForm] = useState({ name: '', email: '', bio: '', skills: '', current_password: '' });

  const loadProfile = async () => {
    try {
      const reviewsRes = await api.get(`/reviews/user/${id}`);
      setReviews(reviewsRes.data);

      if (currentUser && parseInt(id) === currentUser.user_id) {
        const profileRes = await api.get('/auth/profile');
        setProfileUser(profileRes.data);
      } else {
        const profileRes = await api.get(`/auth/users/${id}`);
        setProfileUser(profileRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, [id, currentUser]);

  const handleEditToggle = () => {
    const p = profileUser || currentUser;
    setEditForm({ name: p.name || '', email: p.email || '', bio: p.bio || '', skills: p.skills || '', current_password: '' });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setStatus({ message: '', type: '' });

    const isEmailChanged = editForm.email !== profileUser.email;
    if (isEmailChanged && !editForm.current_password) {
      setStatus({ message: 'Current password is required to change email address.', type: 'error' });
      setSaving(false);
      return;
    }

    try {
      const response = await api.put('/auth/profile', editForm);

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }

      setStatus({ message: 'Profile updated successfully.', type: 'success' });

      setTimeout(async () => {
        await loadProfile();
        if (fetchUserProfile) await fetchUserProfile();
        setIsEditing(false);
        setStatus({ message: '', type: '' });
      }, 1500);
    } catch (err) {
      console.error('Failed to update profile:', err);
      const errorMsg = err.response?.data?.detail === 'Authorization failed: Incorrect password'
        ? 'Authorization failed: Incorrect password.'
        : (err.response?.data?.detail || 'Failed to save profile. Please try again.');
      setStatus({ message: errorMsg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const profile = profileUser || (currentUser?.user_id === parseInt(id) ? currentUser : null);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const skills = profile?.skills ? profile.skills.split(',').map(s => s.trim()).filter(Boolean) : [];

  if (loading) return (
    <div className="min-h-screen pt-24">
      <PageBackground variant="dark" />
      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <div className="animate-pulse space-y-5">
          <div className="bg-slate-900/40 rounded-[2.5rem] border border-white/[0.06] p-10">
            <div className="flex gap-7">
              <div className="w-28 h-28 bg-white/[0.05] rounded-3xl"></div>
              <div className="flex-1 space-y-4">
                <div className="h-7 bg-white/[0.05] rounded-full w-48"></div>
                <div className="h-4 bg-white/[0.04] rounded-full w-32"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-white/[0.04] rounded-full w-full"></div>
                  <div className="h-3 bg-white/[0.04] rounded-full w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen pt-24 relative">
      <PageBackground variant="dark" />
      <div className="max-w-xl mx-auto px-4 py-24 text-center relative z-10">
        <div className="w-16 h-16 bg-white/[0.04] rounded-3xl flex items-center justify-center mx-auto mb-7 border border-white/[0.07]">
          <User className="w-7 h-7 text-white/20" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-3">Profile Not Found</h2>
        <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-8">We couldn't find this profile.</p>
        <Link
          to={currentUser?.role === 'freelancer' ? '/dashboard' : '/freelancers'}
          className="inline-flex items-center gap-3 text-[10px] font-black text-blue-400/70 hover:text-blue-300 transition-all uppercase tracking-[0.3em] bg-blue-500/[0.06] px-7 py-3.5 rounded-full border border-blue-500/[0.15]"
        >
          <ArrowLeft className="w-4 h-4" />
          {currentUser?.role === 'freelancer' ? 'Back to Dashboard' : 'Browse Talent'}
        </Link>
      </div>
    </div>
  );

  const isOwnProfile = currentUser?.user_id === profile.user_id;

  return (
    <div className="min-h-screen pt-20 relative">
      <PageBackground variant="dark" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">

        {/* Status Message */}
        {status.message && (
          <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 animate-fade-in ${
            status.type === 'success'
              ? 'bg-emerald-500/[0.08] border-emerald-500/[0.18] text-emerald-400'
              : 'bg-red-500/[0.08] border-red-500/[0.18] text-red-400'
          }`}>
            {status.type === 'success' ? <CheckCircle className="w-4.5 h-4.5 flex-shrink-0" /> : <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />}
            <span className="text-[10px] font-bold uppercase tracking-widest">{status.message}</span>
          </div>
        )}

        {/* Back Button */}
        <div className="mb-8">
          <Link
            to={currentUser?.role === 'freelancer' ? '/dashboard' : '/freelancers'}
            className="inline-flex items-center gap-2.5 text-[10px] font-black text-white/25 hover:text-white transition-all uppercase tracking-[0.25em] group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {currentUser?.role === 'freelancer' ? 'Dashboard' : 'Browse Talent'}
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            {/* Profile Hero */}
            <div className="bg-slate-900/50 backdrop-blur-2xl rounded-[2.5rem] border border-white/[0.08] p-10 animate-fade-in relative overflow-hidden"
              style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.5)' }}>

              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/[0.07] blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>

              <div className="flex flex-col sm:flex-row gap-8 relative z-10">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-blue-500/20 border border-white/[0.1]">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full text-3xl font-black text-white bg-white/[0.05] border border-white/[0.1] rounded-2xl px-5 py-3.5 mb-4 focus:border-blue-500/40 outline-none uppercase tracking-tight"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        />
                      ) : (
                        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight uppercase leading-none"
                          style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}>
                          {profile.name}
                        </h1>
                      )}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 bg-blue-500/[0.08] border border-blue-500/[0.18] px-4 py-1.5 rounded-full">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{profile.role}</span>
                        </div>
                        {profile.role === 'freelancer' && (
                          <div className="flex items-center gap-2 bg-emerald-500/[0.08] border border-emerald-500/[0.18] px-4 py-1.5 rounded-full">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Available</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Edit Controls */}
                    {isEditing ? (
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="text-[10px] font-black text-white/40 border border-white/[0.1] px-5 py-2.5 rounded-xl hover:bg-white/[0.05] transition-all uppercase tracking-widest"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="text-[10px] font-black text-white bg-blue-600 border border-blue-500/50 px-5 py-2.5 rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50 uppercase tracking-widest flex items-center gap-2"
                        >
                          {saving ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            <><Save className="w-3.5 h-3.5" /> Save</>
                          )}
                        </button>
                      </div>
                    ) : isOwnProfile && (
                      <button
                        onClick={handleEditToggle}
                        className="text-[10px] font-black text-blue-400/70 border border-blue-500/[0.2] px-5 py-2.5 rounded-xl hover:bg-blue-500/[0.08] transition-all hover:border-blue-400/40 uppercase tracking-widest flex items-center gap-2"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit Profile
                      </button>
                    )}
                  </div>

                  {/* Rating */}
                  {avgRating && !isEditing && (
                    <div className="flex items-center gap-3 mt-5">
                      <div className="flex bg-white/[0.04] px-3 py-2 rounded-xl border border-white/[0.05] gap-0.5">
                        <StarRating rating={Math.round(parseFloat(avgRating))} />
                      </div>
                      <span className="font-black text-white text-base tracking-tight">{avgRating}</span>
                      <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">({reviews.length} reviews)</span>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex flex-wrap gap-8 mt-7">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-black text-white/15 uppercase tracking-[0.3em]">Email</span>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2 text-blue-200/70 focus:border-blue-500/40 outline-none text-sm font-medium"
                          placeholder="Email Address"
                        />
                      ) : (
                        <span className="flex items-center gap-2 text-blue-200/50 font-bold text-sm">
                          <Mail className="w-3.5 h-3.5 text-blue-500/30" />
                          {profile.email}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-black text-white/15 uppercase tracking-[0.3em]">Member since</span>
                      <span className="flex items-center gap-2 text-blue-200/50 font-bold text-sm">
                        <Clock className="w-3.5 h-3.5 text-blue-500/30" />
                        {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-8 pt-8 border-t border-white/[0.06]">
                <h3 className="text-[10px] font-black text-blue-400/60 uppercase tracking-[0.3em] mb-4">Bio</h3>
                {isEditing ? (
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full text-sm text-slate-300 bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 focus:border-blue-500/40 outline-none resize-y min-h-[100px] font-medium"
                  />
                ) : (
                  <p className="text-slate-300/75 text-base leading-relaxed font-medium">{profile.bio || 'No bio provided.'}</p>
                )}
              </div>

              {/* Skills */}
              {(skills.length > 0 || isEditing || profile.role === 'freelancer') && (
                <div className="mt-7 border-t border-white/[0.06] pt-7">
                  <h3 className="text-[10px] font-black text-blue-400/60 uppercase tracking-[0.3em] mb-4">Skills & Expertise</h3>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.skills}
                      onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                      placeholder="e.g. React, Python, UI Design"
                      className="w-full text-sm text-slate-300 bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 focus:border-blue-500/40 outline-none font-medium"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2.5">
                      {skills.length > 0 ? skills.map(skill => (
                        <span key={skill} className="px-4 py-1.5 bg-blue-500/[0.08] border border-blue-500/[0.15] text-blue-300/80 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/[0.15] transition-colors cursor-default">
                          {skill}
                        </span>
                      )) : <span className="text-sm text-white/20 italic">No skills listed.</span>}
                    </div>
                  )}
                </div>
              )}

              {/* Password for email change */}
              {isEditing && (
                <div className="mt-7 p-6 bg-blue-500/[0.05] rounded-2xl border border-blue-500/[0.1]">
                  <div className="flex items-center gap-3 mb-4">
                    <Lock className="w-4 h-4 text-blue-400/60" />
                    <h4 className="text-[10px] font-black text-blue-400/60 uppercase tracking-widest">Security Verification</h4>
                  </div>
                  <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mb-4">
                    Required only when changing your email address.
                  </p>
                  <input
                    type="password"
                    value={editForm.current_password}
                    onChange={(e) => setEditForm({ ...editForm, current_password: e.target.value })}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:border-blue-500/40 outline-none text-sm font-medium"
                    placeholder="Current password..."
                  />
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-black text-white tracking-tight uppercase"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Reviews
                </h2>
                <span className="bg-white/[0.05] text-white/30 border border-white/[0.07] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {reviews.length}
                </span>
              </div>

              {reviews.length === 0 ? (
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/[0.05] border-dashed p-16 text-center">
                  <div className="w-14 h-14 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/[0.07]">
                    <Star className="w-6 h-6 text-white/[0.1]" />
                  </div>
                  <p className="text-[10px] font-black text-white/25 uppercase tracking-[0.3em] mb-2">No reviews yet</p>
                  <p className="text-white/15 text-[9px] font-bold uppercase tracking-widest">Reviews will appear after completed projects.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review, i) => <ReviewCard key={i} review={review} />)}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="bg-slate-950/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/[0.06] p-8 relative overflow-hidden"
              style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 24px 48px rgba(0,0,0,0.5)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/[0.05] blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>
              <h3 className="text-[10px] font-black text-blue-400/60 uppercase tracking-[0.4em] mb-8">Performance</h3>
              <div className="space-y-7">
                {[
                  { icon: <Star className="w-4 h-4 text-amber-400" />, label: 'Rating', value: avgRating ? `${avgRating} / 5.0` : 'No reviews yet' },
                  { icon: <Briefcase className="w-4 h-4 text-blue-400" />, label: 'Jobs Completed', value: reviews.length },
                  { icon: <CheckCircle className="w-4 h-4 text-emerald-400" />, label: 'Success Rate', value: '100%' },
                  { icon: <Award className="w-4 h-4 text-purple-400" />, label: 'Member Level', value: profile.role === 'freelancer' ? 'Level 1' : 'Client' },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {stat.icon}
                      <span className="text-[10px] font-black text-white/25 uppercase tracking-[0.2em]">{stat.label}</span>
                    </div>
                    <span className="text-sm font-black text-white tracking-tight">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hire Card */}
            {!isOwnProfile && currentUser?.role === 'client' && (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 border border-white/[0.1] relative overflow-hidden group"
                style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 24px 48px rgba(59,130,246,0.2)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-3 relative z-10">Hire This Freelancer</h3>
                <p className="text-[10px] text-blue-100/40 font-bold uppercase tracking-widest mb-7 leading-relaxed relative z-10">Post a job to invite this freelancer to collaborate.</p>
                <Link
                  to="/jobs/new"
                  className="block w-full text-center bg-white text-slate-950 font-black py-3.5 rounded-xl text-[10px] uppercase tracking-[0.25em] hover:bg-blue-50 transition-all active:scale-[0.98] relative z-10 shadow-lg"
                >
                  Post a Job
                </Link>
              </div>
            )}

            {/* Availability */}
            {profile.role === 'freelancer' && (
              <div className="bg-emerald-500/[0.07] border border-emerald-500/[0.15] backdrop-blur-xl rounded-[2rem] p-7 relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-2.5 relative z-10">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.6)]"></div>
                  <span className="font-black text-emerald-400 text-[11px] uppercase tracking-[0.25em]">Available for Work</span>
                </div>
                <p className="text-emerald-200/30 text-[10px] font-bold uppercase tracking-widest relative z-10">Ready to start new projects immediately.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;