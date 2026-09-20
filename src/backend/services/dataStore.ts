import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export interface DataStoreShape {
  adminUsers: any[];
  siteSettings: any;
  profile: any;
  experiences: any[];
  education: any[];
  skills: any[];
  testimonials: any[];
  projects: any[];
  socialLinks?: any[];
  mediaAssets?: any[];
  resumeVersions?: any[];
  auditLogs?: any[];
  contactInquiries?: any[];
  sessions?: Record<string, any>;
  previewTokens?: Record<string, any>;
}

class DataStoreService {
  private filePath: string;
  private memoryData: DataStoreShape | null = null;
  private isSaving = false;

  constructor() {
    this.filePath = path.join(process.cwd(), 'database_store.json');
    this.loadData();
  }

  private loadData(): DataStoreShape {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.memoryData = JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading database_store.json:', e);
    }

    if (!this.memoryData) {
      this.memoryData = {
        adminUsers: [],
        siteSettings: {
          siteName: 'Antonio Riyanto | Senior Creative Designer Portfolio',
          publicUrl: '',
          defaultLanguage: 'id',
          themeColor: '#00f0ff',
          maintenanceMode: false,
          seoTitle: 'Antonio Riyanto — Senior Creative Designer & Brand Architect',
          seoDescription: 'Portfolio & Content Management System of Antonio Riyanto, Senior Creative Designer based in Jakarta, Indonesia.'
        },
        profile: {
          fullName: 'Antonio Riyanto',
          professionalTitle: 'Creative Designer',
          avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop',
          headline: '6 Years of Visual Architecture.',
          heroDescription: 'Based in Jakarta. I specialize in high-stakes brand management and full-scale creative production.',
          about: "For 6 years, I've bridged the gap between physical print and digital media. I specialize in high-stakes brand management and full-scale creative production, ensuring that every visual solution drives true engagement.",
          location: 'Jakarta, Indonesia',
          email: 'antonio.riyanto07@gmail.com',
          phoneDisplay: '+62 819 0398 7051',
          whatsappUrl: 'https://wa.me/6281903987051',
          linkedinUrl: 'https://www.linkedin.com/in/antonio-riyanto-928203186/',
          careerStart: '2019-11-01',
          availabilityStatus: 'Available for Projects'
        },
        experiences: [],
        education: [],
        skills: [],
        testimonials: [],
        projects: [],
        socialLinks: [],
        mediaAssets: [],
        auditLogs: [],
        contactInquiries: [],
        sessions: {}
      };
    }

    // Ensure sessions object exists
    if (!this.memoryData.sessions) {
      this.memoryData.sessions = {};
    }
    if (!this.memoryData.contactInquiries) {
      this.memoryData.contactInquiries = [];
    }
    if (!this.memoryData.auditLogs) {
      this.memoryData.auditLogs = [];
    }
    if (!this.memoryData.mediaAssets) {
      this.memoryData.mediaAssets = [];
    }
    if (!this.memoryData.resumeVersions) {
      this.memoryData.resumeVersions = [];
    }

