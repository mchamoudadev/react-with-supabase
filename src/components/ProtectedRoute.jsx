import { Navigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

/**
 * ProtectedRoute component that redirects unauthenticated users to the sign-in page.
 * 
 * Usage:
 * <Route path="/protected" element={<ProtectedRoute><YourComponent /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children, redirectTo = '/signin' }) {
  const { isLoggedIn, isLoading } = useAuth()
  
  // Show nothing while checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }
  
  // If not authenticated, redirect to sign-in page
  if (!isLoggedIn) {
    return <Navigate to={redirectTo} replace />
  }
  
  // If authenticated, render the protected component
  return children
} 