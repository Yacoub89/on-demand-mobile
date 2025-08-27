import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const GET_PROVIDER_STATS_QUERY = gql`
  query ProviderStats($providerId: Int!) {
    providerBookings(providerId: $providerId) {
      id
      status
      totalPrice
      date
      review {
        id
        rating
      }
    }
  }
`;

const ProviderDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  // For now, we'll use a mock providerId. In a real app, you'd get this from the provider profile
  const providerId = 1; // This should come from the provider's profile

  const { data, loading } = useQuery(GET_PROVIDER_STATS_QUERY, {
    variables: { providerId },
    errorPolicy: 'all',
  });

  const bookings = (data as any)?.providerBookings || [];

  // Calculate stats
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b: any) => b.status === 'PENDING').length;
  const completedBookings = bookings.filter((b: any) => b.status === 'COMPLETED').length;
  const totalEarnings = bookings
    .filter((b: any) => b.status === 'COMPLETED')
    .reduce((sum: number, b: any) => sum + b.totalPrice, 0);

  const reviews = bookings
    .filter((b: any) => b.review)
    .map((b: any) => b.review);
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : 0;

  const quickActions = [
    {
      title: 'View Bookings',
      subtitle: `${pendingBookings} pending`,
      icon: 'calendar',
      color: '#3b82f6',
      onPress: () => navigation.navigate('Bookings'),
    },
    {
      title: 'Manage Services',
      subtitle: 'Add or edit services',
      icon: 'briefcase',
      color: '#10b981',
      onPress: () => {
        // This would navigate to a services management screen
        alert('Services management coming soon!');
      },
    },
    {
      title: 'Availability',
      subtitle: 'Set your schedule',
      icon: 'time',
      color: '#f59e0b',
      onPress: () => {
        // This would navigate to availability management
        alert('Availability management coming soon!');
      },
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
      title: 'Completed',
      value: completedBookings.toString(),
      icon: 'checkmark-circle',
      color: '#10b981',
    },
    {
      title: 'Average Rating',
      value: averageRating > 0 ? averageRating.toFixed(1) : 'N/A',
      icon: 'star',
      color: '#f59e0b',
    },
    {
      title: 'Total Earnings',
      value: `$${totalEarnings.toFixed(2)}`,
      icon: 'cash',
      color: '#ef4444',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name}!</Text>
            <Text style={styles.subtitle}>Manage your services and bookings</Text>
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

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            {pendingBookings > 0 ? (
              <View style={styles.activityItem}>
                <Ionicons name="time" size={20} color="#f59e0b" />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>
                    {pendingBookings} booking{pendingBookings !== 1 ? 's' : ''} pending
                  </Text>
                  <Text style={styles.activitySubtitle}>
                    Respond to new booking requests
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.activityButton}
                  onPress={() => navigation.navigate('Bookings')}
                >
                  <Text style={styles.activityButtonText}>View</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.activityItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>All caught up!</Text>
                  <Text style={styles.activitySubtitle}>
                    No pending bookings at the moment
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips for Success</Text>
          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={20} color="#f59e0b" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Respond quickly to bookings</Text>
              <Text style={styles.tipText}>
                Fast response times lead to higher customer satisfaction and more bookings.
              </Text>
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
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
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
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  activityButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activityButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
});

export default ProviderDashboardScreen;
