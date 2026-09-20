import React, { useState, useRef } from 'react';
import { 
  Upload, Image as ImageIcon, Trash2, Copy, Check, 
  ExternalLink, FileText, AlertCircle, X 
} from 'lucide-react';
import { MediaAssetItem } from './types';

interface MediaTabProps {
  mediaAssets: MediaAssetItem[];
  onRefreshData: () => void;
}

export const MediaTab: React.FC<MediaTabProps> = ({
  mediaAssets,
  onRefreshData
}) => {
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<MediaAssetItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUploadFile = async (file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      showToast('File exceeds the 4MB limit (Vercel payload limit)', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/v1/admin/media/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        showToast('Media asset uploaded successfully!');
        onRefreshData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to upload media', 'error');
      }
    } catch (err) {
      showToast('Network error while uploading asset', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUploadFile(file);
  };

  const handleCopyUrl = (asset: MediaAssetItem) => {
    navigator.clipboard.writeText(asset.publicUrl);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/admin/media/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Media asset deleted');
        setDeleteConfirmId(null);
        if (selectedAsset?.id === id) setSelectedAsset(null);
        onRefreshData();
      } else {
        showToast('Failed to delete asset', 'error');
      }
    } catch (err) {
      showToast('Network error while deleting media', 'error');
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
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
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Media & Asset Library ({mediaAssets.length})</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Store portfolio imagery, branding artwork, and project deliverables with automated CDN/DataURL delivery.
        </p>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
          isDragOver 
            ? 'border-[#00f0ff] bg-[#00f0ff]/5' 
            : 'border-white/10 hover:border-white/20 bg-white/5'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg,image/png,image/webp,image/svg+xml,application/pdf"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleUploadFile(file);
          }}
        />
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-[#00f0ff]">
          <Upload className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-white text-base">
          {uploading ? 'Uploading media asset...' : 'Click to Upload or Drag & Drop'}
        </h3>
        <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
          Supports PNG, JPG, WEBP, SVG, and PDF documents up to 4MB in size.
        </p>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {mediaAssets.length === 0 ? (
          <div className="col-span-full bg-white/5 border border-white/10 rounded-3xl p-12 text-center text-neutral-500 text-sm">
            No media assets uploaded yet. Drop a file above to upload.
          </div>
        ) : (
          mediaAssets.map((asset) => {
            const isImage = asset.mimeType?.startsWith('image/');
            const isCopied = copiedId === asset.id;

            return (
              <div 
                key={asset.id}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all"
              >
                {/* Preview Thumbnail */}
                <div 
                  onClick={() => setSelectedAsset(asset)}
                  className="aspect-square bg-black/40 relative cursor-pointer overflow-hidden flex items-center justify-center"
                >
                  {isImage ? (
                    <img 
                      src={asset.publicUrl} 
                      alt={asset.originalName || asset.fileName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <FileText className="w-10 h-10 text-neutral-500" />
                  )}

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="text-[11px] font-semibold text-white bg-white/20 px-2 py-1 rounded-lg backdrop-blur-md">
                      Inspect
                    </span>
                  </div>
                </div>

                {/* Info & Actions */}
                <div className="p-3 bg-white/3 border-t border-white/5 space-y-2">
                  <div className="truncate text-xs font-semibold text-white" title={asset.originalName || asset.fileName}>
                    {asset.originalName || asset.fileName}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400">
                    <span>{formatBytes(asset.sizeBytes)}</span>
                    <span className="uppercase">{asset.mimeType?.split('/')[1] || 'FILE'}</span>
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1">
                    <button
                      onClick={() => handleCopyUrl(asset)}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors ${
                        isCopied 
                          ? 'bg-emerald-500 text-black' 
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Copied' : 'Copy URL'}</span>
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(asset.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* INSPECT MODAL */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-base font-bold text-white truncate max-w-xs">
                {selectedAsset.originalName || selectedAsset.fileName}
              </h2>
              <button 
                onClick={() => setSelectedAsset(null)}
                className="p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-72 rounded-2xl overflow-hidden bg-black/60 flex items-center justify-center">
              {selectedAsset.mimeType?.startsWith('image/') ? (
                <img 
                  src={selectedAsset.publicUrl} 
                  alt={selectedAsset.fileName}
                  className="max-h-72 object-contain"
                />
              ) : (
                <div className="py-16 text-center text-neutral-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <span>Document Preview Not Available</span>
                </div>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>File Size:</span>
                <span className="text-white font-mono">{formatBytes(selectedAsset.sizeBytes)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>MIME Type:</span>
                <span className="text-white font-mono">{selectedAsset.mimeType}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Public URL:</span>
                <a 
                  href={selectedAsset.publicUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#00f0ff] hover:underline flex items-center gap-1"
                >
                  Open in New Tab <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => handleCopyUrl(selectedAsset)}
                className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#00f0ff]"
              >
                {copiedId === selectedAsset.id ? 'Copied to Clipboard!' : 'Copy Asset URL'}
              </button>
            </div>
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
            <h3 className="text-lg font-bold text-white">Delete Media Asset?</h3>
            <p className="text-xs text-neutral-400">
              Are you sure you want to delete this media asset permanently?
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
