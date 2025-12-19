import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000 // 30 seconds
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Student API methods
export const studentAPI = {
    // Get all students with optional filters
    getAll: (params = {}) => {
        return apiClient.get('/students', { params });
    },

    // Get single student by ID
    getById: (id) => {
        return apiClient.get(`/students/${id}`);
    },

    // Create new student
    create: (studentData) => {
        return apiClient.post('/students', studentData);
    },

    // Update student
    update: (id, studentData) => {
        return apiClient.put(`/students/${id}`, studentData);
    },

    // Delete student
    delete: (id) => {
        return apiClient.delete(`/students/${id}`);
    },

    // Refresh student data
    refresh: (id) => {
        return apiClient.post(`/students/${id}/refresh`);
    },

    // Refresh all students data
    refreshAll: () => {
        return apiClient.post('/students/refresh-all');
    }
};

export default apiClient;
