import axios from 'axios';
import { createClient } from '@/utils/supabase/client';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000, // Increased timeout to 30 seconds
});

// Request interceptor for adding token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      console.log(`[API] Request to ${config.url}`);
      
      // Get Supabase session
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      // If session exists, add token to headers
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
        console.log('[API] Using Supabase session token');
      } else {
        console.log('[API] No Supabase session token available');
      }
    } catch (error) {
      console.error('[API] Error getting Supabase session:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] Response from ${response.config.url}: Status ${response.status}`);
    return response;
  },
  async (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('[API] Request timeout:', error.config.url);
    } else if (error.response) {
      console.error(`[API] Error response from ${error.config?.url}: Status ${error.response.status}`);
      
      // Don't handle 401 errors here - let AuthContext handle authentication
      // This prevents conflicts between API client and AuthContext redirects
    } else {
      console.error('[API] Request failed:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;