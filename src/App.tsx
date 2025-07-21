import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login'
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/home';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

// Basit bir authentication kontrolü için örnek bir fonksiyon (gerçek uygulamada context veya global state kullanılmalı)
const isAuthenticated = () => {
  return !!localStorage.getItem('isLoggedIn');
};

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Header />
      <div style={{ minHeight: 'calc(100vh - 120px)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          } />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App
