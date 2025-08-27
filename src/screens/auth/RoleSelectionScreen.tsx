import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const RoleSelectionScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleRoleSelect = (role: 'CUSTOMER' | 'PROVIDER') => {
    navigation.navigate('Login', { role });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to On-Demand Services</Text>
        <Text style={styles.subtitle}>How would you like to use our platform?</Text>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect('CUSTOMER')}
          >
            <Ionicons name="person" size={48} color="#2563eb" />
            <Text style={styles.roleTitle}>I'm a Customer</Text>
            <Text style={styles.roleDescription}>
              Book services from verified providers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect('PROVIDER')}
          >
            <Ionicons name="briefcase" size={48} color="#2563eb" />
            <Text style={styles.roleTitle}>I'm a Provider</Text>
            <Text style={styles.roleDescription}>
              Offer services and manage bookings
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
    color: '#6b7280',
  },
  roleContainer: {
    gap: 24,
  },
  roleCard: {
    backgroundColor: '#ffffff',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#1f2937',
  },
  roleDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6b7280',
  },
});

export default RoleSelectionScreen;
