import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dataStore } from '../services/dataStore';
import { requireAdmin, AuthenticatedRequest } from '../middlewares/authMiddleware';
import { isSupabaseConfigured, uploadMulter, uploadToSupabaseStorage } from '../services/storage';
import { isDatabaseConfigured, db, checkDatabaseHealth } from '../../db';

const router = Router();
router.use(requireAdmin);

// ==========================================
// 1. MEDIA LIBRARY (Upload & Delete)
// ==========================================
// Upload (4MB limit, JPG/PNG/WEBP/SVG/PDF)
router.post('/media/upload', (req: AuthenticatedRequest, res, next) => {
  uploadMulter.any()(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Upload failed. File size limit is 4MB.' });
    }
    next();
  });
}, async (req: AuthenticatedRequest, res) => {
  try {
    const file = req.file || (req.files as Express.Multer.File[])?.[0];
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    let publicUrl = '';
    if (isSupabaseConfigured()) {
      const fileExt = file.originalname.split('.').pop() || 'bin';
      const fileName = `${uuidv4()}.${fileExt}`;
      const uploadRes = await uploadToSupabaseStorage('portfolio-media', fileName, file.buffer, file.mimetype);
      if (uploadRes.publicUrl) {
        publicUrl = uploadRes.publicUrl;
      }
    }

    if (!publicUrl) {
      publicUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }

    const asset = dataStore.addMediaAsset({
      fileName: file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      publicUrl
    });

    dataStore.addAuditLog(req.user?.id || 'admin', 'MEDIA_UPLOAD', { fileName: file.originalname, size: file.size });
    res.status(201).json(asset);
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload media: ' + error.message });
  }
});

// Media List
router.get('/media', async (req, res) => {
  try {
    res.json(dataStore.getMediaAssets());
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// Delete Media
router.delete('/media/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const success = dataStore.deleteMediaAsset(req.params.id);
    if (!success) return res.status(404).json({ error: 'Media asset not found' });
    dataStore.addAuditLog(req.user?.id || 'admin', 'MEDIA_DELETE', { id: req.params.id });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// ==========================================
// 2. RESUME / CV
// ==========================================
router.post('/resume/upload', (req: AuthenticatedRequest, res, next) => {
  uploadMulter.any()(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Upload failed. File size limit is 4MB.' });
    }
    next();
  });
}, async (req: AuthenticatedRequest, res) => {
  try {
    const file = req.file || (req.files as Express.Multer.File[])?.[0];
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    if (file.mimetype !== 'application/pdf' && !file.originalname.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ error: 'Only PDF files are accepted for resumes' });
    }

    const fileName = `Antonio-Riyanto-Resume-${Date.now()}.pdf`;
    let publicUrl = '';

    if (isSupabaseConfigured()) {
      const uploadRes = await uploadToSupabaseStorage('portfolio-private', fileName, file.buffer, 'application/pdf');
      if (uploadRes.publicUrl) {
        publicUrl = uploadRes.publicUrl;
      }
    }

    if (!publicUrl) {
      publicUrl = `data:application/pdf;base64,${file.buffer.toString('base64')}`;
    }

    const asset = {
      versionName: `Resume ${new Date().toISOString().split('T')[0]}`,
      fileUrl: publicUrl,
      fileName,
      isActive: true
    };

    const savedResume = dataStore.saveActiveResume(asset);
    dataStore.addAuditLog(req.user?.id || 'admin', 'RESUME_UPLOAD', { fileName });
    res.json(savedResume);
  } catch (error: any) {
    console.error('Resume upload error:', error);
    res.status(500).json({ error: 'Failed to upload resume: ' + error.message });
  }
});

