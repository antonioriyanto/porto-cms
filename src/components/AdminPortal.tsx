import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, User, Briefcase, Award, GraduationCap, 
  Sparkles, Star, Image as ImageIcon, Settings, Activity, 
  LogOut, Shield, ArrowLeft, ExternalLink, Menu, X, CheckCircle2
} from 'lucide-react';

import { 
  AdminUser, ProjectItem, ExperienceItem, EducationItem, 
  SkillItem, TestimonialItem, MediaAssetItem, SiteSettingsData, 
  ProfileData, AuditLogItem 
} from './admin/types';

import { DashboardTab } from './admin/DashboardTab';
import { ProfileTab } from './admin/ProfileTab';
import { ProjectsTab } from './admin/ProjectsTab';
import { ExperienceTab } from './admin/ExperienceTab';
import { EducationTab } from './admin/EducationTab';
import { SkillsTab } from './admin/SkillsTab';
import { TestimonialsTab } from './admin/TestimonialsTab';
import { MediaTab } from './admin/MediaTab';
import { SettingsTab } from './admin/SettingsTab';
import { AuditLogsTab } from './admin/AuditLogsTab';

type AdminTabKey = 
  | 'dashboard' 
  | 'profile' 
  | 'projects' 
  | 'experience' 
  | 'education' 
  | 'skills' 
  | 'testimonials' 
  | 'media' 
  | 'settings' 
  | 'activity';

