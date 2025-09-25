import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import FormInputTest from './components/FormInputTest';
import AuthGuard from './components/AuthGuard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            {/* Public routes that redirect authenticated users */}
            <Route 
              path="/login" 
              element={
                <AuthGuard requireAuth={false}>
                  <Login />
                </AuthGuard>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <AuthGuard requireAuth={false}>
                  <Signup />
                </AuthGuard>
              } 
            />
            
            {/* Test route - accessible to all */}
            <Route path="/test-form" element={<FormInputTest />} />
            
            {/* Public home route - accessible to all */}
            <Route path="/" element={<Home />} />
            
            {/* Protected routes */}
            <Route 
              path="/profile" 
              element={
                <AuthGuard requireAuth={true}>
                  <Profile />
                </AuthGuard>
              } 
            />
            
            {/* Settings route - protected */}
            <Route 
              path="/settings" 
              element={
                <AuthGuard requireAuth={true}>
                  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
                      <p className="text-gray-600">Settings page coming soon...</p>
                    </div>
                  </div>
                </AuthGuard>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;