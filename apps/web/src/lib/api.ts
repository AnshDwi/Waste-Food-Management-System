import axios from 'axios';
import type { Store } from '@reduxjs/toolkit';
import type { RootState } from '../app/store';

declare const process: {
  env?: {
    VITE_API_BASE_URL?: string;
  };
};

const resolvedBaseUrl =
  (typeof window !== 'undefined' && (window as Window & { __APP_CONFIG__?: { apiBaseUrl?: string } }).__APP_CONFIG__?.apiBaseUrl) ||
  process.env?.VITE_API_BASE_URL ||
  'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: resolvedBaseUrl,
  withCredentials: true
});

export const setupApiInterceptors = (store: Store<RootState>) => {
  api.interceptors.request.use((config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};
