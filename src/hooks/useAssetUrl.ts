import { useState, useEffect } from 'react';
import { getAssetUrl } from '@/lib/assetCache';

/**
 * Hook to get the optimized URL for an asset (cached blob URL if available, original URL otherwise).
 * Automatically uses IndexedDB cache if the asset has been preloaded.
 */
export function useAssetUrl(originalUrl: string | null): string | null {
  const [assetUrl, setAssetUrl] = useState<string | null>(originalUrl);

  useEffect(() => {
    if (!originalUrl) {
      setAssetUrl(null);
      return;
    }

    let isMounted = true;

    getAssetUrl(originalUrl).then((url) => {
      if (isMounted) {
        setAssetUrl(url);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [originalUrl]);

  return assetUrl;
}

/**
 * Hook to get optimized URLs for multiple assets.
 */
export function useAssetUrls(originalUrls: string[]): (string | null)[] {
  const [assetUrls, setAssetUrls] = useState<(string | null)[]>(originalUrls);

  useEffect(() => {
    if (originalUrls.length === 0) {
      setAssetUrls([]);
      return;
    }

    let isMounted = true;

    Promise.all(originalUrls.map((url) => getAssetUrl(url))).then((urls) => {
      if (isMounted) {
        setAssetUrls(urls);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [originalUrls.join(',')]); // Use join to avoid dependency array issues

  return assetUrls;
}
