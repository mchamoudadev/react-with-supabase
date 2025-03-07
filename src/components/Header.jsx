import { Link } from 'react-router'
import { useState } from 'react'
import { FiMenu, FiX, FiUser } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { isLoggedIn, profile, logout } = useAuth()

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-orange-600">Blogify</Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-orange-500 text-sm font-medium text-gray-900">
                Home
              </Link>
              <Link to="/articles" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Articles
              </Link>
              {isLoggedIn && (
                <>
                  <Link to="/editor" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                    Write
                  </Link>
                  <Link to="/manage-articles" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                    My Articles
                  </Link>
                </>
              )}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <div className="text-sm text-gray-700">
                  {profile?.username && (
                    <span>Hello, {profile.username}</span>
                  )}
                </div>
                <div className="relative">
                  <button 
                    className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    onMouseEnter={() => setIsDropdownOpen(true)}
                  >
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile?.username || 'User'} 
                        className="h-8 w-8 rounded-full" 
                      />
                    ) : (
                      <FiUser className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                  {isDropdownOpen && (
                    <div 
                      className="absolute right-0 w-48 mt-1 py-2 bg-white rounded-md shadow-lg z-10"
                      onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                      {/* Add a small invisible area to prevent the dropdown from closing when moving cursor */}
                      <div className="absolute h-3 w-full top-[-12px]"></div>
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <Link 
                        to="/manage-articles" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Manage Articles
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/signin" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                  Sign In
                </Link>
                <Link to="/signup" className="hidden sm:inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-orange-600 bg-white border-orange-600 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                  Sign Up
                </Link>
              </>
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <FiX className="block h-6 w-6" /> : <FiMenu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" className="block pl-3 pr-4 py-2 border-l-4 border-orange-500 text-base font-medium text-orange-700 bg-orange-50">
              Home
            </Link>
            <Link to="/articles" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
              Articles
            </Link>
            {isLoggedIn && (
              <>
                <Link to="/editor" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
                  Write
                </Link>
                <Link to="/manage-articles" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
                  My Articles
                </Link>
                <Link to="/profile" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                >
                  Sign Out
                </button>
              </>
            )}
            {!isLoggedIn && (
              <>
                <Link to="/signin" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
                  Sign In
                </Link>
                <Link to="/signup" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
} 