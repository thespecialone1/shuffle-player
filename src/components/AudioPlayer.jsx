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
    play
  } = usePlayerStore();

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
      }
    }
  }, [currentTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      // For mock data we might have a preset duration, but let's use the real audio's duration if available
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    nextTrack();
  };

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
