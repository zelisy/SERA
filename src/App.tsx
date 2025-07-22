import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login'
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import DikimOncesiDonem from './components/DikimOncesiDonem';
import DikimOncesiDetayDonem from './components/DikimOncesiDetayDonem';

// Authentication kontrolü
const isAuthenticated = () => {
  return !!localStorage.getItem('isLoggedIn');
};

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  return (
    <>
      {!isAdminPage && <Header />}
      <div style={{ minHeight: isAdminPage ? '100vh' : 'calc(100vh - 120px)' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes - Giriş Gerekli */}
          <Route path="/dikim-oncesi" element={
            <PrivateRoute>
              <DikimOncesiDonem />
            </PrivateRoute>
          } />
          <Route path="/dikim-oncesi-detay" element={
            <PrivateRoute>
              <DikimOncesiDetayDonem />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          } />
        </Routes>
      </div>
      {!isAdminPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App
