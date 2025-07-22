import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoggedIn = !!localStorage.getItem('isLoggedIn');

  const navItems = [
    { path: '/', label: 'Anasayfa', icon: '🏠' },
    { path: '/about', label: 'Hakkımızda', icon: 'ℹ️' },
    { path: '/contact', label: 'İletişim', icon: '📞' },
  ];

  const handleAuthClick = () => {
    if (isLoggedIn) {
      navigate('/admin');
    } else {
      navigate('/login');
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white text-lg font-bold">S</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                SERA TAKİP
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${location.pathname === item.path
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }
                `}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Button */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={handleAuthClick}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-2 rounded-xl font-medium hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span>{isLoggedIn ? '⚙️' : '🔐'}</span>
              <span>{isLoggedIn ? 'Admin Panel' : 'Giriş Yap'}</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg 
              className={`w-6 h-6 text-slate-600 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-45' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`
          md:hidden transition-all duration-300 ease-in-out overflow-hidden
          ${mobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}
        `}>
          <div className="py-4 space-y-2 border-t border-gray-100">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200
                  ${location.pathname === item.path
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={handleAuthClick}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
              >
                <span>{isLoggedIn ? '⚙️' : '🔐'}</span>
                <span>{isLoggedIn ? 'Admin Panel' : 'Giriş Yap'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
