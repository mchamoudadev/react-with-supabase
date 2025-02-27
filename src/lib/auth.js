import supabase from './supabase'


export async function signUp(email, password, username = '') {
  console.log('Starting signup process for email:', email)
  
  // Create auth user
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) {
    console.error('Signup error:', error)
    throw error
  }
  
  console.log('Auth signup successful:', data)
  
  // If signup successful and we have a user, create profile
  if (data?.user) {
    // Wait for session to be established
    const { data: sessionData } = await supabase.auth.getSession()
    console.log('Checking session after signup:', sessionData)
    
    if (!sessionData?.session) {
      console.log('No active session yet - profile will be created on first sign in')
      return data
    }
    
    // Use provided username or derive from email
    const displayName = username || email.split('@')[0]
    console.log('Creating user profile with:', {
      id: data.user.id,
      username: displayName
    })
    
    // Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        username: displayName,
        avatar_url: null
      })
      .select()
      .single()
    
    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't throw here - just log the error since the auth account was created
      console.log('Profile creation deferred to first sign in')
    } else {
      console.log('Profile created successfully:', profileData)
    }
  }
  
  return data
}


export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ 
    email, 
    password 
  })
  
  if (error) throw error
  
  // Check if user profile exists, create if it doesn't
  if (data?.user) {
    try {
      const profile = await getUserProfile(data.user.id)
      console.log('Profile after signin:', profile)
    } catch (profileError) {
      console.error('Error with profile during signin:', profileError)
    }
  }
  
  return data
}

/**
 * Sign out the current user
 */
export async function signOut() {
  await supabase.auth.signOut()
}


export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser()
  return data.user
}


export async function getUserProfile(userId) {
  console.log('Getting user profile for ID:', userId)
  
  // Debug: Check if we have a valid session
  const { data: sessionData } = await supabase.auth.getSession()
  console.log('Current session:', sessionData)
  
  // First, try to get the existing profile
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  // If no profile exists, create one
  if (error && error.code === 'PGRST116') {
    console.log('No profile found, attempting to create one for user:', userId)
    
    // Get user email to derive username if needed
    const { data: userData } = await supabase.auth.getUser()
    console.log('Current user data:', userData)
    
    const email = userData?.user?.email || ''
    const defaultUsername = email ? email.split('@')[0] : `user_${Date.now()}`
    
    console.log('Creating profile with:', {
      id: userId,
      username: defaultUsername
    })
    
    // Create a new profile
    const { data: newProfile, error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        username: defaultUsername,
        avatar_url: null
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Profile creation error:', insertError)
      throw insertError
    }
    
    console.log('New profile created successfully:', newProfile)
    return newProfile
  }
  
  if (error) {
    console.error('Error fetching profile:', error)
    throw error
  }
  
  console.log('Existing profile found:', data)
  return data
}


export async function updateProfile(userId, updates) {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
  
  if (error) throw error
}


export function onAuthChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null, event)
  })
  
  return () => subscription.unsubscribe()
} 