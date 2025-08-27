# Setup Instructions

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure API endpoints**
   
   Edit `src/config/api.ts` and update with your Supabase project details:
   
   ```typescript
   export const API_CONFIG = {
     API_URL: 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/api',
     SUPABASE_URL: 'https://YOUR-PROJECT-REF.supabase.co',
     SUPABASE_ANON_KEY: 'your-supabase-anon-key',
   };
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

## Backend Requirements

Make sure your existing Supabase backend is running and accessible. The app expects these GraphQL operations to be available:

### Authentication
- `loginUser(email: String!, password: String!): AuthPayload`
- `registerUser(input: CreateUserInput!): AuthPayload`

### Services
- `services(categoryId: Int): [ProviderService]`
- `categories: [Category]`

### Bookings
- `createBooking(input: CreateBookingInput!): Booking`
- `userBookings(userId: Int!): [Booking]`
- `providerBookings(providerId: Int!): [Booking]`
- `updateBookingStatus(bookingId: Int!, status: BookingStatus!): Booking`

## Testing

### Test Accounts
Create test accounts through the app:
1. Register as a customer to test booking flow
2. Register as a provider to test booking management

### Running on Different Platforms
- **Web**: `npm run web`
- **iOS**: `npm run ios`
- **Android**: `npm run android`

## Development Notes

- The app uses mock provider IDs (1) for testing - update with real provider profile logic
- All GraphQL responses are typed as `any` for simplicity - add proper types for production
- The UI is optimized for mobile but works on web for testing

## Next Steps

1. Connect to your actual backend
2. Test the complete user flows
3. Add proper error handling
4. Implement push notifications
5. Add payment integration
