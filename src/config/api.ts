// API Configuration
export const API_BASE_URL = 'http://192.168.50.171:5000';

// API Endpoints
export const API_ENDPOINTS = {
  birthRecords: `${API_BASE_URL}/birthRecords`,
  deathRecords: `${API_BASE_URL}/deathRecords`,
  parentData: `${API_BASE_URL}/ParentData`,
  mortuaryRecords: `${API_BASE_URL}/mortuaryRecords`,
  statistics: `${API_BASE_URL}/statistics`,
  certificates: `${API_BASE_URL}/certificates`,
  activities: `${API_BASE_URL}/activities`
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>) => {
  const url = new URL(endpoint);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }
  return url.toString();
};