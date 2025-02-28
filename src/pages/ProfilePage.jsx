import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import supabase from '../lib/supabase'
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setUsername(data.username);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error.message);
      toast.error('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // First update username
      const updates = { username };
      
      // If there's a new avatar, upload it first
      if (avatar) {
        const fileExt = avatar.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}`;
        const filePath = `avatars/${fileName}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatar);
          
        if (uploadError) throw uploadError;
        
        // Get public URL for the avatar
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        updates.avatar_url = data.publicUrl;
        setAvatarUrl(data.publicUrl);
      }
      
      // Update the user profile
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error.message);
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be smaller than 2MB');
        return;
      }
      setAvatar(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 relative">
              <img 
                src={avatarUrl || 'https://via.placeholder.com/150'} 
                alt="Profile" 
                className="rounded-full w-full h-full object-cover"
              />
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
              </label>
              <input 
                type="file" 
                id="avatar-upload" 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarChange}
              />
            </div>
            {avatar && (
              <p className="text-sm text-gray-500">
                New image selected: {avatar.name}
              </p>
            )}
          </div>
          
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          {/* Email - Read only */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              value={user?.email || ''}
              disabled
            />
            <p className="mt-1 text-sm text-gray-500">
              Email cannot be changed.
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Account Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Account</h2>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate('/reset-password')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Change Password
          </button>
          
          <hr className="my-4" />
          
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to sign out?')) {
                signOut();
                navigate('/');
              }
            }}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 