// src/api.ts
const baseURL = 'https://tanlov.medsfera.uz/api';

const getToken = () => localStorage.getItem('accessToken');

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${baseURL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token eskirgan bo‘lishi mumkin
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login'; // logout
  }

  return response;
};
