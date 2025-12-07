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
};

// Get all fields as a flat array
export const getAllFields = () => [
  ...STANDARD_FIELDS.grouping,
  ...STANDARD_FIELDS.listing,
  ...STANDARD_FIELDS.vehicle,
];

// Get required field keys
export const getRequiredFields = () => 
  getAllFields().filter(f => f.required).map(f => f.key);
