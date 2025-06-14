// src/App.jsx - Simple update
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './utils/toast'; // Import dari utils kita
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
        {/* Toast Notifications */}
        <Toaster />

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
                      <div className="h-[calc(100vh-64px)]">
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