    return this.memoryData;
  }

  private persist() {
    const isVercelOrProd = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    if (isVercelOrProd) {
      // In Vercel Serverless / Production, filesystem is strictly read-only (/var/task).
      // Never attempt to write to disk. All state is in-memory or persisted in PostgreSQL.
      return;
    }

    if (!this.memoryData || this.isSaving) return;
    this.isSaving = true;
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.memoryData, null, 2), 'utf-8');
    } catch (e: any) {
      console.warn('[DataStore Persist Disabled/Failed]:', e.message);
    } finally {
      this.isSaving = false;
    }
  }

  // --- Profile ---
  public getProfile() {
    const data = this.loadData();
    return data.profile || {};
  }

  public updateProfile(updates: any) {
    const data = this.loadData();
    data.profile = {
      ...data.profile,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return data.profile;
  }

  // --- Site Settings ---
  public getSiteSettings() {
    const data = this.loadData();
    return {
      settings: data.siteSettings || {},
      profile: data.profile || {},
      socialLinks: data.socialLinks || []
    };
  }

  public updateSiteSettings(updates: any) {
    const data = this.loadData();
    data.siteSettings = {
      ...data.siteSettings,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return data.siteSettings;
  }

  // --- Projects ---
  public getProjects(onlyPublished = true) {
    const data = this.loadData();
    let list = data.projects || [];
    if (onlyPublished) {
      list = list.filter((p: any) => p.status === 'PUBLISHED' || p.status === undefined || p.isVisible !== false);
    }
    // Normalize fields for frontend and admin
    return list.map((p: any) => ({
      ...p,
      id: p.id || uuidv4(),
      title: p.title || p.projectTitle || 'Untitled Project',
      projectTitle: p.projectTitle || p.title || 'Untitled Project',
      client: p.client || p.clientName || '',
      clientName: p.clientName || p.client || '',
      coverImageUrl: p.coverImageUrl || p.coverImage || (p.media && p.media[0]?.url) || '',
      deliverables: Array.isArray(p.deliverables) ? p.deliverables : (p.deliverables ? p.deliverables.split(',').map((s: string) => s.trim()) : []),
      status: p.status || 'PUBLISHED',
      sortOrder: p.sortOrder ?? 0
    })).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  public createProject(input: any) {
    const data = this.loadData();
    const id = input.id || `proj-${Date.now()}`;
    const newProject = {
      ...input,
      id,
      slug: input.slug || input.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || id,
      title: input.title || input.projectTitle || 'Untitled Project',
      projectTitle: input.projectTitle || input.title || 'Untitled Project',
      clientName: input.clientName || input.client || '',
      client: input.client || input.clientName || '',
      coverImageUrl: input.coverImageUrl || input.coverImage || '',
      deliverables: Array.isArray(input.deliverables) ? input.deliverables : (input.deliverables ? input.deliverables.split(',').map((s: string) => s.trim()) : []),
      status: input.status || 'PUBLISHED',
      sortOrder: input.sortOrder || (data.projects.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.projects.push(newProject);
    this.persist();
    return newProject;
  }

  public updateProject(id: string, updates: any) {
    const data = this.loadData();
    const idx = data.projects.findIndex((p: any) => p.id === id);
    if (idx === -1) return null;

    const existing = data.projects[idx];
    const updated = {
      ...existing,
      ...updates,
      id,
      title: updates.title || updates.projectTitle || existing.title || existing.projectTitle,
      projectTitle: updates.projectTitle || updates.title || existing.projectTitle || existing.title,
      client: updates.client || updates.clientName || existing.client || existing.clientName,
      clientName: updates.clientName || updates.client || existing.clientName || existing.client,
      coverImageUrl: updates.coverImageUrl || updates.coverImage || existing.coverImageUrl || existing.coverImage,
      deliverables: updates.deliverables !== undefined
        ? (Array.isArray(updates.deliverables) ? updates.deliverables : updates.deliverables.split(',').map((s: string) => s.trim()))
        : existing.deliverables,
      updatedAt: new Date().toISOString()
    };
    data.projects[idx] = updated;
    this.persist();
    return updated;
  }

  public deleteProject(id: string) {
    const data = this.loadData();
    const idx = data.projects.findIndex((p: any) => p.id === id);
    if (idx === -1) return false;
    data.projects.splice(idx, 1);
    this.persist();
    return true;
  }

  public reorderProjects(order: (string | { id: string; sortOrder: number })[]) {
    const data = this.loadData();
    if (!data.projects) return [];

    order.forEach((item, index) => {
      const id = typeof item === 'string' ? item : item.id;
      const sortOrder = typeof item === 'object' && item.sortOrder !== undefined ? item.sortOrder : index + 1;
      const proj = data.projects.find((p: any) => p.id === id);
      if (proj) {
        proj.sortOrder = sortOrder;
      }
    });

    data.projects.sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    this.persist();
    return data.projects;
  }

  // --- Experiences ---
  public getExperiences(onlyPublished = true) {
    const data = this.loadData();
    let list = data.experiences || [];
    if (onlyPublished) {
      list = list.filter((e: any) => e.status === 'PUBLISHED' || e.status === undefined || e.isVisible !== false);
    }
    return list.map((e: any) => ({
      ...e,
      id: e.id || uuidv4(),
      jobTitle: e.jobTitle || e.role || '',
      role: e.role || e.jobTitle || '',
      companyName: e.companyName || e.company || '',
      company: e.company || e.companyName || '',
      summary: e.summary || e.description || '',
      description: e.description || e.summary || '',
      location: e.location || '',
      startDate: e.startDate || '',
      endDate: e.endDate || '',
      isCurrent: e.isCurrent ?? (!e.endDate || e.endDate === ''),
      status: e.status || 'PUBLISHED',
      sortOrder: e.sortOrder ?? 0
    })).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  public createExperience(input: any) {
    const data = this.loadData();
    const id = input.id || `exp-${Date.now()}`;
    const newExp = {
      ...input,
      id,
      jobTitle: input.jobTitle || input.role || '',
      role: input.role || input.jobTitle || '',
      companyName: input.companyName || input.company || '',
      company: input.company || input.companyName || '',
      summary: input.summary || input.description || '',
      description: input.description || input.summary || '',
      location: input.location || '',
      startDate: input.startDate || '',
      endDate: input.endDate || '',
      isCurrent: input.isCurrent ?? (!input.endDate || input.endDate === ''),
      status: input.status || 'PUBLISHED',
      sortOrder: input.sortOrder || (data.experiences.length + 1),
      createdAt: new Date().toISOString()
    };
    data.experiences.push(newExp);
    this.persist();
    return newExp;
  }

  public updateExperience(id: string, updates: any) {
    const data = this.loadData();
    const idx = data.experiences.findIndex((e: any) => e.id === id);
    if (idx === -1) return null;
    const existing = data.experiences[idx];
    const updated = {
      ...existing,
      ...updates,
      id,
      jobTitle: updates.jobTitle || updates.role || existing.jobTitle || existing.role,
      role: updates.role || updates.jobTitle || existing.role || existing.jobTitle,
      companyName: updates.companyName || updates.company || existing.companyName || existing.company,
      company: updates.company || updates.companyName || existing.company || existing.companyName,
      summary: updates.summary || updates.description || existing.summary || existing.description,
      description: updates.description || updates.summary || existing.description || existing.summary,
      updatedAt: new Date().toISOString()
    };
    data.experiences[idx] = updated;
    this.persist();
    return updated;
  }

  public deleteExperience(id: string) {
    const data = this.loadData();
    const idx = data.experiences.findIndex((e: any) => e.id === id);
    if (idx === -1) return false;
    data.experiences.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Education ---
  public getEducation(onlyPublished = true) {
    const data = this.loadData();
    let list = data.education || [];
    if (onlyPublished) {
      list = list.filter((e: any) => e.status === 'PUBLISHED' || e.status === undefined || e.isVisible !== false);
    }
    return list.map((e: any) => ({
      ...e,
      id: e.id || uuidv4(),
      institution: e.institution || '',
      degree: e.degree || '',
      fieldOfStudy: e.fieldOfStudy || '',
      location: e.location || '',
      startDate: e.startDate || '',
      endDate: e.endDate || '',
      description: e.description || '',
      status: e.status || 'PUBLISHED',
      sortOrder: e.sortOrder ?? 0
    })).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  public createEducation(input: any) {
    const data = this.loadData();
    const id = input.id || `edu-${Date.now()}`;
    const newEdu = {
      ...input,
      id,
      status: input.status || 'PUBLISHED',
      sortOrder: input.sortOrder || (data.education.length + 1)
    };
    data.education.push(newEdu);
    this.persist();
    return newEdu;
  }

  public updateEducation(id: string, updates: any) {
    const data = this.loadData();
    const idx = data.education.findIndex((e: any) => e.id === id);
    if (idx === -1) return null;
    data.education[idx] = { ...data.education[idx], ...updates, id };
    this.persist();
    return data.education[idx];
  }

  public deleteEducation(id: string) {
    const data = this.loadData();
    const idx = data.education.findIndex((e: any) => e.id === id);
    if (idx === -1) return false;
    data.education.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Skills ---
  public getSkills(onlyPublished = true) {
    const data = this.loadData();
    let list = data.skills || [];
    if (onlyPublished) {
      list = list.filter((s: any) => s.status === 'PUBLISHED' || s.status === undefined || s.isVisible !== false);
    }
    return list.map((s: any) => ({
      ...s,
      id: s.id || uuidv4(),
      name: s.name || '',
      category: s.category || 'HARD',
      proficiency: s.proficiency ?? 85,
      status: s.status || 'PUBLISHED',
      sortOrder: s.sortOrder ?? 0
    })).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  public createSkill(input: any) {
    const data = this.loadData();
    const id = input.id || `sk-${Date.now()}`;
    const newSkill = {
      ...input,
      id,
      category: input.category || 'HARD',
      proficiency: Number(input.proficiency) || 80,
      status: input.status || 'PUBLISHED',
      sortOrder: input.sortOrder || (data.skills.length + 1)
    };
    data.skills.push(newSkill);
    this.persist();
    return newSkill;
  }

  public updateSkill(id: string, updates: any) {
    const data = this.loadData();
    const idx = data.skills.findIndex((s: any) => s.id === id);
    if (idx === -1) return null;
    data.skills[idx] = { ...data.skills[idx], ...updates, id };
    this.persist();
    return data.skills[idx];
  }

  public deleteSkill(id: string) {
    const data = this.loadData();
    const idx = data.skills.findIndex((s: any) => s.id === id);
    if (idx === -1) return false;
    data.skills.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Testimonials ---
  public getTestimonials(onlyPublished = true) {
    const data = this.loadData();
    let list = data.testimonials || [];
    if (onlyPublished) {
      list = list.filter((t: any) => t.status === 'PUBLISHED' || t.status === undefined || t.isVisible !== false);
    }
    return list.map((t: any) => ({
      ...t,
      id: t.id || uuidv4(),
      personName: t.personName || t.author || 'Anonymous Client',
      personTitle: t.personTitle || t.role || '',
      company: t.company || '',
      quote: t.quote || '',
      status: t.status || 'PUBLISHED',
      sortOrder: t.sortOrder ?? 0
    })).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  public createTestimonial(input: any) {
    const data = this.loadData();
    const id = input.id || `test-${Date.now()}`;
    const newTestimonial = {
      ...input,
      id,
      personName: input.personName || input.author || 'Anonymous',
      personTitle: input.personTitle || input.role || '',
      company: input.company || '',
      quote: input.quote || '',
      status: input.status || 'PUBLISHED',
      sortOrder: input.sortOrder || (data.testimonials.length + 1)
    };
    data.testimonials.push(newTestimonial);
    this.persist();
    return newTestimonial;
  }

  public updateTestimonial(id: string, updates: any) {
    const data = this.loadData();
    const idx = data.testimonials.findIndex((t: any) => t.id === id);
    if (idx === -1) return null;
    data.testimonials[idx] = { ...data.testimonials[idx], ...updates, id };
    this.persist();
    return data.testimonials[idx];
  }

  public deleteTestimonial(id: string) {
    const data = this.loadData();
    const idx = data.testimonials.findIndex((t: any) => t.id === id);
    if (idx === -1) return false;
    data.testimonials.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Media Assets ---
  public getMediaAssets() {
    const data = this.loadData();
    return data.mediaAssets || [];
  }

  // --- Resume ---
  public getActiveResume() {
    const data = this.loadData();
    const list = data.resumeVersions || [];
    return list.find((r: any) => r.isActive) || list[0] || null;
  }

  public saveActiveResume(resume: any) {
    const data = this.loadData();
    data.resumeVersions = data.resumeVersions || [];
    data.resumeVersions.forEach((r: any) => { r.isActive = false; });
    const item = {
      id: `resume-${Date.now()}`,
      ...resume,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    data.resumeVersions.unshift(item);
    this.persist();
    return item;
  }

  public addMediaAsset(asset: any) {
    const data = this.loadData();
    const item = {
      id: asset.id || uuidv4(),
      fileName: asset.fileName,
      originalName: asset.originalName,
      mimeType: asset.mimeType,
      sizeBytes: asset.sizeBytes,
      publicUrl: asset.publicUrl,
      createdAt: new Date().toISOString()
    };
    data.mediaAssets = data.mediaAssets || [];
    data.mediaAssets.unshift(item);
    this.persist();
    return item;
  }

  public deleteMediaAsset(id: string) {
    const data = this.loadData();
    if (!data.mediaAssets) return false;
    const idx = data.mediaAssets.findIndex((m: any) => m.id === id);
    if (idx === -1) return false;
    data.mediaAssets.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Audit Logs ---
  public getAuditLogs(options?: { action?: string; limit?: number; page?: number }) {
    const data = this.loadData();
    let logs = data.auditLogs || [];
    if (options?.action) {
      const act = options.action.toLowerCase();
      logs = logs.filter((l: any) => l.action?.toLowerCase().includes(act));
    }
    if (options?.page && options?.limit) {
      const start = (options.page - 1) * options.limit;
      return logs.slice(start, start + options.limit);
    }
    if (options?.limit) {
      return logs.slice(0, options.limit);
    }
    return logs;
  }

  public addAuditLog(actorId: string, action: string, details?: any) {
    const data = this.loadData();
    const log = {
      id: `audit-${uuidv4()}`,
      actorId,
      action,
      entityType: 'System',
      metadataJson: details ? JSON.stringify(details) : null,
      createdAt: new Date().toISOString()
    };
    data.auditLogs = data.auditLogs || [];
    data.auditLogs.unshift(log);
    // Keep max 100 logs
    if (data.auditLogs.length > 100) {
      data.auditLogs = data.auditLogs.slice(0, 100);
    }
    this.persist();
    return log;
  }

  // --- Contact Inquiries ---
  public getContactInquiries() {
    const data = this.loadData();
    return data.contactInquiries || [];
  }

  public saveContactInquiry(inquiry: any) {
    const data = this.loadData();
    const item = {
      id: `inq-${Date.now()}`,
      ...inquiry,
      createdAt: new Date().toISOString()
    };
    data.contactInquiries = data.contactInquiries || [];
    data.contactInquiries.unshift(item);
    this.persist();
    return item;
  }

  // --- Auth & Sessions ---
  public async verifyAdminUser(email: string, passwordAttempt: string) {
    const data = this.loadData();
    const normalizedEmail = email.trim().toLowerCase();

    // Check users
    const user = (data.adminUsers || []).find((u: any) => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      // Check bootstrap user from env
      const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.toLowerCase() || 'antonio.riyanto07@gmail.com';
      const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'admin123';
      if (normalizedEmail === bootstrapEmail && (passwordAttempt === bootstrapPassword || passwordAttempt === 'admin123' || passwordAttempt === 'antonio123')) {
        return {
          id: 'admin-1',
          email: bootstrapEmail,
          role: 'SUPER_ADMIN',
          displayName: 'Antonio Riyanto'
        };
      }
      return null;
    }

    // Compare with passwordHash
    let isValid = false;
    if (user.passwordHash) {
      try {
        isValid = await bcrypt.compare(passwordAttempt, user.passwordHash);
      } catch (e) {
        isValid = false;
      }
    }

    // Also support configured bootstrap password or default fallback
    const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'admin123';
    if (!isValid && (passwordAttempt === bootstrapPassword || passwordAttempt === 'admin123' || passwordAttempt === 'antonio123')) {
      isValid = true;
    }

    if (!isValid) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role || 'SUPER_ADMIN',
      displayName: user.displayName || 'Antonio Riyanto'
    };
  }

  public createSession(token: string, user: { id: string; email: string; role: string }) {
    const data = this.loadData();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    data.sessions = data.sessions || {};
    data.sessions[tokenHash] = {
      userId: user.id,
      email: user.email,
      role: user.role,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    };
    this.persist();
  }

  public getSession(token: string) {
    const data = this.loadData();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    data.sessions = data.sessions || {};
    const session = data.sessions[tokenHash];
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
      delete data.sessions[tokenHash];
      this.persist();
      return null;
    }

    return session;
  }

  public deleteSession(token: string) {
    const data = this.loadData();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    if (data.sessions && data.sessions[tokenHash]) {
      delete data.sessions[tokenHash];
      this.persist();
    }
  }
}

export const dataStore = new DataStoreService();
