import { Router } from 'express';
import { db } from '../../db';
import { siteSettings, profiles, projects, experiences, education, skills, testimonials, contactInquiries } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';

const router = Router();

router.get('/site', async (req, res) => {
  const settings = await db.select().from(siteSettings).limit(1);
  const profile = await db.select().from(profiles).limit(1);
  res.json({
    settings: settings[0] || {},
    profile: profile[0] || {}
  });
});

router.get('/projects', async (req, res) => {
  const allProjects = await db.select().from(projects).where(eq(projects.status, 'PUBLISHED')).orderBy(asc(projects.sortOrder));
  res.json(allProjects);
});

router.get('/experience', async (req, res) => {
  const allExp = await db.select().from(experiences).where(eq(experiences.status, 'PUBLISHED')).orderBy(asc(experiences.sortOrder));
  res.json(allExp);
});

router.get('/profile', async (req, res) => {
  const profile = await db.select().from(profiles).limit(1);
  res.json(profile[0] || {});
});

router.get('/education', async (req, res) => {
  const allEdu = await db.select().from(education).where(eq(education.status, 'PUBLISHED')).orderBy(asc(education.sortOrder));
  res.json(allEdu);
});

router.get('/skills', async (req, res) => {
  const allSkills = await db.select().from(skills).where(eq(skills.status, 'PUBLISHED')).orderBy(asc(skills.sortOrder));
  res.json(allSkills);
});

router.get('/testimonials', async (req, res) => {
  const allTesti = await db.select().from(testimonials).where(eq(testimonials.status, 'PUBLISHED')).orderBy(asc(testimonials.sortOrder));
  res.json(allTesti);
});

router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message, honeypot } = req.body;
    
    // Honeypot validation
    if (honeypot) {
      return res.status(200).json({ success: true, message: 'Message sent successfully.' });
    }
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }
    
    await db.insert(contactInquiries).values({ name, email, subject, message });
    
    res.json({ success: true, message: 'Message sent successfully.' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

export default router;
