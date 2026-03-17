import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  DollarSign, SlidersHorizontal, LayoutGrid, Search, ChevronDown, Clock, Briefcase, ArrowUpRight, X
} from 'lucide-react';
import PageBackground from '../components/PageBackground';

const CATEGORIES = [
  'All Categories', 'Web Development', 'UI/UX Design', 'Mobile Apps',
  'AI & Machine Learning', 'Data Science', 'Content Writing',
  'Digital Marketing', 'Cybersecurity', 'Backend Development',
];

const EXPERIENCE_LEVELS = ['Any Level', 'Entry Level', 'Intermediate', 'Expert'];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'budget_high', label: 'Highest Budget' },
  { value: 'budget_low', label: 'Lowest Budget' },
];

const SkeletonCard = () => (
  <div className="rounded-[2.5rem] border border-white/[0.05] bg-slate-950/40 p-9 overflow-hidden relative">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-pulse"></div>
    <div className="flex justify-between mb-5">
      <div className="h-5 bg-white/[0.05] rounded-full w-2/3"></div>
      <div className="h-4 bg-white/[0.05] rounded-full w-14"></div>
    </div>
    <div className="space-y-2.5 mb-7">
      <div className="h-3 bg-white/[0.04] rounded-full w-full"></div>
      <div className="h-3 bg-white/[0.04] rounded-full w-4/5"></div>
    </div>
    <div className="flex gap-2 mb-7">
      <div className="h-6 bg-white/[0.04] rounded-full w-16"></div>
      <div className="h-6 bg-white/[0.04] rounded-full w-20"></div>
    </div>
    <div className="flex justify-between border-t border-white/[0.05] pt-5">
      <div className="h-4 bg-white/[0.04] rounded-full w-20"></div>
      <div className="h-9 bg-white/[0.04] rounded-xl w-28"></div>
    </div>
  </div>
);

