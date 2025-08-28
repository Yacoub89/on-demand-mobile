import React from 'react';
import { ApolloProvider } from '@apollo/client/react';
import apolloClient from './src/services/apollo';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ApolloProvider>
  );
}