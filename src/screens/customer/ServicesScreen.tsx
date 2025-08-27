import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { ProviderService } from '../../types';

const GET_SERVICES_QUERY = gql`
  query GetServices($categoryId: Int) {
    services(categoryId: $categoryId) {
      id
      price
      duration
      description
      images
      isActive
      provider {
        id
        user {
          id
          name
        }
        rating
        totalReviews
        isVerified
      }
      serviceType {
        id
        name
        description
        category {
          id
          name
        }
      }
    }
  }
`;

const ServicesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [searchText, setSearchText] = useState('');

  const categoryId = route.params?.categoryId;
  const categoryName = route.params?.categoryName;

  const { data, loading, error } = useQuery(GET_SERVICES_QUERY, {
    variables: { categoryId },
    errorPolicy: 'all',
  });

  const services = (data as any)?.services || [];

  // Filter services by category (client-side safeguard), active status, and search text
  const filteredServices = services.filter((service: ProviderService) => {
    // Only show active services
    if (!service.isActive) return false;
    
    // If categoryId is provided, ensure service belongs to that category
    const matchesCategory = !categoryId || service.serviceType.category.id === categoryId;
    
    // Search filter
    const matchesSearch = !searchText || 
      service.serviceType.name.toLowerCase().includes(searchText.toLowerCase()) ||
      service.provider.user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      service.serviceType.category.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchText.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const handleServicePress = (service: ProviderService) => {
    navigation.navigate('Booking', { service });
  };

  const renderService = ({ item: service }: { item: ProviderService }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => handleServicePress(service)}
    >
      {service.images && service.images.length > 0 ? (
        <Image source={{ uri: service.images[0] }} style={styles.serviceImage} />
      ) : (
        <View style={[styles.serviceImage, styles.placeholderImage]}>
          <Ionicons name="image" size={32} color="#9ca3af" />
        </View>
      )}

      <View style={styles.serviceContent}>
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceName}>{service.serviceType.name}</Text>
          <Text style={styles.servicePrice}>${service.price}</Text>
        </View>

        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{service.provider.user.name}</Text>
          {service.provider.isVerified && (
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          )}
        </View>

        {service.provider.rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text style={styles.ratingText}>
              {service.provider.rating.toFixed(1)} ({service.provider.totalReviews} reviews)
            </Text>
          </View>
        )}

        {service.description && (
          <Text style={styles.serviceDescription} numberOfLines={2}>
            {service.description}
          </Text>
        )}

        <View style={styles.serviceMeta}>
          <View style={styles.durationContainer}>
            <Ionicons name="time" size={14} color="#6b7280" />
            <Text style={styles.durationText}>{service.duration} min</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Failed to load services</Text>
          <Text style={styles.errorSubtext}>Please check your connection and try again</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {categoryName ? `${categoryName} Services` : 'All Services'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services or providers..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Services List */}
      <FlatList
        data={filteredServices}
        renderItem={renderService}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>No services found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or browse different categories
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    marginLeft: 12,
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  serviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
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
  serviceImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeholderImage: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceContent: {
    padding: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  providerName: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
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

export default ServicesScreen;
