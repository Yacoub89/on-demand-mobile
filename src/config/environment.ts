// Environment Configuration
export const ENV_CONFIG = {
  development: {
    API_URL: 'https://lyknhwabbysztqqwznen.supabase.co/functions/v1/api',
    name: 'DEVELOPMENT',
    supabaseUrl: 'https://lyknhwabbysztqqwznen.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5a25od2FiYnlzenRxcXd6bmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0ODYxNzIsImV4cCI6MjA3MDA2MjE3Mn0.Xa6vANeW_zAWdLB_ePTIVD7YuZtLZTBuwS-IpAQxkpo'
  },
  // development: {
  //   API_URL: 'http://127.0.0.1:54321/functions/v1/api',
  //   name: 'DEVELOPMENT',
  //   supabaseUrl: 'http://127.0.0.1:54321',
  //   supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5a25od2FiYnlzenRxcXd6bmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0ODYxNzIsImV4cCI6MjA3MDA2MjE3Mn0.Xa6vANeW_zAWdLB_ePTIVD7YuZtLZTBuwS-IpAQxkpo'
  // },
  production: {
    API_URL: 'https://lyknhwabbysztqqwznen.supabase.co/functions/v1/api',
    name: 'PRODUCTION',
    supabaseUrl: 'https://lyknhwabbysztqqwznen.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5a25od2FiYnlzenRxcXd6bmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0ODYxNzIsImV4cCI6MjA3MDA2MjE3Mn0.Xa6vANeW_zAWdLB_ePTIVD7YuZtLZTBuwS-IpAQxkpo'
  }
} as const;

type EnvironmentType = keyof typeof ENV_CONFIG;

// Environment detection
export const isDevelopment = __DEV__;
export const isProduction = !isDevelopment;

// MANUAL OVERRIDE: Uncomment the line below to force development mode
// export const currentEnv: EnvironmentType = 'development';

// Get current environment (or use manual override)
export const currentEnv: EnvironmentType = (isProduction ? 'production' : 'development');
export const config = ENV_CONFIG[currentEnv];

// Helper functions
export const getApiUrl = () => config.API_URL;
export const getEnvironment = () => currentEnv;
export const isDev = () => isDevelopment;
export const isProd = () => isProduction;


