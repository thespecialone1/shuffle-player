import React, { useState, useEffect } from 'react';
import { fetchSlskdDownloads } from '../lib/api';
import { DownloadCloud, CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';

export default function Downloads() {
  const [downloads, setDownloads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const pollDownloads = async () => {
    try {
      const data = await fetchSlskdDownloads();
      
      // Flatten the hierarchical slskd response
      const flatList = [];
      for (const user of data) {
        for (const dir of user.directories) {
          for (const file of dir.files) {
            flatList.push({
              username: user.username,
              directory: dir.directory,
              id: file.id,
              filename: file.filename.split('\\').pop().split('/').pop(),
              size: file.size,
              state: file.state,
              percentComplete: file.percentComplete,
              averageSpeed: file.averageSpeed, // bytes/s
              bytesTransferred: file.bytesTransferred
            });
          }
        }
      }

      // Sort: Active/Downloading first, then Queued, then Completed
      flatList.sort((a, b) => {
        const getRank = (state) => {
          if (state.includes('Downloading')) return 1;
          if (state.includes('Queued')) return 2;
          if (state.includes('Completed')) return 3;
          return 4;
        };
        return getRank(a.state) - getRank(b.state);
      });

      setDownloads(flatList);
    } catch (error) {
      console.error("Failed to fetch downloads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.documentElement.classList.add('page-active');
    
    pollDownloads();
    const interval = setInterval(pollDownloads, 2000); // Fast polling for UI responsiveness
    
    return () => {
      document.documentElement.classList.remove('page-active');
      clearInterval(interval);
    };
  }, []);

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStatusIcon = (state) => {
    if (state.includes('Completed, Succeeded')) return <CheckCircle size={20} className="text-green-500" />;
    if (state.includes('Completed, Errored')) return <AlertCircle size={20} className="text-red-500" />;
    if (state.includes('Queued')) return <Clock size={20} className="text-yellow-500" />;
    return <RefreshCw size={20} className="text-[var(--color-accent)] animate-spin" />;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 px-4 sm:px-8 max-w-4xl mx-auto">
      <div className="mb-10 pt-8">
        <h1 className="text-4xl font-display font-bold text-[var(--color-text-primary)] tracking-tight">Downloads</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">Track the status of your Soulseek file transfers.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
          <RefreshCw size={20} className="animate-spin" />
          <span>Fetching active transfers...</span>
        </div>
      ) : downloads.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-[var(--color-border-subtle)] rounded-xl bg-[var(--color-surface-1)]/30">
          <DownloadCloud size={48} className="mx-auto text-[var(--color-text-secondary)] opacity-50 mb-4" />
          <h3 className="text-lg font-medium text-[var(--color-text-primary)]">No recent downloads</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Files you download from Soulseek will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {downloads.map((file) => (
            <div key={file.id} className="bg-[var(--color-surface-1)] p-4 rounded-xl shadow-sm border border-[var(--color-border-subtle)]/50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="shrink-0 mt-1">
                    {getStatusIcon(file.state)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-[var(--color-text-primary)] truncate" title={file.filename}>
                      {file.filename}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--color-text-secondary)] mt-1">
                      <span>User: <span className="text-[var(--color-text-primary)]">{file.username}</span></span>
                      <span>•</span>
                      <span>{formatSize(file.size)}</span>
                      {file.state.includes('Downloading') && (
                        <>
                          <span>•</span>
                          <span className="text-[var(--color-accent)]">{formatSize(file.averageSpeed)}/s</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right shrink-0">
                  <span className={`text-[13px] font-medium px-2.5 py-1 rounded-full border ${
                    file.state.includes('Completed, Succeeded') ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    file.state.includes('Completed, Errored') ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    file.state.includes('Queued') ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/20'
                  }`}>
                    {file.state}
                  </span>
                </div>
              </div>

              {/* Progress bar for active downloads */}
              {!file.state.includes('Completed') && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--color-accent)] transition-all duration-300"
                      style={{ width: `${file.percentComplete || 0}%` }}
                    />
                  </div>
                  <span className="text-[12px] font-medium text-[var(--color-text-secondary)] w-8 text-right">
                    {file.percentComplete || 0}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
