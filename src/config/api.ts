// API Configuration
// Replace these URLs with your actual Supabase project URLs

export const API_CONFIG = {
  // Your Supabase Function API endpoint
  API_URL: 'https://lyknhwabbysztqqwznen.supabase.co/functions/v1/api',
  
  // Your Supabase project URL and anon key (if needed for direct Supabase calls)
  SUPABASE_URL: 'https://lyknhwabbysztqqwznen.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5a25od2FiYnlzenRxcXd6bmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0ODYxNzIsImV4cCI6MjA3MDA2MjE3Mn0.Xa6vANeW_zAWdLB_ePTIVD7YuZtLZTBuwS-IpAQxkpo'
};

// Development/Testing API URLs
export const DEV_API_CONFIG = {
  API_URL: 'https://lyknhwabbysztqqwznen.supabase.co/functions/v1/api', // Local Supabase
  SUPABASE_URL: 'https://lyknhwabbysztqqwznen.supabase.co',
      SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5a25od2FiYnlzenRxcXd6bmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0ODYxNzIsImV4cCI6MjA3MDA2MjE3Mn0.Xa6vANeW_zAWdLB_ePTIVD7YuZtLZTBuwS-IpAQxkpo'
};

// Use development config if in development mode
const isDevelopment = __DEV__;
export const CURRENT_API_CONFIG = isDevelopment ? DEV_API_CONFIG : API_CONFIG;
