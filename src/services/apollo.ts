import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl, getEnvironment } from '../config/environment';

// Get API URL from environment configuration
const API_URL = getApiUrl();



const httpLink = createHttpLink({
  uri: API_URL,
});

// Simplified logging without ApolloLink for now

const authLink = setContext(async (_, { headers }) => {
  try {
    const token = await AsyncStorage.getItem('authToken');

    
    const finalHeaders = {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
    

    
    return {
      headers: finalHeaders,
    };
  } catch (error) {

    return {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    };
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});



export default client;
