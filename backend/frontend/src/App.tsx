import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import HomePage from './pages/HomePage';
import UsersPage from './pages/UsersPage';
import CreateSubrabbitPage from './pages/CreateSubrabbitPage';
import SubrabbitDetailPage from './pages/SubrabbitDetailPage';
import CreatePostPage from './pages/CreatePostPage';

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
            </Routes>
        </Router>
        <AuthenticationModal />
    </QueryClientProvider>
  )
}

export default App
