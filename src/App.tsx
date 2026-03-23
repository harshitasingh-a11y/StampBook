import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import ShellLayout from '@/components/ShellLayout/ShellLayout';
import Login from '@/routes/Login';
import Collection from '@/routes/Collection';
import Create from '@/routes/Create';
import Inbox from '@/routes/Inbox';
import Community from '@/routes/Community';
import BookView from '@/routes/BookView';
import { useFirestoreSync } from '@/hooks/useFirestoreSync';

function FirestoreSync() {
  useFirestoreSync();
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <FirestoreSync />
        <Routes>
          <Route path="/login" element={<Login />} />
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
      </BrowserRouter>
    </AuthProvider>
  );
}
