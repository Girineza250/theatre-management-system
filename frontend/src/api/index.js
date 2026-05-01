
// src/api/index.js - Updated with search API
/**
 * Main API index file
 * Export all API services for easy import
 */

import apiClient from './client';
import authApi from './auth';
import bookingApi from './bookings';
import contactApi from './contact';
import dashboardApi from './dashboard';
import movieApi from './movies';
import screeningApi from './screenings';
import seatApi from './seats';
import theatreApi from './theatres';
import userApi from './users';
import searchApi from './search'; // New search API

export {
  apiClient,
  authApi,
  bookingApi,
  contactApi,
  dashboardApi,
  movieApi,
  screeningApi,
  seatApi,
  theatreApi,
  userApi,
  searchApi // Export search API
};

// Export default as a combined API object
export default {
  auth: authApi,
  bookings: bookingApi,
  contact: contactApi,
  dashboard: dashboardApi,
  movies: movieApi,
  screenings: screeningApi,
  seats: seatApi,
  theatres: theatreApi,
  users: userApi,
  search: searchApi // Add search API
};