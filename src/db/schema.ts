import { pgTable, text, timestamp, uuid, varchar, jsonb, boolean, integer, pgEnum } from 'drizzle-orm/pg-core';

export const contentStatusEnum = pgEnum('content_status', ['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export const roleEnum = pgEnum('admin_role', ['SUPER_ADMIN', 'EDITOR']);

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: roleEnum('role').default('EDITOR').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const adminSessions = pgTable('admin_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => adminUsers.id, { onDelete: 'cascade' }).notNull(),
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const siteSettings = pgTable('site_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  siteName: varchar('site_name', { length: 255 }).notNull().default('Portfolio'),
  publicUrl: varchar('public_url', { length: 255 }),
  defaultSeoTitle: text('default_seo_title'),
  seoDescription: text('seo_description'),
  ogImage: text('og_image'),
  maintenanceMode: boolean('maintenance_mode').default(false).notNull(),
  analyticsId: varchar('analytics_id', { length: 255 }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  professionalTitle: varchar('professional_title', { length: 255 }),
  avatarUrl: text('avatar_url'),
  headline: text('headline'),
  heroDescription: text('hero_description'),
  about: text('about'),
  location: varchar('location', { length: 255 }),
  email: varchar('email', { length: 255 }),
  phoneDisplay: varchar('phone_display', { length: 255 }),
  whatsappUrl: text('whatsapp_url'),
  linkedinUrl: text('linkedin_url'),
  availabilityStatus: varchar('availability_status', { length: 255 }),
  careerStart: timestamp('career_start'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  client: varchar('client', { length: 255 }),
  category: varchar('category', { length: 255 }),
  role: varchar('role', { length: 255 }),
  year: varchar('year', { length: 255 }),
  shortDescription: text('short_description'),
  challenge: text('challenge'),
  solution: text('solution'),
  deliverables: text('deliverables'),
  coverImageUrl: text('cover_image_url'),
  videoUrl: text('video_url'),
  featured: boolean('featured').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  ogImage: text('og_image'),
  status: contentStatusEnum('status').default('DRAFT').notNull(),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projectMedia = pgTable('project_media', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  mediaUrl: text('media_url').notNull(),
  altText: text('alt_text'),
  caption: text('caption'),
  sortOrder: integer('sort_order').default(0).notNull(),
});

export const experiences = pgTable('experiences', {
  id: uuid('id').defaultRandom().primaryKey(),
  role: varchar('role', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }).notNull(),
  startDate: varchar('start_date', { length: 255 }).notNull(),
  endDate: varchar('end_date', { length: 255 }),
  description: text('description'),
  status: contentStatusEnum('status').default('DRAFT').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const education = pgTable('education', {
  id: uuid('id').defaultRandom().primaryKey(),
  degree: varchar('degree', { length: 255 }).notNull(),
  institution: varchar('institution', { length: 255 }).notNull(),
  year: varchar('year', { length: 255 }).notNull(),
  description: text('description'),
  status: contentStatusEnum('status').default('DRAFT').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const skills = pgTable('skills', {
  id: uuid('id').defaultRandom().primaryKey(),
  category: varchar('category', { length: 255 }).notNull(),
  items: jsonb('items').notNull(), // Array of strings
  status: contentStatusEnum('status').default('DRAFT').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const testimonials = pgTable('testimonials', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 255 }),
  content: text('content').notNull(),
  avatarUrl: text('avatar_url'),
  verified: boolean('verified').default(false).notNull(),
  status: contentStatusEnum('status').default('DRAFT').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 255 }).notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  publicUrl: text('public_url').notNull(),
  bucketId: varchar('bucket_id', { length: 255 }).notNull(),
  altText: text('alt_text'),
  width: integer('width'),
  height: integer('height'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const resumeVersions = pgTable('resume_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  versionName: varchar('version_name', { length: 255 }).notNull(),
  fileUrl: text('file_url').notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id'),
  action: varchar('action', { length: 255 }).notNull(),
  entityType: varchar('entity_type', { length: 255 }),
  entityId: varchar('entity_id', { length: 255 }),
  details: jsonb('details'),
  ipAddress: varchar('ip_address', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const contactInquiries = pgTable('contact_inquiries', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const previewTokens = pgTable('preview_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
  entityType: varchar('entity_type', { length: 255 }).notNull(),
  entityId: varchar('entity_id', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
