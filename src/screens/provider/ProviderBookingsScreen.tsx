import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';


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
      paymentStatus
      completedAt
      paymentReleaseAt
      paymentReleasedAt
      providerPayout
      platformFee
      serviceAddress
      completionNotes
      completionPhotos
      customerNotifiedAt
      cancellationRequestedAt
      cancellationRequestedBy
      cancellationReason
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
        phone
      }
      providerService {
        id
        price
        duration
        description
        serviceType {
          id
          name
          category {
            id
            name
          }
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


const UPDATE_BOOKING_STATUS_MUTATION = gql`
  mutation UpdateBookingStatus($bookingId: Int!, $status: String!) {
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

const ProviderBookingsScreen = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // First, find the provider profile ID for this user
  const userId = user?.id ? parseInt(String(user.id)) : null;
  
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

  const { data, loading, error, refetch } = useQuery(GET_PROVIDER_BOOKINGS_QUERY, {
    variables: { providerId: actualProviderId },
    skip: !actualProviderId,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
  });



  const [updateBookingStatus] = useMutation(UPDATE_BOOKING_STATUS_MUTATION, {
    refetchQueries: [
      {
        query: GET_PROVIDER_BOOKINGS_QUERY,
        variables: { providerId: actualProviderId },
      },
    ],
  });

  const [disputeBooking] = useMutation(DISPUTE_BOOKING_MUTATION, {
    refetchQueries: [
      {
        query: GET_PROVIDER_BOOKINGS_QUERY,
        variables: { providerId: actualProviderId },
      },
    ],
  });

  const bookings = (data as any)?.providerBookings || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
    try {
      await updateBookingStatus({
        variables: {
          bookingId,
          status: newStatus,
        },
      });
      Alert.alert('Success', 'Booking status updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update booking status');
    }
  };

  const handleDispute = async (bookingId: number) => {
    Alert.prompt(
      'Dispute Booking',
      'Please provide a reason for disputing this booking:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Submit',
          onPress: async (reason) => {
            if (reason) {
              try {
                await disputeBooking({
                  variables: {
                    bookingId,
                    reason,
                  },
                });
                Alert.alert('Success', 'Dispute submitted successfully');
              } catch (error) {
                Alert.alert('Error', 'Failed to submit dispute');
              }
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#FFA500';
      case 'CONFIRMED':
        return '#007AFF';
      case 'IN_PROGRESS':
        return '#FF6B35';
      case 'COMPLETED':
        return '#34C759';
      case 'CANCELLED':
        return '#FF3B30';
      case 'DISPUTED':
        return '#FF9500';
      default:
        return '#8E8E93';
    }
  };

  const renderBookingItem = ({ item }: { item: any }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingId}>Booking #{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <Text style={styles.customerName}>{item.user?.name || 'Unknown Customer'}</Text>
        <Text style={styles.serviceInfo}>
          {item.providerService?.serviceType?.name} - ${item.providerService?.price}
        </Text>
        <Text style={styles.dateTime}>
          {item.date} at {item.startTime} - {item.endTime}
        </Text>
        <Text style={styles.address}>{item.serviceAddress || 'No address provided'}</Text>
        <Text style={styles.totalPrice}>Total: ${item.totalPrice}</Text>
      </View>

      {item.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        {item.status === 'PENDING' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => handleStatusUpdate(item.id, 'CONFIRMED')}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => handleStatusUpdate(item.id, 'CANCELLED')}
            >
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
          </>
        )}

        {item.status === 'CONFIRMED' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.startButton]}
            onPress={() => handleStatusUpdate(item.id, 'IN_PROGRESS')}
          >
            <Text style={styles.buttonText}>Start Service</Text>
          </TouchableOpacity>
        )}

        {item.status === 'IN_PROGRESS' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleStatusUpdate(item.id, 'COMPLETED')}
          >
            <Text style={styles.buttonText}>Complete Service</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.disputeButton]}
          onPress={() => handleDispute(item.id)}
        >
          <Text style={styles.buttonText}>Dispute</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!actualProviderId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Provider ID not found. Please log in again.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading bookings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading bookings: {error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</Text>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No bookings found</Text>
          <Text style={styles.emptyStateSubtext}>
            When customers book your services, they will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.bookingsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
  },
  bookingsList: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  bookingDetails: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  serviceInfo: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 6,
  },
  dateTime: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 6,
  },
  address: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 6,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28A745',
  },
  notesSection: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#6C757D',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#28A745',
  },
  declineButton: {
    backgroundColor: '#DC3545',
  },
  startButton: {
    backgroundColor: '#007AFF',
  },
  completeButton: {
    backgroundColor: '#6F42C1',
  },
  disputeButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6C757D',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#ADB5BD',
    textAlign: 'center',
    lineHeight: 22,
  },


  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
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
    backgroundColor: '#F8F9FA',
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
    color: '#6C757D',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default ProviderBookingsScreen;
