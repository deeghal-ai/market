import { useState, useMemo, useCallback } from 'react';
import { groupVehiclesIntoListings, transformToVehicles } from '../utils/groupingLogic';

/**
 * Custom hook for managing listings state
 * Handles filtering, selection, and CRUD operations
 */
export const useListings = () => {
  const [listings, setListings] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filters, setFilters] = useState({});

  // Import vehicles and create listings
  const importVehicles = useCallback((rawData, mapping) => {
    const vehicles = transformToVehicles(rawData, mapping);
    const groupedListings = groupVehiclesIntoListings(vehicles);
    setListings(groupedListings);
    setSelectedIds([]);
    setFilters({});
  }, []);

  // Filter listings based on current filters
  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return String(listing[key]).toLowerCase() === String(value).toLowerCase();
      });
    });
  }, [listings, filters]);

  // Get unique values for filter dropdowns
  const filterOptions = useMemo(() => ({
    make: [...new Set(listings.map(l => l.make).filter(Boolean))].sort(),
    model: [...new Set(listings.map(l => l.model).filter(Boolean))].sort(),
    year: [...new Set(listings.map(l => l.year).filter(Boolean))].sort((a, b) => b - a),
    color: [...new Set(listings.map(l => l.color).filter(Boolean))].sort(),
    bodyType: [...new Set(listings.map(l => l.bodyType).filter(Boolean))].sort(),
    fuelType: [...new Set(listings.map(l => l.fuelType).filter(Boolean))].sort(),
    transmission: [...new Set(listings.map(l => l.transmission).filter(Boolean))].sort(),
  }), [listings]);

  // Update a single filter
  const setFilter = useCallback((key, value) => {
    if (key === 'clear') {
      setFilters({});
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  }, []);

  // Selection handlers
  const selectAll = useCallback(() => {
    setSelectedIds(filteredListings.map(l => l.id));
  }, [filteredListings]);

  const deselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const toggleSelection = useCallback((id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    );
  }, []);

  const setSelection = useCallback((ids) => {
    setSelectedIds(ids);
  }, []);

  // Bulk delete
  const deleteSelected = useCallback(() => {
    setListings(prev => prev.filter(l => !selectedIds.includes(l.id)));
    setSelectedIds([]);
  }, [selectedIds]);

  // Delete single listing
  const deleteListing = useCallback((id) => {
    setListings(prev => prev.filter(l => l.id !== id));
    setSelectedIds(prev => prev.filter(i => i !== id));
  }, []);

  // Reset everything
  const reset = useCallback(() => {
    setListings([]);
    setSelectedIds([]);
    setFilters({});
  }, []);

  // Stats
  const stats = useMemo(() => ({
    totalListings: listings.length,
    totalVehicles: listings.reduce((sum, l) => sum + l.count, 0),
    filteredCount: filteredListings.length,
    selectedCount: selectedIds.length,
  }), [listings, filteredListings, selectedIds]);

  return {
    // State
    listings,
    filteredListings,
    selectedIds,
    filters,
    filterOptions,
    stats,
    
    // Actions
    importVehicles,
    setFilter,
    selectAll,
    deselectAll,
    toggleSelection,
    setSelection,
    deleteSelected,
    deleteListing,
    reset,
  };
};

export default useListings;
