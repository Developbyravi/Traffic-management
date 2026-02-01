/**
 * API Service - Handles all backend communication
 */

import axios from 'axios';

const API_BASE_URL = ' https://traffic-management-1-mt03.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dashboard Stats
export const getDashboardStats = () => api.get('/api/dashboard/stats');

// Traffic APIs
export const getTrafficJunctions = () => api.get('/api/traffic/junctions');
export const getTrafficHeatmap = () => api.get('/api/traffic/heatmap');

// Parking APIs
export const getParkingZones = () => api.get('/api/parking/zones');
export const reserveParking = (zoneId) => api.post(`/api/parking/reserve?zone_id=${zoneId}`);

// Event Mode APIs
export const getEventMode = () => api.get('/api/event-mode');
export const setEventMode = (enabled, eventType = null) => 
  api.post('/api/event-mode', { enabled, event_type: eventType });

// Analytics APIs
export const getTrafficTrends = () => api.get('/api/analytics/traffic-trends');
export const getPeakHours = () => api.get('/api/analytics/peak-hours');
export const getTopCongested = () => api.get('/api/analytics/top-congested');

// Demo Control APIs
export const demoControl = (action, value = null) => 
  api.post('/api/demo/control', { action, value });

// Incidents API
export const getIncidents = () => api.get('/api/incidents');

export default api;
