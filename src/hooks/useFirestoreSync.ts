import { useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { booksRef, pagesRef, saveBook, savePage } from '@/lib/firestoreService';
import { useBooksStore } from '@/stores/booksStore';
import { usePagesStore } from '@/stores/pagesStore';
import { mockBooks } from '@/data/mockBooks';
import { mockPages } from '@/data/mockPages';
import type { Book } from '@/types/book';
import type { Page } from '@/types/page';

export function useFirestoreSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      useBooksStore.setState({ uid: null, books: [] });
      usePagesStore.setState({ uid: null, pages: [] });
      return;
    }

    const uid = user.uid;
    useBooksStore.setState({ uid });
    usePagesStore.setState({ uid });

    let seeded = false;

    const unsubBooks = onSnapshot(booksRef(uid), (snap) => {
      if (snap.empty && !seeded) {
        // New user — seed mock data into Firestore
        seeded = true;
        mockBooks.forEach((book) => saveBook(uid, book));
        mockPages.forEach((page) => savePage(uid, page));
      } else {
        const books = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Book);
        // One-time title migration for renamed mock book
        books.forEach((b) => {
          if (b.id === 'mock-bentota-2026' && b.title === 'Bentota Beach 2026') {
            saveBook(uid, { ...b, title: 'Vacations 2026' });
          }
        });
        // One-time migration: add stickers + clipStyle to default mock books that don't have them yet
        const STALE_STICKERS = ['/stickers/9.png', '/stickers/6.png', '/stickers/13.png'];
        const STALE_SIZES: Record<string, number> = { '/stickers/15.png': 36, '/stickers/16.png': 42 };
        const mockDefaults: Record<string, Pick<Book, 'clipStyle' | 'stickers'>> = {
          'mock-bentota-2026': {
            clipStyle: '3',
            stickers: [
              { id: 's1', src: '/stickers/15.png', x: 53, y: 5,  width: 22, rotation: -5 },
              { id: 's2', src: '/stickers/16.png', x: 12, y: 42, width: 26, rotation: 4  },
            ],
          },
          'mock-family-sundays': {
            clipStyle: '1',
            stickers: [
              { id: 's1', src: '/stickers/_ (2) 1.png', x: 50, y: 5,  width: 32, rotation: 6  },
              { id: 's2', src: '/stickers/4.png',        x: 10, y: 48, width: 24, rotation: -9 },
            ],
          },
          'mock-tokyo-winter': {
            clipStyle: '2',
            stickers: [
              { id: 's1', src: '/stickers/2.png', x: 48, y: 5,  width: 34, rotation: -6 },
              { id: 's2', src: '/stickers/8.png', x: 10, y: 45, width: 26, rotation: 10 },
            ],
          },
          'mock-weekend-hikes': {
            clipStyle: 'frame5',
            stickers: [
              { id: 's1', src: '/stickers/7.png',  x: 52, y: 6,  width: 28, rotation: 7  },
              { id: 's2', src: '/stickers/17.png', x: 12, y: 47, width: 24, rotation: -8 },
            ],
          },
        };
        books.forEach((b) => {
          const defaults = mockDefaults[b.id];
          const hasStaleSticker = b.stickers?.some(
            (s) => STALE_STICKERS.includes(s.src) || (STALE_SIZES[s.src] && s.width >= STALE_SIZES[s.src])
          );
          if (defaults && (!b.stickers?.length || hasStaleSticker)) {
            saveBook(uid, { ...b, ...defaults });
          }
        });
        useBooksStore.setState({ books });
      }
    });

    const unsubPages = onSnapshot(pagesRef(uid), (snap) => {
      const pages = snap.docs.map((d) => {
        const page = { ...d.data(), id: d.id } as Page;

        // Strip stale blob URLs — they're session-only and break after reload
        let needsWrite = false;
        const sanitizedStamps = page.stamps.map((s) => {
          const cleanClips = (s.videoClips ?? []).filter((c) => !c.startsWith('blob:'));
          const mediaUrlIsBlob = !!s.mediaUrl?.startsWith('blob:');
          const hadBlobs = mediaUrlIsBlob || cleanClips.length !== (s.videoClips ?? []).length;

          if (!hadBlobs) return s; // nothing to fix

          needsWrite = true;
          // If mediaUrl was a blob but valid Storage clips exist, recover from them
          const mediaUrl = mediaUrlIsBlob
            ? (cleanClips[0] ?? null)
            : (s.mediaUrl ?? null);
          const mediaType = mediaUrl
            ? (cleanClips.length > 0 ? 'video' : s.mediaType)
            : null;

          return { ...s, mediaUrl, mediaType: mediaType ?? null, videoClips: cleanClips };
        });

        // Write cleaned page back to Firestore so blob URLs don't persist
        if (needsWrite) {
          savePage(uid, { ...page, stamps: sanitizedStamps });
        }

        return { ...page, stamps: sanitizedStamps };
      });
      usePagesStore.setState({ pages });
    });

    return () => {
      unsubBooks();
      unsubPages();
    };
  }, [user?.uid]);
}
