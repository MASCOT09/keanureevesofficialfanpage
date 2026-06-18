"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export function HeroVideoPortrait({
  videoUrl,
  poster,
  alt,
}: {
  videoUrl: string;
  poster: string;
  alt: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [showPoster, setShowPoster] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [pendingPlay, setPendingPlay] = useState(false);

  useEffect(() => {
    if (!videoReady || !pendingPlay) return;
    const video = videoRef.current;
    if (!video) return;

    video
      .play()
      .then(() => {
        setPlaying(true);
        setShowPoster(false);
        setPendingPlay(false);
      })
      .catch(() => setPendingPlay(false));
  }, [videoReady, pendingPlay]);

  const handlePlay = async () => {
    if (!videoReady) {
      setPendingPlay(true);
      setVideoReady(true);
      return;
    }

    const video = videoRef.current;
    if (!video) return;
    try {
      await video.play();
      setPlaying(true);
      setShowPoster(false);
    } catch {
      // User can still use native controls
    }
  };

  return (
    <div className="glass group relative aspect-[4/5] overflow-hidden rounded-[20px] shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
      {videoReady && (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={poster}
          className="h-full w-full object-cover"
          controls
          playsInline
          preload="none"
          onPlay={() => {
            setPlaying(true);
            setShowPoster(false);
          }}
          onPause={() => setPlaying(false)}
          onEnded={() => setShowPoster(true)}
        />
      )}

      {showPoster && !playing && (
        <>
          <Image
            src={poster}
            alt={alt}
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 90vw, 45vw"
          />
          <button
            type="button"
            onClick={handlePlay}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/40 transition-colors hover:bg-black/50"
            aria-label="Play intro video"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/50 bg-accent/20 text-accent backdrop-blur-sm transition-transform group-hover:scale-105">
              <svg className="ml-1 h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="text-sm uppercase tracking-[0.25em] text-foreground">Watch intro</span>
          </button>
        </>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0F0F10]/40 via-transparent to-transparent" />
    </div>
  );
}
