import React from 'react';
import { X, Play, GripVertical } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { Reorder } from 'framer-motion';

export default function QueueDrawer() {
  const { isQueueOpen, toggleQueue, queue, currentTrack, playTrack } = usePlayerStore();
  const [localQueue, setLocalQueue] = React.useState(queue);

  React.useEffect(() => {
    setLocalQueue(queue);
  }, [queue]);

  const handleReorder = (newOrder) => {
    setLocalQueue(newOrder);
    // Debounce or sync to global store
    const currentId = currentTrack?.id;
    const newIndex = newOrder.findIndex(t => t.id === currentId);
    usePlayerStore.setState({ queue: newOrder, queueIndex: newIndex !== -1 ? newIndex : usePlayerStore.getState().queueIndex });
  };

  if (!isQueueOpen) return null;

  return (
    <div className="fixed top-0 right-0 w-full sm:w-[360px] h-[calc(100vh-72px)] sm:h-[calc(100vh-88px)] bg-[var(--color-surface-1)] border-l border-[var(--color-border-subtle)] z-30 flex flex-col shadow-2xl transition-transform duration-300 transform translate-x-0">
      <div className="p-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--color-surface-1)] z-10">
        <h3 className="font-display font-semibold text-lg text-[var(--color-text-primary)]">Up Next</h3>
        <button onClick={toggleQueue} className="p-1 rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer text-[var(--color-text-secondary)]">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 hide-scrollbar">
        {localQueue.length === 0 ? (
          <div className="p-4 text-center text-[var(--color-text-secondary)] text-sm">
            Your queue is empty.
          </div>
        ) : (
          <Reorder.Group 
            axis="y" 
            values={localQueue} 
            onReorder={handleReorder}
            className="flex flex-col gap-1"
          >
            {localQueue.map((track) => {
              const isPlaying = currentTrack?.id === track.id;
              return (
                <Reorder.Item 
                  key={track.queueId || track.id} // use queueId for perfect animations
                  value={track}
                  className={`group relative flex items-center gap-3 p-2 rounded-md hover:bg-[rgba(255,255,255,0.05)] transition-colors ${isPlaying ? 'bg-[rgba(255,255,255,0.03)] border-l-2 border-[var(--color-accent)]' : 'border-l-2 border-transparent'}`}
                >
                  <div className="relative w-10 h-10 rounded overflow-hidden shrink-0 cursor-pointer" onDoubleClick={() => playTrack(track)}>
                    <img src={track.coverArt} alt={track.title} className="w-full h-full object-cover pointer-events-none" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); playTrack(track); }}>
                      <Play size={16} fill="currentColor" className="text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1 cursor-default pointer-events-none">
                    <span className={`text-[14px] font-medium text-ellipsis-1 ${isPlaying ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'}`}>
                      {track.title}
                    </span>
                    <span className="text-[12px] text-[var(--color-text-secondary)] text-ellipsis-1">
                      {track.artist}
                    </span>
                  </div>
                  {/* Drag Handle */}
                  <div className="cursor-grab active:cursor-grabbing p-1 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                    <GripVertical size={16} />
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}
