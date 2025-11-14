import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PythonLearning from './pages/PythonLearning';
import TestCurriculum from './pages/TestCurriculum';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/python" element={<PythonLearning />} />
        <Route path="/test" element={<TestCurriculum />} />
      </Routes>
    </Router>
  );
}

export default App;
