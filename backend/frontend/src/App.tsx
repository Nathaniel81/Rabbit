import { QueryClient, QueryClientProvider } from 'react-query';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';

import Navbar from './components/Navbar';


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/sign-in" element={<LoginPage />} />
              <Route path="/users" element={<UsersPage />} />
            </Routes>
        </Router>
    </QueryClientProvider>
  )
}

export default App
