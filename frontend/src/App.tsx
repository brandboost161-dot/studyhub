import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './lib/auth';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StudyMode from './pages/StudyMode';
import CourseDirectory from './pages/CourseDirectory';
import CourseDetail from './pages/CourseDetail';
import Analytics from './pages/Analytics';
import CreateReview from './pages/CreateReview';
import CreateFlashcards from './pages/CreateFlashcards';
import UploadNotes from './pages/UploadNotes';
import ViewNotes from './pages/ViewNotes';
import Profile from './pages/Profile';
import AIHub from './pages/AIHub';
import GenerateFlashcards from './pages/GenerateFlashcards';
import GenerateStudyGuide from './pages/GenerateStudyGuide';
import GenerateQuiz from './pages/GenerateQuiz';
import SummarizeNotes from './pages/SummarizeNotes';
import Search from './pages/Search';
import ActivityFeed from './pages/ActivityFeed';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <CourseDirectory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:courseId"
              element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:courseId/review"
              element={
                <ProtectedRoute>
                  <CreateReview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:courseId/flashcards"
              element={
                <ProtectedRoute>
                  <CreateFlashcards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:courseId/notes"
              element={
                <ProtectedRoute>
                  <UploadNotes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notes/:resourceId"
              element={
                <ProtectedRoute>
                  <ViewNotes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai"
              element={
                <ProtectedRoute>
                  <AIHub />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai/generate-flashcards"
              element={
                <ProtectedRoute>
                  <GenerateFlashcards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai/study-guide"
              element={
                <ProtectedRoute>
                  <GenerateStudyGuide />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai/quiz"
              element={
                <ProtectedRoute>
                  <GenerateQuiz />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai/summarize"
              element={
                <ProtectedRoute>
                  <SummarizeNotes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <Search />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activity"
              element={
                <ProtectedRoute>
                  <ActivityFeed />
                </ProtectedRoute>
              }
            />
            <Route
              path="/study/:resourceId"
              element={
                <ProtectedRoute>
                  <StudyMode />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;