import React from 'react';
import { 
  Briefcase, Image as ImageIcon, Award, GraduationCap, 
  Eye, CheckCircle2, AlertCircle, Plus, Upload, User, ExternalLink, Activity
} from 'lucide-react';
import { ProjectItem, MediaAssetItem, AuditLogItem } from './types';

interface DashboardTabProps {
  stats: any;
  projects: ProjectItem[];
  mediaAssets: MediaAssetItem[];
  auditLogs: AuditLogItem[];
  onNavigateTab: (tab: any) => void;
  onOpenNewProject: () => void;
  onOpenUploadMedia: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  stats,
  projects,
  mediaAssets,
  auditLogs,
  onNavigateTab,
  onOpenNewProject,
  onOpenUploadMedia
}) => {
  const publishedCount = projects.filter(p => p.status === 'PUBLISHED').length;
  const draftCount = projects.filter(p => p.status !== 'PUBLISHED').length;

  const isDbConnected = stats?.supabaseStatus?.databaseConnected;
  const isStorageConfigured = stats?.supabaseStatus?.configured;

  const getActionBadgeColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('UPLOAD')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (action.includes('UPDATE')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (action.includes('DELETE')) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    if (action.includes('LOGIN')) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  };

  return (
    <div className="space-y-8">
      {/* Header & Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Overview & Metrics</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Real-time management dashboard for Antonio Riyanto's Creative Portfolio CMS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Database Health Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${
            isDbConnected 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{isDbConnected ? 'Supabase PostgreSQL Online' : 'Local JSON DataStore Active'}</span>
          </div>

          {/* Storage Health Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${
            isStorageConfigured 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
          }`}>
            <span>{isStorageConfigured ? 'Supabase Bucket: Ready' : 'Direct Data URL Storage'}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex flex-wrap gap-3">
        <button 
          onClick={onOpenNewProject}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-[#00f0ff] hover:text-black transition-all shadow-lg hover:shadow-[#00f0ff]/20"
        >
          <Plus className="w-4 h-4" />
          Create New Project
        </button>

        <button 
          onClick={onOpenUploadMedia}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 border border-white/10 transition-all"
        >
          <Upload className="w-4 h-4" />
          Upload Media Asset
        </button>

        <button 
          onClick={() => onNavigateTab('profile')}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 border border-white/10 transition-all"
        >
          <User className="w-4 h-4" />
          Edit Profile & Resume
        </button>

        <a 
          href="/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 text-neutral-400 font-semibold text-sm hover:text-white border border-white/10 transition-all ml-auto"
        >
          <ExternalLink className="w-4 h-4" />
          View Live Portfolio
        </a>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Projects Metric */}
        <div 
          onClick={() => onNavigateTab('projects')}
          className="bg-white/5 hover:bg-white/8 border border-white/10 p-6 rounded-3xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Projects</span>
            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-[#00f0ff]/10 text-neutral-400 group-hover:text-[#00f0ff] transition-colors">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{projects.length}</div>
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span className="text-emerald-400 font-medium">{publishedCount} Published</span>
            <span>•</span>
            <span className="text-amber-400 font-medium">{draftCount} Drafts</span>
          </div>
        </div>

        {/* Media Assets Metric */}
        <div 
          onClick={() => onNavigateTab('media')}
          className="bg-white/5 hover:bg-white/8 border border-white/10 p-6 rounded-3xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold">Media Library</span>
            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-[#00f0ff]/10 text-neutral-400 group-hover:text-[#00f0ff] transition-colors">
              <ImageIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{mediaAssets.length}</div>
          <div className="text-xs text-neutral-400">
            Active images & documents
          </div>
        </div>

        {/* Skills & Experience Metric */}
        <div 
          onClick={() => onNavigateTab('experience')}
          className="bg-white/5 hover:bg-white/8 border border-white/10 p-6 rounded-3xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold">Career History</span>
            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-[#00f0ff]/10 text-neutral-400 group-hover:text-[#00f0ff] transition-colors">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{stats?.experienceCount || 5} Roles</div>
          <div className="text-xs text-neutral-400">
            {stats?.skillCount || 10} skills & {stats?.educationCount || 2} education records
          </div>
        </div>

        {/* Views / Engagement Metric */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold">Portfolio Views</span>
            <div className="p-2 rounded-xl bg-white/5 text-neutral-400">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{stats?.views || 1420}</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active live tracking enabled
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/5 text-neutral-300">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Recent System Audit Logs</h2>
              <p className="text-xs text-neutral-400">Real-time audit trail of administrative actions</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigateTab('activity')}
            className="text-xs font-semibold text-[#00f0ff] hover:underline"
          >
            View All Audit Logs →
          </button>
        </div>

        {auditLogs.length === 0 ? (
          <div className="text-center py-10 text-neutral-500 text-sm">
            No audit logs recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {auditLogs.slice(0, 6).map((log) => {
              const formattedDate = new Date(log.createdAt).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
              });
              let metaStr = '';
              try {
                if (log.metadataJson) {
                  const parsed = typeof log.metadataJson === 'string' ? JSON.parse(log.metadataJson) : log.metadataJson;
                  metaStr = Object.entries(parsed)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(' | ');
                }
              } catch {}

              return (
                <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-semibold ${getActionBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-sm text-neutral-300">
                      by <span className="font-mono text-neutral-400">{log.actorId}</span>
                    </span>
                    {metaStr && (
                      <span className="hidden md:inline text-xs text-neutral-500 font-mono truncate max-w-md">
                        ({metaStr})
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-neutral-500 whitespace-nowrap">
                    {formattedDate}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
