import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PythonLearning from './pages/PythonLearning';
import TestCurriculum from './pages/TestCurriculum';
import ErrorManagement from './pages/ErrorManagement';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/python" element={<PythonLearning />} />
        <Route path="/learn" element={<PythonLearning />} />
        <Route path="/test" element={<TestCurriculum />} />
        <Route path="/error-management" element={<ErrorManagement />} />
      </Routes>
    </Router>
  );
}

export default App;
