import axios from 'axios'; // HTTP client library

// Base URL API dari environment variable atau fallback ke localhost
export const API_BASE_URL = (import.meta.env.VITE_REACT_APP_BACKEND_BASEURL || 'http://localhost:5000').replace(/\/+$/, '');

// Axios default configuration
axios.defaults.withCredentials = false; // Set false untuk public endpoints
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Public axios instance - untuk endpoint yang tidak perlu authentication
const publicAxios = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Authenticated axios instance - untuk endpoint yang perlu authentication
const authAxios = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Request interceptor untuk authenticated requests
authAxios.interceptors.request.use(
    (config) => {
        // Ambil token dari localStorage dan inject ke header
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor untuk handle 401 errors
authAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        // Jika unauthorized, hapus token dan redirect ke login
        if (error.response?.status === 401) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

export { publicAxios, authAxios };