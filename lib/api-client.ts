import axios from 'axios';

// Create a centralized axios instance with default headers
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-PK-Token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJBVVRIRU5USUNBVElPTiIsImlzcyI6IldZQ01TIiwiYXVkIjpbIkFQSV9DTElFTlRTIl0sImRhdGEiOnsib3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJodHRwOi8vbG9jYWxob3N0OjgwODAiLCJodHRwczovL3lvdXRoLWFsaXZlLWdpdmUtcGxhdGZvcm0udmVyY2VsLmFwcCIsImh0dHBzOi8vd2lubmVyc3lvdXRoLm9yZyIsImh0dHBzOi8veW91dGgtYWxpdmUtZ2xvYmFsLXYyLndlYi5hcHAiXX0sImlhdCI6MTc1ODcyMzEwNSwiZXhwIjoxOTE2NDAzMTA1fQ.p7tqLtQtH-nD6eW-Rm9pok8zjss0lOBMvYstw1_T9g1cWvEy_U5ccr6Sy9vJbS0qI7_3YSJbRpJaxD2q4eaXog'
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to log requests (optional)
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication failed - invalid X-PK-Token');
    } else if (error.response?.status === 403) {
      console.error('Access forbidden - check token permissions');
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response.status);
    }
    return Promise.reject(error);
  }
);

export default apiClient;