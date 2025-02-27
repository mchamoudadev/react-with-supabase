# Minimalist Authentication for Supabase

This document explains the minimalist authentication approach implemented in this project.

## Philosophy

The goal is to provide a simple, clean authentication system that:

- Focuses only on essential functionality
- Reduces code complexity 
- Is easy to understand and maintain
- Integrates seamlessly with Supabase

## Key Components

### 1. Auth Utilities (`src/lib/auth.js`)

A streamlined module with just the core authentication functions:

- `signUp(email, password, username)` - Register a new user
- `signIn(email, password)` - Authenticate a user
- `signOut()` - Log out the current user
- `getCurrentUser()` - Get the currently authenticated user
- `getUserProfile(userId)` - Get a user's profile data
- `updateProfile(userId, updates)` - Update a user's profile
- `onAuthChange(callback)` - Subscribe to authentication state changes

### 2. Auth Context (`src/context/AuthContext.jsx`)

A simple React context that:

- Tracks authentication state
- Provides user data throughout the app
- Handles profile data fetching when a user logs in

### 3. Auth Form (`src/components/AuthForm.jsx`)

A clean form component that:

- Handles both sign-up and sign-in
- Provides intuitive error handling
- Toggles between authentication modes

## How It Works

1. **User Registration**: When a user signs up, we:
   - Create an auth record via Supabase Auth
   - Create a profile record in the users table
   - The profile uses the provided username or defaults to the email username

2. **Authentication State**: The auth context:
   - Listens for auth state changes
   - Automatically fetches the user profile when authenticated
   - Provides this data to the rest of the application

3. **User Login/Logout**: Simple functions handle:
   - Email/password authentication
   - Secure sign-out
   - Error handling

## Using Authentication in Components

```jsx
import { useAuth } from '../context/AuthContext';

function MyProtectedComponent() {
  const { user, profile, isLoggedIn, logout } = useAuth();
  
  if (!isLoggedIn) {
    return <p>Please log in to view this content</p>;
  }
  
  return (
    <div>
      <h1>Welcome, {profile.username}</h1>
      <button onClick={logout}>Log Out</button>
    </div>
  );
}
```

## Extending the System

This minimalist approach can be extended as needed. If you require additional functionality:

1. Add new functions to `auth.js` as required
2. Keep functions simple and focused on a single responsibility
3. Update the auth context if new state needs to be tracked 