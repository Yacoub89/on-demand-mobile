# 🌍 Environment Configuration

This mobile app automatically detects the environment and configures the API endpoints accordingly.

## 🔧 How It Works

The app uses React Native's `__DEV__` flag to automatically detect the environment:
- **Development** (`__DEV__ = true`): Uses local Supabase Edge Functions at `http://127.0.0.1:54321/functions/v1/api`
- **Production** (`__DEV__ = false`): Uses production Supabase Edge Functions

## 🐳 Docker Development Setup

Your mobile app now uses the same local development environment as your web application:

### Prerequisites
- Supabase CLI installed
- Docker running

### Quick Start
```bash
# 1. Start Supabase locally
cd /Users/yacoubabdulla/Desktop/on-demand-service-platform
supabase start

# 2. Start your mobile app
cd /Users/yacoubabdulla/Desktop/on-demand-mobile
npx expo start
```

## 📱 Environment Files

- `env.development` - Development configuration (for reference)
- `env.production` - Production configuration (for reference)

## 🚀 Automatic Environment Detection

### Development Mode
- When running in development: `npx expo start` or `npx react-native run-ios`
- API URL: `http://127.0.0.1:54321/functions/v1/api` (Local Supabase)
- Supabase URL: `http://127.0.0.1:54321`

### Production Mode
- When building for production: `npx expo build` or `npx react-native run-ios --configuration Release`
- API URL: `https://lyknhwabbysztqqwznen.supabase.co/functions/v1/api`
- Supabase URL: `https://lyknhwabbysztqqwznen.supabase.co`

## 🔄 Manual Override

If you need to manually override the environment, you can modify `src/config/environment.ts`:

```typescript
// Force production mode even in development
export const currentEnv = 'production'; // Override automatic detection
```

## 📍 Current Configuration

- **Development API**: `http://127.0.0.1:54321/functions/v1/api` (Local Supabase)
- **Production API**: `https://lyknhwabbysztqqwznen.supabase.co/functions/v1/api`

## 🧪 Testing

To test different environments:
1. **Development**: Start Supabase locally with `supabase start`, then run `npx expo start`
2. **Production**: Build release version or modify environment config

## 📝 Notes

- The app automatically logs which environment it's using in the console
- Environment detection happens at build time, not runtime
- Both web and mobile apps now use the same local Supabase instance in development
- See `DOCKER_DEVELOPMENT_SETUP.md` for detailed Docker setup instructions
