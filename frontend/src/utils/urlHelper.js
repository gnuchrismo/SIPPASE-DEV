/**
 * Utility to construct full URLs based on the environment configuration.
 * Uses VITE_API_URL from .env files.
 */

export const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return url.replace(/\/$/, ''); // Remove trailing slash if present
};

export const getApiUrl = (endpoint) => {
  const baseUrl = getBaseUrl();
  // Ensure we don't have double slashes if endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}/api${cleanEndpoint}`;
};

export const getResourceUrl = (path) => {
  if (!path) return '';
  
  // CRITICAL FIX: If the path from DB is already a full URL pointing to localhost (dev residue),
  // we must replace it with the current environment's base URL.
  if (path.includes('localhost:3000')) {
     const baseUrl = getBaseUrl();
     // Replace localhost:3000 with the actual production URL
     return path.replace('http://localhost:3000', baseUrl).replace('https://localhost:3000', baseUrl);
  }

  if (path.startsWith('http')) return path;
  
  const baseUrl = getBaseUrl();
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};
