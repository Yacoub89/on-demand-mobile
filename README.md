# On-Demand Services Mobile App

A React Native mobile application for the on-demand service platform, built with Expo and TypeScript. This app allows customers to book services and providers to manage their bookings.

## Features

### Customer Features
- **Service Discovery**: Browse services by category
- **Service Booking**: Book services with date/time selection
- **Booking Management**: View and track booking status
- **User Profile**: Manage account settings

### Provider Features
- **Dashboard**: Overview of bookings and earnings
- **Booking Management**: View and respond to booking requests
- **Status Updates**: Accept, decline, start, and complete bookings
- **Customer Communication**: View customer details and notes

### Shared Features
- **Authentication**: Login and registration for both customers and providers
- **Role-based Navigation**: Different interfaces for customers and providers
- **Real-time Updates**: Live booking status updates
- **Responsive Design**: Optimized for mobile devices

## Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **TypeScript**: Type-safe development
- **Apollo Client**: GraphQL client for API communication
- **React Navigation**: Navigation and routing
- **Async Storage**: Local data persistence
- **Ionicons**: Icon library

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd on-demand-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoints**
   
   Update `src/config/api.ts` with your actual Supabase project URLs:
   ```typescript
   export const API_CONFIG = {
     API_URL: 'https://your-project-ref.supabase.co/functions/v1/api',
     SUPABASE_URL: 'https://your-project-ref.supabase.co',
     SUPABASE_ANON_KEY: 'your-supabase-anon-key',
   };
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components (future)
├── config/             # Configuration files
│   └── api.ts          # API endpoints configuration
├── context/            # React Context providers
│   └── AuthContext.tsx # Authentication context
├── navigation/         # Navigation configuration
│   └── AppNavigator.tsx # Main navigation setup
├── screens/            # Screen components
│   ├── auth/           # Authentication screens
│   ├── customer/       # Customer-specific screens
│   ├── provider/       # Provider-specific screens
│   └── ProfileScreen.tsx # Shared profile screen
├── services/           # External services
│   └── apollo.ts       # Apollo Client configuration
└── types/              # TypeScript type definitions
    └── index.ts        # Shared types
```

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run on web browser

## API Integration

The app connects to the existing Supabase Edge Function API. Make sure your backend is running and accessible:

### Required GraphQL Operations

**Authentication**
- `loginUser` - User login
- `registerUser` - User registration

**Services**
- `services` - Get available services
- `categories` - Get service categories

**Bookings**
- `createBooking` - Create new booking
- `userBookings` - Get customer bookings
- `providerBookings` - Get provider bookings
- `updateBookingStatus` - Update booking status

## Environment Setup

### Development
For local development, update `DEV_API_CONFIG` in `src/config/api.ts`:
```typescript
export const DEV_API_CONFIG = {
  API_URL: 'http://localhost:54321/functions/v1/api',
  SUPABASE_URL: 'http://localhost:54321',
  SUPABASE_ANON_KEY: 'your-local-supabase-anon-key',
};
```

### Production
Update `API_CONFIG` with your production Supabase URLs.

## Key Features Implementation

### Authentication Flow
1. Role selection (Customer/Provider)
2. Login/Registration forms
3. JWT token storage
4. Automatic authentication check

### Customer Booking Flow
1. Browse service categories
2. View available services
3. Select service and provider
4. Choose date and time
5. Enter service address
6. Confirm booking

### Provider Booking Management
1. View all bookings with filters
2. Accept or decline pending bookings
3. Start and complete services
4. View customer information

## Navigation Structure

```
Auth Stack (Unauthenticated)
├── RoleSelection
├── Login
└── Register

Main Stack (Authenticated)
├── Customer Tabs
│   ├── Home
│   ├── Services
│   ├── Bookings
│   └── Profile
├── Provider Tabs
│   ├── Dashboard
│   ├── Bookings
│   └── Profile
└── Booking (Modal)
```

## State Management

- **Authentication**: React Context (`AuthContext`)
- **API Data**: Apollo Client cache
- **Local Storage**: AsyncStorage for tokens

## Styling

The app uses a consistent design system:
- **Colors**: Blue primary (#2563eb), gray scale
- **Typography**: System fonts with consistent sizing
- **Spacing**: 4px grid system
- **Shadows**: Subtle shadows for cards and buttons

## Future Enhancements

- [ ] Push notifications
- [ ] Real-time chat between customers and providers
- [ ] Payment integration (Stripe)
- [ ] Service reviews and ratings
- [ ] Provider service management
- [ ] Availability calendar
- [ ] Photo uploads
- [ ] Location services and maps

## Testing

### Running on Device/Simulator

1. **iOS Simulator**
   ```bash
   npm run ios
   ```

2. **Android Emulator**
   ```bash
   npm run android
   ```

3. **Physical Device**
   - Install Expo Go app
   - Scan QR code from `expo start`

### Test Accounts

Create test accounts through the registration flow:
- Customer account for testing booking flow
- Provider account for testing booking management

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start -c
   ```

2. **iOS build issues**
   ```bash
   cd ios && pod install
   ```

3. **Android build issues**
   - Check Android Studio setup
   - Verify Android SDK installation

4. **API connection issues**
   - Verify API URLs in `src/config/api.ts`
   - Check backend server status
   - Verify network connectivity

### Debug Mode

Enable debug mode in Expo:
1. Shake device or press Cmd+D (iOS) / Cmd+M (Android)
2. Select "Debug JS Remotely"
3. Open browser developer tools

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the troubleshooting section
- Review existing GitHub issues
- Create a new issue with detailed description

---

Built with ❤️ using React Native and Expo
