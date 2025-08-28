import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const GET_PROVIDER_STATS_QUERY = gql`
  query ProviderBookings($providerId: Int!) {
    providerBookings(providerId: $providerId) {
      id
      status
      totalPrice
      date
      paymentStatus
      completedAt
      review {
        id
        rating
        comment
        createdAt
      }
      user {
        id
        name
        email
      }
      providerService {
        id
        serviceType {
          id
          name
        }
      }
    }
  }
`;

const GET_PROVIDER_BY_USER_QUERY = gql`
  query GetProviderByUser($userId: Int!) {
    providers(where: { userId: { _eq: $userId } }) {
      id
      userId
      user {
        id
        name
        email
        role
      }
      description
      experience
      rating
      totalReviews
      isVerified
      isActive
    }
  }
`;


const ProviderDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  // Use user ID directly as provider ID
  const userId = user?.id ? parseInt(String(user.id)) : null;
  const providerId = userId;

  // First, find the provider profile ID for this user
  const { data: providerData, loading: providerLoading } = useQuery(GET_PROVIDER_BY_USER_QUERY, {
    variables: { userId },
    skip: !userId,
    errorPolicy: 'all',
  });

  // Get the actual provider ID from the profile
  const actualProviderId = (providerData as any)?.providers?.[0]?.id || userId;

  // Show loading state while determining provider ID
  if (providerLoading && !actualProviderId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Finding provider profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error if we can't determine provider ID
  if (!actualProviderId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Provider Profile Not Found</Text>
          <Text style={styles.errorSubtext}>
            Unable to find provider profile for user ID: {userId}
          </Text>
          <Text style={styles.errorSubtext}>
            Please check your account setup or contact support.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const { data, loading } = useQuery(GET_PROVIDER_STATS_QUERY, {
    variables: { providerId: actualProviderId },
    skip: !actualProviderId,
    errorPolicy: 'all',
  });

  const bookings = (data as any)?.providerBookings || [];

  // Calculate stats
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b: any) => b.status === 'PENDING').length;
  const confirmedBookings = bookings.filter((b: any) => b.status === 'CONFIRMED').length;
  const inProgressBookings = bookings.filter((b: any) => b.status === 'IN_PROGRESS').length;
  const completedBookings = bookings.filter((b: any) => b.status === 'COMPLETED').length;

  const quickActions = [
    {
      title: 'View Bookings',
      subtitle: `${pendingBookings} pending`,
      icon: 'calendar',
      color: '#3b82f6',
      onPress: () => navigation.navigate('Bookings'),
    },
    {
      title: 'Profile',
      subtitle: 'Update your profile',
      icon: 'person',
      color: '#8b5cf6',
      onPress: () => navigation.navigate('Profile'),
    },
  ];

  const statCards = [
    {
      title: 'Total Bookings',
      value: totalBookings.toString(),
      icon: 'calendar',
      color: '#3b82f6',
    },
    {
      title: 'Pending',
      value: pendingBookings.toString(),
      icon: 'time',
      color: '#f59e0b',
    },
    {
      title: 'In Progress',
      value: inProgressBookings.toString(),
      icon: 'play-circle',
      color: '#8b5cf6',
    },
    {
      title: 'Completed',
      value: completedBookings.toString(),
      icon: 'checkmark-circle',
      color: '#10b981',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name}!</Text>
            <Text style={styles.subtitle}>Manage your service bookings</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {statCards.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                  <Ionicons name={stat.icon as any} size={20} color="#ffffff" />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={action.onPress}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon as any} size={24} color="#ffffff" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Review Bookings</Text>
                <Text style={styles.stepDescription}>Check incoming booking requests and details</Text>
              </View>
            </View>

            <View style={styles.infoStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Approve & Start</Text>
                <Text style={styles.stepDescription}>Approve bookings and mark them as in progress</Text>
              </View>
            </View>

            <View style={styles.infoStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Complete & Manage</Text>
                <Text style={styles.stepDescription}>Mark bookings as complete or handle disputes</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  notificationButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: Math.max((width - 52) / 2, 140), // Minimum width of 140px for very small screens
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default ProviderDashboardScreen;
