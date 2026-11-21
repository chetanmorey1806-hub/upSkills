import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
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
import Videos from './pages/Videos.jsx';
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
import AuthPage from './pages/AuthPage.jsx';
import { WebProjectList, WebProjectWorkspace } from './pages/WebProjects.jsx';
import { StudyHub, NotesPage, MistakesPage, RevisionPage, PlannerPage, AchievementsPage } from './pages/StudyPages.jsx';
import { CertificatesPage, CertificateView, ResumeBuilder, DailyChallenge, AiCodeReview } from './pages/CareerTools.jsx';
import CodeVisualizer from './pages/CodeVisualizer.jsx';
import Visualizers from './pages/Visualizers.jsx';
import { ExplainError, CodePuzzles, QuizBattle } from './pages/PracticeGames.jsx';
import { AptitudeHome, AptitudeTopic, CompanyKits, VideoInterview } from './pages/PlacementTools.jsx';
import { InterviewPhrases, ProjectPitch, JamPractice, SituationalRound, CompanyHR } from './pages/InterviewCoach.jsx';
import { VersantPractice, GDTopics, EnglishMistakes, InterviewDayKit, FirstJobSkills } from './pages/InterviewCoach2.jsx';
import { DiagnosticTest, PortfolioBuilder, WeeklyReport } from './pages/GrowthTools.jsx';
import TodayPage from './pages/TodayPage.jsx';
import { Leaderboard, Forum, ForumThread, ExperienceBank } from './pages/Community.jsx';
import Classroom, { AdminUsers } from './pages/Classroom.jsx';
import { ApplicationTracker, OfferComparison, InterviewJournal } from './pages/CareerHub.jsx';
import { RequireAuth } from './auth.js';
import Admin from './pages/Admin.jsx';
import AdminInbox from './pages/AdminInbox.jsx';
import Legal from './pages/Legal.jsx';
import Chat from './pages/Chat.jsx';
import StudyMaterial from './pages/StudyMaterial.jsx';
import Profile from './pages/Profile.jsx';
import PermissionGate from './components/PermissionGate.jsx';
import { loadPublishedConfig } from './permissions.js';
const DevVerifyTasks = import.meta.env.DEV ? lazy(() => import('./pages/DevVerifyTasks.jsx')) : null;
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
      <PermissionGate>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/inbox" element={<AdminInbox />} />
        <Route path="/profile" element={<Profile />} />
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
        <Route path="/videos" element={<Videos />} />
        <Route path="/materials" element={<StudyMaterial />} />
        <Route path="/chat" element={<Chat />} />
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
        <Route path="/study" element={<StudyHub />} />
        <Route path="/study/notes" element={<NotesPage />} />
        <Route path="/study/mistakes" element={<MistakesPage />} />
        <Route path="/study/revision" element={<RevisionPage />} />
        <Route path="/study/planner" element={<PlannerPage />} />
        <Route path="/study/achievements" element={<AchievementsPage />} />
        <Route path="/study/certificates" element={<CertificatesPage />} />
        <Route path="/study/certificate/:track" element={<CertificateView />} />
        <Route path="/study/resume" element={<ResumeBuilder />} />
        <Route path="/study/challenge" element={<DailyChallenge />} />
        <Route path="/tools/ai-code-review" element={<AiCodeReview />} />
        <Route path="/tools/code-visualizer" element={<CodeVisualizer />} />
        <Route path="/tools/visualizers" element={<Visualizers />} />
        <Route path="/tools/explain-error" element={<ExplainError />} />
        <Route path="/tools/code-puzzles" element={<CodePuzzles />} />
        <Route path="/tools/quiz-battle" element={<QuizBattle />} />
        <Route path="/practice/aptitude" element={<AptitudeHome />} />
        <Route path="/practice/aptitude/:id" element={<AptitudeTopic />} />
        <Route path="/practice/companies" element={<CompanyKits />} />
        <Route path="/practice/companies/:id" element={<CompanyKits />} />
        <Route path="/practice/video-interview" element={<VideoInterview />} />
        <Route path="/tools/interview-phrases" element={<InterviewPhrases />} />
        <Route path="/tools/project-pitch" element={<ProjectPitch />} />
        <Route path="/tools/jam" element={<JamPractice />} />
        <Route path="/tools/situational" element={<SituationalRound />} />
        <Route path="/tools/company-hr" element={<CompanyHR />} />
        <Route path="/tools/company-hr/:id" element={<CompanyHR />} />
        <Route path="/tools/versant" element={<VersantPractice />} />
        <Route path="/tools/gd-topics" element={<GDTopics />} />
        <Route path="/tools/english-mistakes" element={<EnglishMistakes />} />
        <Route path="/tools/interview-day" element={<InterviewDayKit />} />
        <Route path="/tools/first-job" element={<FirstJobSkills />} />
        <Route path="/study/diagnostic" element={<DiagnosticTest />} />
        <Route path="/study/portfolio" element={<PortfolioBuilder />} />
        <Route path="/study/report" element={<WeeklyReport />} />
        <Route path="/today" element={<TodayPage />} />
        <Route path="/community/leaderboard" element={<Leaderboard />} />
        <Route path="/community/forum" element={<Forum />} />
        <Route path="/community/forum/:id" element={<ForumThread />} />
        <Route path="/community/experiences" element={<ExperienceBank />} />
        <Route path="/classroom" element={<Classroom />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/career/applications" element={<ApplicationTracker />} />
        <Route path="/career/offers" element={<OfferComparison />} />
        <Route path="/career/experiences" element={<InterviewJournal />} />
        <Route path="/tools/web-projects" element={<WebProjectList />} />
        <Route path="/tools/web-projects/:id" element={<WebProjectWorkspace />} />
        <Route path="/tools/test-series" element={<TestSeries />} />
        <Route path="/tools/test-series/:course" element={<TestSeries />} />
        <Route path="/tools/python-projects" element={<Projects />} />
        <Route path="/tools/python-projects/:id" element={<ProjectWorkspace />} />
        <Route path="/tools/mongo-lab" element={<MongoLab />} />
        <Route path="/tools/mern-projects" element={<MernProjects />} />
        <Route path="/tools/mern-projects/:id" element={<MernProjects />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
      </PermissionGate>
    </Layout>
  );
}

export default function App() {
  useEffect(() => { loadPublishedConfig(); }, []);
  return (
    <>
      <ScrollTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/privacy" element={<Legal kind="privacy" />} />
        <Route path="/terms" element={<Legal kind="terms" />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        {DevVerifyTasks && <Route path="/dev/verify-tasks/:track" element={<Suspense fallback={<p>Loading verifier…</p>}><DevVerifyTasks /></Suspense>} />}
        <Route path="*" element={<RequireAuth><AppShell /></RequireAuth>} />
      </Routes>
    </>
  );
}
