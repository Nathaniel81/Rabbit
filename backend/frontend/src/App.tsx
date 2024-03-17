import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { QueryClient, QueryClientProvider } from 'react-query';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import HomePage from './pages/HomePage';
import UsersPage from './pages/UsersPage';
import CreateSubrabbitPage from './pages/CreateSubrabbitPage';
import SubrabbitDetailPage from './pages/SubrabbitDetailPage';
import CreatePostPage from './pages/CreatePostPage';
import PostDetailPage from './pages/PostDetailPage';
import SettingsPage from './pages/SettingsPage';

import AuthenticationModal from './components/AuthenticationModal';
import Navbar from './components/Navbar';


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/r/create" element={<CreateSubrabbitPage />} />
              <Route path="/r/:slug" element={<SubrabbitDetailPage />} />
              <Route path="/r/:slug/submit" element={<CreatePostPage />} />
              <Route path="/r/:slug/post/:id" element={<PostDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
        </Router>
        <AuthenticationModal />
    </QueryClientProvider>
  )
}

export default App
