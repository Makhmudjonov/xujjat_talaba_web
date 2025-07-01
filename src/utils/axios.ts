// utils/axios.ts
import axios, { InternalAxiosRequestConfig } from 'axios';

const instance = axios.create({
  baseURL: '/api/',
});

instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access');
  if (token && config.headers) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

export default instance;
