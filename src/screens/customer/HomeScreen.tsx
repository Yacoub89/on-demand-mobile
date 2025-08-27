import React, { useState } from 'react';
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
import { Category } from '../../types';

const { width } = Dimensions.get('window');

const GET_CATEGORIES_QUERY = gql`
  query GetCategories {
    categories {
      id
      name
      icon
      isActive
      sortOrder
    }
  }
`;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const { data, loading, error } = useQuery(GET_CATEGORIES_QUERY, {
    errorPolicy: 'all',
  });

  const categories = (data as any)?.categories || [];

  // Icon mapping for categories (maps emojis and names to valid Ionicons)
  const iconMapping: { [key: string]: { icon: string; color: string } } = {
    // Emoji mappings
    '🏠': { icon: 'home-outline', color: '#3b82f6' },
    '🔨': { icon: 'hammer-outline', color: '#f59e0b' },
    '💅': { icon: 'cut-outline', color: '#ec4899' },
    '💇': { icon: 'cut-outline', color: '#ec4899' },
    '💄': { icon: 'sparkles-outline', color: '#ec4899' },
    '🦶': { icon: 'footsteps-outline', color: '#8b5cf6' },
    '🧖': { icon: 'person-outline', color: '#ec4899' },
    '🪒': { icon: 'cut-outline', color: '#ec4899' },
    '🎨': { icon: 'color-palette-outline', color: '#ec4899' },
    '✨': { icon: 'sparkles-outline', color: '#ec4899' },
    '🌸': { icon: 'flower-outline', color: '#ec4899' },
    '🧘': { icon: 'fitness-outline', color: '#ef4444' },
    '💪': { icon: 'fitness-outline', color: '#ef4444' },
    '📚': { icon: 'book-outline', color: '#10b981' },
    '🐕': { icon: 'paw-outline', color: '#8b5cf6' },
    '🐾': { icon: 'paw-outline', color: '#8b5cf6' },
    '🚗': { icon: 'car-outline', color: '#f59e0b' },
    '💻': { icon: 'laptop-outline', color: '#6366f1' },
    
    // Name mappings
    'Cleaning': { icon: 'home-outline', color: '#3b82f6' },
    'Handyman': { icon: 'hammer-outline', color: '#f59e0b' },
    'Beauty': { icon: 'cut-outline', color: '#ec4899' },
    'Beauty & Personal Care': { icon: 'cut-outline', color: '#ec4899' },
    'Personal Care': { icon: 'sparkles-outline', color: '#ec4899' },
    'Tutoring': { icon: 'book-outline', color: '#10b981' },
    'Education': { icon: 'book-outline', color: '#10b981' },
    'Fitness': { icon: 'fitness-outline', color: '#ef4444' },
    'Health & Wellness': { icon: 'fitness-outline', color: '#ef4444' },
    'Pet Care': { icon: 'paw-outline', color: '#8b5cf6' },
    'Home Services': { icon: 'home-outline', color: '#3b82f6' },
    'Technology': { icon: 'laptop-outline', color: '#6366f1' },
    'Automotive': { icon: 'car-outline', color: '#f59e0b' },
    'Transportation': { icon: 'car-outline', color: '#f59e0b' },
  };

  const getCategoryIcon = (category: Category) => {
    // Try to match by icon (emoji) first, then by name
    const mapping = iconMapping[category.icon || ''] || iconMapping[category.name] || { icon: 'grid-outline', color: '#6b7280' };
    return {
      icon: mapping.icon,
      color: mapping.color,
    };
  };

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('Services', { categoryId: category.id, categoryName: category.name });
  };

  const renderCategories = () => {
    if (loading) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Categories</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading categories...</Text>
          </View>
        </View>
      );
    }

    if (error || !categories || categories.length === 0) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Categories</Text>
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={32} color="#ef4444" />
            <Text style={styles.errorText}>Unable to load categories</Text>
          </View>
        </View>
      );
    }

    // Filter active categories and get top 4, sorted by sortOrder
    const activeCategories = categories
      .filter((category: Category) => category.isActive)
      .sort((a: Category, b: Category) => a.sortOrder - b.sortOrder)
      .slice(0, 4); // Show only top 4 categories

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Categories</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Services')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.categoriesGrid}>
          {activeCategories.map((category: Category) => {
            const { icon, color } = getCategoryIcon(category);
            return (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: color }]}>
                  <Ionicons name={icon as any} size={24} color="#ffffff" />
                </View>
                <Text style={styles.categoryName}>{category.name || 'Category'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name || 'User'}!</Text>
            <Text style={styles.subtitle}>What service do you need today?</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Services')}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <Text style={styles.searchText}>Search for services...</Text>
        </TouchableOpacity>

        {/* Categories */}
        {renderCategories()}

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Bookings')}
            >
              <Ionicons name="calendar" size={24} color="#2563eb" />
              <Text style={styles.actionTitle}>My Bookings</Text>
              <Text style={styles.actionSubtitle}>View your upcoming appointments</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Services')}
            >
              <Ionicons name="star" size={24} color="#f59e0b" />
              <Text style={styles.actionTitle}>Top Rated</Text>
              <Text style={styles.actionSubtitle}>Browse highly rated services</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>
          <View style={styles.activityCard}>
            <Ionicons name="time" size={20} color="#6b7280" />
            <Text style={styles.activityText}>
              You haven't booked any services yet. Start exploring!
            </Text>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 20,
    marginTop: 10,
    padding: 16,
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
  searchText: {
    marginLeft: 12,
    color: '#6b7280',
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563eb',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: Math.max((width - 64) / 3, 90), // Minimum width of 90px for very small screens
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
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
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
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
  activityText: {
    marginLeft: 12,
    color: '#6b7280',
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 8,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
});

export default HomeScreen;
