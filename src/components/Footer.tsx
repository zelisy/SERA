import { Link } from 'react-router-dom';
import { getBrandName } from '../utils/brand';

const Footer = () => {
  const currentYear = new Date().getFullYear();



  const socialLinks = [
    { icon: '📧', label: 'Email', href: 'mailto:agroviatr@gmail.com' },
    { icon: '📱', label: 'Telefon', href: 'tel:+905377383743' },
    { icon: '🌐', label: 'Website', href: 'https://sera.com' },
  ];

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Footer Content */}
        <div className="py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">S</span>
              </div>
              <h3 className="text-lg font-display bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {getBrandName()}
              </h3>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed max-w-sm font-body">
              Modern tarım ve seracılık uygulamalarında verimliliği artırmak için geliştirilmiş 
              akıllı takip sistemi.
            </p>
            <div className="mt-3 flex space-x-3">
              {socialLinks.map((social, index) => (
                social.label === 'Website' ? (
                  <Link
                    key={index}
                    to="/"
                    className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors group"
                    title={social.label}
                  >
                    <span className="text-slate-600 group-hover:text-slate-800 transition-colors text-sm">
                      {social.icon}
                    </span>
                  </Link>
                ) : (
                  <a
                    key={index}
                    href={social.href}
                    className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors group"
                    title={social.label}
                  >
                    <span className="text-slate-600 group-hover:text-slate-800 transition-colors text-sm">
                      {social.icon}
                    </span>
                  </a>
                )
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-800 font-semibold mb-3 text-sm">Hızlı Linkler</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-slate-600 hover:text-emerald-600 text-xs transition-colors"
                >
                  Anasayfa
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-slate-600 hover:text-emerald-600 text-xs transition-colors"
                >
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-slate-600 hover:text-emerald-600 text-xs transition-colors"
                >
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <p className="text-slate-500 text-xs">
              © {currentYear} {getBrandName()}. TÜM HAKLARI SAKLIDIR.
            </p>
            <div className="mt-2 sm:mt-0 flex items-center space-x-3">
              <span className="text-slate-400 text-xs">v1.0.0</span>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-slate-500 text-xs">Sistem Aktif</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
