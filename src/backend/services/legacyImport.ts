import fs from 'fs';
import path from 'path';
import { db } from '../../db';
import { adminUsers, profiles, siteSettings, projects, experiences, education, skills, testimonials, mediaAssets } from '../../db/schema';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function importLegacyData() {
  const dataPath = path.join(process.cwd(), 'database_store.json');
  if (!fs.existsSync(dataPath)) {
    console.log('No database_store.json found. Skipping legacy import.');
    return;
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log('Starting legacy data import...');

  // 1. Create Default Site Settings if missing
  const settingsCount = await db.select().from(siteSettings);
  if (settingsCount.length === 0) {
    await db.insert(siteSettings).values({
      siteName: data.siteSettings?.siteName || 'Antonio Riyanto Portfolio',
      publicUrl: data.siteSettings?.publicUrl || '',
      defaultSeoTitle: data.siteSettings?.seoTitle || '',
      seoDescription: data.siteSettings?.seoDescription || '',
    });
  }

  // 2. Profile
  const profileCount = await db.select().from(profiles);
  if (profileCount.length === 0) {
    await db.insert(profiles).values({
      fullName: data.profile?.fullName || 'Antonio Riyanto',
      professionalTitle: data.profile?.professionalTitle || 'Creative Designer',
      headline: data.profile?.headline || '6 Years of Visual Architecture.',
      heroDescription: data.profile?.heroDescription || 'Based in Jakarta. I specialize in high-stakes brand management and full-scale creative production.',
      about: data.profile?.about || '',
      location: data.profile?.location || 'Jakarta, Indonesia',
      email: data.profile?.email || 'antonio.riyanto07@gmail.com',
      phoneDisplay: data.profile?.phoneDisplay || '+62 819 0398 7051',
      whatsappUrl: data.profile?.whatsappUrl || 'https://wa.me/6281903987051',
      linkedinUrl: data.profile?.linkedinUrl || 'https://www.linkedin.com/in/antonio-riyanto-928203186/',
      avatarUrl: data.profile?.avatarUrl,
      careerStart: new Date('2019-11-01'),
      availabilityStatus: data.profile?.availabilityStatus || 'Available for Projects',
    });
  }

  // We are NOT importing admin users, sessions, or preview tokens as requested.

  // Projects
  if (data.projects && Array.isArray(data.projects)) {
    for (const p of data.projects) {
      const existing = await db.select().from(projects).where(eq(projects.slug, p.slug || p.id));
      if (existing.length === 0) {
        await db.insert(projects).values({
          id: uuidv4(),
          slug: p.slug || p.id,
          title: p.title || 'Untitled',
          client: p.client,
          category: p.category,
          role: p.role,
          year: p.year,
          shortDescription: p.shortDescription,
          challenge: p.challenge,
          solution: p.solution,
          deliverables: p.deliverables ? p.deliverables.join(', ') : '',
          coverImageUrl: p.coverImage,
          videoUrl: p.videoUrl,
          featured: p.featured || false,
          status: 'DRAFT', // Default to DRAFT per requirements
          sortOrder: p.sortOrder || 0,
        });
      }
    }
  }

  // Experiences
  if (data.experiences && Array.isArray(data.experiences)) {
    for (const e of data.experiences) {
      await db.insert(experiences).values({
        role: e.role || 'Unknown',
        company: e.company || 'Unknown',
        startDate: e.startDate || '',
        endDate: e.endDate || '',
        description: e.description || '',
        status: 'PUBLISHED',
      });
    }
  }

  console.log('Legacy import completed. Please verify data and remove database_store.json.');
}
