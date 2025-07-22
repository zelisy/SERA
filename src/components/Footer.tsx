import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: 'Gizlilik Politikası', href: '/privacy' },
    { label: 'Kullanım Şartları', href: '/terms' },
    { label: 'Destek', href: '/support' },
  ];

  const socialLinks = [
    { icon: '📧', label: 'Email', href: 'mailto:info@sera.com' },
    { icon: '📱', label: 'Telefon', href: 'tel:+90555123456' },
    { icon: '🌐', label: 'Website', href: 'https://sera.com' },
  ];

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">S</span>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                SERA TAKİP
              </h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed max-w-md">
              Modern tarım ve seracılık uygulamalarında verimliliği artırmak için geliştirilmiş 
              akıllı takip sistemi. Geleceğin tarımını bugün deneyimleyin.
            </p>
            <div className="mt-6 flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors group"
                  title={social.label}
                >
                  <span className="text-slate-600 group-hover:text-slate-800 transition-colors">
                    {social.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-800 font-semibold mb-4">Hızlı Linkler</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="text-slate-600 hover:text-emerald-600 text-sm transition-colors"
                >
                  Anasayfa
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-slate-600 hover:text-emerald-600 text-sm transition-colors"
                >
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-slate-600 hover:text-emerald-600 text-sm transition-colors"
                >
                  İletişim
                </Link>
              </li>
              <li>
                <Link 
                  to="/dikim-oncesi-detay" 
                  className="text-slate-600 hover:text-emerald-600 text-sm transition-colors"
                >
                  Checklist
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-slate-800 font-semibold mb-4">Yasal</h4>
            <ul className="space-y-3">
              {footerLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-slate-600 hover:text-emerald-600 text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <p className="text-slate-500 text-sm">
              © {currentYear} SERA TAKİP. Tüm hakları saklıdır.
            </p>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <span className="text-slate-400 text-xs">v1.0.0</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
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
