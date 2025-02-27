import { Navigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

/**
 * UnauthenticatedRoute component that redirects authenticated users away from pages like sign-in and sign-up.
 * 
 * Usage:
 * <Route path="/signin" element={<UnauthenticatedRoute><SignInPage /></UnauthenticatedRoute>} />
 */
export default function UnauthenticatedRoute({ children, redirectTo = '/' }) {
  const { isLoggedIn, isLoading } = useAuth()
  
  // Show nothing while checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }
  
  // If already authenticated, redirect to home page
  if (isLoggedIn) {
    return <Navigate to={redirectTo} replace />
  }
  
  // If not authenticated, render the sign-in/sign-up component
  return children
} 