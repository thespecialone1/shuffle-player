import React, { useEffect, useRef } from 'react';
import { Vibrant } from 'node-vibrant/browser';
import { usePlayerStore } from '../store/usePlayerStore';

export default function AudioPlayer() {
  const audioRef = useRef(null);
  const { 
    currentTrack, 
    isPlaying, 
    volume, 
    isMuted, 
    setDuration, 
    setProgress, 
    setDominantColor,
    nextTrack,
    pause,
    play,
    togglePlay,
    seekTo,
    setSeekTo
  } = usePlayerStore();

  useEffect(() => {
    if (seekTo !== null && audioRef.current) {
      audioRef.current.currentTime = seekTo;
      setSeekTo(null);
    }
  }, [seekTo, setSeekTo]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if focusing an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (currentTrack) {
      // Extract vibrant color
      try {
        new Vibrant(currentTrack.coverArt)
          .getPalette()
          .then((palette) => {
            const color = palette.DarkVibrant?.hex || palette.Vibrant?.hex || palette.Muted?.hex || '#1A1A1A';
            setDominantColor(color);
          })
          .catch(console.error);
      } catch(e) {
        console.error("Vibrant error", e);
      }
      
      // Update Media Session API
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title,
          artist: currentTrack.artist,
          album: currentTrack.album,
          artwork: [
            { src: currentTrack.coverArt, sizes: '512x512', type: 'image/png' }
          ]
        });

        navigator.mediaSession.setActionHandler('play', () => usePlayerStore.getState().play());
        navigator.mediaSession.setActionHandler('pause', () => usePlayerStore.getState().pause());
        navigator.mediaSession.setActionHandler('previoustrack', () => usePlayerStore.getState().prevTrack());
        navigator.mediaSession.setActionHandler('nexttrack', () => usePlayerStore.getState().nextTrack());
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.fastSeek && 'fastSeek' in audioRef.current) {
            audioRef.current.fastSeek(details.seekTime);
          } else {
            audioRef.current.currentTime = details.seekTime;
          }
          usePlayerStore.getState().setProgress(details.seekTime);
          updatePositionState();
        });
      }
    }
  }, [currentTrack]);

  const updatePositionState = () => {
    if ('mediaSession' in navigator && audioRef.current && !isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
      navigator.mediaSession.setPositionState({
        duration: audioRef.current.duration,
        playbackRate: audioRef.current.playbackRate,
        position: audioRef.current.currentTime
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      // For mock data we might have a preset duration, but let's use the real audio's duration if available
      setDuration(audioRef.current.duration);
      updatePositionState();
    }
  };

  const handleEnded = () => {
    nextTrack();
  };

  // Add event listeners for native play/pause to sync position state
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    
    audioEl.addEventListener('play', updatePositionState);
    audioEl.addEventListener('pause', updatePositionState);
    audioEl.addEventListener('seeked', updatePositionState);
    
    return () => {
      audioEl.removeEventListener('play', updatePositionState);
      audioEl.removeEventListener('pause', updatePositionState);
      audioEl.removeEventListener('seeked', updatePositionState);
    };
  }, []);

  return (
    <audio 
      ref={audioRef}
      src={currentTrack?.audioUrl}
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onEnded={handleEnded}
      preload="auto"
    />
  );
}
