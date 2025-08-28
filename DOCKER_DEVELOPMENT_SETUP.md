# 🐳 Docker Development Setup

This guide shows you how to run your mobile app with the same local development environment as your web application.

## 🚀 Quick Start

### 1. Start Supabase Locally
```bash
cd /Users/yacoubabdulla/Desktop/on-demand-service-platform
supabase start
```

This will start:
- **API**: `http://127.0.0.1:54321`
- **Database**: `http://127.0.0.1:54322`
- **Studio**: `http://127.0.0.1:54323`
- **Edge Functions**: `http://127.0.0.1:54321/functions/v1/api`

### 2. Start Your Mobile App
```bash
cd /Users/yacoubabdulla/Desktop/on-demand-mobile
npx expo start
```

## 🔧 Environment Configuration

Your mobile app is now configured to automatically use:

- **Development**: `http://127.0.0.1:54321/functions/v1/api` (Local Supabase)
- **Production**: `https://lyknhwabbysztqqwznen.supabase.co/functions/v1/api` (Live Supabase)

## 📱 Testing

### Local Development
1. Start Supabase: `supabase start`
2. Start mobile app: `npx expo start`
3. App will connect to local Supabase Edge Functions
4. Use Expo Go app to scan QR code

### Production Testing
1. Build release version or override environment
2. App will connect to live Supabase

## 🐳 Docker Commands

### Start Supabase
```bash
supabase start
```

### Stop Supabase
```bash
supabase stop
```

### Reset Database
```bash
supabase db reset
```

### View Logs
```bash
supabase logs
```

## 🌐 Access Points

When Supabase is running locally:

- **API**: http://127.0.0.1:54321
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Studio**: http://127.0.0.1:54323
- **Edge Functions**: http://127.0.0.1:54321/functions/v1/api

## 🔍 Troubleshooting

### Port Already in Use
If you get port conflicts:
```bash
supabase stop
# Wait a moment
supabase start
```

### Database Issues
```bash
supabase db reset
```

### Edge Functions Not Working
```bash
supabase functions serve
```

## 📝 Notes

- Your mobile app now uses the exact same backend as your web app in development
- Both apps connect to the same local Supabase instance
- You can test API changes on both web and mobile simultaneously
- Production builds automatically use the live Supabase instance