router.get(['/resume', '/resume/active'], async (req, res) => {
  try {
    const resume = dataStore.getActiveResume();
    res.json({ success: true, resume: resume || { isActive: false, fileName: 'Antonio-Riyanto-Resume.pdf' } });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

// ==========================================
// 3. DASHBOARD STATS
// ==========================================
const getDashboardStatsHandler = async (req: AuthenticatedRequest, res: any) => {
  try {
    const allProjects = dataStore.getProjects(false);
    const media = dataStore.getMediaAssets();
    const experiences = dataStore.getExperiences(false);
    const education = dataStore.getEducation(false);
    const skills = dataStore.getSkills(false);
    const testimonials = dataStore.getTestimonials(false);
    const inquiries = dataStore.getContactInquiries();
    const recentLogs = dataStore.getAuditLogs({ limit: 8 });

    let dbHealth = { connected: false, message: 'Not configured' };
    if (isDatabaseConfigured) {
      dbHealth = await checkDatabaseHealth();
    }

    const stats = {
      projectCount: allProjects.length,
      publishedProjectCount: allProjects.filter((p: any) => p.status === 'PUBLISHED').length,
      draftProjectCount: allProjects.filter((p: any) => p.status !== 'PUBLISHED').length,
      mediaCount: media.length,
      experienceCount: experiences.length,
      educationCount: education.length,
      skillCount: skills.length,
      testimonialCount: testimonials.length,
      inquiryCount: inquiries.length,
      unreadInquiryCount: inquiries.filter((i: any) => !i.isRead).length,
      views: 1420,
      supabaseStatus: {
        configured: isSupabaseConfigured(),
        databaseConnected: dbHealth.connected,
        databaseMessage: dbHealth.message
      },
      recentLogs
    };

    res.json({
      projects: allProjects,
      stats
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard stats' });
  }
};

router.get('/dashboard', getDashboardStatsHandler);
router.get('/dashboard/stats', getDashboardStatsHandler);

// ==========================================
// 4. SITE SETTINGS & SEO
// ==========================================
router.get('/settings', async (req, res) => {
  try {
    const siteData = dataStore.getSiteSettings();
    res.json(siteData.settings || siteData);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

const saveSettingsHandler = async (req: AuthenticatedRequest, res: any) => {
  try {
    const updated = dataStore.updateSiteSettings(req.body);
    dataStore.addAuditLog(req.user?.id || 'admin', 'UPDATE_SETTINGS', req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};
router.post('/settings', saveSettingsHandler);
router.put('/settings', saveSettingsHandler);

// ==========================================
// 5. PROFILE & BIOGRAPHY
// ==========================================
router.get('/profile', async (req, res) => {
  try {
    const profile = dataStore.getProfile();
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

const saveProfileHandler = async (req: AuthenticatedRequest, res: any) => {
  try {
    const updated = dataStore.updateProfile(req.body);
    dataStore.addAuditLog(req.user?.id || 'admin', 'UPDATE_PROFILE', req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
router.post('/profile', saveProfileHandler);
router.put('/profile', saveProfileHandler);

// ==========================================
// 6. PROJECTS (CRUD & REORDER)
// ==========================================
router.get('/projects', async (req, res) => {
  try {
    const allProjects = dataStore.getProjects(false);
    res.json(allProjects);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post('/projects', async (req: AuthenticatedRequest, res) => {
  try {
    const created = dataStore.createProject(req.body);
    dataStore.addAuditLog(req.user?.id || 'admin', 'CREATE_PROJECT', { title: created.title, id: created.id });
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create project: ' + error.message });
  }
});

router.put('/projects/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const updated = dataStore.updateProject(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Project not found' });
    dataStore.addAuditLog(req.user?.id || 'admin', 'UPDATE_PROJECT', { id: req.params.id, title: updated.title });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/projects/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const success = dataStore.deleteProject(req.params.id);
    if (!success) return res.status(404).json({ error: 'Project not found' });
    dataStore.addAuditLog(req.user?.id || 'admin', 'DELETE_PROJECT', { id: req.params.id });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Reorder Projects
router.post('/projects/reorder', async (req: AuthenticatedRequest, res) => {
  try {
    const order = req.body.order || req.body.items || req.body;
    if (!Array.isArray(order)) {
      return res.status(400).json({ error: 'Order must be an array of project IDs or objects' });
    }
    const reordered = dataStore.reorderProjects(order);
    dataStore.addAuditLog(req.user?.id || 'admin', 'REORDER_PROJECTS', { count: order.length });
    res.json({ success: true, projects: reordered });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to reorder projects' });
  }
});

// ==========================================
// 7. EXPERIENCES (CRUD)
// ==========================================
const getExperiencesHandler = async (req: any, res: any) => {
  try {
    const allExp = dataStore.getExperiences(false);
    res.json(allExp);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
};
router.get('/experience', getExperiencesHandler);
router.get('/experiences', getExperiencesHandler);

const createExperienceHandler = async (req: AuthenticatedRequest, res: any) => {
  try {
    const created = dataStore.createExperience(req.body);
    dataStore.addAuditLog(req.user?.id || 'admin', 'CREATE_EXPERIENCE', { title: created.jobTitle, id: created.id });
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create experience' });
  }
};
router.post('/experience', createExperienceHandler);
router.post('/experiences', createExperienceHandler);

const updateExperienceHandler = async (req: AuthenticatedRequest, res: any) => {
  try {
    const updated = dataStore.updateExperience(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Experience not found' });
    dataStore.addAuditLog(req.user?.id || 'admin', 'UPDATE_EXPERIENCE', { id: req.params.id });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update experience' });
  }
};
router.put('/experience/:id', updateExperienceHandler);
router.put('/experiences/:id', updateExperienceHandler);

const deleteExperienceHandler = async (req: AuthenticatedRequest, res: any) => {
  try {
    const success = dataStore.deleteExperience(req.params.id);
    if (!success) return res.status(404).json({ error: 'Experience not found' });
    dataStore.addAuditLog(req.user?.id || 'admin', 'DELETE_EXPERIENCE', { id: req.params.id });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete experience' });
  }
};
router.delete('/experience/:id', deleteExperienceHandler);
router.delete('/experiences/:id', deleteExperienceHandler);

// ==========================================
// 8. EDUCATION (CRUD)
// ==========================================
router.get('/education', async (req, res) => {
  try {
    res.json(dataStore.getEducation(false));
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch education' });
  }
});

router.post('/education', async (req: AuthenticatedRequest, res) => {
  try {
    const created = dataStore.createEducation(req.body);
    dataStore.addAuditLog(req.user?.id || 'admin', 'CREATE_EDUCATION', { institution: created.institutionName });
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create education' });
  }
});

router.put('/education/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const updated = dataStore.updateEducation(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Education record not found' });
    dataStore.addAuditLog(req.user?.id || 'admin', 'UPDATE_EDUCATION', { id: req.params.id });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update education' });
  }
});

router.delete('/education/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const success = dataStore.deleteEducation(req.params.id);
    if (!success) return res.status(404).json({ error: 'Education record not found' });
    dataStore.addAuditLog(req.user?.id || 'admin', 'DELETE_EDUCATION', { id: req.params.id });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete education' });
  }
});

// ==========================================
// 9. SKILLS MATRIX (CRUD)
// ==========================================
router.get('/skills', async (req, res) => {
  try {
    res.json(dataStore.getSkills(false));
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

router.post('/skills', async (req: AuthenticatedRequest, res) => {
  try {
    const created = dataStore.createSkill(req.body);
    dataStore.addAuditLog(req.user?.id || 'admin', 'CREATE_SKILL', { name: created.name });
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create skill' });
  }
});

router.put('/skills/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const updated = dataStore.updateSkill(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Skill not found' });
    dataStore.addAuditLog(req.user?.id || 'admin', 'UPDATE_SKILL', { id: req.params.id });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

router.delete('/skills/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const success = dataStore.deleteSkill(req.params.id);
    if (!success) return res.status(404).json({ error: 'Skill not found' });
    dataStore.addAuditLog(req.user?.id || 'admin', 'DELETE_SKILL', { id: req.params.id });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete skill' });
  }
});

// ==========================================
// 10. TESTIMONIALS (CRUD)
// ==========================================
router.get('/testimonials', async (req, res) => {
  try {
    res.json(dataStore.getTestimonials(false));
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

router.post('/testimonials', async (req: AuthenticatedRequest, res) => {
  try {
    const created = dataStore.createTestimonial(req.body);
    dataStore.addAuditLog(req.user?.id || 'admin', 'CREATE_TESTIMONIAL', { person: created.personName });
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

router.put('/testimonials/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const updated = dataStore.updateTestimonial(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Testimonial not found' });
    dataStore.addAuditLog(req.user?.id || 'admin', 'UPDATE_TESTIMONIAL', { id: req.params.id });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

router.delete('/testimonials/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const success = dataStore.deleteTestimonial(req.params.id);
    if (!success) return res.status(404).json({ error: 'Testimonial not found' });
    dataStore.addAuditLog(req.user?.id || 'admin', 'DELETE_TESTIMONIAL', { id: req.params.id });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

// ==========================================
// 11. AUDIT LOGS
// ==========================================
router.get('/audit-logs', async (req, res) => {
  try {
    const action = req.query.action as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const logs = dataStore.getAuditLogs({ action, limit, page });
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// ==========================================
// 12. INQUIRIES (CONTACT MESSAGES)
// ==========================================
router.get('/inquiries', async (req, res) => {
  try {
    res.json(dataStore.getContactInquiries());
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

export default router;
