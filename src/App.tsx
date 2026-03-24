import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import ShellLayout from '@/components/ShellLayout/ShellLayout';
import { useFirestoreSync } from '@/hooks/useFirestoreSync';
import { useAssetPreloader } from '@/hooks/useAssetPreloader';

const Landing = lazy(() => import('@/routes/Landing'));
const Collection = lazy(() => import('@/routes/Collection'));
const Create = lazy(() => import('@/routes/Create'));
const Inbox = lazy(() => import('@/routes/Inbox'));
const Community = lazy(() => import('@/routes/Community'));
const BookView = lazy(() => import('@/routes/BookView'));

function FirestoreSync() {
  useFirestoreSync();
  useAssetPreloader();
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <FirestoreSync />
        <Suspense fallback={<div />}>
          <Routes>
            <Route path="/login" element={<Landing />} />
            <Route path="/landing" element={<Landing />} />
            <Route
              path="/book/:bookId"
              element={
                <ProtectedRoute>
                  <BookView />
                </ProtectedRoute>
              }
            />
            <Route
              element={
                <ProtectedRoute>
                  <ShellLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Collection />} />
              <Route path="/create" element={<Create />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/community" element={<Community />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
