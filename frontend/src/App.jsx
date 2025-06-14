// src/App.jsx - Updated dengan Toast Provider
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import MapPage from './pages/MapPage';
import DataPage from './pages/DataPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen w-full">
        {/* Toast Provider - harus di level paling atas */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '14px',
              maxWidth: '350px',
            },
            success: {
              duration: 4000,
              style: {
                background: '#10B981',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10B981',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#EF4444',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#EF4444',
              },
            },
            loading: {
              style: {
                background: '#3B82F6',
              },
            },
          }}
        />

        <Routes>
          {/* Admin Routes - tanpa navbar */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Public Routes - dengan navbar */}
          <Route
            path="/*"
            element={
              <>
                {/* Navbar dengan z-index tinggi agar selalu terlihat */}
                <div className="relative z-50">
                  <Navbar />
                </div>

                {/* Container untuk konten yang dapat di-scroll */}
                <div className="flex-1 overflow-auto relative">
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/peta" element={
                      <div className="h-[calc(100vh-64px)]"> {/* 64px adalah perkiraan tinggi navbar */}
                        <MapPage />
                      </div>
                    } />
                    <Route path="/data" element={<DataPage />} />
                  </Routes>
                </div>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;