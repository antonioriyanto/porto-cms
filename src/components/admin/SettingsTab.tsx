import React, { useState } from 'react';
import { Settings, Save, Check, AlertCircle, Globe, ShieldAlert } from 'lucide-react';
import { SiteSettingsData } from './types';

interface SettingsTabProps {
  settings: SiteSettingsData;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettingsData>>;
  onRefreshData: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  setSettings,
  onRefreshData
}) => {
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        showToast('Site settings and SEO metadata saved successfully!');
        onRefreshData();
      } else {
        showToast('Failed to save settings', 'error');
      }
    } catch (err) {
      showToast('Network error while updating settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast Alert */}
      {toast && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border text-sm font-medium ${
          toast.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Site Configuration & Global SEO</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Control public metadata, OpenGraph social cards, search engine indexes, and maintenance mode.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Identity */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <Globe className="w-5 h-5 text-[#00f0ff]" />
            <h2 className="text-base font-bold text-white">Domain & Metadata</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Site Title / Brand Name</label>
              <input
                type="text"
                value={settings?.siteName || ''}
                onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Canonical Public URL</label>
              <input
                type="text"
                placeholder="https://antonioriyanto.com"
                value={settings?.publicUrl || ''}
                onChange={e => setSettings({ ...settings, publicUrl: e.target.value })}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Default SEO Title</label>
            <input
              type="text"
              value={settings?.defaultSeoTitle || ''}
              onChange={e => setSettings({ ...settings, defaultSeoTitle: e.target.value })}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Meta Description</label>
            <textarea
              rows={3}
              value={settings?.seoDescription || ''}
              onChange={e => setSettings({ ...settings, seoDescription: e.target.value })}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Default OpenGraph Image URL</label>
            <input
              type="text"
              placeholder="https://... (1200x630 social share card)"
              value={settings?.ogImage || ''}
              onChange={e => setSettings({ ...settings, ogImage: e.target.value })}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Google Analytics / Tag ID</label>
            <input
              type="text"
              placeholder="G-XXXXXXXXXX"
              value={settings?.analyticsId || ''}
              onChange={e => setSettings({ ...settings, analyticsId: e.target.value })}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
            />
          </div>
        </div>

        {/* Maintenance Mode Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Maintenance Mode</h3>
              <p className="text-xs text-neutral-400">
                When enabled, visitors will see a graceful under-construction screen while you update portfolio items.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(settings?.maintenanceMode)}
              onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00f0ff]"></div>
          </label>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-black font-bold hover:bg-[#00f0ff] transition-all shadow-lg hover:shadow-[#00f0ff]/20 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
