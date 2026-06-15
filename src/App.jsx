import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Library from './pages/Library';
import Browse from './pages/Browse';
import Search from './pages/Search';
import PlaylistDetail from './pages/PlaylistDetail';
import Playlists from './pages/Playlists';
import Downloads from './pages/Downloads';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Browse />} />
          <Route path="library" element={<Library />} />
          <Route path="browse" element={<Browse />} />
          <Route path="search" element={<Search />} />
          <Route path="downloads" element={<Downloads />} />
          <Route path="playlists" element={<Playlists />} />
          <Route path="playlist/:id" element={<PlaylistDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
