import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ShellLayout from '@/components/ShellLayout/ShellLayout';
import Collection from '@/routes/Collection';
import Create from '@/routes/Create';
import Inbox from '@/routes/Inbox';
import Community from '@/routes/Community';
import BookView from '@/routes/BookView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/book/:bookId" element={<BookView />} />
        <Route element={<ShellLayout />}>
          <Route path="/" element={<Collection />} />
          <Route path="/create" element={<Create />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/community" element={<Community />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
