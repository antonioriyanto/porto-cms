import React, { useState } from 'react';
import { 
  Plus, Edit, Trash2, ArrowUp, ArrowDown, Search, Check, 
  AlertCircle, Eye, EyeOff, X, Briefcase, ExternalLink, Image as ImageIcon
} from 'lucide-react';
import { ProjectItem } from './types';
import { adminFetch } from '../../services/apiClient';

interface ProjectsTabProps {
  projects: ProjectItem[];
  onRefreshData: () => void;
  openNewProjectTrigger?: boolean;
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({
  projects,
  onRefreshData
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [editingProject, setEditingProject] = useState<Partial<ProjectItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingProject({
      title: '',
      slug: '',
      client: '',
      category: 'Branding & Identity',
      role: 'Creative Designer',
      year: new Date().getFullYear().toString(),
      shortDescription: '',
      challenge: '',
      solution: '',
      deliverables: 'Brand Guidelines, Social Media Assets, Packaging',
      coverImageUrl: '',
      status: 'PUBLISHED',
      featured: true,
      sortOrder: projects.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: ProjectItem) => {
    setEditingProject({
      ...project,
      title: project.title || project.projectTitle || '',
      client: project.client || project.clientName || '',
      coverImageUrl: project.coverImageUrl || project.coverImage || '',
      deliverables: Array.isArray(project.deliverables) 
        ? project.deliverables.join(', ') 
        : (project.deliverables || '')
    });
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    if (!editingProject) return;
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setEditingProject({
      ...editingProject,
      title: val,
      // Auto-generate slug if new project or empty slug
      slug: !editingProject.id ? generatedSlug : (editingProject.slug || generatedSlug)
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.title) return;
    setLoading(true);

    const deliverablesArray = typeof editingProject.deliverables === 'string'
      ? editingProject.deliverables.split(',').map((d: string) => d.trim()).filter(Boolean)
      : editingProject.deliverables;

    const payload = {
      ...editingProject,
      title: editingProject.title,
      projectTitle: editingProject.title,
      client: editingProject.client,
      clientName: editingProject.client,
      coverImageUrl: editingProject.coverImageUrl,
      deliverables: deliverablesArray
    };

    try {
      if (editingProject.id) {
        // Update
        const res = await adminFetch(`/api/v1/admin/projects/${editingProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast('Project updated successfully!');
          setIsModalOpen(false);
          onRefreshData();
        } else {
          const err = await res.json();
          showToast(err.error || 'Failed to update project', 'error');
        }
      } else {
        // Create
        const res = await adminFetch('/api/v1/admin/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast('New project published successfully!');
          setIsModalOpen(false);
          onRefreshData();
        } else {
          const err = await res.json();
          showToast(err.error || 'Failed to create project', 'error');
        }
      }
    } catch (err) {
      showToast('Network error while saving project', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await adminFetch(`/api/v1/admin/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Project deleted successfully');
        setDeleteConfirmId(null);
        onRefreshData();
      } else {
        showToast('Failed to delete project', 'error');
      }
    } catch (err) {
      showToast('Network error while deleting project', 'error');
    }
  };

  const handleReorder = async (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const reordered = [...projects];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Reassign sort orders
    const orderPayload = reordered.map((p, i) => ({ id: p.id, sortOrder: i + 1 }));

    try {
      const res = await adminFetch('/api/v1/admin/projects/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: orderPayload })
      });
      if (res.ok) {
        onRefreshData();
      }
    } catch (err) {
      console.error('Reorder error:', err);
    }
  };

  const filteredProjects = projects.filter(p => {
    const title = (p.title || p.projectTitle || '').toLowerCase();
    const client = (p.client || p.clientName || '').toLowerCase();
    const category = (p.category || '').toLowerCase();
    const matchesSearch = title.includes(searchQuery.toLowerCase()) || 
                          client.includes(searchQuery.toLowerCase()) || 
                          category.includes(searchQuery.toLowerCase());
    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'PUBLISHED') return matchesSearch && p.status === 'PUBLISHED';
    if (statusFilter === 'DRAFT') return matchesSearch && p.status !== 'PUBLISHED';
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {statusMsg && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border text-sm font-medium ${
          statusMsg.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {statusMsg.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Portfolio Projects ({projects.length})</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage showcase case studies, client work, categories, and visual deliverables.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-[#00f0ff] transition-all shadow-lg hover:shadow-[#00f0ff]/20 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Project
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white/5 border border-white/10 p-3 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by title, client, category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab
                  ? 'bg-white text-black'
                  : 'text-neutral-400 hover:text-white bg-white/5'
              }`}
            >
              {tab === 'ALL' ? 'All Projects' : tab === 'PUBLISHED' ? 'Published' : 'Drafts'}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table / List */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 text-neutral-500 text-sm">
            No projects match the selected filter.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredProjects.map((project, index) => {
              const title = project.title || project.projectTitle || 'Untitled Project';
              const client = project.client || project.clientName || 'Private Client';
              const coverImg = project.coverImageUrl || project.coverImage;

              return (
                <div 
                  key={project.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/3 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Sort controls */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleReorder(index, 'UP')}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleReorder(index, 'DOWN')}
                        disabled={index === projects.length - 1}
                        className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Thumbnail */}
                    <div className="w-16 h-12 rounded-xl bg-neutral-900 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {coverImg ? (
                        <img 
                          src={coverImg} 
                          alt={title} 
                          className="w-full h-full object-cover"
                          onError={(e: any) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-neutral-600" />
                      )}
                    </div>

                    {/* Meta */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base">{title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                          project.status === 'PUBLISHED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {project.status || 'PUBLISHED'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {client} • <span className="text-neutral-300">{project.category || 'General Design'}</span> • {project.year || '2021'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => handleOpenEdit(project)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(project.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-rose-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">
                {editingProject.id ? 'Edit Portfolio Project' : 'Create New Portfolio Project'}
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
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={editingProject.title || ''}
                    onChange={e => handleTitleChange(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={editingProject.slug || ''}
                    onChange={e => setEditingProject({ ...editingProject, slug: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Client Name</label>
                  <input
                    type="text"
                    value={editingProject.client || ''}
                    onChange={e => setEditingProject({ ...editingProject, client: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Category</label>
                  <input
                    type="text"
                    value={editingProject.category || ''}
                    onChange={e => setEditingProject({ ...editingProject, category: e.target.value })}
                    placeholder="e.g. Branding & Identity"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Year</label>
                  <input
                    type="text"
                    value={editingProject.year || ''}
                    onChange={e => setEditingProject({ ...editingProject, year: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Cover Image URL</label>
                <input
                  type="text"
                  placeholder="https://... or upload in Media Library"
                  value={editingProject.coverImageUrl || ''}
                  onChange={e => setEditingProject({ ...editingProject, coverImageUrl: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Short Overview</label>
                <textarea
                  rows={2}
                  value={editingProject.shortDescription || ''}
                  onChange={e => setEditingProject({ ...editingProject, shortDescription: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">The Challenge</label>
                  <textarea
                    rows={3}
                    value={editingProject.challenge || ''}
                    onChange={e => setEditingProject({ ...editingProject, challenge: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">The Solution</label>
                  <textarea
                    rows={3}
                    value={editingProject.solution || ''}
                    onChange={e => setEditingProject({ ...editingProject, solution: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Deliverables (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Brand Identity, Packaging Design, 3D Render"
                  value={typeof editingProject.deliverables === 'string' ? editingProject.deliverables : (editingProject.deliverables || []).join(', ')}
                  onChange={e => setEditingProject({ ...editingProject, deliverables: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">Publish Status</label>
                  <select
                    value={editingProject.status || 'PUBLISHED'}
                    onChange={e => setEditingProject({ ...editingProject, status: e.target.value as any })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="featCheck"
                    checked={Boolean(editingProject.featured)}
                    onChange={e => setEditingProject({ ...editingProject, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-[#00f0ff] focus:ring-0 bg-black/60 border-white/20"
                  />
                  <label htmlFor="featCheck" className="text-xs font-semibold text-neutral-300">Feature on Home Page</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-[#00f0ff] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Project'}
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
            <h3 className="text-lg font-bold text-white">Delete Project?</h3>
            <p className="text-xs text-neutral-400">
              This action cannot be undone. Are you sure you want to permanently delete this project?
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
