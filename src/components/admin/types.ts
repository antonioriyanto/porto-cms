export interface AdminUser {
  id: string;
  email: string;
  role: string;
  displayName?: string;
}

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  projectTitle?: string;
  client?: string;
  clientName?: string;
  category?: string;
  role?: string;
  year?: string;
  shortDescription?: string;
  challenge?: string;
  solution?: string;
  deliverables?: string[] | string;
  featured?: boolean;
  sortOrder?: number;
  isVisible?: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  coverImageUrl?: string;
  coverImage?: string;
  media?: any[];
  publishedAt?: string;
}

export interface ExperienceItem {
  id: string;
  jobTitle: string;
  role?: string;
  companyName: string;
  company?: string;
  summary?: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  sortOrder?: number;
}

export interface EducationItem {
  id: string;
  institutionName: string;
  degree?: string;
  fieldOfStudy?: string;
  period?: string;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  sortOrder?: number;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'HARD' | 'SOFT' | 'TOOL';
  proficiency: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  sortOrder?: number;
}

export interface TestimonialItem {
  id: string;
  personName: string;
  personTitle?: string;
  company?: string;
  quote: string;
  avatarUrl?: string;
  rating?: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  sortOrder?: number;
}

export interface MediaAssetItem {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  publicUrl: string;
  createdAt?: string;
}

export interface AuditLogItem {
  id: string;
  actorId: string;
  action: string;
  entityType?: string;
  metadataJson?: string | null;
  createdAt: string;
}

export interface SiteSettingsData {
  siteName?: string;
  publicUrl?: string;
  defaultSeoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  maintenanceMode?: boolean;
  analyticsId?: string;
}

export interface ProfileData {
  fullName: string;
  professionalTitle: string;
  avatarUrl?: string;
  headline: string;
  heroDescription: string;
  about: string;
  location: string;
  email: string;
  phoneDisplay: string;
  whatsappUrl: string;
  linkedinUrl: string;
  availabilityStatus: string;
  careerStart?: string;
}
