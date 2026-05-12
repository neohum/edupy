import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import PythonLearning from './pages/PythonLearning';
import PygameLearning from './pages/PygameLearning';
import PygameGames from './pages/PygameGames';
import GameWindow from './pages/GameWindow';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import NewThemes from './pages/NewThemes';
import DataCurriculumSelect from './pages/DataCurriculumSelect';
import AICurriculumSelect from './pages/AICurriculumSelect';
import AlgorithmCurriculumSelect from './pages/AlgorithmCurriculumSelect';
import CurriculumLearning from './pages/CurriculumLearning';
import EduPyPlayground from './pages/EduPyPlayground';
import { setupSessionTracking, trackPageView, trackPageLeave } from './utils/analytics';
import './App.css';

// 페이지 추적 컴포넌트
function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    // 페이지 이동 시 추적
    trackPageView(location.pathname, document.title);

    // 페이지 이탈 시 체류 시간 추적
    return () => {
      trackPageLeave(location.pathname);
    };
  }, [location.pathname]);

  return null;
}

function App() {
  useEffect(() => {
    // 세션 추적 초기화
    setupSessionTracking();
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <PageTracker />
        <Toaster position="top-center" richColors closeButton />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/python" element={<PythonLearning />} />
          <Route path="/learn" element={<PythonLearning />} />
          <Route path="/pygame" element={<PygameLearning />} />
          <Route path="/pygame-games" element={<PygameGames />} />
          <Route path="/game/:sessionId" element={<GameWindow />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/new" element={<NewThemes />} />
          <Route path="/data" element={<DataCurriculumSelect />} />
          <Route path="/ai" element={<AICurriculumSelect />} />
          <Route path="/algorithm" element={<AlgorithmCurriculumSelect />} />
          <Route path="/learn/:curriculumId" element={<CurriculumLearning />} />
          <Route path="/edupy" element={<EduPyPlayground />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
