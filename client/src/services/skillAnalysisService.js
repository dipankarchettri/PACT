import axios from 'axios';

   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

   export const skillAnalysisService = {
     // Get skill analysis for a student
     getAnalysis: async (studentId) => {
       const response = await axios.get(`${API_URL}/skill-analysis/${studentId}`);
       return response.data;
     },

     // Force refresh analysis
     refreshAnalysis: async (studentId) => {
       const response = await axios.post(`${API_URL}/skill-analysis/${studentId}/refresh`);
       return response.data;
     },

     // Get personalized learning path
     getLearningPath: async (studentId) => {
       const response = await axios.get(`${API_URL}/skill-analysis/${studentId}/learning-path`);
       return response.data;
     },

     // Get AI insights separately (Slow)
     getAIInsights: async (studentId) => {
        const response = await axios.get(`${API_URL}/skill-analysis/${studentId}/ai`);
        return response.data;
     }
   };
