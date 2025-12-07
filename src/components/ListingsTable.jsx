import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Eye, Car, Grid, List, ShoppingCart, Star, CheckCircle } from 'lucide-react';

const ListingsTable = ({ listings, selectedIds, onSelectionChange, onViewDetail }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [viewMode, setViewMode] = useState('table');

  const sortedListings = useMemo(() => {
    if (!sortConfig.key) return listings;
    return [...listings].sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [listings, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectAll = (e) => {
    onSelectionChange(e.target.checked ? listings.map(l => l.id) : []);
  };

  const handleSelectOne = (id) => {
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter(i => i !== id)
        : [...selectedIds, id]
    );
  };

  // Get condition badge based on actual listing data only
  const getConditionBadge = (listing) => {
    const condition = listing.condition?.toLowerCase();
    if (!condition) return null; // No badge if no condition data

    if (condition.includes('new') || condition.includes('like new')) {
      return { text: 'Like New', className: 'badge-like-new' };
    } else if (condition.includes('excellent')) {
      return { text: 'Excellent', className: 'badge-excellent' };
    } else if (condition.includes('good')) {
      return { text: 'Good', className: 'badge-good' };
    }
    return { text: listing.condition, className: 'badge-used' };
  };



  const getRegionalSpec = (listing) => {
    return listing.regionalSpecs || null;
  };

  return (
    <div>
      {/* Table Header Bar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-700 font-medium">
          Showing <span className="text-navy font-semibold">{listings.length}</span> vehicles
        </p>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="toggle-group">
            <button
              className={`toggle-btn ${viewMode === 'grid' ? '' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
              Grid
            </button>
            <button
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <List className="w-4 h-4" />
              Table
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            className="filter-select"
            onChange={(e) => {
              const [key, dir] = e.target.value.split('-');
              setSortConfig({ key, direction: dir });
            }}
          >
            <option value="">Price: Low to High</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="year-desc">Year: Newest First</option>
            <option value="year-asc">Year: Oldest First</option>
            <option value="mileage-asc">Mileage: Low to High</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="p-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === listings.length && listings.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-navy focus:ring-navy"
                  />
                </th>
                <th className="p-4 text-left font-medium text-gray-600">Image</th>
                <th className="p-4 text-left font-medium text-gray-600">Vehicle Info</th>
                <th className="p-4 text-left font-medium text-gray-600">Seller</th>
                <th className="p-4 text-left font-medium text-gray-600">Regional Specs</th>
                <th className="p-4 text-left font-medium text-gray-600">Mileage</th>
                <th className="p-4 text-left font-medium text-gray-600">Price</th>
                <th className="p-4 text-center font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedListings.map(listing => {
                const conditionBadge = getConditionBadge(listing);
                const regionalSpec = getRegionalSpec(listing);
                const minPrice = listing.vehicles?.length > 0
                  ? Math.min(...listing.vehicles.map(v => v.price || 0).filter(p => p > 0))
                  : 0;
                const avgMileage = listing.vehicles?.length > 0
                  ? Math.round(listing.vehicles.reduce((sum, v) => sum + (parseInt(v.mileage) || 0), 0) / listing.vehicles.length)
                  : 0;

                return (
                  <tr key={listing.id} className="table-row">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(listing.id)}
                        onChange={() => handleSelectOne(listing.id)}
                        className="w-4 h-4 rounded border-gray-300 text-navy focus:ring-navy"
                      />
                    </td>

                    {/* Image Column */}
                    <td className="p-4">
                      <div className="relative w-24 h-16 image-placeholder rounded-lg">
                        <Car className="w-8 h-8" />
                        {/* Condition Badge Overlay - only if condition is mapped */}
                        {conditionBadge && (
                          <div className="absolute top-1 left-1">
                            <span className={`badge ${conditionBadge.className} text-xs`}>
                              {conditionBadge.text}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Vehicle Info Column */}
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-navy">
                          {listing.year} {listing.make} {listing.model}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          <span className="text-gray-400">Transmission:</span> {listing.transmission || ''} <span className="mx-1">•</span> <span className="text-gray-400">Fuel:</span> {listing.fuelType || ''}
                        </p>
                        <p className="text-sm text-gray-400 mt-0.5">
                          <span className="text-gray-400">City:</span> {listing.city || ''}, <span className="text-gray-400">Country:</span> {listing.country || ''}
                        </p>
                      </div>
                    </td>

                    {/* Seller Column - only show if seller data exists */}
                    <td className="p-4">
                      <p className="text-gray-500"></p>
                    </td>

                    {/* Regional Specs Column */}
                    <td className="p-4">
                      {regionalSpec ? (
                        <span className="badge-regional">
                          {regionalSpec}
                        </span>
                      ) : (
                        <span className="text-gray-500"></span>
                      )}
                    </td>

                    {/* Mileage Column */}
                    <td className="p-4 text-gray-700">
                      {avgMileage > 0 ? `${avgMileage.toLocaleString()} km` : ''}
                    </td>

                    {/* Price Column */}
                    <td className="p-4">
                      <p className="font-semibold text-navy">
                        {minPrice > 0
                          ? `AED ${minPrice.toLocaleString()}`
                          : ''
                        }
                      </p>
                      {listing.count > 1 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {listing.count} available
                        </p>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="p-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => onViewDetail(listing)}
                          className="btn-primary text-xs justify-center"
                        >
                          View Details
                        </button>
                        <button className="btn-secondary text-xs justify-center">
                          <ShoppingCart className="w-3 h-3" />
                          Add to Cart
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {listings.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <Car className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No listings found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingsTable;
