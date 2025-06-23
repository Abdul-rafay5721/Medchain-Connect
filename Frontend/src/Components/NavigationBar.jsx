import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/Medchain connect logo.png'; // Assuming you have a logo image in your assets folder

const NavigationBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white p-4 px-4 md:px-8 lg:px-20">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 md:space-x-3">
          <img src={logo} alt="MedChain Connect Logo" className="h-8 w-8 md:h-12 md:w-12" />
          <span className="text-xl md:text-2xl font-bold tracking-tight">MedChain Connect</span>
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-4">
          <Link 
            to="/login" 
            className="px-4 md:px-6 py-2 rounded-full hover:bg-white hover:text-blue-600 transition-all duration-300 border-2 border-transparent hover:border-white"
          >
            Login
          </Link>
          <Link 
            to="/signup" 
            className="px-4 md:px-6 py-2 rounded-full bg-white text-blue-600 hover:bg-blue-50 transition-all duration-300"
          >
            Signup
          </Link>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-blue-600 border-t border-blue-500">
            <div className="flex flex-col p-4 space-y-3">
              <Link 
                to="/login" 
                className="px-4 py-2 text-center rounded-full hover:bg-white hover:text-blue-600 transition-all duration-300 border-2 border-transparent hover:border-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="px-4 py-2 text-center rounded-full bg-white text-blue-600 hover:bg-blue-50 transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Signup
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
