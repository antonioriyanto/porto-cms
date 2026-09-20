import { Router } from 'express';
import { dataStore } from '../services/dataStore';

const router = Router();

router.get('/site', async (req, res) => {
  try {
    const siteData = dataStore.getSiteSettings();
    res.json(siteData);
  } catch (error: any) {
    console.error('Error fetching site settings:', error);
    res.status(500).json({ error: 'Failed to fetch site settings' });
  }
});

router.get('/projects', async (req, res) => {
  try {
    const projects = dataStore.getProjects(true);
    res.json(projects);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.get('/experience', async (req, res) => {
  try {
    const exp = dataStore.getExperiences(true);
    res.json(exp);
  } catch (error: any) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
});

router.get('/experiences', async (req, res) => {
  try {
    const exp = dataStore.getExperiences(true);
    res.json(exp);
  } catch (error: any) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const profile = dataStore.getProfile();
    res.json(profile);
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.get('/education', async (req, res) => {
  try {
    const edu = dataStore.getEducation(true);
    res.json(edu);
  } catch (error: any) {
    console.error('Error fetching education:', error);
    res.status(500).json({ error: 'Failed to fetch education' });
  }
});

router.get('/skills', async (req, res) => {
  try {
    const skills = dataStore.getSkills(true);
    res.json(skills);
  } catch (error: any) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = dataStore.getTestimonials(true);
    res.json(testimonials);
  } catch (error: any) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

router.get('/resume', async (req, res) => {
  try {
    const resume = dataStore.getActiveResume();
    const wantsJson = (req.headers.accept && req.headers.accept.includes('application/json')) || req.query.format === 'json';

    if (wantsJson) {
      return res.json({
        hasCustomResume: Boolean(resume && resume.fileUrl),
        resume: resume || null,
        downloadUrl: '/api/v1/public/resume?download=1',
        viewUrl: '/resume'
      });
    }

    if (resume && resume.fileUrl) {
      if (resume.fileUrl.startsWith('data:')) {
        const matches = resume.fileUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const buffer = Buffer.from(matches[2], 'base64');
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `inline; filename="${resume.fileName || 'Antonio-Riyanto-Resume.pdf'}"`);
          return res.send(buffer);
        }
      }
      return res.redirect(resume.fileUrl);
    }
    res.json({
      hasCustomResume: false,
      viewUrl: '/resume'
    });
  } catch (error: any) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, service, budget, message, honeypot } = req.body;

    // Honeypot bot protection
    if (honeypot) {
      return res.status(200).json({ success: true, message: 'Message sent successfully.' });
    }

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    dataStore.saveContactInquiry({
      name,
      email,
      subject: subject || `${service || 'General'} Inquiry (${budget || 'Flexible'})`,
      service,
      budget,
      message,
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Message sent successfully.' });
  } catch (e: any) {
    console.error('Failed to save contact inquiry:', e);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

export default router;
