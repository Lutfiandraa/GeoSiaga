import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
});

export const fetcher = (url: string) => api.get(url).then((res) => res.data);

export const endpoints = {
  regions: '/api/regions',
  compare: '/api/regions/compare/all',
  analytics: '/api/analytics',
  timeline: '/api/analytics/timeline', // Check if this exists
  upload: '/api/upload',
  rivers: '/api/geojson/rivers',
  buffer: '/api/geojson/buffer',
  actualEvents: '/api/geojson/actual-events',
};
