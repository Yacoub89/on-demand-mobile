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

const GET_USER_BOOKINGS_QUERY = gql`
  query UserBookings($userId: Int!) {
    userBookings(userId: $userId) {
      id
      date
      startTime
      endTime
      status
      totalPrice
      paymentStatus
      completedAt
      serviceAddress
      notes
      providerService {
        id
        serviceType {
          name
        }
        provider {
          user {
            id
            name
          }
        }
      }
      review {
        id
        rating
        comment
      }
    }
  }
`;

const CANCEL_BOOKING_MUTATION = gql`
  mutation CancelBooking($bookingId: Int!) {
    cancelBooking(bookingId: $bookingId) {
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

const BookingsScreen: React.FC = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_USER_BOOKINGS_QUERY, {
    variables: { userId: parseInt(user?.id || '0') },
    skip: !user,
    errorPolicy: 'all',
  });

  const [cancelBooking] = useMutation(CANCEL_BOOKING_MUTATION);
  const [disputeBooking] = useMutation(DISPUTE_BOOKING_MUTATION);

  const bookings: Booking[] = (data as any)?.userBookings || [];

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelBooking = (booking: Booking) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your ${booking.providerService?.serviceType.name} booking?`,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking({
                variables: { bookingId: booking.id },
                refetchQueries: [{ query: GET_USER_BOOKINGS_QUERY, variables: { userId: parseInt(user?.id || '0') } }],
              });
              Alert.alert('Success', 'Booking cancelled successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking. Please try again.');
            }
          },
        },
      ]
    );
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
          text: 'Service Not Provided',
          onPress: () => submitDispute(booking.id, 'Service was not provided as agreed'),
        },
        {
          text: 'Poor Quality',
          onPress: () => submitDispute(booking.id, 'Service quality was unsatisfactory'),
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
        refetchQueries: [{ query: GET_USER_BOOKINGS_QUERY, variables: { userId: parseInt(user?.id || '0') } }],
      });
      Alert.alert('Success', 'Dispute submitted successfully. We will review your case.');
    } catch (error) {
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

  const renderBooking = ({ item: booking }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>
            {booking.providerService?.serviceType.name}
          </Text>
          <Text style={styles.providerName}>
            by {booking.providerService?.provider.user.name}
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
      </View>

      {booking.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{booking.notes}</Text>
        </View>
      )}

      {booking.status === 'COMPLETED' && !booking.review && (
        <TouchableOpacity style={styles.reviewButton}>
          <Ionicons name="star" size={16} color="#f59e0b" />
          <Text style={styles.reviewButtonText}>Leave a Review</Text>
        </TouchableOpacity>
      )}

      {booking.review && (
        <View style={styles.reviewSection}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewLabel}>Your Review:</Text>
            <View style={styles.rating}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name="star"
                  size={14}
                  color={i < booking.review!.rating ? '#f59e0b' : '#e5e7eb'}
                />
              ))}
            </View>
          </View>
          {booking.review.comment && (
            <Text style={styles.reviewComment}>{booking.review.comment}</Text>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelBooking(booking)}
          >
            <Ionicons name="close-circle" size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        
        {(booking.status === 'COMPLETED' || booking.status === 'CANCELLED') && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.disputeButton]}
            onPress={() => handleDisputeBooking(booking)}
          >
            <Ionicons name="flag" size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>Dispute</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading your bookings...</Text>
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

      <FlatList
        data={bookings}
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
            <Text style={styles.emptyText}>No bookings yet</Text>
            <Text style={styles.emptySubtext}>
              Book your first service to see it here
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
  providerName: {
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
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 8,
  },
  reviewButtonText: {
    marginLeft: 4,
    color: '#f59e0b',
    fontWeight: '600',
  },
  reviewSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  rating: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  disputeButton: {
    backgroundColor: '#f59e0b',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BookingsScreen;
