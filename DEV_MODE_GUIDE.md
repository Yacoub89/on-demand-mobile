# 🚀 How to Run in Development Mode

## **Automatic Development Mode (Default)**

Your app automatically runs in development mode when you use:
```bash
npx expo start
```

This will:
- ✅ Connect to **local Supabase** at `http://127.0.0.1:54321/functions/v1/api`
- ✅ Use development configuration
- ✅ Show development logs in console

## **Manual Development Mode Override**

If you want to force development mode even in production builds:

1. **Edit** `src/config/environment.ts`
2. **Uncomment** this line:
   ```typescript
   export const currentEnv: EnvironmentType = 'development';
   ```
3. **Comment out** this line:
   ```typescript
   export const currentEnv: EnvironmentType = (isProduction ? 'production' : 'development');
   ```

## **Prerequisites for Development Mode**

Before running in dev mode, make sure you have:

1. **Supabase running locally**:
   ```bash
   cd /Users/yacoubabdulla/Desktop/on-demand-service-platform
   supabase start
   ```

2. **Docker running** (Supabase needs it)

## **Quick Development Workflow**

```bash
# Terminal 1: Start Supabase
cd /Users/yacoubabdulla/Desktop/on-demand-service-platform
supabase start

# Terminal 2: Start Mobile App
cd /Users/yacoubabdulla/Desktop/on-demand-mobile
npx expo start
```

## **Verify You're in Development Mode**

Check your console logs - you should see:
```
🌍 Environment Configuration:
   Mode: DEVELOPMENT
   API URL: http://127.0.0.1:54321/functions/v1/api
   Supabase URL: http://127.0.0.1:54321
```

## **Troubleshooting**

### **App connects to production instead of local?**
- Make sure Supabase is running: `supabase start`
- Check if ports 54321-54323 are available
- Restart your mobile app after starting Supabase

### **Port conflicts?**
```bash
supabase stop
# Wait a moment
supabase start
```

### **Still not working?**
Check the manual override in `src/config/environment.ts`
