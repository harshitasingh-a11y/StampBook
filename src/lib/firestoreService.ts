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
