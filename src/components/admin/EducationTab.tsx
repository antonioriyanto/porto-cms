import React, { useState } from 'react';
import { Plus, Edit, Trash2, GraduationCap, Calendar, X, Check, AlertCircle } from 'lucide-react';
import { EducationItem } from './types';

interface EducationTabProps {
  education: EducationItem[];
  onRefreshData: () => void;
}

export const EducationTab: React.FC<EducationTabProps> = ({
  education,
  onRefreshData
}) => {
  const [editingItem, setEditingItem] = useState<Partial<EducationItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingItem({
      institutionName: '',
      degree: "Bachelor's Degree",
      fieldOfStudy: 'Visual Communication Design (DKV)',
      period: '2015 - 2019',
      description: '',
      status: 'PUBLISHED',
      sortOrder: education.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: EducationItem) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.institutionName) return;
    setLoading(true);

    try {
      if (editingItem.id) {
        const res = await fetch(`/api/v1/admin/education/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingItem)
        });
        if (res.ok) {
          showToast('Education record updated!');
          setIsModalOpen(false);
          onRefreshData();
        } else {
          showToast('Failed to update education', 'error');
        }
      } else {
        const res = await fetch('/api/v1/admin/education', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingItem)
        });
        if (res.ok) {
          showToast('New education record added!');
          setIsModalOpen(false);
          onRefreshData();
        } else {
          showToast('Failed to create education', 'error');
        }
      }
    } catch (err) {
      showToast('Network error while saving', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/admin/education/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Education record deleted');
        setDeleteConfirmId(null);
        onRefreshData();
      } else {
        showToast('Failed to delete education record', 'error');
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Education & Certifications ({education.length})</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Academic degrees, design credentials, and formal qualifications.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-[#00f0ff] transition-all shadow-lg hover:shadow-[#00f0ff]/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Education
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {education.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center text-neutral-500 text-sm">
            No education records added yet. Click "Add Education" to create one.
          </div>
        ) : (
          education.map((item) => (
            <div 
              key={item.id}
              className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/7 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-white/5 text-[#00f0ff] border border-white/10 mt-1">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{item.institutionName}</h3>
                  <p className="text-sm text-neutral-300 mt-0.5">
                    {item.degree} {item.fieldOfStudy ? `in ${item.fieldOfStudy}` : ''}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mt-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.period || 'Year'}</span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-neutral-400 mt-2 max-w-2xl">{item.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirmId(item.id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-rose-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111] border border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">
                {editingItem.id ? 'Edit Education Record' : 'Add Education Record'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Institution Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Universitas Pelita Harapan"
                  value={editingItem.institutionName || ''}
                  onChange={e => setEditingItem({ ...editingItem, institutionName: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Degree / Certificate</label>
                  <input
                    type="text"
                    placeholder="e.g. Bachelor of Arts"
                    value={editingItem.degree || ''}
                    onChange={e => setEditingItem({ ...editingItem, degree: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Field of Study</label>
                  <input
                    type="text"
                    placeholder="e.g. Visual Communication"
                    value={editingItem.fieldOfStudy || ''}
                    onChange={e => setEditingItem({ ...editingItem, fieldOfStudy: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Period</label>
                <input
                  type="text"
                  placeholder="e.g. 2016 - 2020"
                  value={editingItem.period || ''}
                  onChange={e => setEditingItem({ ...editingItem, period: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Honors & Activities</label>
                <textarea
                  rows={3}
                  value={editingItem.description || ''}
                  onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Graduated with honors, design thesis exhibition award..."
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
                  {loading ? 'Saving...' : 'Save Record'}
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
            <h3 className="text-lg font-bold text-white">Delete Education Record?</h3>
            <p className="text-xs text-neutral-400">
              Are you sure you want to remove this academic record?
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
