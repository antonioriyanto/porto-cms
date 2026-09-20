import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dataStore } from '../services/dataStore';
import { requireAdmin, AuthenticatedRequest } from '../middlewares/authMiddleware';
import { isSupabaseConfigured, uploadMulter, uploadToSupabaseStorage } from '../services/storage';

const router = Router();
router.use(requireAdmin);

// Media Upload (4MB limit, JPG/PNG/WEBP/PDF)
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
      const fileExt = file.originalname.split('.').pop();
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

    dataStore.addAuditLog(req.user?.id || 'admin', 'MEDIA_UPLOAD', { fileName: file.originalname });
    res.json(asset);
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

// Resume Upload (4MB limit, PDF only)
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
      return res.status(400).json({ error: 'Only PDF files allowed' });
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
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// Resume
router.get('/resume', async (req, res) => {
  try {
    const resume = dataStore.getActiveResume();
    res.json(resume || { isActive: false });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

// Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const allProjects = dataStore.getProjects(false);
    const media = dataStore.getMediaAssets();
    res.json({
      projects: allProjects,
      stats: {
        mediaCount: media.length,
        projectCount: allProjects.length
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// Settings
router.get('/settings', async (req, res) => {
  try {
    const siteData = dataStore.getSiteSettings();
    res.json(siteData.settings);
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

// Profile
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

// Projects
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
    dataStore.addAuditLog(req.user?.id || 'admin', 'CREATE_PROJECT', { title: created.title });
    res.json(created);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.put('/projects/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const updated = dataStore.updateProject(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Project not found' });
    dataStore.addAuditLog(req.user?.id || 'admin', 'UPDATE_PROJECT', { id: req.params.id });
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

// Experiences
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
    dataStore.addAuditLog(req.user?.id || 'admin', 'CREATE_EXPERIENCE', { title: created.jobTitle });
    res.json(created);
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

// Education
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
    res.json(created);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create education' });
  }
});

router.put('/education/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const updated = dataStore.updateEducation(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update education' });
  }
});

router.delete('/education/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const success = dataStore.deleteEducation(req.params.id);
    if (!success) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete education' });
  }
});

// Skills
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
    res.json(created);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create skill' });
  }
});

router.put('/skills/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const updated = dataStore.updateSkill(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

router.delete('/skills/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const success = dataStore.deleteSkill(req.params.id);
    if (!success) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete skill' });
  }
});

// Testimonials
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
    res.json(created);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

router.put('/testimonials/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const updated = dataStore.updateTestimonial(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

router.delete('/testimonials/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const success = dataStore.deleteTestimonial(req.params.id);
    if (!success) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

// Media
router.get('/media', async (req, res) => {
  try {
    res.json(dataStore.getMediaAssets());
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

router.delete('/media/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const success = dataStore.deleteMediaAsset(req.params.id);
    if (!success) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// Audit Logs
router.get('/audit-logs', async (req, res) => {
  try {
    res.json(dataStore.getAuditLogs());
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
