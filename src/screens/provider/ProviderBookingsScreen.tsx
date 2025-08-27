import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useAuth } from '../../context/AuthContext';
import { Booking } from '../../types';

const GET_PROVIDER_BOOKINGS_QUERY = gql`
  query ProviderBookings($providerId: Int!) {
    providerBookings(providerId: $providerId) {
      id
      date
      startTime
      endTime
      status
      totalPrice
      notes
      serviceAddress
      user {
        id
        name
        email
        phone
      }
      providerService {
        id
        serviceType {
          name
          category {
            name
          }
        }
      }
    }
  }
`;

const UPDATE_BOOKING_STATUS_MUTATION = gql`
  mutation UpdateBookingStatus($bookingId: Int!, $status: BookingStatus!) {
    updateBookingStatus(bookingId: $bookingId, status: $status) {
      id
      status
    }
  }
`;

const DISPUTE_BOOKING_MUTATION = gql`
  mutation DisputeBooking($bookingId: Int!, $reason: String!) {
    disputeBooking(bookingId: $bookingId, reason: $reason) {
      id
      status
    }
  }
`;

const ProviderBookingsScreen: React.FC = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('ALL');

  // For now, we'll use a mock providerId. In a real app, you'd get this from the provider profile
  const providerId = 1; // This should come from the provider's profile

  const { data, loading, error, refetch } = useQuery(GET_PROVIDER_BOOKINGS_QUERY, {
    variables: { providerId },
    errorPolicy: 'all',
  });

  const [updateBookingStatus, { loading: updating }] = useMutation(
    UPDATE_BOOKING_STATUS_MUTATION,
    {
      refetchQueries: [{ query: GET_PROVIDER_BOOKINGS_QUERY, variables: { providerId } }],
    }
  );

  const [disputeBooking] = useMutation(DISPUTE_BOOKING_MUTATION, {
    refetchQueries: [{ query: GET_PROVIDER_BOOKINGS_QUERY, variables: { providerId } }],
  });

  const bookings: Booking[] = (data as any)?.providerBookings || [];

  const filteredBookings = filter === 'ALL' 
    ? bookings 
    : bookings.filter(booking => booking.status === filter);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = async (bookingId: number, status: string) => {
    try {
      await updateBookingStatus({
        variables: { bookingId, status },
      });
      Alert.alert('Success', `Booking ${status.toLowerCase()} successfully`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update booking status');
    }
  };

  const handleDisputeBooking = (booking: Booking) => {
    Alert.alert(
      'Dispute Booking',
      'Please select a reason for disputing this booking:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Customer No-Show',
          onPress: () => submitDispute(booking.id, 'Customer did not show up for the appointment'),
        },
        {
          text: 'Service Not Possible',
          onPress: () => submitDispute(booking.id, 'Service cannot be provided as requested'),
        },
        {
          text: 'Other Issue',
          onPress: () => submitDispute(booking.id, 'Other dispute reason'),
        },
      ]
    );
  };

  const submitDispute = async (bookingId: number, reason: string) => {
    try {
      await disputeBooking({
        variables: { bookingId, reason },
      });
      Alert.alert('Success', 'Dispute submitted successfully. We will review your case.');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to submit dispute. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#f59e0b';
      case 'CONFIRMED':
        return '#3b82f6';
      case 'IN_PROGRESS':
        return '#8b5cf6';
      case 'COMPLETED':
        return '#10b981';
      case 'CANCELLED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'time';
      case 'CONFIRMED':
        return 'checkmark-circle';
      case 'IN_PROGRESS':
        return 'play-circle';
      case 'COMPLETED':
        return 'checkmark-done-circle';
      case 'CANCELLED':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getAvailableActions = (booking: Booking) => {
    switch (booking.status) {
      case 'PENDING':
        return [
          { label: 'Accept', status: 'CONFIRMED', color: '#10b981', icon: 'checkmark' },
          { label: 'Decline', status: 'CANCELLED', color: '#ef4444', icon: 'close' },
        ];
      case 'CONFIRMED':
        return [
          { label: 'Start', status: 'IN_PROGRESS', color: '#8b5cf6', icon: 'play' },
          { label: 'Cancel', status: 'CANCELLED', color: '#ef4444', icon: 'close' },
        ];
      case 'IN_PROGRESS':
        return [
          { label: 'Complete', status: 'COMPLETED', color: '#10b981', icon: 'checkmark-done' },
        ];
      default:
        return [];
    }
  };

  const renderBooking = ({ item: booking }: { item: Booking }) => {
    const actions = getAvailableActions(booking);

    return (
      <View style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>
              {booking.providerService?.serviceType.name}
            </Text>
            <Text style={styles.customerName}>
              Customer: {booking.user?.name}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
            <Ionicons
              name={getStatusIcon(booking.status) as any}
              size={12}
              color="#ffffff"
            />
            <Text style={styles.statusText}>{booking.status}</Text>
          </View>
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{formatDate(booking.date)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time" size={16} color="#6b7280" />
            <Text style={styles.detailText}>
              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={16} color="#6b7280" />
            <Text style={styles.detailText} numberOfLines={1}>
              {booking.serviceAddress || 'Address not provided'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="pricetag" size={16} color="#6b7280" />
            <Text style={styles.detailText}>${booking.totalPrice}</Text>
          </View>
          {booking.user?.phone && (
            <View style={styles.detailRow}>
              <Ionicons name="call" size={16} color="#6b7280" />
              <Text style={styles.detailText}>{booking.user.phone}</Text>
            </View>
          )}
        </View>

        {booking.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Customer Notes:</Text>
            <Text style={styles.notesText}>{booking.notes}</Text>
          </View>
        )}

        {actions.length > 0 && (
          <View style={styles.actionsSection}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionButton, { backgroundColor: action.color }]}
                onPress={() => handleStatusUpdate(booking.id, action.status)}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name={action.icon as any} size={16} color="#ffffff" />
                    <Text style={styles.actionButtonText}>{action.label}</Text>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Dispute Button - Available for all statuses */}
        <View style={styles.disputeSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.disputeButton]}
            onPress={() => handleDisputeBooking(booking)}
          >
            <Ionicons name="flag" size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>Dispute</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const filters = ['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Failed to load bookings</Text>
          <Text style={styles.errorSubtext}>Please check your connection and try again</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterTab,
                filter === item && styles.activeFilterTab,
              ]}
              onPress={() => setFilter(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item && styles.activeFilterText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredBookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>
              {filter === 'ALL' ? 'No bookings yet' : `No ${filter.toLowerCase()} bookings`}
            </Text>
            <Text style={styles.emptySubtext}>
              {filter === 'ALL' 
                ? 'Your bookings will appear here once customers start booking your services'
                : `No bookings with ${filter.toLowerCase()} status found`
              }
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  activeFilterTab: {
    backgroundColor: '#2563eb',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bookingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  customerName: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  bookingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    color: '#6b7280',
    fontSize: 14,
    flex: 1,
  },
  notesSection: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 4,
  },
  disputeSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  disputeButton: {
    backgroundColor: '#f59e0b',
    marginHorizontal: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ProviderBookingsScreen;
