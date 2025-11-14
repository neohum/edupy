import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TypingPractice from './pages/TypingPractice';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/typing" element={<TypingPractice />} />
      </Routes>
    </Router>
  );
}

export default App;
