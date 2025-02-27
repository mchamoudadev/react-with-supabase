import { createContext, useState, useEffect, useContext } from 'react'
import { onAuthChange, getUserProfile, signOut } from '../lib/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const cleanup = onAuthChange(async (user) => {
      setUser(user)
      
      if (user) {
        try {
          const userProfile = await getUserProfile(user.id)
          setProfile(userProfile)
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })
    
    return cleanup
  }, [])
  
  const logout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }
  
  const value = {
    user,
    profile,
    isLoggedIn: !!user,
    isLoading: loading,
    logout
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 