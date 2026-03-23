import { useEffect } from 'react';
import { cacheAsset } from '@/lib/assetCache';
import { usePagesStore } from '@/stores/pagesStore';

/**
 * Preloads all book assets (images/videos) in the background.
 * Runs after Firestore sync completes and doesn't block the UI.
 */
export function useAssetPreloader() {
  const pages = usePagesStore((s) => s.pages);

  useEffect(() => {
    if (pages.length === 0) return;

    // Extract all media URLs from all pages
    const urls = new Set<string>();
    pages.forEach((page) => {
      page.stamps.forEach((stamp) => {
        if (stamp.mediaUrl) urls.add(stamp.mediaUrl);
        if (stamp.videoClips) {
          stamp.videoClips.forEach((clip) => urls.add(clip));
        }
      });
    });

    if (urls.size === 0) return;

    // Preload assets with low priority (don't block UI)
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => preloadAssets(Array.from(urls)));
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => preloadAssets(Array.from(urls)), 1000);
    }
  }, [pages]);
}

/**
 * Preload multiple assets sequentially with delays to avoid network saturation.
 */
async function preloadAssets(urls: string[]) {
  const BATCH_SIZE = 3; // Preload 3 assets in parallel
  const DELAY_BETWEEN_BATCHES = 200; // ms

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map((url) => cacheAsset(url).catch(() => {})));

    // Add delay between batches to avoid network congestion
    if (i + BATCH_SIZE < urls.length) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }
}
