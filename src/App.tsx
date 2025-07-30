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
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Products from './pages/Products';
import BlogPage from './pages/Blog';
import BlogManagement from './pages/BlogManagement';
import AdminProducts from './pages/AdminProducts';
import Recipe from './pages/Recipe';
import RecipeCreate from './pages/RecipeCreate';

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
          <Route path="/products" element={<Products />} />
          <Route path="/blog" element={<BlogPage />} />
          
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
          <Route path="/blog-management" element={
            <PrivateRoute>
              <BlogManagement />
            </PrivateRoute>
          } />
          <Route path="/admin/products" element={
            <PrivateRoute>
              <AdminProducts />
            </PrivateRoute>
          } />
          <Route path="/messages" element={
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/recipe" element={
            <PrivateRoute>
              <Recipe />
            </PrivateRoute>
          } />
          <Route path="/recipe/create/:producerId" element={
            <PrivateRoute>
              <RecipeCreate />
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