const JobCard = ({ job }) => {
  const statusConfig = {
    open: { cls: 'text-emerald-400 bg-emerald-500/[0.08] border-emerald-500/[0.18]', dot: 'bg-emerald-500' },
    in_progress: { cls: 'text-blue-400 bg-blue-500/[0.08] border-blue-500/[0.18]', dot: 'bg-blue-500' },
  };
  const cfg = statusConfig[job.status] || { cls: 'text-white/30 bg-white/[0.04] border-white/[0.08]', dot: 'bg-white/30' };

  const daysAgo = Math.floor((Date.now() - new Date(job.created_at)) / (1000 * 60 * 60 * 24));

  const skillHints = ['React', 'Python', 'Node.js', 'TypeScript', 'AWS', 'Django', 'Vue', 'MongoDB', 'Flutter', 'Figma'];
  const jobSkills = skillHints.filter(s =>
    job.title?.toLowerCase().includes(s.toLowerCase()) ||
    job.description?.toLowerCase().includes(s.toLowerCase())
  ).slice(0, 3);

  return (
    <div className="group relative overflow-hidden bg-slate-950/50 backdrop-blur-2xl rounded-[2.5rem] border border-white/[0.06] p-9 hover:bg-slate-900/50 transition-all duration-500 flex flex-col h-full"
      style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 16px 48px rgba(0,0,0,0.4)' }}>

      {/* Hover glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/[0.05] blur-[70px] rounded-full -mr-20 -mt-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-start justify-between gap-5 mb-5 relative z-10">
        <h3 className="text-xl font-black text-white leading-tight group-hover:text-blue-300 transition-colors line-clamp-2 uppercase tracking-tight flex-1"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {job.title}
        </h3>
        <span className={`flex items-center gap-1.5 text-[9px] font-black px-3.5 py-1.5 rounded-full border uppercase tracking-[0.2em] flex-shrink-0 ${cfg.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
          {job.status === 'in_progress' ? 'Active' : job.status}
        </span>
      </div>

      <p className="text-slate-400/65 text-sm leading-relaxed mb-7 line-clamp-3 font-medium flex-1 relative z-10 group-hover:text-slate-300/70 transition-colors">
        {job.description || 'No description provided for this job.'}
      </p>

      {/* Skills */}
      {jobSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-7 relative z-10">
          {jobSkills.map(skill => (
            <span key={skill} className="px-3.5 py-1.5 bg-blue-500/[0.08] border border-blue-500/[0.15] text-blue-400/80 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-500/[0.15] transition-colors cursor-default">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-white/[0.05] relative z-10">
        <div className="flex items-center gap-6 text-[10px] text-white/25 font-black uppercase tracking-widest">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] opacity-50 tracking-widest">Budget</span>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400/60" />
              <span className="text-base text-white font-black tracking-tight">${Number(job.budget).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[8px] opacity-50 tracking-widest">Posted</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 opacity-40" />
              <span>{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
            </div>
          </div>
        </div>
        <Link
          to={`/jobs/${job.job_id}`}
          className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.07] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 hover:border-blue-500 transition-all duration-300 group/btn"
        >
          View Job
          <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

const JobListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    minBudget: '',
    maxBudget: '',
    experience: 'Any Level',
    category: searchParams.get('category') || 'All Categories',
    sort: 'newest',
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs?status=open');
      let data = res.data;

      if (filters.q) {
        const q = filters.q.toLowerCase();
        data = data.filter(j =>
          j.title?.toLowerCase().includes(q) ||
          j.description?.toLowerCase().includes(q)
        );
      }
      if (filters.minBudget) data = data.filter(j => Number(j.budget) >= Number(filters.minBudget));
      if (filters.maxBudget) data = data.filter(j => Number(j.budget) <= Number(filters.maxBudget));
      if (filters.category && filters.category !== 'All Categories') {
        data = data.filter(j => j.category === filters.category);
      }

      if (filters.sort === 'budget_high') data.sort((a, b) => b.budget - a.budget);
      else if (filters.sort === 'budget_low') data.sort((a, b) => a.budget - b.budget);
      else data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const updateFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));

  const clearFilters = () => setFilters({
    q: '', minBudget: '', maxBudget: '', experience: 'Any Level', category: 'All Categories', sort: 'newest',
  });

  const hasActiveFilters = filters.minBudget || filters.maxBudget ||
    filters.experience !== 'Any Level' || filters.category !== 'All Categories';

  return (
    <div className="min-h-screen pt-20 relative">
      <PageBackground variant="dark" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">

        {/* Header */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-blue-500/40"></span>
            <span className="text-blue-400/50 font-black uppercase tracking-[0.4em] text-[9px]">Job Board</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 tracking-tight uppercase leading-none"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.04em' }}>
            Browse Jobs
          </h1>
          <p className="text-white/25 font-bold text-sm uppercase tracking-[0.3em]">
            {jobs.length} open opportunities available
          </p>
        </div>

        {/* Search + Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-3 px-7 py-4 rounded-2xl border text-[10px] uppercase font-black tracking-[0.18em] transition-all duration-400 flex-shrink-0 ${
              hasActiveFilters
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white/[0.04] backdrop-blur-2xl border-white/[0.07] text-white/40 hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && <span className="bg-white text-blue-600 rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-black">!</span>}
          </button>

          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-blue-500/40" />
            <input
              type="text"
              placeholder="Search jobs by title, skill, or keyword..."
              value={filters.q}
              onChange={e => updateFilter('q', e.target.value)}
              className="w-full pl-16 pr-5 py-4 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.07] rounded-2xl text-sm text-white focus:outline-none focus:border-blue-500/40 focus:bg-blue-500/[0.03] transition-all font-medium placeholder-white/[0.15]"
            />
            {filters.q && (
              <button onClick={() => updateFilter('q', '')} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative flex-shrink-0">
            <select
              value={filters.sort}
              onChange={e => updateFilter('sort', e.target.value)}
              className="appearance-none bg-white/[0.04] backdrop-blur-2xl border border-white/[0.07] text-[10px] font-black uppercase tracking-[0.18em] text-white/50 px-7 py-4 pr-12 rounded-2xl focus:outline-none focus:border-blue-500/40 cursor-pointer hover:bg-white/[0.06] transition-all"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          {filterOpen && (
            <aside className="w-72 flex-shrink-0 animate-slide-in">
              <div className="bg-slate-900/70 backdrop-blur-2xl rounded-3xl border border-white/[0.08] p-7 sticky top-24"
                style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 24px 48px rgba(0,0,0,0.4)' }}>
                <div className="flex justify-between items-center mb-7">
                  <h3 className="text-[10px] font-black text-blue-400/70 uppercase tracking-[0.3em]">Filter Options</h3>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-[9px] text-white/30 font-black uppercase tracking-widest hover:text-white transition-colors">
                      Reset all
                    </button>
                  )}
                </div>

                {/* Category */}
                <div className="mb-7">
                  <label className="text-[9px] font-black text-white/25 uppercase tracking-[0.25em] mb-4 block">Category</label>
                  <div className="space-y-1.5">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => updateFilter('category', cat)}
                        className={`w-full text-left text-[10px] px-4 py-2.5 rounded-xl transition-all font-bold uppercase tracking-widest ${
                          filters.category === cat
                            ? 'bg-blue-600/[0.12] text-blue-300 border border-blue-500/[0.2]'
                            : 'text-white/30 border border-transparent hover:bg-white/[0.04] hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div className="mb-7 border-t border-white/[0.05] pt-7">
                  <label className="text-[9px] font-black text-white/25 uppercase tracking-[0.25em] mb-4 block">Budget Range ($)</label>
                  <div className="flex gap-2.5">
                    <input
                      type="number" placeholder="Min"
                      value={filters.minBudget}
                      onChange={e => updateFilter('minBudget', e.target.value)}
                      className="w-1/2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white focus:border-blue-500/40 outline-none font-medium"
                    />
                    <input
                      type="number" placeholder="Max"
                      value={filters.maxBudget}
                      onChange={e => updateFilter('maxBudget', e.target.value)}
                      className="w-1/2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white focus:border-blue-500/40 outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Experience */}
                <div className="border-t border-white/[0.05] pt-7">
                  <label className="text-[9px] font-black text-white/25 uppercase tracking-[0.25em] mb-4 block">Experience Level</label>
                  <div className="space-y-1.5">
                    {EXPERIENCE_LEVELS.map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => updateFilter('experience', lvl)}
                        className={`w-full text-left text-[10px] px-4 py-2.5 rounded-xl transition-all font-bold uppercase tracking-widest ${
                          filters.experience === lvl
                            ? 'bg-blue-600/[0.12] text-blue-300 border border-blue-500/[0.2]'
                            : 'text-white/30 border border-transparent hover:bg-white/[0.04] hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Job Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-7">
              <p className="text-[10px] font-black text-white/25 uppercase tracking-[0.2em]">
                Showing <span className="text-blue-400">{jobs.length}</span> jobs
              </p>
              <div className="flex items-center gap-2.5">
                <LayoutGrid className="w-3.5 h-3.5 text-white/15" />
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Grid view</span>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-[3rem] border border-white/[0.05] border-dashed bg-slate-900/30 p-20 text-center group">
                <div className="w-16 h-16 bg-white/[0.04] rounded-3xl flex items-center justify-center mx-auto mb-7 border border-white/[0.07] group-hover:scale-105 transition-transform shadow-xl">
                  <Briefcase className="w-7 h-7 text-white/[0.1]" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No jobs found</h3>
                <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-8 max-w-xs mx-auto leading-relaxed">
                  Try adjusting your search filters or check back later.
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-3 text-[10px] font-black text-blue-400/70 hover:text-blue-300 transition-all uppercase tracking-[0.3em] bg-blue-500/[0.06] px-7 py-3.5 rounded-full border border-blue-500/[0.15]"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {jobs.map(job => <JobCard key={job.job_id} job={job} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobListPage;