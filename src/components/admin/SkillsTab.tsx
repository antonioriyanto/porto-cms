import React, { useState } from 'react';
import { Plus, Edit, Trash2, Award, X, Check, AlertCircle, Sparkles } from 'lucide-react';
import { SkillItem } from './types';

interface SkillsTabProps {
  skills: SkillItem[];
  onRefreshData: () => void;
}

export const SkillsTab: React.FC<SkillsTabProps> = ({
  skills,
  onRefreshData
}) => {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'HARD' | 'SOFT' | 'TOOL'>('ALL');
  const [editingSkill, setEditingSkill] = useState<Partial<SkillItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingSkill({
      name: '',
      category: activeCategory === 'ALL' ? 'HARD' : activeCategory,
      proficiency: 90,
      status: 'PUBLISHED',
      sortOrder: skills.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (skill: SkillItem) => {
    setEditingSkill({ ...skill });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill?.name) return;
    setLoading(true);

    try {
      if (editingSkill.id) {
        const res = await fetch(`/api/v1/admin/skills/${editingSkill.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingSkill)
        });
        if (res.ok) {
          showToast('Skill updated successfully!');
          setIsModalOpen(false);
          onRefreshData();
        } else {
          showToast('Failed to update skill', 'error');
        }
      } else {
        const res = await fetch('/api/v1/admin/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingSkill)
        });
        if (res.ok) {
          showToast('New skill added!');
          setIsModalOpen(false);
          onRefreshData();
        } else {
          showToast('Failed to create skill', 'error');
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
      const res = await fetch(`/api/v1/admin/skills/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Skill deleted');
        setDeleteConfirmId(null);
        onRefreshData();
      } else {
        showToast('Failed to delete skill', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  const filteredSkills = skills.filter(s => {
    if (activeCategory === 'ALL') return true;
    return s.category === activeCategory;
  });

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
          <h1 className="text-2xl font-bold text-white tracking-tight">Skills & Competency Matrix ({skills.length})</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Design tool mastery, creative methodologies, and leadership capabilities.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-[#00f0ff] transition-all shadow-lg hover:shadow-[#00f0ff]/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Skill
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-2xl w-fit">
        {(['ALL', 'HARD', 'SOFT', 'TOOL'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeCategory === cat
                ? 'bg-white text-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {cat === 'ALL' ? 'All Competencies' : cat === 'HARD' ? 'Hard Skills' : cat === 'SOFT' ? 'Soft Skills' : 'Design Tools'}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSkills.length === 0 ? (
          <div className="col-span-2 bg-white/5 border border-white/10 rounded-3xl p-12 text-center text-neutral-500 text-sm">
            No skills found in this category. Click "Add Skill" to create one.
          </div>
        ) : (
          filteredSkills.map((skill) => (
            <div 
              key={skill.id}
              className="bg-white/5 border border-white/10 rounded-3xl p-5 hover:bg-white/7 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white/5 text-[#00f0ff] border border-white/10">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{skill.name}</h3>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">
                      {skill.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-neutral-300">
                    {skill.proficiency || 85}%
                  </span>
                  <button
                    onClick={() => handleOpenEdit(skill)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(skill.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="bg-[#00f0ff] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, skill.proficiency || 85))}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && editingSkill && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">
                {editingSkill.id ? 'Edit Skill' : 'Add Skill to Matrix'}
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
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Skill / Tool Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Figma, Adobe Photoshop, Brand Strategy"
                  value={editingSkill.name || ''}
                  onChange={e => setEditingSkill({ ...editingSkill, name: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Category</label>
                <select
                  value={editingSkill.category || 'HARD'}
                  onChange={e => setEditingSkill({ ...editingSkill, category: e.target.value as any })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                >
                  <option value="HARD">Hard Skill (Branding, Typography, UI/UX)</option>
                  <option value="SOFT">Soft Skill (Leadership, Creative Direction)</option>
                  <option value="TOOL">Design Tool (Figma, Illustrator, After Effects)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs uppercase tracking-wider font-semibold text-neutral-400">Proficiency Level</label>
                  <span className="text-xs font-mono font-bold text-[#00f0ff]">{editingSkill.proficiency || 85}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={editingSkill.proficiency || 85}
                  onChange={e => setEditingSkill({ ...editingSkill, proficiency: parseInt(e.target.value, 10) })}
                  className="w-full accent-[#00f0ff] cursor-pointer"
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
                  {loading ? 'Saving...' : 'Save Skill'}
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
            <h3 className="text-lg font-bold text-white">Delete Skill?</h3>
            <p className="text-xs text-neutral-400">
              Are you sure you want to remove this skill from the competency matrix?
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
