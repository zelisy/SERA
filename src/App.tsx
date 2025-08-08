import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

// Lazy loading için bileşenleri import et
const Login = React.lazy(() => import('./pages/Login'));
const RecipeCreate = React.lazy(() => import('./pages/RecipeCreate'));
const Home = React.lazy(() => import('./pages/Home'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Admin = React.lazy(() => import('./pages/Admin'));
const DikimOncesiDonem = React.lazy(() => import('./components/DikimOncesiDonem'));
const DikimOncesiDetayDonem = React.lazy(() => import('./components/DikimOncesiDetayDonem'));
const Messages = React.lazy(() => import('./pages/Messages'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Products = React.lazy(() => import('./pages/Products'));
const BlogPage = React.lazy(() => import('./pages/Blog'));
const BlogManagement = React.lazy(() => import('./pages/BlogManagement'));
const AdminProducts = React.lazy(() => import('./pages/AdminProducts'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Yükleniyor...</p>
    </div>
  </div>
);

// Authentication kontrolü
const isAuthenticated = () => {
  return !!localStorage.getItem('isLoggedIn');
};

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin') && !location.pathname.includes('/admin/products');

  return (
    <>
      {!isAdminPage && <Header />}
      <div style={{ minHeight: isAdminPage ? '100vh' : 'calc(100vh - 120px)' }}>
        <Suspense fallback={<LoadingSpinner />}>
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
            <Route path="/admin/recipe" element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            } />
            <Route path="/admin/recipes/create/:producerId" element={
              <PrivateRoute>
                <RecipeCreate />
              </PrivateRoute>
            } />
            <Route path="/admin/recipes" element={
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

          </Routes>
        </Suspense>
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
