import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_REACT_APP_BACKEND_BASEURL || 'http://localhost:5000').replace(/\/+$/, '');

// Configure axios defaults
axios.defaults.withCredentials = false; // Set to false for public endpoints
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Create separate axios instances for public and authenticated requests
const publicAxios = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

const authAxios = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor for authenticated requests
authAxios.interceptors.request.use(
    (config) => {
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

// Add response interceptor for authenticated requests
authAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

export { publicAxios, authAxios }; 