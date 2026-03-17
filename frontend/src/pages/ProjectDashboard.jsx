import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
  Activity, FileText, AlertTriangle, Briefcase, Upload, CheckCircle, 
  Star, ArrowLeft, User, Users, Clock, DollarSign, ShieldCheck
} from 'lucide-react';
import PageBackground from '../components/PageBackground';

const StatusBadge = ({ status }) => {
  const map = {
    active: ['bg-blue-600 text-white border-blue-400', 'MISSION ACTIVE'],
    work_submitted: ['bg-amber-600 text-white border-amber-400', 'INTEL SUBMITTED'],
    completed: ['bg-indigo-600 text-white border-indigo-400', 'MISSION COMPLETE'],
    pending: ['bg-[#1e293b] text-white/60 border-[#2563EB]/20', 'PENDING SYNC'],
  };
  const [cls, label] = map[status] || ['bg-[#1e293b]/5 text-white/90 border-[#2563EB]/20', status?.toUpperCase()];
  return (
    <span className={`inline-flex items-center px-6 py-2.5 rounded-full text-base font-bold uppercase tracking-widest border ${cls}`}>
      {label}
    </span>
  );
};

const ProjectDashboard = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const navigate = useNavigate();

  const fetchProject = async () => {
    try {
      const res = await api.get('/projects');
      const found = res.data.find(p => p.project_id === parseInt(id));
      if (found) setProject(found);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProject(); }, [id]);

  const handleApprove = () => {
    setShowApproveModal(true);
  };

  const confirmApproval = () => {
    setShowApproveModal(false);
    navigate(`/projects/${id}/payment`);
  };

  if (loading) return (
    <div className="min-h-screen pt-24 bg-[#0f172a] relative">
      <PageBackground variant="dark" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse relative z-10">
        <div className="bg-[#1e293b]/5 rounded-2xl p-8 border border-[#2563EB]/20">
          <div className="h-8 bg-[#1e293b]/10 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="h-20 bg-[#1e293b]/10 rounded-xl"></div>
            <div className="h-20 bg-[#1e293b]/10 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!project) return (
    <div className="min-h-screen pt-24 relative flex items-center justify-center">
      <PageBackground variant="dark" />
      <div className="text-center relative z-10">
        <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Mission Archive Exception</h2>
        <p className="text-blue-100/90 text-sm uppercase font-black tracking-widest mt-2 px-10">The requested data node [PROJECT_ID: {id}] could not be located in the central registry.</p>
        <Link to="/dashboard" className="text-blue-600 font-bold text-sm uppercase tracking-widest mt-8 inline-block hover:text-white transition-colors">← RETURN_TO_HUB</Link>
      </div>
    </div>
  );

  const isClient = user?.role === 'client' && user?.user_id === project.client_id;
  const isFreelancer = user?.role === 'freelancer' && user?.user_id === project.freelancer_id;
  const isCompleted = project.status === 'completed';

  const timeline = [
    { label: 'Project Created', done: true, icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Work In Progress', done: project.status !== 'pending', icon: <Activity className="w-4 h-4" /> },
    { label: 'Work Submitted', done: ['work_submitted', 'completed'].includes(project.status), icon: <Upload className="w-4 h-4" /> },
    { label: 'Client Review', done: ['completed'].includes(project.status), icon: <CheckCircle className="w-4 h-4" /> },
    { label: 'Completed', done: isCompleted, icon: <Star className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen pt-20 relative">
      <PageBackground variant="dark" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mb-10">
          <Link to="/dashboard" className="inline-flex items-center gap-3 text-base font-bold text-blue-100/90 hover:text-white transition-all uppercase tracking-widest group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="bg-[#111827]/40 backdrop-blur-3xl rounded-[3rem] border border-[#2563EB]/10 p-12 mb-10 animate-fade-in relative z-10 overflow-hidden shadow-3xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full -mr-48 -mt-48 pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 relative z-10">
            <div>
              <h1 className="text-6xl font-black text-white mb-4 leading-none tracking-tighter uppercase">
                MISSION BRIEF <span className="text-blue-500 tracking-widest ml-4">#{project.project_id}</span>
              </h1>
              <div className="flex items-center gap-4">
                <span className="h-[2px] w-12 bg-blue-500/40"></span>
                <p className="text-blue-100/90 font-bold text-sm uppercase tracking-widest">OPERATIONAL DATA LINK: {project.job_id}</p>
              </div>
            </div>
            <StatusBadge status={project.status} />
          </div>

          {/* Info Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 relative z-10">
            <div className="bg-[#1e293b]/2 backdrop-blur-3xl border border-[#2563EB]/10 rounded-[2rem] p-8 hover:bg-[#1e293b]/5 transition-all">
              <p className="text-base font-bold text-white/70 uppercase tracking-widest mb-6">COMMANDER</p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white uppercase tracking-widest mb-1">NODE #{project.client_id}</span>
                  {isClient && <span className="text-sm font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 w-fit">ACTIVE UNIT</span>}
                </div>
              </div>
            </div>
            <div className="bg-[#1e293b]/2 backdrop-blur-3xl border border-[#2563EB]/10 rounded-[2rem] p-8 hover:bg-[#1e293b]/5 transition-all">
              <p className="text-base font-bold text-white/70 uppercase tracking-widest mb-6">OPERATIVE</p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-600/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white uppercase tracking-widest mb-1">NODE #{project.freelancer_id}</span>
                  {isFreelancer && <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-fit">ACTIVE UNIT</span>}
                </div>
              </div>
            </div>
            <div className="bg-[#1e293b]/2 backdrop-blur-3xl border border-[#2563EB]/10 rounded-[2rem] p-8 hover:bg-[#1e293b]/5 transition-all">
              <p className="text-base font-bold text-white/70 uppercase tracking-widest mb-6">DEPLOYMENT DATE</p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#1e293b]/5 rounded-2xl flex items-center justify-center border border-[#2563EB]/10">
                  <Clock className="w-6 h-6 text-white/90" />
                </div>
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  {project.start_date ? new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'PENDING SYNC'}
                </span>
              </div>
            </div>
          </div>

          {/* Work Notes */}
          {project.work_notes && (
            <div className="mb-10 bg-blue-600/5 border border-blue-500/10 rounded-2xl p-8 relative z-10 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="font-black text-blue-400 text-sm uppercase tracking-widest">Submission Notes</h3>
              </div>
              <p className="text-slate-300 text-base leading-relaxed whitespace-pre-wrap italic font-medium">"{project.work_notes}"</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-4 pt-8 border-t border-[#2563EB]/10 justify-end relative z-10">
            {isFreelancer && project.status === 'active' && (
              <Link
                to={`/projects/${project.project_id}/submit`}
                className="inline-flex items-center gap-4 bg-gradient-to-r from-[#2563EB] to-[#9B2C8C] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(155,44,140,0.6)] border border-blue-500/20 font-black px-10 py-4 rounded-2xl hover: transition-all active:scale-95 text-sm uppercase tracking-widest"
              >
                <Upload className="w-4 h-4" />
                Submit Finished Work
              </Link>
            )}

            {isClient && project.status === 'work_submitted' && (
              <button
                onClick={handleApprove}
                className="inline-flex items-center gap-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black px-10 py-4 rounded-2xl transition-all active:scale-95 text-sm uppercase tracking-widest hover:"
              >
                <CheckCircle className="w-4 h-4" />
                Final Approval
              </button>
            )}

            {isCompleted && (
              <Link
                to={`/projects/${project.project_id}/review`}
                className="inline-flex items-center gap-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black px-10 py-4 rounded-2xl transition-all active:scale-95 text-sm uppercase tracking-widest hover:shadow-lg"
              >
                <Star className="w-4 h-4" />
                Leave a Review
              </Link>
            )}
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="bg-[#111827]/40 backdrop-blur-3xl rounded-[3rem] border border-[#2563EB]/10 p-12 animate-fade-in relative z-10 shadow-3xl">
          <h2 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-12 flex items-center gap-4">
            <Activity className="w-6 h-6 opacity-40" />
            MISSION PROTOCOL MAP
          </h2>
          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-8 top-8 bottom-8 w-[2px] bg-[#1e293b]/5"></div>
            <div className="space-y-12">
              {timeline.map((step, i) => (
                <div key={i} className="flex items-start gap-10 relative z-10 group">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 transition-all duration-700 border ${
                    step.done
                      ? 'bg-blue-600 text-white border-blue-400 scale-110'
                      : 'bg-[#1e293b]/2 text-white/10 border-[#2563EB]/10 scale-100 group-hover:scale-105 group-hover:bg-[#1e293b]/5'
                  }`}>
                    {React.cloneElement(step.icon, { className: 'w-6 h-6' })}
                  </div>
                  <div className="flex-1 pt-4">
                    <p className={`text-base font-bold uppercase tracking-widest ${step.done ? 'text-white' : 'text-white/10'}`}>
                      {step.label}
                    </p>
                    {step.done && (
                      <p className="text-sm font-bold text-emerald-500/60 uppercase tracking-widest mt-2">VERIFIED // COMPLETE</p>
                    )}
                  </div>
                  {step.done && (
                    <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20 mt-4">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Confirmation Overlay */}
      {showApproveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl animate-fade-in">
          <div className="bg-slate-900 border border-[#2563EB]/20 rounded-[2.5rem] p-10 max-w-md w-full shadow-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full -mr-16 -mt-16"></div>
            
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/20">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Final Validation</h3>
            <p className="text-blue-100/90 text-base font-bold uppercase tracking-wider leading-relaxed mb-10">
              This will release the escrowed funds to the operative. Please ensure all mission deliverables meet your requirements. 
              You will be redirected to the secure payment node for authorization.
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowApproveModal(false)}
                className="flex-1 py-4 bg-[#1e293b]/5 hover:bg-[#1e293b]/10 text-white/90 hover:text-white font-bold text-base uppercase tracking-widest rounded-xl transition-all"
              >
                Abort
              </button>
              <button 
                onClick={confirmApproval}
                className="flex-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;
