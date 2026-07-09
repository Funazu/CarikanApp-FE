import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ItemDetailPage from './pages/ItemDetailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-surface flex flex-col font-inter">
            <Navbar />
            
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <StudentDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/items/:id" element={<ItemDetailPage />} />
              </Routes>
            </main>

            {/* Clean Branded Footer */}
            <footer className="border-t border-gray-100 py-6 bg-white text-center text-xs text-gray-400 font-semibold mt-12">
              <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center gap-4">
                <p>&copy; 2026 Carikan Amikom. All rights reserved.</p>
                <div className="flex gap-4">
                  <a href="https://amikom.ac.id" target="_blank" rel="noreferrer" className="hover:text-secondary transition-colors">Website Amikom</a>
                  <span>•</span>
                  <span className="text-gray-300">Hubungi Pengembang</span>
                </div>
              </div>
            </footer>
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
