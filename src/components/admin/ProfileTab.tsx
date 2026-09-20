import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Globe, FileText, Upload, 
  Check, AlertCircle, Save, ExternalLink, Shield
} from 'lucide-react';
import { ProfileData } from './types';

interface ProfileTabProps {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
  activeResume: any;
  onRefreshData: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  profile,
  setProfile,
  activeResume,
  onRefreshData
}) => {
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/v1/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        showToast('Profile updated and synchronized successfully!', 'success');
        onRefreshData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update profile', 'error');
      }
    } catch (err: any) {
      showToast('Network error while saving profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Only PDF files are allowed for resume upload', 'error');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      showToast('File size exceeds the 4MB limit', 'error');
      return;
    }

    setUploadingResume(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await fetch('/api/v1/admin/resume/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        showToast('New PDF Resume uploaded and activated!', 'success');
        onRefreshData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to upload resume', 'error');
      }
    } catch (err) {
      showToast('Error uploading resume to storage', 'error');
    } finally {
      setUploadingResume(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Toast Alert */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border text-sm font-medium ${
          statusMessage.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {statusMessage.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Profile & Biography Management</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Customize Antonio Riyanto's core bio, contact details, and resume PDF document.
        </p>
      </div>

      {/* Resume Management Card */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Active Resume PDF</h3>
              <p className="text-xs text-neutral-400">
                {activeResume?.fileName || 'Antonio-Riyanto-Resume.pdf'} • Available for public download
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeResume?.fileUrl && (
              <a
                href={activeResume.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-2 border border-white/10 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Current Resume
              </a>
            )}

            <label className={`px-4 py-2.5 rounded-xl bg-white text-black hover:bg-[#00f0ff] text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${uploadingResume ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingResume ? 'Uploading...' : 'Upload New PDF (Max 4MB)'}</span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                disabled={uploadingResume}
                onChange={handleResumeUpload}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleProfileSubmit} className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/10 pb-4">Personal & Professional Identity</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-2">Full Name</label>
              <input
                type="text"
                value={profile.fullName || ''}
                onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-2">Professional Title</label>
              <input
                type="text"
                value={profile.professionalTitle || ''}
                onChange={e => setProfile({ ...profile, professionalTitle: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-2">Hero Headline</label>
            <input
              type="text"
              value={profile.headline || ''}
              onChange={e => setProfile({ ...profile, headline: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-2">Hero Short Description</label>
            <textarea
              rows={2}
              value={profile.heroDescription || ''}
              onChange={e => setProfile({ ...profile, heroDescription: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-2">Full Biography / About Section</label>
            <textarea
              rows={4}
              value={profile.about || ''}
              onChange={e => setProfile({ ...profile, about: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-2">Avatar / Photo URL</label>
              <input
                type="text"
                value={profile.avatarUrl || ''}
                onChange={e => setProfile({ ...profile, avatarUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-2">Availability Status</label>
              <select
                value={profile.availabilityStatus || 'Available for Projects'}
                onChange={e => setProfile({ ...profile, availabilityStatus: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
              >
                <option value="Available for Projects">Available for Projects</option>
                <option value="Open to High-Impact Opportunities">Open to High-Impact Opportunities</option>
                <option value="Currently Booked">Currently Booked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact & Social Links */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/10 pb-4">Contact & Communication Channels</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-2">Public Email</label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-2">Phone / Display Number</label>
              <input
                type="text"
                value={profile.phoneDisplay || ''}
                onChange={e => setProfile({ ...profile, phoneDisplay: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-2">Location / Base</label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={e => setProfile({ ...profile, location: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-2">WhatsApp Direct URL</label>
              <input
                type="text"
                value={profile.whatsappUrl || ''}
                onChange={e => setProfile({ ...profile, whatsappUrl: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-2">LinkedIn Profile URL</label>
              <input
                type="text"
                value={profile.linkedinUrl || ''}
                onChange={e => setProfile({ ...profile, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-black font-bold hover:bg-[#00f0ff] hover:text-black transition-all shadow-lg hover:shadow-[#00f0ff]/20 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
