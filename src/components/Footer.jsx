import { Link } from 'react-router'
import { FiTwitter, FiInstagram, FiGithub } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          <div className="px-5 py-2">
            <Link to="/" className="text-base text-gray-500 hover:text-gray-900">
              Home
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/articles" className="text-base text-gray-500 hover:text-gray-900">
              Articles
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/tags" className="text-base text-gray-500 hover:text-gray-900">
              Tags
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/about" className="text-base text-gray-500 hover:text-gray-900">
              About Us
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/contact" className="text-base text-gray-500 hover:text-gray-900">
              Contact
            </Link>
          </div>
        </nav>
        <div className="mt-8 flex justify-center space-x-6">
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Twitter</span>
            <FiTwitter className="h-6 w-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Instagram</span>
            <FiInstagram className="h-6 w-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">GitHub</span>
            <FiGithub className="h-6 w-6" />
          </a>
        </div>
        <p className="mt-8 text-center text-base text-gray-400">
          &copy; {new Date().getFullYear()} Blogify. All rights reserved.
        </p>
      </div>
    </footer>
  )
} 