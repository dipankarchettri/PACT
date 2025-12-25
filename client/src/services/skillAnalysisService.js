import apiClient from '../lib/apiClient';

export const skillAnalysisService = {
  // Get skill analysis for a student
  getAnalysis: async (studentId) => {
    const response = await apiClient.get(`/skill-analysis/${studentId}`);
    return response.data;
  },

  // Force refresh analysis
  refreshAnalysis: async (studentId) => {
    const response = await apiClient.post(`/skill-analysis/${studentId}/refresh`);
    return response.data;
  },

  // Get personalized learning path
  getLearningPath: async (studentId) => {
    const response = await apiClient.get(`/skill-analysis/${studentId}/learning-path`);
    return response.data;
  },

  // Get AI insights separately (Slow)
  getAIInsights: async (studentId) => {
     const response = await apiClient.get(`/skill-analysis/${studentId}/ai`);
     return response.data;
  }
};
