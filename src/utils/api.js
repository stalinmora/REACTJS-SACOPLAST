import { useAuth } from '../contexts/AuthContext';

export const useApi = () => {
  const { token } = useAuth();

  const apiRequest = async (url, options = {}) => {
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Opcional: redirigir al login
    }

    return response;
  };

  return { apiRequest };
};