"use client";

import { useCallback } from "react";
import { VideoIntroFallback } from "./VideoIntroFallback";

interface CelebrityIntroProps {
  videoUrl: string;
  onComplete: () => void;
}

export function CelebrityIntro({ videoUrl, onComplete }: CelebrityIntroProps) {
  const handleSkip = useCallback(() => {
    sessionStorage.setItem("intro_seen", "true");
    onComplete();
  }, [onComplete]);

  return (
    <VideoIntroFallback videoUrl={videoUrl} onComplete={handleSkip} onSkip={handleSkip} />
  );
}
