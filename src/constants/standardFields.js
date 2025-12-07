// Standard field definitions for the application
export const STANDARD_FIELDS = {
  // Grouping fields (used to create single listing)
  grouping: [
    { key: 'make', label: 'Make/Brand', required: true },
    { key: 'model', label: 'Model', required: true },
    { key: 'year', label: 'Year', required: true },
    { key: 'color', label: 'Color', required: true },
  ],
  // Listing fields (same for all cars in a listing)
  listing: [
    { key: 'variant', label: 'Variant' },
    { key: 'bodyType', label: 'Body Type' },
    { key: 'fuelType', label: 'Fuel Type' },
    { key: 'transmission', label: 'Transmission' },
    { key: 'drivetrain', label: 'Drivetrain' },
    { key: 'engineSize', label: 'Engine Size' },
    { key: 'cylinders', label: 'Cylinders' },
    { key: 'horsepower', label: 'Horsepower' },
    { key: 'seatingCapacity', label: 'Seating Capacity' },
    { key: 'doors', label: 'Number of Doors' },
    { key: 'condition', label: 'Condition' },
    { key: 'regionalSpecs', label: 'Regional Specs' },
    { key: 'city', label: 'City' },
    { key: 'country', label: 'Country' },
    { key: 'description', label: 'Description' },
  ],
  // Vehicle-specific fields (different for each car)
  vehicle: [
    { key: 'vin', label: 'VIN', required: true },
    { key: 'registrationNumber', label: 'Registration Number' },
    { key: 'mileage', label: 'Mileage' },
    { key: 'owners', label: 'Number of Owners' },
    { key: 'warranty', label: 'Warranty Period' },
    { key: 'price', label: 'Price' },
  ],
  // Smart combined fields (will be split automatically)
  combined: [
    {
      key: 'combined_make_model',
      label: '🔀 Make + Model (Combined)',
      description: 'Auto-splits "Audi A6" into Make: Audi, Model: A6',
      splitsTo: ['make', 'model'],
    },
    {
      key: 'combined_make_model_variant',
      label: '🔀 Make + Model + Variant (Combined)',
      description: 'Auto-splits "VW Tiguan 330TSI Luxury" into separate fields',
      splitsTo: ['make', 'model', 'variant'],
    },
    {
      key: 'combined_full_description',
      label: '🔀 Full Vehicle Description',
      description: 'Extracts color from description like "...Black Interior - Sky Blue"',
      splitsTo: ['variant', 'color'],
    },
  ],
};

// Get all fields as a flat array (excluding combined)
export const getAllFields = () => [
  ...STANDARD_FIELDS.grouping,
  ...STANDARD_FIELDS.listing,
  ...STANDARD_FIELDS.vehicle,
];

// Get all fields including combined options
export const getAllFieldsWithCombined = () => [
  ...STANDARD_FIELDS.grouping,
  ...STANDARD_FIELDS.listing,
  ...STANDARD_FIELDS.vehicle,
  ...STANDARD_FIELDS.combined,
];

// Get required field keys
export const getRequiredFields = () =>
  getAllFields().filter(f => f.required).map(f => f.key);

// Check if a field key is a combined field
export const isCombinedField = (fieldKey) =>
  STANDARD_FIELDS.combined.some(f => f.key === fieldKey);

// Get combined field info
export const getCombinedFieldInfo = (fieldKey) =>
  STANDARD_FIELDS.combined.find(f => f.key === fieldKey);
