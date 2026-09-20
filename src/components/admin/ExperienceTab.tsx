import React, { useState } from 'react';
import { Plus, Edit, Trash2, Briefcase, Calendar, MapPin, X, Check, AlertCircle } from 'lucide-react';
import { ExperienceItem } from './types';
import { adminFetch } from '../../services/apiClient';

interface ExperienceTabProps {
  experiences: ExperienceItem[];
  onRefreshData: () => void;
}

export const ExperienceTab: React.FC<ExperienceTabProps> = ({
  experiences,
  onRefreshData
}) => {
  const [editingExp, setEditingExp] = useState<Partial<ExperienceItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingExp({
      jobTitle: '',
      companyName: '',
      location: 'Jakarta, Indonesia',
      startDate: '2023-01',
      endDate: '',
      isCurrent: true,
      summary: '',
      status: 'PUBLISHED',
      sortOrder: experiences.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ExperienceItem) => {
    setEditingExp({
      ...item,
      jobTitle: item.jobTitle || item.role || '',
      companyName: item.companyName || item.company || '',
      summary: item.summary || item.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp?.jobTitle || !editingExp?.companyName) return;
    setLoading(true);

    const payload = {
      ...editingExp,
      role: editingExp.jobTitle,
      company: editingExp.companyName,
      description: editingExp.summary,
      endDate: editingExp.isCurrent ? '' : editingExp.endDate
    };

    try {
      if (editingExp.id) {
        const res = await adminFetch(`/api/v1/admin/experiences/${editingExp.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast('Work experience updated successfully!');
          setIsModalOpen(false);
          onRefreshData();
        } else {
          showToast('Failed to update experience', 'error');
        }
      } else {
        const res = await adminFetch('/api/v1/admin/experiences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast('New work experience added!');
          setIsModalOpen(false);
          onRefreshData();
        } else {
          showToast('Failed to add experience', 'error');
        }
      }
    } catch (err) {
      showToast('Network error while saving experience', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await adminFetch(`/api/v1/admin/experiences/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Experience record deleted');
        setDeleteConfirmId(null);
        onRefreshData();
      } else {
        showToast('Failed to delete experience record', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  return (
    <div className="space-y-6">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Work Experience ({experiences.length})</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage professional roles, client tenures, and creative director responsibilities.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-[#00f0ff] transition-all shadow-lg hover:shadow-[#00f0ff]/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Experience
        </button>
      </div>

      {/* Experience Timeline Cards */}
      <div className="space-y-4">
        {experiences.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center text-neutral-500 text-sm">
            No work experiences found. Click "Add Experience" to create one.
          </div>
        ) : (
          experiences.map((exp) => {
            const title = exp.jobTitle || exp.role;
            const company = exp.companyName || exp.company;
            const summary = exp.summary || exp.description;

            return (
              <div 
                key={exp.id}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/7 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-white/5 text-[#00f0ff] border border-white/10 mt-1">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-base">{title}</h3>
                      <span className="text-neutral-400 font-medium">@ {company}</span>
                      {exp.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                          CURRENT ROLE
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate || 'Present'}
                      </span>
                      {exp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {exp.location}
                        </span>
                      )}
                    </div>
                    {summary && (
                      <p className="text-sm text-neutral-300 leading-relaxed max-w-3xl whitespace-pre-line">
                        {summary}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-start">
                  <button
                    onClick={() => handleOpenEdit(exp)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(exp.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-rose-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && editingExp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111] border border-white/10 rounded-3xl max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">
                {editingExp.id ? 'Edit Work Experience' : 'Add New Work Experience'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={editingExp.jobTitle || ''}
                    onChange={e => setEditingExp({ ...editingExp, jobTitle: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Company / Agency *</label>
                  <input
                    type="text"
                    required
                    value={editingExp.companyName || ''}
                    onChange={e => setEditingExp({ ...editingExp, companyName: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Location</label>
                <input
                  type="text"
                  value={editingExp.location || ''}
                  onChange={e => setEditingExp({ ...editingExp, location: e.target.value })}
                  placeholder="e.g. Jakarta, Indonesia"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Start Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 2021-06"
                    value={editingExp.startDate || ''}
                    onChange={e => setEditingExp({ ...editingExp, startDate: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">End Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 2023-12"
                    disabled={editingExp.isCurrent}
                    value={editingExp.isCurrent ? '' : (editingExp.endDate || '')}
                    onChange={e => setEditingExp({ ...editingExp, endDate: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff] disabled:opacity-30"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCurrent"
                  checked={Boolean(editingExp.isCurrent)}
                  onChange={e => setEditingExp({ ...editingExp, isCurrent: e.target.checked })}
                  className="w-4 h-4 rounded text-[#00f0ff] focus:ring-0 bg-black/60 border-white/20"
                />
                <label htmlFor="isCurrent" className="text-xs font-semibold text-neutral-300">
                  I currently work in this role
                </label>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Key Responsibilities & Achievements</label>
                <textarea
                  rows={4}
                  value={editingExp.summary || ''}
                  onChange={e => setEditingExp({ ...editingExp, summary: e.target.value })}
                  placeholder="Outline key design achievements, leadership roles, and brand impact..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-[#00f0ff] disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Experience'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-3xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Delete Experience?</h3>
            <p className="text-xs text-neutral-400">
              Are you sure you want to delete this career history record?
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
