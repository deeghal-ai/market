// Common column name variations for auto-mapping
// Add more synonyms as you encounter different dealer formats
export const COLUMN_SYNONYMS = {
  // Grouping fields
  make: ['make', 'brand', 'manufacturer', 'oem', 'car make', 'vehicle make'],
  model: ['model', 'model name', 'car model', 'vehicle model'],
  year: ['year', 'model year', 'manufacturing year', 'mfg year', 'yr', 'production year'],
  color: ['color', 'colour', 'exterior color', 'body color', 'ext color', 'paint color'],
  
  // Listing fields
  variant: ['variant', 'trim', 'trim level', 'version', 'grade', 'spec level'],
  bodyType: ['body type', 'body', 'type', 'body style', 'vehicle type', 'car type'],
  fuelType: ['fuel type', 'fuel', 'engine type', 'power type', 'propulsion'],
  transmission: ['transmission', 'gearbox', 'trans', 'gear type', 'transmission type'],
  drivetrain: ['drivetrain', 'drive', 'drive type', 'wheel drive', 'driven wheels'],
  engineSize: ['engine size', 'engine', 'displacement', 'cc', 'engine capacity', 'engine cc', 'liters', 'litres'],
  cylinders: ['cylinders', 'cyl', 'no of cylinders', 'cylinder count', 'cyls'],
  horsepower: ['horsepower', 'hp', 'power', 'bhp', 'horse power', 'ps', 'kw'],
  seatingCapacity: ['seating capacity', 'seats', 'seating', 'passengers', 'no of seats', 'seat count'],
  doors: ['doors', 'number of doors', 'no of doors', 'door count'],
  condition: ['condition', 'vehicle condition', 'state', 'car condition'],
  regionalSpecs: ['regional specs', 'specs', 'specification', 'region', 'market'],
  city: ['city', 'location', 'dealer city'],
  country: ['country', 'nation', 'dealer country'],
  description: ['description', 'details', 'about', 'notes', 'remarks', 'comments'],
  
  // Vehicle-specific fields
  vin: ['vin', 'vehicle identification number', 'chassis number', 'chassis', 'vin number', 'chassis no'],
  registrationNumber: ['registration number', 'reg number', 'registration', 'plate number', 'license plate', 'number plate', 'reg no', 'plate'],
  mileage: ['mileage', 'kms driven', 'kilometers', 'odometer', 'odometer reading', 'km', 'miles', 'kms', 'distance', 'run'],
  owners: ['owners', 'no of owners', 'number of owners', 'previous owners', 'owner count', 'ownership'],
  warranty: ['warranty', 'warranty period', 'warranty status', 'warranty remaining'],
  price: ['price', 'asking price', 'cost', 'amount', 'selling price', 'rate', 'value'],
};

/**
 * Auto-detect mapping based on column names
 * @param {string[]} columns - Array of column names from uploaded file
 * @returns {Object} - Mapping of column name to standard field key
 */
export const autoDetectMapping = (columns) => {
  const mapping = {};
  const usedFields = new Set();
  
  columns.forEach(col => {
    const normalizedCol = col.toLowerCase().trim();
    
    for (const [fieldKey, synonyms] of Object.entries(COLUMN_SYNONYMS)) {
      // Skip if this field is already mapped
      if (usedFields.has(fieldKey)) continue;
      
      // Check for exact match first, then partial match
      const isMatch = synonyms.some(syn => 
        normalizedCol === syn || 
        normalizedCol.includes(syn) ||
        syn.includes(normalizedCol)
      );
      
      if (isMatch) {
        mapping[col] = fieldKey;
        usedFields.add(fieldKey);
        break;
      }
    }
  });
  
  return mapping;
};

/**
 * Add a new synonym for a field
 * @param {string} fieldKey - The standard field key
 * @param {string} synonym - The new synonym to add
 */
export const addSynonym = (fieldKey, synonym) => {
  if (COLUMN_SYNONYMS[fieldKey]) {
    const normalizedSynonym = synonym.toLowerCase().trim();
    if (!COLUMN_SYNONYMS[fieldKey].includes(normalizedSynonym)) {
      COLUMN_SYNONYMS[fieldKey].push(normalizedSynonym);
    }
  }
};
