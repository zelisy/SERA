import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = !!localStorage.getItem('isLoggedIn');

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setSettingsMenuOpen(false);
      }
    }
    if (settingsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [settingsMenuOpen]);

  const navItems = [
    { path: '/', label: 'Anasayfa', icon: '🏠' },
    { path: '/about', label: 'Hakkımızda', icon: 'ℹ️' },
    { path: '/products', label: 'Ürünlerimiz', icon: '🛒' },
    { path: '/blog', label: 'Blog', icon: '📝' },
    { path: '/contact', label: 'İletişim', icon: '📞' },
  ];

  const settingsItems = [
    { label: 'Mesajlar', path: '/messages' },
    { label: 'Ürün Yönetimi', path: '/products' },
    { label: 'Profil', path: '/profile' },
  ];

  const handleAuthClick = () => {
    if (isLoggedIn) {
      navigate('/admin');
    } else {
      navigate('/login');
    }
    setMobileMenuOpen(false);
  };

  // Anasayfada farklı stil uygula
  const isHomePage = location.pathname === '/';

  return (
    <header className={`${
      isHomePage 
        ? 'bg-black/50 backdrop-blur-md border-b border-white/10' 
        : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
    } sticky top-0 z-40 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white text-lg font-bold">S</span>
            </div>
            <div className="hidden sm:block">
              <h1 className={`text-xl font-bold ${
                isHomePage 
                  ? 'text-white' 
                  : 'bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent'
              }`}>
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
                    ? isHomePage 
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : isHomePage
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }
                `}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Button + Settings */}
          <div className="hidden md:flex items-center space-x-4 relative">
            <button
              onClick={handleAuthClick}
              className={`flex items-center space-x-2 font-medium px-6 py-2 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                isHomePage
                  ? 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                  : 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600'
              }`}
            >
              <span>{isLoggedIn ? '⚙️' : '🔐'}</span>
              <span>{isLoggedIn ? 'Admin Panel' : 'Giriş Yap'}</span>
            </button>

            {isLoggedIn && (
              <div className="relative">
                <button
                  onClick={() => setSettingsMenuOpen((open) => !open)}
                  className={`ml-2 p-2 rounded-full transition-colors ${
                    isHomePage 
                      ? 'hover:bg-white/20 text-white' 
                      : 'hover:bg-gray-100 text-slate-600'
                  }`}
                  aria-label="Ayarlar"
                  type="button"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                {settingsMenuOpen && (
                  <div ref={settingsMenuRef} className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                    <ul className="py-2">
                      {settingsItems.map((item) => (
                        <li key={item.path}>
                          <button
                            onClick={() => {
                              setSettingsMenuOpen(false);
                              navigate(item.path);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-emerald-50 transition-colors text-slate-700"
                          >
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isHomePage 
                ? 'hover:bg-white/20 text-white' 
                : 'hover:bg-gray-100 text-slate-600'
            }`}
          >
            <svg 
              className={`w-6 h-6 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-45' : ''}`}
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
          <div className={`py-4 space-y-2 ${
            isHomePage ? 'border-t border-white/20' : 'border-t border-gray-100'
          }`}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200
                  ${location.pathname === item.path
                    ? isHomePage 
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : isHomePage
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            <div className={`pt-2 ${
              isHomePage ? 'border-t border-white/20' : 'border-t border-gray-100'
            }`}>
              <button
                onClick={handleAuthClick}
                className={`w-full flex items-center justify-center space-x-2 font-medium px-6 py-3 rounded-xl transition-all duration-200 shadow-lg ${
                  isHomePage
                    ? 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                    : 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600'
                }`}
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