export default function AdminPortal() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<AdminTabKey>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('antonio.riyanto07@gmail.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // CMS Datasets
  const [stats, setStats] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileData>({
    fullName: 'Antonio Riyanto',
    professionalTitle: 'Senior Creative Designer',
    headline: '6 Years of Visual Architecture.',
    heroDescription: 'Based in Jakarta. I specialize in high-stakes brand management and full-scale creative production.',
    about: "For 6 years, I've bridged the gap between physical print and digital media.",
    location: 'Jakarta, Indonesia',
    email: 'antonio.riyanto07@gmail.com',
    phoneDisplay: '+62 819 0398 7051',
    whatsappUrl: 'https://wa.me/6281903987051',
    linkedinUrl: '',
    availabilityStatus: 'Available for Projects'
  });
  const [activeResume, setActiveResume] = useState<any>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAssetItem[]>([]);
  const [settings, setSettings] = useState<SiteSettingsData>({
    siteName: 'Antonio Riyanto — Creative Designer',
    publicUrl: 'https://antonioriyanto.com',
    defaultSeoTitle: 'Antonio Riyanto | Senior Creative Designer & Art Director',
    seoDescription: 'Senior Creative Designer with 6+ years of expertise in Brand Identity, FMCG Packaging, and Production Architecture.',
    ogImage: '',
    maintenanceMode: false
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  const loadAllAdminData = useCallback(async () => {
    try {
      const [
        statsRes, profRes, resumeRes, projRes, expRes, 
        eduRes, skillRes, testRes, mediaRes, setRes, logRes
      ] = await Promise.all([
        fetch('/api/v1/admin/dashboard/stats'),
        fetch('/api/v1/admin/profile'),
        fetch('/api/v1/admin/resume/active'),
        fetch('/api/v1/admin/projects'),
        fetch('/api/v1/admin/experiences'),
        fetch('/api/v1/admin/education'),
        fetch('/api/v1/admin/skills'),
        fetch('/api/v1/admin/testimonials'),
        fetch('/api/v1/admin/media'),
        fetch('/api/v1/admin/settings'),
        fetch('/api/v1/admin/audit-logs')
      ]);

      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData.stats);
        if (sData.projects) setProjects(sData.projects);
      }
      if (profRes.ok) setProfile(await profRes.json());
      if (resumeRes.ok) {
        const rData = await resumeRes.json();
        setActiveResume(rData.resume);
      }
      if (projRes.ok) setProjects(await projRes.json());
      if (expRes.ok) setExperiences(await expRes.json());
      if (eduRes.ok) setEducation(await eduRes.json());
      if (skillRes.ok) setSkills(await skillRes.json());
      if (testRes.ok) setTestimonials(await testRes.json());
      if (mediaRes.ok) setMediaAssets(await mediaRes.json());
      if (setRes.ok) setSettings(await setRes.json());
      if (logRes.ok) setAuditLogs(await logRes.json());
    } catch (err) {
      console.error('Failed to load admin datasets:', err);
    }
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/auth/session');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        await loadAllAdminData();
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [loadAllAdminData]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        await loadAllAdminData();
      } else {
        setLoginError(data.error || data.message || 'Invalid credentials');
      }
    } catch (err) {
      setLoginError('Network error connecting to backend service');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch {}
    setUser(null);
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060606] text-white flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-neutral-400 font-mono">Verifying CMS Authentication Session...</p>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!user) {
    return (
      <div className="min-h-screen bg-[#060606] text-white flex items-center justify-center p-6 selection:bg-[#00f0ff] selection:text-black">
        <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-2xl shadow-2xl">
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/20 flex items-center justify-center text-[#00f0ff] shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Admin Portal</h1>
              <p className="text-xs text-neutral-400 font-mono">Antonio Riyanto • CMS v2.0</p>
            </div>
          </div>

          {loginError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium leading-relaxed">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-2">
                Administrator Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00f0ff] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-2">
                Master Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00f0ff] transition-colors"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-4 rounded-2xl bg-white text-black font-bold text-sm hover:bg-[#00f0ff] transition-all shadow-lg hover:shadow-[#00f0ff]/20 disabled:opacity-50"
              >
                {loginLoading ? 'Authenticating...' : 'Sign In to Admin Portal'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <a
              href="/"
              className="text-xs text-neutral-500 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Public Portfolio Website
            </a>
          </div>
        </div>
      </div>
    );
  }

  // NAVIGATION TABS CONFIG
  const navTabs: { id: AdminTabKey; label: string; icon: any; count?: number }[] = [
    { id: 'dashboard', label: 'Dashboard & Stats', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile & Resume', icon: User },
    { id: 'projects', label: 'Projects Portfolio', icon: Briefcase, count: projects.length },
    { id: 'experience', label: 'Work Experience', icon: Award, count: experiences.length },
    { id: 'education', label: 'Education & Certs', icon: GraduationCap, count: education.length },
    { id: 'skills', label: 'Skills Matrix', icon: Sparkles, count: skills.length },
    { id: 'testimonials', label: 'Client Reviews', icon: Star, count: testimonials.length },
    { id: 'media', label: 'Media Library', icon: ImageIcon, count: mediaAssets.length },
    { id: 'settings', label: 'SEO & Site Settings', icon: Settings },
    { id: 'activity', label: 'System Audit Logs', icon: Activity, count: auditLogs.length }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row selection:bg-[#00f0ff] selection:text-black">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-black/80 border-b border-white/10 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/20 flex items-center justify-center text-[#00f0ff]">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Admin Portal</h2>
            <p className="text-[10px] text-neutral-400 font-mono">Antonio Riyanto CMS</p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:sticky top-0 h-screen z-30
        w-72 p-6 flex flex-col justify-between
        bg-black/90 md:bg-black/40 border-r border-white/10 backdrop-blur-2xl
        transition-transform duration-300 md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="space-y-6 overflow-y-auto">
          {/* Admin Identity Brand */}
          <div className="flex items-center gap-3.5 pb-6 border-b border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00f0ff] to-[#0057ff] flex items-center justify-center text-black font-extrabold text-sm shadow-md">
              AR
            </div>
            <div className="overflow-hidden">
              <h2 className="font-bold text-sm text-white truncate">Antonio Riyanto</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] font-mono font-semibold text-neutral-400 uppercase tracking-wider">
                  {user.role || 'SUPER_ADMIN'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setCurrentTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-black font-bold shadow-lg shadow-white/5'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {typeof tab.count === 'number' && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                      isActive ? 'bg-black/10 text-black' : 'bg-white/5 text-neutral-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-white/10 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Public Site</span>
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out ({user.displayName || 'Admin'})</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 p-6 sm:p-8 lg:p-12 overflow-y-auto max-h-screen">
        {currentTab === 'dashboard' && (
          <DashboardTab
            stats={stats}
            projects={projects}
            mediaAssets={mediaAssets}
            auditLogs={auditLogs}
            onNavigateTab={tab => setCurrentTab(tab)}
            onOpenNewProject={() => setCurrentTab('projects')}
            onOpenUploadMedia={() => setCurrentTab('media')}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileTab
            profile={profile}
            setProfile={setProfile}
            activeResume={activeResume}
            onRefreshData={loadAllAdminData}
          />
        )}

        {currentTab === 'projects' && (
          <ProjectsTab
            projects={projects}
            onRefreshData={loadAllAdminData}
          />
        )}

        {currentTab === 'experience' && (
          <ExperienceTab
            experiences={experiences}
            onRefreshData={loadAllAdminData}
          />
        )}

        {currentTab === 'education' && (
          <EducationTab
            education={education}
            onRefreshData={loadAllAdminData}
          />
        )}

        {currentTab === 'skills' && (
          <SkillsTab
            skills={skills}
            onRefreshData={loadAllAdminData}
          />
        )}

        {currentTab === 'testimonials' && (
          <TestimonialsTab
            testimonials={testimonials}
            onRefreshData={loadAllAdminData}
          />
        )}

        {currentTab === 'media' && (
          <MediaTab
            mediaAssets={mediaAssets}
            onRefreshData={loadAllAdminData}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsTab
            settings={settings}
            setSettings={setSettings}
            onRefreshData={loadAllAdminData}
          />
        )}

        {currentTab === 'activity' && (
          <AuditLogsTab
            auditLogs={auditLogs}
            onRefreshData={loadAllAdminData}
          />
        )}
      </main>
    </div>
  );
}
