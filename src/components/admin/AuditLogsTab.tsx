import React, { useState } from 'react';
import { Activity, RefreshCw, Filter, Eye, X, Shield } from 'lucide-react';
import { AuditLogItem } from './types';

interface AuditLogsTabProps {
  auditLogs: AuditLogItem[];
  onRefreshData: () => void;
}

export const AuditLogsTab: React.FC<AuditLogsTabProps> = ({
  auditLogs,
  onRefreshData
}) => {
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [selectedMeta, setSelectedMeta] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefreshData();
    setRefreshing(false);
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('UPLOAD')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (action.includes('UPDATE') || action.includes('REORDER')) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    if (action.includes('DELETE')) return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    if (action.includes('LOGIN')) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  };

  const filteredLogs = auditLogs.filter(log => {
    if (actionFilter === 'ALL') return true;
    return log.action.includes(actionFilter);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Audit Trail ({auditLogs.length})</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Immutable log of all administrative actions, authentication attempts, and data modifications.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Real-Time Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-2xl w-fit overflow-x-auto">
        {['ALL', 'LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'UPLOAD'].map(filter => (
          <button
            key={filter}
            onClick={() => setActionFilter(filter)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              actionFilter === filter
                ? 'bg-white text-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {filter === 'ALL' ? 'All Activities' : filter}
          </button>
        ))}
      </div>

      {/* Audit Log Table */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 text-neutral-500 text-sm">
            No audit logs found matching the filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/40 border-b border-white/10 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Action</th>
                  <th className="py-3.5 px-6">Actor ID</th>
                  <th className="py-3.5 px-6">Entity / Scope</th>
                  <th className="py-3.5 px-6 text-right">Metadata Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.map(log => {
                  const dateStr = new Date(log.createdAt).toLocaleString('en-US', {
                    dateStyle: 'short',
                    timeStyle: 'medium'
                  });

                  return (
                    <tr key={log.id} className="hover:bg-white/3 transition-colors">
                      <td className="py-4 px-6 text-xs font-mono text-neutral-400 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs font-mono text-neutral-300">
                        {log.actorId}
                      </td>
                      <td className="py-4 px-6 text-xs text-neutral-400">
                        {log.entityType || 'General'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {log.metadataJson ? (
                          <button
                            onClick={() => {
                              try {
                                const parsed = typeof log.metadataJson === 'string' ? JSON.parse(log.metadataJson) : log.metadataJson;
                                setSelectedMeta(parsed);
                              } catch {
                                setSelectedMeta({ raw: log.metadataJson });
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold inline-flex items-center gap-1 border border-white/10 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View JSON
                          </button>
                        ) : (
                          <span className="text-neutral-600 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* METADATA INSPECT MODAL */}
      {selectedMeta && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#00f0ff]" />
                Audit Metadata Payload
              </h3>
              <button 
                onClick={() => setSelectedMeta(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="bg-black/60 border border-white/10 rounded-2xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-80">
              {JSON.stringify(selectedMeta, null, 2)}
            </pre>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedMeta(null)}
                className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#00f0ff]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
