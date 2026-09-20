import React, { useState } from 'react';
import { Plus, Edit, Trash2, Star, Quote, X, Check, AlertCircle } from 'lucide-react';
import { TestimonialItem } from './types';
import { adminFetch } from '../../services/apiClient';

interface TestimonialsTabProps {
  testimonials: TestimonialItem[];
  onRefreshData: () => void;
}

export const TestimonialsTab: React.FC<TestimonialsTabProps> = ({
  testimonials,
  onRefreshData
}) => {
  const [editingItem, setEditingItem] = useState<Partial<TestimonialItem> | null>(null);
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
      personName: '',
      personTitle: 'Marketing Director',
      company: '',
      quote: '',
      avatarUrl: '',
      rating: 5,
      status: 'PUBLISHED',
      sortOrder: testimonials.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: TestimonialItem) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.personName || !editingItem?.quote) return;
    setLoading(true);

    try {
      if (editingItem.id) {
        const res = await adminFetch(`/api/v1/admin/testimonials/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingItem)
        });
        if (res.ok) {
          showToast('Testimonial updated!');
          setIsModalOpen(false);
          onRefreshData();
        } else {
          showToast('Failed to update testimonial', 'error');
        }
      } else {
        const res = await adminFetch('/api/v1/admin/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingItem)
        });
        if (res.ok) {
          showToast('New testimonial created!');
          setIsModalOpen(false);
          onRefreshData();
        } else {
          showToast('Failed to create testimonial', 'error');
        }
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await adminFetch(`/api/v1/admin/testimonials/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Testimonial deleted');
        setDeleteConfirmId(null);
        onRefreshData();
      } else {
        showToast('Failed to delete testimonial', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Client & Collaborator Testimonials ({testimonials.length})</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Endorsements, client reviews, and testimonials highlighting Antonio's design quality.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-[#00f0ff] transition-all shadow-lg hover:shadow-[#00f0ff]/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.length === 0 ? (
          <div className="col-span-2 bg-white/5 border border-white/10 rounded-3xl p-12 text-center text-neutral-500 text-sm">
            No testimonials recorded. Click "Add Testimonial" to create one.
          </div>
        ) : (
          testimonials.map((item) => (
            <div 
              key={item.id}
              className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/7 transition-colors flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Quote className="w-6 h-6 text-white/10 absolute -left-2 -top-2" />
                  <p className="text-sm text-neutral-300 italic pl-5 leading-relaxed">
                    "{item.quote}"
                  </p>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                  {item.personName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{item.personName}</h4>
                  <p className="text-xs text-neutral-400">
                    {item.personTitle} {item.company ? `• ${item.company}` : ''}
                  </p>
                </div>
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
                {editingItem.id ? 'Edit Testimonial' : 'Add Testimonial'}
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
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Client / Person Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={editingItem.personName || ''}
                  onChange={e => setEditingItem({ ...editingItem, personName: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Role / Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Head of Product"
                    value={editingItem.personTitle || ''}
                    onChange={e => setEditingItem({ ...editingItem, personTitle: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Company / Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Studio"
                    value={editingItem.company || ''}
                    onChange={e => setEditingItem({ ...editingItem, company: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Testimonial Quote *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Antonio's visual direction elevated our entire product launch..."
                  value={editingItem.quote || ''}
                  onChange={e => setEditingItem({ ...editingItem, quote: e.target.value })}
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
                  {loading ? 'Saving...' : 'Save Testimonial'}
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
            <h3 className="text-lg font-bold text-white">Delete Testimonial?</h3>
            <p className="text-xs text-neutral-400">
              Are you sure you want to remove this client testimonial?
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
