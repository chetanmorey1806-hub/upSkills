import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import TrackPage from './pages/TrackPage.jsx';
import TopicPage from './pages/TopicPage.jsx';
import Roadmap from './pages/Roadmap.jsx';
import ToolsHome from './pages/ToolsHome.jsx';
import FormulaLab from './pages/FormulaLab.jsx';
import DaxLab from './pages/DaxLab.jsx';
import PowerQueryLab from './pages/PowerQueryLab.jsx';
import QuizArena from './pages/QuizArena.jsx';
import Flashcards from './pages/Flashcards.jsx';
import Shortcuts from './pages/Shortcuts.jsx';
import SearchPage from './pages/SearchPage.jsx';

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <Layout>
      <ScrollTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/track/:track" element={<TrackPage />} />
        <Route path="/track/:track/:id" element={<TopicPage />} />
        <Route path="/tools" element={<ToolsHome />} />
        <Route path="/tools/formula-lab" element={<FormulaLab />} />
        <Route path="/tools/dax-lab" element={<DaxLab />} />
        <Route path="/tools/power-query-lab" element={<PowerQueryLab />} />
        <Route path="/tools/quiz" element={<QuizArena />} />
        <Route path="/tools/flashcards" element={<Flashcards />} />
        <Route path="/tools/shortcuts" element={<Shortcuts />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Layout>
  );
}
