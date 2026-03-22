let audioCache: HTMLAudioElement | null = null;

export function playPageFlip() {
  try {
    if (!audioCache) {
      audioCache = new Audio('/sounds/page-flip.wav');
      audioCache.volume = 0.3;
    }
    audioCache.currentTime = 0;
    audioCache.play().catch(() => {
      // Silently fail — browser may block autoplay
    });
  } catch {
    // Audio not supported
  }
}
