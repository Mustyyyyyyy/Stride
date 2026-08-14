import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { Search, Navigation, MapPin, Zap, Footprints, Bike, Mountain, ExternalLink } from 'lucide-react-native';
import { useActivityStore } from '../store/useActivityStore';

type PlaceCategory = 'all' | 'park' | 'trail' | 'gym' | 'landmark';

const SAVED_ROUTES = [
  {
    id: 'r1',
    title: 'Morning Golden Gate Run',
    type: 'RUNNING',
    distance: 8540,
    date: '2026-08-09',
  },
  {
    id: 'r2',
    title: 'Weekend Century Ride',
    type: 'CYCLING',
    distance: 102500,
    date: '2026-08-08',
  },
  {
    id: 'r3',
    title: 'Muir Woods Trail',
    type: 'HIKING',
    distance: 12500,
    date: '2026-08-07',
  },
];

export const MapsScreen: React.FC = () => {
  const { recentActivities } = useActivityStore();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<PlaceCategory>('all');
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  const routes = SAVED_ROUTES;

  const categories: { id: PlaceCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'park', label: 'Parks' },
    { id: 'trail', label: 'Trails' },
    { id: 'gym', label: 'Gyms' },
    { id: 'landmark', label: 'Landmarks' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'RUNNING': return <Zap size={18} color="#10b981" />;
      case 'WALKING': return <Footprints size={18} color="#06b6d4" />;
      case 'CYCLING': return <Bike size={18} color="#f97316" />;
      case 'HIKING': return <Mountain size={18} color="#a855f7" />;
      default: return <MapPin size={18} color="#64748b" />;
    }
  };

  const handleSearch = (place: string) => {
    const url = `https://www.google.com/maps/search/?api=1&q=${encodeURIComponent(place)}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={18} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search places..."
            placeholderTextColor="#64748b"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => query.trim() && handleSearch(query)}
          />
        </View>
        <TouchableOpacity
          onPress={() => query.trim() && handleSearch(query)}
          style={styles.searchBtn}
        >
          <Text style={styles.searchBtnText}>Go</Text>
        </TouchableOpacity>
      </View>

      {/* Map Area */}
      <View style={styles.mapArea}>
        <View style={styles.mapPlaceholder}>
          <MapPin size={32} color="#64748b" />
          <Text style={styles.mapPlaceholderText}>Map View</Text>
          <Text style={styles.mapPlaceholderSub}>Search places or view saved routes below</Text>
        </View>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setCategory(cat.id)}
            style={[styles.categoryChip, category === cat.id && styles.categoryChipActive]}
          >
            <Text style={[styles.categoryText, category === cat.id && styles.categoryTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Saved Routes */}
      <ScrollView style={styles.routesSection} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Saved Running Routes</Text>
        {routes.map((route) => (
          <TouchableOpacity
            key={route.id}
            onPress={() => setSelectedRoute(route.id)}
            style={[styles.routeCard, selectedRoute === route.id && styles.routeCardActive]}
          >
            <View style={styles.routeHeader}>
              <View style={styles.routeIconBox}>
                {getActivityIcon(route.type)}
              </View>
              <View style={styles.routeInfo}>
                <Text style={styles.routeTitle}>{route.title}</Text>
                <Text style={styles.routeMeta}>
                  {(route.distance / 1000).toFixed(1)} km • {new Date(route.date).toLocaleDateString()}
                </Text>
              </View>
              <ExternalLink size={16} color="#64748b" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    paddingVertical: 10,
  },
  searchBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: {
    color: '#090d16',
    fontWeight: '700',
    fontSize: 14,
  },
  mapArea: {
    height: 220,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapPlaceholderText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  mapPlaceholderSub: {
    color: '#64748b',
    fontSize: 12,
  },
  categoryRow: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  categoryText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#090d16',
    fontWeight: '700',
  },
  routesSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  routeCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 12,
  },
  routeCardActive: {
    borderColor: '#10b981',
    backgroundColor: '#10b98110',
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeInfo: {
    flex: 1,
  },
  routeTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  routeMeta: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
});
