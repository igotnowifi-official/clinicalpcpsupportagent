/**
 * API Configuration
 * 
 * Centralized configuration for backend API endpoints
 */

// API base URL - defaults to localhost:8080 (FastAPI default port)
// Can be overridden via environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_PREFIX = '/api';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  prefix: API_PREFIX,
  fullURL: `${API_BASE_URL}${API_PREFIX}`,
  
  // Endpoints
  endpoints: {
    // Intake endpoints
    intake: {
      issue: `${API_PREFIX}/intake/issue`,
      submit: `${API_PREFIX}/intake/submit`,
      session: (token: string) => `${API_PREFIX}/intake/session/${token}`,
    },
    
    // Triage endpoints
    triage: {
      run: `${API_PREFIX}/triage/run`,
    },
    
    // Health check
    health: `${API_PREFIX}/health`,
  },
  
  // Request configuration
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Timeout settings (ms)
  timeout: 30000, // 30 seconds
};

/**
 * Helper to build full URL
 */
export const buildApiUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Helper to make API requests with error handling
 */
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = buildApiUrl(endpoint);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...API_CONFIG.defaultHeaders,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

