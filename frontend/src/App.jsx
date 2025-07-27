import './App.css'; // Import styles
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // React Router untuk navigation
import { Toaster } from './utils/toast'; // Custom toast notification system

// Import komponen-komponen yang dibutuhkan
import Navbar from './components/Navbar'; // Navigation bar component
import ProtectedRoute from './components/ProtectedRoute'; // HOC untuk protected routes
import LandingPage from './pages/LandingPage'; // Halaman utama/landing
import MapPage from './pages/MapPage'; // Halaman peta
import DataPage from './pages/DataPage'; // Halaman data RTH
import AdminLoginPage from './pages/AdminLoginPage'; // Halaman login admin
import AdminDashboard from './pages/AdminDashboard'; // Dashboard admin

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen w-full">
        {/* Toast notification container - akan muncul di semua halaman */}
        <Toaster />

        <Routes>
          {/* Admin Routes - tidak menggunakan navbar */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Public Routes - menggunakan navbar */}
          <Route
            path="/*"
            element={
              <>
                {/* Navbar dengan z-index tinggi agar selalu di atas */}
                <div className="relative z-50">
                  <Navbar />
                </div>

                {/* Container untuk konten utama */}
                <div className="flex-1 overflow-auto relative">
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/peta" element={
                      <div className="h-[calc(100vh-64px)]"> {/* Height dikurangi tinggi navbar */}
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