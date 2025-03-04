import { Routes, Route } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ArticlesPage from './pages/ArticlesPage'
import ArticlePage from './pages/ArticlePage'
import ArticleEditorPage from './pages/ArticleEditorPage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ProfilePage from './pages/ProfilePage'
import ImageUploadTest from './components/ImageUploadTest'
import ProtectedRoute from './components/ProtectedRoute'
import UnauthenticatedRoute from './components/UnauthenticatedRoute'

function App() {
  return (
      <AuthProvider>
        <div className="flex flex-col min-h-screen w-full">
          <Header />
          <main className="flex-grow w-full">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/articles" element={<ArticlesPage />} />
              <Route path="/article/:id" element={<ArticlePage />} />
              <Route path="/upload-test" element={<ImageUploadTest />} />
              
              {/* Unauthenticated routes (redirect to home if logged in) */}
              <Route path="/signin" element={
                <UnauthenticatedRoute>
                  <SignInPage />
                </UnauthenticatedRoute>
              } />
              <Route path="/signup" element={
                <UnauthenticatedRoute>
                  <SignUpPage />
                </UnauthenticatedRoute>
              } />
              <Route path="/forgot-password" element={
                <UnauthenticatedRoute>
                  <ForgotPasswordPage />
                </UnauthenticatedRoute>
              } />
              <Route path="/reset-password" element={
                <UnauthenticatedRoute>
                  <ResetPasswordPage />
                </UnauthenticatedRoute>
              } />
              
              {/* Protected routes */}
              <Route path="/editor" element={
                <ProtectedRoute>
                  <ArticleEditorPage />
                </ProtectedRoute>
              } />
              <Route path="/editor/:id" element={
                <ProtectedRoute>
                  <ArticleEditorPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
  )
}

export default App
