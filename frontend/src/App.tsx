import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PythonLearning from './pages/PythonLearning';
import PygameLearning from './pages/PygameLearning';
import PygameGames from './pages/PygameGames';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/python" element={<PythonLearning />} />
        <Route path="/learn" element={<PythonLearning />} />
        <Route path="/pygame" element={<PygameLearning />} />
        <Route path="/pygame-games" element={<PygameGames />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
