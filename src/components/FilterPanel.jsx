import React from 'react';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';

const FilterPanel = ({ filterOptions, filters, onFilterChange }) => {
  const hasActiveFilters = Object.values(filters).some(Boolean);

  // Get filter keys for structured layout
  const filterKeys = Object.keys(filterOptions);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* First Row of Filters */}
      <div className="flex flex-wrap gap-3 mb-3">
        {filterKeys.slice(0, 6).map((key) => (
          <select
            key={key}
            value={filters[key] || ''}
            onChange={(e) => onFilterChange(key, e.target.value)}
            className="filter-select flex-1 min-w-[140px]"
          >
            <option value="">
              {key === 'make' ? 'Select Brand' :
                key === 'country' ? 'Select Country' :
                  key === 'city' ? 'Select City' :
                    key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            </option>
            {filterOptions[key]?.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        ))}
      </div>

      {/* Second Row - Remaining Filters + Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {filterKeys.slice(6).map((key) => (
          <select
            key={key}
            value={filters[key] || ''}
            onChange={(e) => onFilterChange(key, e.target.value)}
            className="filter-select min-w-[140px]"
          >
            <option value="">
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            </option>
            {filterOptions[key]?.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        ))}

        {/* Search Button */}
        <button className="btn-primary">
          <Search className="w-4 h-4" />
          Search
        </button>

        {/* Advanced Filters Button */}
        <button className="btn-secondary">
          <SlidersHorizontal className="w-4 h-4" />
          Advanced Filters
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Clear All */}
        {hasActiveFilters && (
          <button
            onClick={() => onFilterChange('clear', null)}
            className="text-sm text-navy hover:text-navy-dark font-medium"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;
