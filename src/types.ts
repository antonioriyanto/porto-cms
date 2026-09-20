export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: 'SUPER_ADMIN' | 'EDITOR';
  isActive: boolean;
  lastLoginAt?: string;
}

export interface SiteSettings {
  siteName: string;
  publicUrl: string;
  defaultLanguage: string;
  themeColor: string;
  maintenanceMode: boolean;
  seoTitle: string;
  seoDescription: string;
  ogImageMediaId?: string;
  faviconMediaId?: string;
}

export interface Profile {
  fullName: string;
  professionalTitle: string;
  headline: string;
  heroDescription: string;
  about: string;
  location: string;
  email: string;
  phoneDisplay: string;
  whatsappUrl: string;
  linkedinUrl: string;
  profileImageMediaId?: string;
  resumeMediaId?: string;
  careerStart: string;
  availabilityStatus: string;
}

export interface Experience {
  id: string;
  companyName: string;
  jobTitle: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  summary: string;
  sortOrder: number;
  isVisible: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  sortOrder: number;
  isVisible: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface Skill {
  id: string;
  name: string;
  category: 'HARD' | 'SOFT';
  proficiency: number;
  icon?: string;
  sortOrder: number;
  isVisible: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface ProjectMedia {
  id: string;
  projectId: string;
  mediaId: string;
  caption?: string;
  altText?: string;
  sortOrder: number;
  isVisible: boolean;
}

export interface Project {
  id: string;
  slug: string;
  clientName: string;
  projectTitle: string;
  category: string;
  role: string;
  year: string;
  shortDescription: string;
  challenge: string;
  solution: string;
  deliverables: string[];
  coverMediaId?: string;
  featured: boolean;
  sortOrder: number;
  isVisible: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
  media?: ProjectMedia[];
}

export interface Testimonial {
  id: string;
  personName: string;
  personTitle: string;
  company: string;
  quote: string;
  avatarMediaId?: string;
  isVerified: boolean;
  sortOrder: number;
  isVisible: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  sortOrder: number;
  isVisible: boolean;
}

export interface MediaAsset {
  id: string;
  storageKey: string;
  publicUrl: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  altText?: string;
  checksum: string;
  uploadedBy: string;
  createdAt: string;
  replacedAt?: string;
}

export interface ContentRevision {
  id: string;
  entityType: string;
  entityId: string;
  revisionNumber: number;
  snapshotJson: any;
  changedBy: string;
  changeSummary: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadataJson?: any;
  ipHash?: string;
  createdAt: string;
}
