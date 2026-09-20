import React, { useState, useEffect } from 'react';
import { 
  Briefcase, User, FileText, Mail, Phone, MapPin, ExternalLink, 
  Download, Award, CheckCircle, ArrowRight, Menu, X, Play, Star, Sparkles
} from 'lucide-react';

export default function PublicPortfolio() {
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeGalleryProject, setActiveGalleryProject] = useState<any | null>(null);
  const [skillTab, setSkillTab] = useState<'HARD' | 'SOFT'>('HARD');
  
  // Contact form state
  const [formData, setFormData] = useState({ name: '', email: '', service: 'Packaging', budget: '$5k-10k', message: '', honeypot: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [pRes, prRes, eRes, edRes, sRes, tRes, siteRes] = await Promise.all([
          fetch('/api/v1/public/profile'),
          fetch('/api/v1/public/projects'),
          fetch('/api/v1/public/experience'),
          fetch('/api/v1/public/education'),
          fetch('/api/v1/public/skills'),
          fetch('/api/v1/public/testimonials'),
          fetch('/api/v1/public/site')
        ]);

        const parseJsonSafe = async (res: Response) => {
          if (!res.ok) return null;
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch {
            return null;
          }
        };

        const [pData, prData, eData, edData, sData, tData, siteData] = await Promise.all([
          parseJsonSafe(pRes),
          parseJsonSafe(prRes),
          parseJsonSafe(eRes),
          parseJsonSafe(edRes),
          parseJsonSafe(sRes),
          parseJsonSafe(tRes),
          parseJsonSafe(siteRes)
        ]);
        
        if (pData) setProfile(pData);
        if (prData && Array.isArray(prData)) setProjects(prData);
        if (eData && Array.isArray(eData)) setExperiences(eData);
        if (edData && Array.isArray(edData)) setEducation(edData);
        if (sData && Array.isArray(sData)) setSkills(sData);
        if (tData && Array.isArray(tData)) setTestimonials(tData);
        if (siteData && siteData.socialLinks) setSocialLinks(siteData.socialLinks);
      } catch (err) {
        console.error('Failed to load public portfolio data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch('/api/v1/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setFormError(data.error || 'Failed to submit proposal.');
      }
    } catch (err) {
      setFormError('Network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-neutral-400 font-mono text-sm tracking-widest uppercase">Loading Portfolio...</p>
        </div>
      </div>
    );
  }

  const hardSkills = skills.filter(s => s.category === 'HARD');
  const softSkills = skills.filter(s => s.category === 'SOFT');
  const activeSkillsList = skillTab === 'HARD' ? hardSkills : softSkills;

  return (
    <div className="min-h-screen bg-[#030303] text-[#e5e5e5] relative overflow-x-hidden font-sans">
      {/* Ambient Spotlight */}
      <div className="fixed inset-0 pointer-events-none z-0 hidden md:block"
           style={{ background: 'radial-gradient(800px circle at 50vw 30vh, rgba(0, 240, 255, 0.04), transparent 40%)' }}>
      </div>

      {/* Floating WhatsApp Button */}
      {profile?.whatsappUrl && (
        <a href={profile.whatsappUrl} target="_blank" rel="noopener noreferrer"
           className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] bg-transparent border border-[#25D366] text-[#25D366] p-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.5)] hover:scale-110 hover:shadow-[0_0_30px_rgba(37,211,102,0.9)] hover:bg-[#25D366]/10 backdrop-blur-md transition-all duration-300 flex items-center justify-center group"
           aria-label="Chat on WhatsApp">
            <i className="ph ph-whatsapp-logo text-3xl"></i>
        </a>
      )}

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-6 bg-[#030303]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <a href="#" className="text-xl font-bold tracking-tighter text-white flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#00f0ff] to-[#0057ff]"></div>
            Antonio.
          </a>
          <div className="hidden md:flex gap-8 text-sm font-medium text-neutral-400">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#work" className="hover:text-white transition-colors">Work</a>
            <a href="#video-reel" className="hover:text-white transition-colors">Video</a>
            <a href="#skills" className="hover:text-white transition-colors">Skills</a>
            <a href="#experience" className="hover:text-white transition-colors">Experience</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <a href="/resume" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-all rounded-full bg-white/5 border border-white/10 hover:bg-white/10">
              <Download className="w-4 h-4" /> CV
            </a>
            <a href="#contact" className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white transition-all rounded-full bg-white/5 border border-white/10 hover:bg-white/10">
              Let's Talk
            </a>
            <a href="/admin/login" className="text-xs text-neutral-500 hover:text-[#00f0ff] transition-colors">Admin</a>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white p-2">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#030303] border-b border-white/10 p-6 flex flex-col gap-4">
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-neutral-300 hover:text-white">About</a>
            <a href="#work" onClick={() => setMobileMenuOpen(false)} className="text-neutral-300 hover:text-white">Work</a>
            <a href="#video-reel" onClick={() => setMobileMenuOpen(false)} className="text-neutral-300 hover:text-white">Video</a>
            <a href="#skills" onClick={() => setMobileMenuOpen(false)} className="text-neutral-300 hover:text-white">Skills</a>
            <a href="#experience" onClick={() => setMobileMenuOpen(false)} className="text-neutral-300 hover:text-white">Experience</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-neutral-300 hover:text-white">Testimonials</a>
            <a href="/resume" target="_blank" rel="noopener noreferrer" className="text-[#00f0ff]">Download CV</a>
            <a href="/admin/login" className="text-neutral-500">Admin Portal</a>
          </div>
        )}
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-[#0057ff] rounded-full blur-[150px] opacity-[0.07] pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 flex flex-col text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8 mx-auto lg:mx-0 w-fit">
                  <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse"></span>
                  <span className="text-xs font-medium tracking-wide uppercase text-neutral-300">{profile?.fullName} — {profile?.professionalTitle}</span>
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tighter leading-[1.05] mb-6 text-white">
                  {profile?.headline || "6 Years of Visual Architecture."}
                </h1>
                <p className="text-lg md:text-xl text-neutral-400 max-w-xl mb-10 leading-relaxed mx-auto lg:mx-0">
                  {profile?.heroDescription}
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <a href="#work" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-colors group">
                    View Selected Work
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a href="/resume" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-medium text-white">
                    <Download className="w-5 h-5" /> Download CV
                  </a>
                </div>
              </div>
              <div className="lg:col-span-5 relative mt-12 lg:mt-0 flex justify-center lg:justify-end">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#00f0ff] rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                <img src={profile?.avatarUrl || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop"} alt={profile?.fullName || "Antonio Riyanto"} className="relative z-10 w-full max-w-[380px] lg:max-w-[450px] h-[520px] object-cover rounded-3xl border border-white/10 drop-shadow-[0_0_40px_rgba(0,240,255,0.2)] transition-all duration-700" 
                     onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop"; }} />
                <div className="absolute bottom-10 left-4 md:-left-8 z-20 bg-white/5 border border-white/10 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#00f0ff]/20 flex items-center justify-center text-[#00f0ff]">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-white text-sm font-bold">100+ Projects</p>
                      <p className="text-neutral-400 text-xs">Successfully Delivered</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Selected Work Section */}
        <section id="work" className="py-32 relative border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-16 flex items-center gap-4 text-white">
              Selected Work <span className="text-neutral-700 font-light hidden md:inline">— Print & Digital</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj, idx) => (
                <div key={proj.id} onClick={() => setActiveGalleryProject(proj)} className={`group relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 p-8 md:p-12 transition-all duration-500 cursor-pointer hover:border-[#00f0ff]/50 hover:shadow-[0_0_40px_rgba(0,240,255,0.15)] ${idx === 0 ? 'md:col-span-2 min-h-[420px]' : 'min-h-[350px]'}`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
                  <div className="absolute inset-0 bg-neutral-900">
                    { proj.coverImageUrl ? (
                      <img src={proj.coverImageUrl} alt={proj.projectTitle || proj.title} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-neutral-800 opacity-60"></div>
                    )}
                  </div>
                  <div className="relative z-20 flex flex-col justify-end h-full">
                    <span className="text-[#00f0ff] text-xs font-bold uppercase tracking-widest mb-3">{proj.category}</span>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-3 group-hover:-translate-y-1 transition-transform">{proj.projectTitle}</h3>
                    <p className="text-neutral-300 text-sm max-w-xl mb-6">{proj.shortDescription}</p>
                    <div className="flex items-center gap-2 text-white font-medium text-sm">
                      Explore Project Gallery <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Video & Motion Reel Section */}
        <section id="video-reel" className="py-32 relative bg-[#050505] border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse"></span>
                  <span className="text-xs font-medium tracking-wide uppercase text-neutral-300">Showreel</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                  Motion Graphics & <span className="text-[#00f0ff] italic">Video.</span>
                </h2>
              </div>
              <p className="text-neutral-400 max-w-md md:text-right">Dynamic visual storytelling through animation, kinetic typography, and precise video editing.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                <div className="w-full max-w-[320px] mx-auto aspect-[9/16] rounded-2xl overflow-hidden bg-black mb-6 border border-white/10 flex items-center justify-center">
                  <video controls preload="metadata" className="w-full h-full object-contain">
                    <source src="/img/watchclub/ramadan.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Kinetix Brand Anthem</h3>
                <p className="text-neutral-400 text-sm">Full motion graphics production including logo reveal and kinetic typography.</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                <div className="w-full max-w-[320px] mx-auto aspect-[9/16] rounded-2xl overflow-hidden bg-black mb-6 border border-white/10 flex items-center justify-center">
                  <video controls preload="metadata" className="w-full h-full object-contain">
                    <source src="/img/watchclub/Valentine.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Social Media Promo Reel</h3>
                <p className="text-neutral-400 text-sm">High-engagement short-form video editing for TikTok and Instagram Reels.</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-32 relative border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8 text-white">Crafting visual stories across every medium.</h2>
              <p className="text-neutral-400 text-lg leading-relaxed mb-6">{profile?.about}</p>
              <div className="flex gap-6 pt-4">
                <div className="flex flex-col gap-2">
                  <span className="text-4xl font-bold text-white">6</span>
                  <span className="text-sm text-neutral-500 uppercase tracking-wider">Years Experience</span>
                </div>
                <div className="w-[1px] h-16 bg-white/10"></div>
                <div className="flex flex-col gap-2">
                  <span className="text-4xl font-bold text-white">300+</span>
                  <span className="text-sm text-neutral-500 uppercase tracking-wider">Visuals Created</span>
                </div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl aspect-square flex items-center justify-center">
              <div className="w-full h-full bg-neutral-800 opacity-60 rounded-2xl"></div>
            </div>
          </div>
        </section>

        {/* Skill Matrix Section */}
        <section id="skills" className="py-32 relative bg-[#050505] border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse"></span>
                  <span className="text-xs font-medium tracking-wide uppercase text-neutral-300">Core Arsenal</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white">Skill Matrix.</h2>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setSkillTab('HARD')} className={`px-6 py-2 rounded-full border font-medium transition-all ${skillTab === 'HARD' ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'border-white/10 bg-white/5 text-neutral-400'}`}>Software Mastery</button>
                <button onClick={() => setSkillTab('SOFT')} className={`px-6 py-2 rounded-full border font-medium transition-all ${skillTab === 'SOFT' ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'border-white/10 bg-white/5 text-neutral-400'}`}>Creative Traits</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSkillsList.map(skill => (
                <div key={skill.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex justify-between items-center hover:border-[#00f0ff]/50 transition-all">
                  <span className="text-white font-medium">{skill.name}</span>
                  <span className="text-2xl font-bold text-[#00f0ff]">{skill.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="py-32 relative border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-16 text-white">Career Journey</h2>
            <div className="space-y-8">
              {experiences.map(exp => (
                <div key={exp.id} className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{exp.jobTitle}</h3>
                      <p className="text-[#00f0ff] font-medium">{exp.companyName} — {exp.location}</p>
                    </div>
                    <span className="text-neutral-400 text-sm font-mono mt-2 md:mt-0 bg-white/5 px-4 py-1 rounded-full border border-white/10">
                      {exp.startDate} {exp.endDate ? `to ${exp.endDate}` : 'to Present'}
                    </span>
                  </div>
                  <p className="text-neutral-300 leading-relaxed">{exp.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-32 relative bg-[#050505] border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <h2 className="text-center text-3xl md:text-5xl font-bold tracking-tight mb-20 text-white">Client Voices</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map(t => (
                <div key={t.id} className="bg-white/5 border border-white/10 p-8 rounded-3xl flex flex-col justify-between">
                  <div>
                    <div className="flex gap-1 mb-6 text-[#00f0ff]">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-neutral-300 text-lg leading-relaxed mb-8 italic">"{t.quote}"</p>
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{t.personName}</h4>
                    <p className="text-sm text-neutral-500">{t.personTitle}, {t.company}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-32 relative bg-[#020202] border-t border-white/5">
          <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-white">Let's create something iconic.</h2>
            <p className="text-neutral-400 text-lg mb-12">Currently open to new projects and opportunities.</p>
            
            {submitted ? (
              <div className="bg-white/5 border border-white/10 p-12 rounded-3xl text-center">
                <CheckCircle className="w-16 h-16 text-[#00f0ff] mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-white mb-2">Proposal Received!</h3>
                <p className="text-neutral-400 mb-6">Expect a response within 24 hours.</p>
                <button onClick={() => setSubmitted(false)} className="px-6 py-3 rounded-full border border-[#00f0ff]/30 text-[#00f0ff] hover:bg-[#00f0ff]/10 text-xs font-mono uppercase tracking-widest">Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="bg-white/5 border border-white/10 p-8 md:p-12 rounded-3xl text-left space-y-8">
                {formError && <p className="text-red-400 text-sm">{formError}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">Your Name</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-[#00f0ff]" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">Email Address</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-[#00f0ff]" placeholder="john@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">Project Scope</label>
                  <select value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-[#00f0ff] bg-[#020202]">
                    <option value="Packaging">Packaging</option>
                    <option value="Motion Graphics">Motion Graphics</option>
                    <option value="Print / POP">Print / POP</option>
                    <option value="Digital Banners">Digital Banners</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">Project Details</label>
                  <textarea rows={4} required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-[#00f0ff] resize-none" placeholder="Tell me about your project..."></textarea>
                </div>
                <input type="text" name="honeypot" value={formData.honeypot} onChange={e => setFormData({...formData, honeypot: e.target.value})} className="hidden" aria-hidden="true" />
                <button type="submit" disabled={submitting} className="w-full py-5 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-[#00f0ff] transition-colors">
                  {submitting ? 'Transmitting...' : 'Send Proposal'} <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-[#030303]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#00f0ff] to-[#0057ff]"></div>
            <span className="font-bold tracking-tighter text-lg text-white">Antonio.</span>
          </div>
          <p className="text-neutral-500 text-sm">© {new Date().getFullYear()} Antonio Riyanto. All rights reserved.</p>
          <div className="flex gap-4">
            {socialLinks.map(s => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#00f0ff] transition-all">
                {s.platform}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* Project Gallery Modal */}
      {activeGalleryProject && (
        <div onClick={() => setActiveGalleryProject(null)} className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="max-w-5xl w-full max-h-[90vh] overflow-auto bg-[#030303] border border-white/10 rounded-3xl p-8">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#030303] pb-4 border-b border-white/10 z-10">
              <div>
                <h3 className="text-2xl font-bold text-white">{activeGalleryProject.projectTitle}</h3>
                <p className="text-neutral-400 text-sm">{activeGalleryProject.clientName}</p>
              </div>
              <button onClick={() => setActiveGalleryProject(null)} className="text-neutral-400 hover:text-white text-3xl">×</button>
            </div>
            <p className="text-neutral-300 mb-8">{activeGalleryProject.solution}</p>
            <div className="space-y-6">
              {activeGalleryProject.coverImageUrl ? (
                <div className="w-full max-h-[500px] rounded-2xl overflow-hidden bg-neutral-900 border border-white/10">
                  <img src={activeGalleryProject.coverImageUrl} alt={activeGalleryProject.projectTitle || activeGalleryProject.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full p-12 text-center text-neutral-500 border border-white/10 rounded-2xl">
                  Visual asset previews and project documentation available upon request.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
