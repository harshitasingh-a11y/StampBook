import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Book } from '@/types/book';
import type { Page } from '@/types/page';

export const booksRef = (uid: string) =>
  collection(db, 'users', uid, 'books');

export const pagesRef = (uid: string) =>
  collection(db, 'users', uid, 'pages');

// Firestore rejects `undefined` values — JSON round-trip strips them safely
function clean<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

export const saveBook = (uid: string, book: Book) =>
  setDoc(doc(db, 'users', uid, 'books', book.id), clean(book));

export const deleteBook = (uid: string, bookId: string) =>
  deleteDoc(doc(db, 'users', uid, 'books', bookId));

export const savePage = (uid: string, page: Page) =>
  setDoc(doc(db, 'users', uid, 'pages', page.id), clean(page));

export const deletePage = (uid: string, pageId: string) =>
  deleteDoc(doc(db, 'users', uid, 'pages', pageId));

// For shared books - fetch a book and its pages from any user
import { getDoc, getDocs, query, where } from 'firebase/firestore';

export const getSharedBook = async (ownerUid: string, bookId: string) => {
  try {
    const bookDoc = await getDoc(doc(db, 'users', ownerUid, 'books', bookId));
    if (!bookDoc.exists()) return null;
    return bookDoc.data() as Book;
  } catch (error) {
    console.error('Error fetching shared book:', error);
    return null;
  }
};

export const getSharedPages = async (ownerUid: string, bookId: string) => {
  try {
    const pagesCollection = collection(db, 'users', ownerUid, 'pages');
    const q = query(pagesCollection, where('bookId', '==', bookId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as Page);
  } catch (error) {
    console.error('Error fetching shared pages:', error);
    return [];
  }
};

// Fetch all books for the current user (used for manual refresh)
export const getUserBooks = async (uid: string): Promise<Book[]> => {
  try {
    const snapshot = await getDocs(booksRef(uid));
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Book);
  } catch (error) {
    console.error('Error fetching user books:', error);
    return [];
  }
};

// Extract a display name from an email address
export const getDisplayNameFromEmail = (email: string): string => {
  if (!email) return 'Someone';
  // Extract the part before @ symbol and capitalize each word
  const name = email.split('@')[0];
  return name
    .split(/[._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

// Save user email when they authenticate
export const saveUserEmail = async (uid: string, email: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { email }, { merge: true });
  } catch (error) {
    console.error('Error saving user email:', error);
  }
};

// Fetch user email by UID
export const getUserEmail = async (uid: string): Promise<string | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const snapshot = await getDoc(userRef);
    return snapshot.data()?.email || null;
  } catch (error) {
    console.error('Error fetching user email:', error);
    return null;
  }
};
