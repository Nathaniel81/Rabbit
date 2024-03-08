import { QueryClient, QueryClientProvider } from 'react-query';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import HomePage from './pages/HomePage';
import UsersPage from './pages/UsersPage';

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
            </Routes>
        </Router>
        <AuthenticationModal />
    </QueryClientProvider>
  )
}

export default App
