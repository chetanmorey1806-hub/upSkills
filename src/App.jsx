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
import CodePlayground from './pages/CodePlayground.jsx';
import ApiLab from './pages/ApiLab.jsx';
import MongoLab from './pages/MongoLab.jsx';
import MernProjects from './pages/MernProjects.jsx';
import Courses from './pages/Courses.jsx';
import JavaIDE from './pages/JavaIDE.jsx';
import PythonIDE from './pages/PythonIDE.jsx';
import SqlLab from './pages/SqlLab.jsx';
import MySQLWorkbench from './pages/MySQLWorkbench.jsx';
import SsmsLab from './pages/SsmsLab.jsx';
import CSharpIDE from './pages/CSharpIDE.jsx';
import AiPromptLab from './pages/AiPromptLab.jsx';
import AiConceptsLab from './pages/AiConceptsLab.jsx';
import MlPlayground from './pages/MlPlayground.jsx';
import AiAppBuilder from './pages/AiAppBuilder.jsx';
import AiToolsDirectory from './pages/AiToolsDirectory.jsx';
import QuizArena from './pages/QuizArena.jsx';
import Flashcards from './pages/Flashcards.jsx';
import Shortcuts from './pages/Shortcuts.jsx';
import SearchPage from './pages/SearchPage.jsx';
import JavaInterview from './pages/JavaInterview.jsx';
import JavaProjects from './pages/JavaProjects.jsx';
import SoftSkills from './pages/SoftSkills.jsx';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TestSeries from './pages/TestSeries.jsx';
import Projects from './pages/Projects.jsx';
import ProjectWorkspace from './pages/ProjectWorkspace.jsx';

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppShell() {
  return (
    <Layout>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/track/:track" element={<TrackPage />} />
        <Route path="/track/:track/:id" element={<TopicPage />} />
        <Route path="/tools" element={<ToolsHome />} />
        <Route path="/tools/formula-lab" element={<FormulaLab />} />
        <Route path="/tools/dax-lab" element={<DaxLab />} />
        <Route path="/tools/power-query-lab" element={<PowerQueryLab />} />
        <Route path="/tools/playground" element={<CodePlayground />} />
        <Route path="/tools/api-lab" element={<ApiLab />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/tools/java-ide" element={<JavaIDE />} />
        <Route path="/tools/python-ide" element={<PythonIDE />} />
        <Route path="/tools/sql-lab" element={<SqlLab />} />
        <Route path="/tools/mysql-workbench" element={<MySQLWorkbench key="mysql" />} />
        <Route path="/tools/ssms-lab" element={<SsmsLab />} />
        <Route path="/tools/csharp-ide" element={<CSharpIDE />} />
        <Route path="/tools/ai-lab" element={<AiPromptLab />} />
        <Route path="/tools/ai-concepts" element={<AiConceptsLab />} />
        <Route path="/tools/ml-playground" element={<MlPlayground />} />
        <Route path="/tools/ai-app-builder" element={<AiAppBuilder />} />
        <Route path="/tools/ai-tools" element={<AiToolsDirectory />} />
        <Route path="/tools/quiz" element={<QuizArena />} />
        <Route path="/tools/flashcards" element={<Flashcards />} />
        <Route path="/tools/shortcuts" element={<Shortcuts />} />
        <Route path="/tools/java-interview" element={<JavaInterview />} />
        <Route path="/tools/java-projects" element={<JavaProjects />} />
        <Route path="/tools/java-projects/:id" element={<JavaProjects />} />
        <Route path="/tools/soft-skills" element={<SoftSkills />} />
        <Route path="/tools/test-series" element={<TestSeries />} />
        <Route path="/tools/python-projects" element={<Projects />} />
        <Route path="/tools/python-projects/:id" element={<ProjectWorkspace />} />
        <Route path="/tools/mongo-lab" element={<MongoLab />} />
        <Route path="/tools/mern-projects" element={<MernProjects />} />
        <Route path="/tools/mern-projects/:id" element={<MernProjects />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<AppShell />} />
      </Routes>
    </>
  );
}
