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
