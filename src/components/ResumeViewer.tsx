import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Printer, Download, Mail, Phone, MapPin, 
  Linkedin, ExternalLink, Award, Briefcase, GraduationCap, 
  CheckCircle, Sparkles, Star
} from 'lucide-react';

export default function ResumeViewer() {
  const [profile, setProfile] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumeData, setResumeData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profRes, expRes, eduRes, skillRes, resRes] = await Promise.all([
          fetch('/api/v1/public/profile'),
          fetch('/api/v1/public/experience'),
          fetch('/api/v1/public/education'),
          fetch('/api/v1/public/skills'),
          fetch('/api/v1/public/resume', { headers: { 'Accept': 'application/json' } })
        ]);

        const parseJsonSafe = async (res: Response) => {
          if (!res.ok) return null;
          try {
            return await res.json();
          } catch {
            return null;
          }
        };

        const [pData, eData, edData, sData, rData] = await Promise.all([
          parseJsonSafe(profRes),
          parseJsonSafe(expRes),
          parseJsonSafe(eduRes),
          parseJsonSafe(skillRes),
          parseJsonSafe(resRes)
        ]);

        if (pData) setProfile(pData);
        if (eData && Array.isArray(eData)) setExperiences(eData);
        if (edData && Array.isArray(edData)) setEducation(edData);
        if (sData && Array.isArray(sData)) setSkills(sData);
        if (rData) setResumeData(rData);
      } catch (err) {
        console.error('Failed to load resume details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (resumeData?.hasCustomResume) {
      window.location.href = '/api/v1/public/resume';
    } else {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-mono text-neutral-400">Loading Resume Document...</p>
        </div>
      </div>
    );
  }

  const p = profile || {
    fullName: 'Antonio Riyanto',
    professionalTitle: 'Creative Designer',
    location: 'Jakarta, Indonesia',
    email: 'antonio.riyanto07@gmail.com',
    phoneDisplay: '+62 819 0398 7051',
    whatsappUrl: 'https://wa.me/6281903987051',
    linkedinUrl: 'https://www.linkedin.com/in/antonio-riyanto-928203186/',
    about: "For 6 years, I've bridged the gap between physical print and digital media. I specialize in high-stakes brand management and full-scale creative production, ensuring that every visual solution drives true engagement. Based in Jakarta, working globally."
  };

  const hardSkills = skills.filter((s: any) => s.category === 'HARD' || !s.category);
  const softSkills = skills.filter((s: any) => s.category === 'SOFT');

  return (
    <div className="min-h-screen bg-[#080808] text-neutral-100 py-8 px-4 sm:px-6 lg:px-8 selection:bg-[#00f0ff]/30 selection:text-white print:bg-white print:text-black print:p-0">
      {/* Top Action Bar (hidden on print) */}
      <div className="max-w-4xl mx-auto mb-8 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <a 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portfolio
        </a>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 text-sm font-semibold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all border border-white/10"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 text-sm font-bold bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-black px-5 py-2 rounded-xl transition-all shadow-md"
          >
            <Download className="w-4 h-4" /> Download CV
          </button>
        </div>
      </div>

      {/* Main Resume Sheet */}
      <main className="max-w-4xl mx-auto bg-[#0d0d0d] border border-white/10 rounded-3xl p-8 sm:p-14 shadow-2xl print:bg-white print:border-none print:shadow-none print:p-0 print:text-black">
        {/* Header */}
        <header className="border-b border-white/10 pb-8 mb-8 print:border-black/20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-[#00f0ff] print:text-neutral-700 text-xs font-mono uppercase tracking-widest font-semibold block mb-2">
                Curriculum Vitae
              </span>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white print:text-black">
                {p.fullName}
              </h1>
              <p className="text-xl sm:text-2xl text-neutral-300 print:text-neutral-700 font-medium mt-1">
                {p.professionalTitle}
              </p>
            </div>

            {/* Contact details */}
            <div className="space-y-1.5 text-sm text-neutral-400 print:text-neutral-700">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00f0ff] print:text-black" />
                <span>{p.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#00f0ff] print:text-black" />
                <a href={`mailto:${p.email}`} className="hover:text-white print:text-black underline-offset-2 hover:underline">
                  {p.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#00f0ff] print:text-black" />
                <span>{p.phoneDisplay}</span>
              </div>
              {p.linkedinUrl && (
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-[#00f0ff] print:text-black" />
                  <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white print:text-black truncate max-w-[220px]">
                    LinkedIn Profile
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Executive Summary */}
          {p.about && (
            <div className="mt-6 pt-6 border-t border-white/5 print:border-black/10">
              <p className="text-neutral-300 print:text-neutral-800 text-sm sm:text-base leading-relaxed">
                {p.about}
              </p>
            </div>
          )}
        </header>

        {/* Experience Section */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-white/10 print:border-black/20">
            <Briefcase className="w-5 h-5 text-[#00f0ff] print:text-black" />
            <h2 className="text-xl font-bold tracking-tight text-white print:text-black uppercase text-sm">
              Professional Experience
            </h2>
          </div>

          <div className="space-y-8">
            {experiences.map((exp: any, index: number) => (
              <div key={exp.id || index} className="relative pl-6 border-l border-white/10 print:border-black/20">
                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#00f0ff] print:bg-black"></div>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2">
                  <h3 className="text-lg font-bold text-white print:text-black">
                    {exp.jobTitle || exp.role}
                  </h3>
                  <span className="text-xs font-mono text-neutral-400 print:text-neutral-600 font-semibold">
                    {exp.startDate} — {exp.isCurrent ? 'Present' : (exp.endDate || 'Present')}
                  </span>
                </div>
                <div className="text-sm font-semibold text-[#00f0ff] print:text-neutral-800 mb-2">
                  {exp.companyName || exp.company} {exp.location ? `• ${exp.location}` : ''}
                </div>
                <p className="text-sm text-neutral-300 print:text-neutral-700 leading-relaxed mb-3">
                  {exp.summary || exp.description}
                </p>
                {exp.deliverables && exp.deliverables.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(Array.isArray(exp.deliverables) ? exp.deliverables : exp.deliverables.split(',')).map((d: string, dIdx: number) => (
                      <span key={dIdx} className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-neutral-300 print:bg-neutral-100 print:border-neutral-300 print:text-black">
                        {d.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Skills Matrix */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-white/10 print:border-black/20">
            <Star className="w-5 h-5 text-[#00f0ff] print:text-black" />
            <h2 className="text-xl font-bold tracking-tight text-white print:text-black uppercase text-sm">
              Core Competencies & Skills
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#00f0ff] print:text-black font-semibold mb-3">
                Technical & Creative Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {hardSkills.map((s: any, idx: number) => (
                  <span key={s.id || idx} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-200 print:bg-neutral-100 print:border-neutral-300 print:text-black font-medium">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 print:text-neutral-700 font-semibold mb-3">
                Methodologies & Soft Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {softSkills.length > 0 ? (
                  softSkills.map((s: any, idx: number) => (
                    <span key={s.id || idx} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-300 print:bg-neutral-100 print:border-neutral-300 print:text-black font-medium">
                      {s.name}
                    </span>
                  ))
                ) : (
                  ['Creative Direction', 'Brand Strategy', 'Cross-Functional Collaboration', 'Vendor Management', 'Deadline Management', 'Visual Storytelling'].map((name, idx) => (
                    <span key={idx} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-300 print:bg-neutral-100 print:border-neutral-300 print:text-black font-medium">
                      {name}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Education Section */}
        {education.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-6 pb-2 border-b border-white/10 print:border-black/20">
              <GraduationCap className="w-5 h-5 text-[#00f0ff] print:text-black" />
              <h2 className="text-xl font-bold tracking-tight text-white print:text-black uppercase text-sm">
                Education & Qualifications
              </h2>
            </div>

            <div className="space-y-4">
              {education.map((edu: any, idx: number) => (
                <div key={edu.id || idx} className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div>
                    <h3 className="text-base font-bold text-white print:text-black">
                      {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                    </h3>
                    <p className="text-sm text-[#00f0ff] print:text-neutral-800">
                      {edu.institution} {edu.location ? `• ${edu.location}` : ''}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-neutral-400 print:text-neutral-600 font-semibold">
                    {edu.startDate} — {edu.endDate || 'Present'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer Note */}
        <footer className="pt-6 border-t border-white/10 print:border-black/20 text-center text-xs text-neutral-500 print:text-neutral-600">
          <p>Portfolio & verifiable project case studies available online at antonio-riyanto.com</p>
        </footer>
      </main>
    </div>
  );
}
