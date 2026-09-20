import { Router } from 'express';
import { db } from '../../db';
import { projects, profiles, siteSettings, experiences, education, skills, testimonials, mediaAssets, resumeVersions } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';
import { requireAdmin } from '../middlewares/authMiddleware';

const router = Router();
router.use(requireAdmin); // Protect all routes

import multer from 'multer';
import { supabase } from '../services/storage';
import { v4 as uuidv4 } from 'uuid';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB
});

router.post('/media/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const bucketName = 'portfolio-media';

    // In a real app, ensure bucket exists or create it
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) throw error;

    const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(fileName);

    const asset = await db.insert(mediaAssets).values({
      fileName,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      bucketId: bucketName,
      publicUrl: publicData.publicUrl
    }).returning();

    res.json(asset[0]);
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

router.post('/resume/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (req.file.mimetype !== 'application/pdf') return res.status(400).json({ error: 'Only PDF allowed' });

    const fileName = `Antonio-Riyanto-Resume-${Date.now()}.pdf`;
    const bucketName = 'portfolio-private';

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, req.file.buffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (error) throw error;

    // Deactivate previous
    await db.update(resumeVersions).set({ isActive: false });

    const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(fileName);

    const asset = await db.insert(resumeVersions).values({
      versionName: `Resume ${new Date().toISOString().split('T')[0]}`,
      fileUrl: publicData.publicUrl,
      fileName,
      isActive: true
    }).returning();

    res.json(asset[0]);
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const allProjects = await db.select().from(projects);
    const mediaCount = (await db.select().from(mediaAssets)).length;
    res.json({
      projects: allProjects,
      stats: { mediaCount, projectCount: allProjects.length }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// Settings
router.get('/settings', async (req, res) => {
  const settings = await db.select().from(siteSettings).limit(1);
  res.json(settings[0] || {});
});

router.post('/settings', async (req, res) => {
  const existing = await db.select().from(siteSettings).limit(1);
  if (existing.length > 0) {
    await db.update(siteSettings).set(req.body).where(eq(siteSettings.id, existing[0].id));
  } else {
    await db.insert(siteSettings).values(req.body);
  }
  res.json({ success: true });
});

// Profile
router.get('/profile', async (req, res) => {
  const profile = await db.select().from(profiles).limit(1);
  res.json(profile[0] || {});
});

router.post('/profile', async (req, res) => {
  const existing = await db.select().from(profiles).limit(1);
  if (existing.length > 0) {
    await db.update(profiles).set(req.body).where(eq(profiles.id, existing[0].id));
  } else {
    await db.insert(profiles).values(req.body);
  }
  res.json({ success: true });
});

// Projects CRUD
router.get('/projects', async (req, res) => {
  const allProjects = await db.select().from(projects).orderBy(asc(projects.sortOrder));
  res.json(allProjects);
});

router.post('/projects', async (req, res) => {
  try {
    const newProject = await db.insert(projects).values({ ...req.body, id: undefined }).returning();
    res.json(newProject[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.put('/projects/:id', async (req, res) => {
  try {
    const updated = await db.update(projects).set(req.body).where(eq(projects.id, req.params.id)).returning();
    if (updated.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    const deleted = await db.delete(projects).where(eq(projects.id, req.params.id)).returning();
    if (deleted.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Example for Experiences (similar logic for Education, Skills, Testimonials)
router.get('/experience', async (req, res) => {
  const allExp = await db.select().from(experiences).orderBy(asc(experiences.sortOrder));
  res.json(allExp);
});

router.post('/experience', async (req, res) => {
  try {
    const newExp = await db.insert(experiences).values({ ...req.body, id: undefined }).returning();
    res.json(newExp[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create experience' });
  }
});

router.put('/experience/:id', async (req, res) => {
  try {
    const updated = await db.update(experiences).set(req.body).where(eq(experiences.id, req.params.id)).returning();
    if (updated.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update experience' });
  }
});

router.delete('/experience/:id', async (req, res) => {
  try {
    const deleted = await db.delete(experiences).where(eq(experiences.id, req.params.id)).returning();
    if (deleted.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete experience' });
  }
});

// Generic endpoints
const entities = [
  { name: 'education', table: education },
  { name: 'skills', table: skills },
  { name: 'testimonials', table: testimonials },
  { name: 'media', table: mediaAssets }
];

for (const entity of entities) {
  router.get(`/${entity.name}`, async (req, res) => {
    try {
      const records = await db.select().from(entity.table);
      res.json(records);
    } catch (e) {
      res.status(500).json({ error: `Failed to fetch ${entity.name}` });
    }
  });

  router.post(`/${entity.name}`, async (req, res) => {
    try {
      const newRecord = await db.insert(entity.table).values(req.body).returning();
      res.json(newRecord[0]);
    } catch (e) {
      res.status(500).json({ error: `Failed to create ${entity.name}` });
    }
  });

  router.put(`/${entity.name}/:id`, async (req, res) => {
    try {
      const updated = await db.update(entity.table).set(req.body).where(eq((entity.table as any).id, req.params.id)).returning();
      if (updated.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(updated[0]);
    } catch (e) {
      res.status(500).json({ error: `Failed to update ${entity.name}` });
    }
  });

  router.delete(`/${entity.name}/:id`, async (req, res) => {
    try {
      const deleted = await db.delete(entity.table).where(eq((entity.table as any).id, req.params.id)).returning();
      if (deleted.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: `Failed to delete ${entity.name}` });
    }
  });
}

// Audit Logs (Read-only)
import { auditLogs } from '../../db/schema';
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await db.select().from(auditLogs).orderBy(asc(auditLogs.createdAt));
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Experiences uses plural in Frontend, fix to match '/experiences' if needed
router.get('/experiences', async (req, res) => {
  const allExp = await db.select().from(experiences).orderBy(asc(experiences.sortOrder));
  res.json(allExp);
});

export default router;
