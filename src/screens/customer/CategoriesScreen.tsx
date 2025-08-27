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

const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation<any>();

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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      );
    }

    if (error || !categories || categories.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={32} color="#ef4444" />
          <Text style={styles.errorText}>Unable to load categories</Text>
        </View>
      );
    }

    // Filter active categories and sort by sortOrder
    const activeCategories = categories
      .filter((category: Category) => category.isActive)
      .sort((a: Category, b: Category) => a.sortOrder - b.sortOrder);

    return (
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
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Categories</Text>
          <Text style={styles.subtitle}>Choose a service category</Text>
        </View>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <Text style={styles.searchText}>Search categories...</Text>
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.section}>
          {renderCategories()}
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
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
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
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 72) / 2, // 2 columns with gaps
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
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
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
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

export default CategoriesScreen;
