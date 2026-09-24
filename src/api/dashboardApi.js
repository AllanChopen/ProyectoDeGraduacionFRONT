import { apiClient } from './apiClient';

export const getDashboardSummary = async () => {
  return apiClient('/api/Dashboard');
};

export const getDashboardAnalytics = async () => {
  return apiClient('/api/Dashboard/analytics');
};
