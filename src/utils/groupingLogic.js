/**
 * Grouping Logic for Vehicle Listings
 * 
 * This module handles the core logic of grouping individual vehicles
 * into listings based on matching criteria (make, model, year, color).
 */

// Fields used for grouping vehicles into a single listing
const GROUPING_KEYS = ['make', 'model', 'year', 'color'];

// Fields that are listing-level (same for all vehicles in listing)
const LISTING_KEYS = [
  'variant', 'bodyType', 'fuelType', 'transmission', 'drivetrain',
  'engineSize', 'cylinders', 'horsepower', 'seatingCapacity', 'doors',
  'condition', 'regionalSpecs', 'city', 'country', 'description'
];

// Fields that are vehicle-specific (different for each vehicle)
const VEHICLE_KEYS = ['vin', 'registrationNumber', 'mileage', 'owners', 'warranty', 'price'];

/**
 * Generate a unique key for grouping vehicles
 * @param {Object} vehicle - Vehicle data
 * @returns {string} - Unique grouping key
 */
export const generateListingKey = (vehicle) => {
  return GROUPING_KEYS
    .map(key => String(vehicle[key] || '').toLowerCase().trim())
    .join('_');
};

/**
 * Group an array of vehicles into listings
 * @param {Object[]} vehicles - Array of vehicle objects
 * @returns {Object[]} - Array of listing objects with nested vehicles
 */
export const groupVehiclesIntoListings = (vehicles) => {
  const groups = {};
  
  vehicles.forEach(vehicle => {
    const key = generateListingKey(vehicle);
    
    if (!groups[key]) {
      // Create new listing with grouping and listing-level fields
      groups[key] = {
        id: key,
        // Grouping fields
        ...GROUPING_KEYS.reduce((acc, k) => ({ ...acc, [k]: vehicle[k] }), {}),
        // Listing fields (take from first vehicle)
        ...LISTING_KEYS.reduce((acc, k) => ({ ...acc, [k]: vehicle[k] }), {}),
        // Initialize vehicles array and count
        vehicles: [],
        count: 0,
      };
    }
    
    // Add vehicle-specific data
    groups[key].vehicles.push(
      VEHICLE_KEYS.reduce((acc, k) => ({ ...acc, [k]: vehicle[k] }), {})
    );
    groups[key].count++;
  });
  
  return Object.values(groups);
};

/**
 * Transform raw data using column mapping to standard vehicle format
 * @param {Object[]} rawData - Raw data from Excel
 * @param {Object} mapping - Column to field mapping
 * @returns {Object[]} - Array of standardized vehicle objects
 */
export const transformToVehicles = (rawData, mapping) => {
  // Create reverse mapping: fieldKey -> originalColumnName
  const reverseMapping = {};
  Object.entries(mapping).forEach(([col, field]) => {
    reverseMapping[field] = col;
  });
  
  return rawData.map(row => {
    const vehicle = {};
    Object.entries(reverseMapping).forEach(([field, col]) => {
      vehicle[field] = row[col];
    });
    return vehicle;
  });
};

/**
 * Get summary statistics for listings
 * @param {Object[]} listings - Array of listings
 * @returns {Object} - Statistics object
 */
export const getListingsStats = (listings) => {
  return {
    totalListings: listings.length,
    totalVehicles: listings.reduce((sum, l) => sum + l.count, 0),
    avgVehiclesPerListing: listings.length > 0 
      ? (listings.reduce((sum, l) => sum + l.count, 0) / listings.length).toFixed(1)
      : 0,
    uniqueMakes: [...new Set(listings.map(l => l.make).filter(Boolean))].length,
  };
};
