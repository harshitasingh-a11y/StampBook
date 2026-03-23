# Asset Preloading & Caching System

## Overview

This implementation provides seamless book browsing by preloading all book assets (images and videos) when the user enters the website. All assets are cached in IndexedDB for instant offline access, eliminating lag when navigating between pages.

## How It Works

### 1. **Asset Cache Service** (`src/lib/assetCache.ts`)
- Uses IndexedDB to store downloaded images and videos
- Persists across browser sessions (offline support)
- Automatically downloads and caches assets on demand
- Provides utility functions for cache management

**Key Functions:**
- `cacheAsset(url)` - Download and cache an asset
- `getAssetUrl(url)` - Get cached URL or original URL if not cached
- `clearCache()` - Clear all cached assets
- `getCacheStats()` - Check cache size and count

### 2. **Asset Preloader Hook** (`src/hooks/useAssetPreloader.ts`)
- Runs automatically when user logs in and Firestore data syncs
- Extracts all media URLs from all pages and books
- Preloads assets in batches with delays to avoid network saturation
- Uses `requestIdleCallback` to avoid blocking the UI
- Non-blocking: preloading happens in the background

**How it preloads:**
- Batches: Downloads 3 assets in parallel
- Delays: 200ms between batches to prevent network congestion
- Priority: Uses browser idle time (low priority)

### 3. **Asset URL Hook** (`src/hooks/useAssetUrl.ts`)
- `useAssetUrl(url)` - Get optimized URL for a single asset
- `useAssetUrls(urls)` - Get optimized URLs for multiple assets
- Automatically checks IndexedDB and returns cached blob URL if available
- Falls back to original URL if not cached

### 4. **Component Integration** (`src/components/PageFlipContainer/PageFlipContainer.tsx`)
- **DitheredImage**: Uses `useAssetUrl` to load cached image URLs
- **VideoPlayer**: Uses `useAssetUrls` to load cached video URLs
- **Fallback Images**: Use cached URLs for instant display

## Performance Impact

### Before
- Images load lazily as user navigates
- Network requests on each page flip
- Visible delay when viewing images

### After
- All assets preloaded on login
- Instant display from IndexedDB cache
- Offline support included
- Zero network latency during browsing

## Storage Capacity

- IndexedDB supports 50MB+ per domain (varies by browser)
- Local development typically allows 50MB+
- Browser may ask for permission for larger amounts
- Automatic cleanup of cache can be added if needed

## Offline Support

Once assets are cached:
1. User can browse books even without internet
2. Images/videos load instantly from IndexedDB
3. New media uploads still require internet (as expected)

## Browser Compatibility

- IndexedDB: Chrome, Firefox, Safari, Edge (all modern browsers)
- requestIdleCallback: Chrome, Firefox, Edge (fallback to setTimeout in Safari)

## Future Enhancements

- Add cache invalidation (TTL for cached assets)
- Add manual cache clearing UI
- Add cache size quota management
- Add progress indicator for preloading
- Add smart preloading (prioritize visible book)

## Testing Cache

Check cache stats in browser console:
```javascript
import { getCacheStats } from '@/lib/assetCache';
getCacheStats().then(stats => console.log('Cache:', stats));
```

Clear cache:
```javascript
import { clearCache } from '@/lib/assetCache';
clearCache().then(() => console.log('Cache cleared'));
```
