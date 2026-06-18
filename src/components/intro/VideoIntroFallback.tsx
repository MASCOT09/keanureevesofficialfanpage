"use client";

import { useEffect, useRef, useState } from "react";

interface VideoIntroFallbackProps {
  videoUrl: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function VideoIntroFallback({
  videoUrl,
  onComplete,
  onSkip,
}: VideoIntroFallbackProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [needsPlay, setNeedsPlay] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => setNeedsPlay(true));

    const handleEnded = () => onComplete();
    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, [onComplete, videoUrl]);

  const handlePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      await video.play();
      setNeedsPlay(false);
    } catch {
      setNeedsPlay(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F0F10]">
      <video
        ref={videoRef}
        src={videoUrl}
        className="h-full w-full object-cover opacity-90"
        playsInline
        muted
        autoPlay
        controls={needsPlay}
      />

      {needsPlay && (
        <button
          type="button"
          onClick={handlePlay}
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/50"
          aria-label="Play intro video"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full border border-accent/50 bg-accent/20 text-accent">
            <svg className="ml-1 h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="text-sm uppercase tracking-[0.3em] text-foreground">Tap to play</span>
        </button>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0F0F10] via-transparent to-[#0F0F10]/40" />
      <button
        onClick={onSkip}
        className="absolute bottom-10 right-10 z-10 rounded-full border border-border bg-card/80 px-8 py-3 text-sm tracking-wide text-foreground backdrop-blur-md transition-all duration-300 hover:border-accent hover:text-accent"
      >
        Skip
      </button>
    </div>
  );
}
