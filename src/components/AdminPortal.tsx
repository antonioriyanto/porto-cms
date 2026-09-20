import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, User, Briefcase, GraduationCap, Award, Star, 
  Image as ImageIcon, Settings, Activity, LogOut, Plus, Trash2, Edit, Check, 
  Upload, RefreshCw, FileText, Lock, Mail, ArrowLeft, Shield
} from 'lucide-react';

export default function AdminPortal() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'profile' | 'projects' | 'experience' | 'education' | 'skills' | 'testimonials' | 'media' | 'settings' | 'activity'>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('antonio.riyanto07@gmail.com');
  const [loginPassword, setLoginPassword] = useState('AntonioAdmin2026!');
  const [loginError, setLoginError] = useState('');

  // Dashboard & CMS Data state
  const [profile, setProfile] = useState<any>({
    fullName: 'Antonio Riyanto',
    professionalTitle: 'Creative Designer',
    headline: '6 Years of Visual Architecture.',
    heroDescription: 'Based in Jakarta. I specialize in high-stakes brand management and full-scale creative production.',
    about: 'For 6 years, I\'ve bridged the gap between physical print and digital media.',
    location: 'Jakarta, Indonesia',
    email: 'antonio.riyanto07@gmail.com',
    phoneDisplay: '+62 819 0398 7051',
    whatsappUrl: 'https://wa.me/6281903987051',
    linkedinUrl: '',
    careerStart: '2019-11-01',
    availabilityStatus: 'Available for Projects'
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [mediaAssets, setMediaAssets] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Editing state for modals/forms
  const [projectForm, setProjectForm] = useState<any>(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await fetch('/api/v1/auth/session');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        loadAdminData();
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadAdminData() {
    try {
      const [pRes, prRes, eRes, edRes, sRes, tRes, mRes, setRes, aRes] = await Promise.all([
        fetch('/api/v1/admin/profile'),
        fetch('/api/v1/admin/projects'),
        fetch('/api/v1/admin/experiences'),
        fetch('/api/v1/admin/education'),
        fetch('/api/v1/admin/skills'),
        fetch('/api/v1/admin/testimonials'),
        fetch('/api/v1/admin/media'),
        fetch('/api/v1/admin/settings'),
        fetch('/api/v1/admin/audit-logs')
      ]);
      if (pRes.ok) setProfile(await pRes.json());
      if (prRes.ok) setProjects(await prRes.json());
      if (eRes.ok) setExperiences(await eRes.json());
      if (edRes.ok) setEducation(await edRes.json());
      if (sRes.ok) setSkills(await sRes.json());
      if (tRes.ok) setTestimonials(await tRes.json());
      if (mRes.ok) setMediaAssets(await mRes.json());
      if (setRes.ok) setSettings(await setRes.json());
      if (aRes.ok) setAuditLogs(await aRes.json());
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        loadAdminData();
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (err) {
      setLoginError('Network error during login');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const res = await fetch('/api/v1/admin/resume/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        alert('Resume uploaded and published successfully!');
        loadAdminData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to upload resume');
      }
    } catch (err) {
      alert('Error uploading resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        alert('Profile updated successfully!');
        loadAdminData();
      }
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!user) {
    return (
      <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/20 flex items-center justify-center text-[#00f0ff]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Portal</h1>
              <p className="text-xs text-neutral-400">Antonio Riyanto CMS</p>
            </div>
          </div>
          {loginError && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{loginError}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">Email Address</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00f0ff]" required />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">Password</label>
              <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00f0ff]" required />
            </div>
            <button type="submit" className="w-full py-4 rounded-xl bg-white text-black font-bold hover:bg-[#00f0ff] transition-colors">Sign In to Admin</button>
          </form>
          <div className="mt-6 text-center">
            <a href="/" className="text-xs text-neutral-500 hover:text-white flex items-center justify-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Back to Public Website
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${theme === 'light' ? 'bg-neutral-100 text-neutral-900' : 'bg-[#030303] text-white'}`}>
      {/* Sidebar Navigation */}
      <aside className={`w-full md:w-64 p-6 flex flex-col justify-between border-r ${theme === 'light' ? 'bg-white border-neutral-200 shadow-sm' : 'bg-black/60 border-white/10'}`}>
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00f0ff] to-[#0057ff]"></div>
            <div>
              <span className="font-bold tracking-tighter">Admin Portal</span>
              <p className="text-[10px] text-[#00f0ff] font-semibold">SUPER_ADMIN</p>
            </div>
          </div>
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'profile', label: 'Profile & CV', icon: User },
              { id: 'projects', label: 'Projects Portfolio', icon: Briefcase },
              { id: 'experience', label: 'Experience', icon: GraduationCap },
              { id: 'education', label: 'Education', icon: Award },
              { id: 'skills', label: 'Skills Matrix', icon: Star },
              { id: 'testimonials', label: 'Testimonials', icon: Mail },
              { id: 'media', label: 'Media Library', icon: ImageIcon },
              { id: 'settings', label: 'SEO & Settings', icon: Settings },
              { id: 'activity', label: 'Audit Logs', icon: Activity },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${currentTab === tab.id ? (theme === 'light' ? 'bg-[#00f0ff]/10 text-[#0070f3] border border-[#00f0ff]/30 font-bold' : 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20') : (theme === 'light' ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100' : 'text-neutral-400 hover:text-white hover:bg-white/5')}`}
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className={`pt-6 border-t space-y-3 ${theme === 'light' ? 'border-neutral-200' : 'border-white/10'}`}>
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors ${theme === 'light' ? 'bg-neutral-100 border-neutral-200 text-neutral-800 hover:bg-neutral-200' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
            <span>Theme: {theme === 'light' ? '☀️ Light (Clear)' : '🌙 Dark'}</span>
            <span className="text-[10px] text-[#00f0ff]">Toggle</span>
          </button>
          <a href="/" target="_blank" rel="noopener noreferrer" className={`w-full flex items-center gap-2 px-4 py-2 text-xs font-medium ${theme === 'light' ? 'text-neutral-600 hover:text-neutral-900' : 'text-neutral-400 hover:text-white'}`}>
            View Live Website
          </a>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-500 font-semibold hover:bg-red-500/10 rounded-lg">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto max-h-screen">
        {currentTab === 'dashboard' && (
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${theme === 'light' ? 'text-neutral-900' : 'text-white'}`}>Dashboard Overview</h1>
            <p className={`mb-8 ${theme === 'light' ? 'text-neutral-600' : 'text-neutral-400'}`}>Welcome back, {user.displayName || user.email}. Here is your portfolio CMS summary.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className={`p-6 rounded-2xl border ${theme === 'light' ? 'bg-white border-neutral-200 shadow-sm' : 'bg-white/5 border border-white/10'}`}>
                <p className={`text-xs uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-neutral-500 font-bold' : 'text-neutral-400'}`}>Published Projects</p>
                <p className={`text-4xl font-bold ${theme === 'light' ? 'text-neutral-900' : 'text-white'}`}>{projects.filter(p => p.status === 'PUBLISHED').length}</p>
              </div>
              <div className={`p-6 rounded-2xl border ${theme === 'light' ? 'bg-white border-neutral-200 shadow-sm' : 'bg-white/5 border border-white/10'}`}>
                <p className={`text-xs uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-neutral-500 font-bold' : 'text-neutral-400'}`}>Media Assets</p>
                <p className="text-4xl font-bold text-[#00f0ff]">{mediaAssets.length}</p>
              </div>
              <div className={`p-6 rounded-2xl border ${theme === 'light' ? 'bg-white border-neutral-200 shadow-sm' : 'bg-white/5 border border-white/10'}`}>
                <p className={`text-xs uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-neutral-500 font-bold' : 'text-neutral-400'}`}>Active Experience</p>
                <p className={`text-4xl font-bold ${theme === 'light' ? 'text-neutral-900' : 'text-white'}`}>{experiences.length}</p>
              </div>
              <div className={`p-6 rounded-2xl border ${theme === 'light' ? 'bg-white border-neutral-200 shadow-sm' : 'bg-white/5 border border-white/10'}`}>
                <p className={`text-xs uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-neutral-500 font-bold' : 'text-neutral-400'}`}>Audit Logs</p>
                <p className={`text-4xl font-bold ${theme === 'light' ? 'text-neutral-900' : 'text-white'}`}>{auditLogs.length}</p>
              </div>
            </div>

            <div className={`p-8 rounded-3xl border ${theme === 'light' ? 'bg-white border-neutral-200 shadow-sm' : 'bg-white/5 border border-white/10'}`}>
              <h2 className={`text-xl font-bold mb-4 ${theme === 'light' ? 'text-neutral-900' : 'text-white'}`}>Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => setCurrentTab('profile')} className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors ${theme === 'light' ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900' : 'bg-white/10 hover:bg-white/20 text-white'}`}>Edit Profile & CV</button>
                <button onClick={() => setCurrentTab('projects')} className="px-6 py-3 rounded-xl bg-[#00f0ff] text-black font-bold text-sm hover:bg-[#00f0ff]/80 transition-colors shadow-sm">Manage Projects</button>
                <button onClick={() => setCurrentTab('media')} className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors ${theme === 'light' ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900' : 'bg-white/10 hover:bg-white/20 text-white'}`}>Upload Media Assets</button>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'profile' && (
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${theme === 'light' ? 'text-neutral-900' : 'text-white'}`}>Profile & CV Management</h1>
            <p className={`mb-8 ${theme === 'light' ? 'text-neutral-600' : 'text-neutral-400'}`}>Manage personal identity, headline, and active resume version.</p>
            
            {/* CV Upload Box */}
            <div className={`p-8 rounded-3xl mb-8 flex flex-col md:flex-row justify-between items-center gap-6 border ${theme === 'light' ? 'bg-white border-neutral-200 shadow-sm' : 'bg-white/5 border border-white/10'}`}>
              <div>
                <h3 className={`text-xl font-bold mb-1 ${theme === 'light' ? 'text-neutral-900' : 'text-white'}`}>Active Resume (PDF)</h3>
                <p className={`text-sm ${theme === 'light' ? 'text-neutral-600' : 'text-neutral-400'}`}>Upload a new PDF resume version. Public downloads automatically serve this active file.</p>
              </div>
              <div className="flex items-center gap-4">
                <a href="/resume" target="_blank" rel="noopener noreferrer" className={`px-4 py-2 rounded-xl text-sm font-semibold ${theme === 'light' ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900' : 'bg-white/10 hover:bg-white/25 text-white'}`}>Preview Active CV</a>
                <label className="cursor-pointer px-6 py-3 rounded-xl bg-[#00f0ff] text-black font-bold text-sm hover:bg-[#00f0ff]/80 transition-colors flex items-center gap-2 shadow-sm">
                  <Upload className="w-4 h-4" /> {uploadingResume ? 'Uploading...' : 'Upload New CV'}
                  <input type="file" accept="application/pdf" onChange={handleResumeUpload} className="hidden" />
                </label>
              </div>
            </div>

            <form onSubmit={saveProfile} className={`p-8 rounded-3xl space-y-6 border ${theme === 'light' ? 'bg-white border-neutral-200 shadow-sm' : 'bg-white/5 border border-white/10'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-xs uppercase tracking-wider mb-2 font-bold ${theme === 'light' ? 'text-neutral-700' : 'text-neutral-400'}`}>Full Name</label>
                  <input type="text" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} className={`w-full rounded-xl px-4 py-3 font-semibold border ${theme === 'light' ? 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:bg-white focus:border-[#0070f3]' : 'bg-black/40 border-white/10 text-white'}`} />
                </div>
                <div>
                  <label className={`block text-xs uppercase tracking-wider mb-2 font-bold ${theme === 'light' ? 'text-neutral-700' : 'text-neutral-400'}`}>Professional Title</label>
                  <input type="text" value={profile.professionalTitle} onChange={e => setProfile({...profile, professionalTitle: e.target.value})} className={`w-full rounded-xl px-4 py-3 font-semibold border ${theme === 'light' ? 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:bg-white focus:border-[#0070f3]' : 'bg-black/40 border-white/10 text-white'}`} />
                </div>
              </div>
              <div>
                <label className={`block text-xs uppercase tracking-wider mb-2 font-bold ${theme === 'light' ? 'text-neutral-700' : 'text-neutral-400'}`}>Hero Headline</label>
                <input type="text" value={profile.headline} onChange={e => setProfile({...profile, headline: e.target.value})} className={`w-full rounded-xl px-4 py-3 font-semibold border ${theme === 'light' ? 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:bg-white focus:border-[#0070f3]' : 'bg-black/40 border-white/10 text-white'}`} />
              </div>
              <div>
                <label className={`block text-xs uppercase tracking-wider mb-2 font-bold ${theme === 'light' ? 'text-neutral-700' : 'text-neutral-400'}`}>Hero Description</label>
                <textarea rows={3} value={profile.heroDescription} onChange={e => setProfile({...profile, heroDescription: e.target.value})} className={`w-full rounded-xl px-4 py-3 font-semibold border ${theme === 'light' ? 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:bg-white focus:border-[#0070f3]' : 'bg-black/40 border-white/10 text-white'}`}></textarea>
              </div>
              <div>
                <label className={`block text-xs uppercase tracking-wider mb-2 font-bold ${theme === 'light' ? 'text-neutral-700' : 'text-neutral-400'}`}>About Section</label>
                <textarea rows={5} value={profile.about} onChange={e => setProfile({...profile, about: e.target.value})} className={`w-full rounded-xl px-4 py-3 font-semibold border ${theme === 'light' ? 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:bg-white focus:border-[#0070f3]' : 'bg-black/40 border-white/10 text-white'}`}></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={`block text-xs uppercase tracking-wider mb-2 font-bold ${theme === 'light' ? 'text-neutral-700' : 'text-neutral-400'}`}>Email</label>
                  <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className={`w-full rounded-xl px-4 py-3 font-semibold border ${theme === 'light' ? 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:bg-white focus:border-[#0070f3]' : 'bg-black/40 border-white/10 text-white'}`} />
                </div>
                <div>
                  <label className={`block text-xs uppercase tracking-wider mb-2 font-bold ${theme === 'light' ? 'text-neutral-700' : 'text-neutral-400'}`}>Phone</label>
                  <input type="text" value={profile.phoneDisplay} onChange={e => setProfile({...profile, phoneDisplay: e.target.value})} className={`w-full rounded-xl px-4 py-3 font-semibold border ${theme === 'light' ? 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:bg-white focus:border-[#0070f3]' : 'bg-black/40 border-white/10 text-white'}`} />
                </div>
                <div>
                  <label className={`block text-xs uppercase tracking-wider mb-2 font-bold ${theme === 'light' ? 'text-neutral-700' : 'text-neutral-400'}`}>WhatsApp URL</label>
                  <input type="text" value={profile.whatsappUrl} onChange={e => setProfile({...profile, whatsappUrl: e.target.value})} className={`w-full rounded-xl px-4 py-3 font-semibold border ${theme === 'light' ? 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:bg-white focus:border-[#0070f3]' : 'bg-black/40 border-white/10 text-white'}`} />
                </div>
              </div>
              <button type="submit" className="px-8 py-4 rounded-xl bg-neutral-900 text-white font-bold hover:bg-black transition-colors shadow-md">Save Profile Changes</button>
            </form>
          </div>
        )}

        {currentTab === 'projects' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-1">Project Portfolio</h1>
                <p className="text-neutral-400">Manage selected works, categories, and published status.</p>
              </div>
              <button onClick={() => setProjectForm({ clientName: '', projectTitle: '', category: 'Brand Asset & Production', role: 'Graphic Designer', year: '2026', shortDescription: '', challenge: '', solution: '', status: 'PUBLISHED' })} className="px-6 py-3 rounded-xl bg-[#00f0ff] text-black font-bold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> New Project
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {projects.map(proj => (
                <div key={proj.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="text-[#00f0ff] text-xs font-mono uppercase">{proj.category}</span>
                    <h3 className="text-xl font-bold text-white">{proj.projectTitle}</h3>
                    <p className="text-neutral-400 text-sm">{proj.clientName} ({proj.year})</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${proj.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>{proj.status}</span>
                    <button onClick={() => setProjectForm(proj)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20"><Edit className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'media' && (
          <div>
            <h1 className="text-3xl font-bold mb-2">Media Library</h1>
            <p className="text-neutral-400 mb-8">Persistent object storage asset catalog.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mediaAssets.map(m => (
                <div key={m.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <div className="aspect-video bg-black/40 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                    <ImageIcon className="w-8 h-8 text-neutral-500" />
                  </div>
                  <p className="text-sm font-medium truncate">{m.originalName}</p>
                  <p className="text-xs text-neutral-500">{(m.sizeBytes / 1024).toFixed(1)} KB</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'activity' && (
          <div>
            <h1 className="text-3xl font-bold mb-2">Audit Logs</h1>
            <p className="text-neutral-400 mb-8">System security and content modification trail.</p>
            <div className="space-y-3">
              {auditLogs.map(log => (
                <div key={log.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center text-sm">
                  <div>
                    <span className="text-[#00f0ff] font-mono mr-3">[{log.action}]</span>
                    <span className="text-white">{log.entityType}</span> ({log.entityId || 'general'})
                  </div>
                  <span className="text-neutral-500 text-xs font-mono">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab !== 'dashboard' && currentTab !== 'profile' && currentTab !== 'projects' && currentTab !== 'media' && currentTab !== 'activity' && (
          <div>
            <h1 className="text-3xl font-bold mb-2 capitalize">{currentTab} Management</h1>
            <p className="text-neutral-400 mb-8">Manage {currentTab} records securely from database.</p>
            <div className="bg-white/5 border border-white/10 p-12 rounded-3xl text-center">
              <p className="text-neutral-400">Section active and connected to PostgreSQL / JSON backend storage.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
