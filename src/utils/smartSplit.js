/**
 * Smart Split Utility
 * Handles detection and splitting of combined fields like "Make + Model" or "Make + Model + Variant"
 */

// Comprehensive list of known car makes for pattern matching
export const KNOWN_MAKES = [
  // German
  'Volkswagen', 'VW', 'Audi', 'BMW', 'Mercedes', 'Mercedes-Benz', 'Porsche', 'Opel',
  // Japanese
  'Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki', 'Lexus', 'Infiniti', 'Acura',
  // Korean
  'Hyundai', 'Kia', 'Genesis',
  // American
  'Ford', 'Chevrolet', 'Chevy', 'GMC', 'Dodge', 'Jeep', 'Chrysler', 'Cadillac', 'Lincoln', 'Buick', 'Tesla',
  // European
  'Volvo', 'Peugeot', 'Renault', 'Citroen', 'Fiat', 'Alfa Romeo', 'Seat', 'Skoda', 'Saab',
  // British
  'Land Rover', 'Range Rover', 'Jaguar', 'Mini', 'Bentley', 'Rolls-Royce', 'Aston Martin', 'McLaren',
  // Italian
  'Ferrari', 'Lamborghini', 'Maserati',
  // Chinese
  'BYD', 'Geely', 'Great Wall', 'Haval', 'Chery', 'SAIC', 'NIO', 'XPeng', 'Li Auto', 'Dongfeng', 'FAW',
  'Changan', 'GAC', 'BAIC', 'JAC', 'Zotye', 'Foton', 'Wuling', 'Baojun', 'Roewe', 'MG', 'Lynk & Co',
  // Other
  'Tata', 'Mahindra', 'Proton', 'Perodua',
];

// Normalize make names (handle variations)
const MAKE_ALIASES = {
  'VW': 'Volkswagen',
  'Chevy': 'Chevrolet',
  'Mercedes-Benz': 'Mercedes',
  'Range Rover': 'Land Rover', // Range Rover is a Land Rover model
};

// Helper function to escape special regex characters
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');

/**
 * Detect if a column likely contains combined Make+Model data
 * @param {string[]} sampleValues - Array of sample values from the column
 * @returns {Object} - { isCombined: boolean, confidence: number, detectedMakes: string[] }
 */
export const detectCombinedMakeModel = (sampleValues) => {
  if (!sampleValues || sampleValues.length === 0) {
    return { isCombined: false, confidence: 0, detectedMakes: [] };
  }

  const detectedMakes = new Set();
  let matchCount = 0;

  // Check each value for known makes
  sampleValues.forEach(value => {
    if (!value || typeof value !== 'string') return;

    const normalizedValue = value.trim();

    for (const make of KNOWN_MAKES) {
      // Check if the value contains the make name anywhere (case insensitive)
      // This catches both standard (Audi A6) and inverted (GAC Honda) patterns
      const regex = new RegExp(`\\b${escapeRegex(make)}\\b`, 'i');
      if (regex.test(normalizedValue)) {
        detectedMakes.add(make);
        matchCount++;
        break;
      }
    }
  });

  const confidence = matchCount / sampleValues.filter(v => v).length;

  return {
    isCombined: confidence > 0.3, // If 30%+ values contain known makes, it's likely combined
    confidence,
    detectedMakes: Array.from(detectedMakes),
  };
};

// Chinese joint venture parent company names (these prefix the actual make)
const PARENT_COMPANIES = [
  'GAC', 'SAIC', 'FAW', 'Dongfeng', 'BAIC', 'Changan', 'Brilliance', 'Beijing',
  'Guangzhou', 'Shanghai', 'Geely', 'Great Wall', 'Chery', 'BYD',
];

/**
 * Split a combined Make+Model value into separate parts
 * Handles both standard ("Audi A6") and inverted ("GAC Honda") patterns
 * @param {string} value - The combined value like "Volkswagen Tiguan L 2017 330TSI" or "GAC Honda"
 * @returns {Object} - { make, model, variant, year }
 */
export const splitMakeModel = (value) => {
  if (!value || typeof value !== 'string') {
    return { make: '', model: '', variant: '', year: '' };
  }

  const trimmed = value.trim();
  let make = '';
  let remainder = trimmed;
  let parentCompany = '';

  // Find the make by checking against known makes (longest match first)
  const sortedMakes = [...KNOWN_MAKES].sort((a, b) => b.length - a.length);

  // First, try to find make at the START of the string (standard pattern)
  for (const knownMake of sortedMakes) {
    const regex = new RegExp(`^${escapeRegex(knownMake)}\\b`, 'i');
    const match = trimmed.match(regex);
    if (match) {
      make = MAKE_ALIASES[match[0]] || match[0];
      // Normalize capitalization
      make = make.charAt(0).toUpperCase() + make.slice(1).toLowerCase();
      if (make === 'Vw') make = 'Volkswagen';
      if (make === 'Bmw') make = 'BMW';
      remainder = trimmed.slice(match[0].length).trim();
      break;
    }
  }

  // If no make found at start, check for INVERTED pattern (e.g., "GAC Honda", "SAIC Volkswagen")
  // In these cases, a parent company comes first, then the known make
  if (!make) {
    // Check if first word is a parent company
    const firstWord = trimmed.split(/\s+/)[0];
    const isParentCompany = PARENT_COMPANIES.some(p =>
      firstWord.toLowerCase() === p.toLowerCase()
    );

    if (isParentCompany) {
      parentCompany = firstWord;
      const afterParent = trimmed.slice(firstWord.length).trim();

      // Now look for a known make in the remainder
      for (const knownMake of sortedMakes) {
        const regex = new RegExp(`^${escapeRegex(knownMake)}\\b`, 'i');
        const match = afterParent.match(regex);
        if (match) {
          make = MAKE_ALIASES[match[0]] || match[0];
          make = make.charAt(0).toUpperCase() + make.slice(1).toLowerCase();
          if (make === 'Vw') make = 'Volkswagen';
          if (make === 'Bmw') make = 'BMW';
          remainder = afterParent.slice(match[0].length).trim();
          break;
        }
      }
    }

    // If still no make found, try finding a known make ANYWHERE in the string
    if (!make) {
      for (const knownMake of sortedMakes) {
        const regex = new RegExp(`\\b${escapeRegex(knownMake)}\\b`, 'i');
        const match = trimmed.match(regex);
        if (match) {
          make = MAKE_ALIASES[match[0]] || match[0];
          make = make.charAt(0).toUpperCase() + make.slice(1).toLowerCase();
          if (make === 'Vw') make = 'Volkswagen';
          if (make === 'Bmw') make = 'BMW';
          // Everything before the make becomes part of model/variant consideration
          const beforeMake = trimmed.slice(0, match.index).trim();
          const afterMake = trimmed.slice(match.index + match[0].length).trim();
          // If there's content after the make, that's the model
          // Otherwise, content before (excluding parent company) could be the model
          remainder = afterMake || beforeMake;
          break;
        }
      }
    }
  }

  // Try to extract year (4-digit number between 1990-2030)
  let year = '';
  const yearMatch = remainder.match(/\b(19[9][0-9]|20[0-3][0-9])\b/);
  if (yearMatch) {
    year = yearMatch[1];
    // Remove year from remainder
    remainder = remainder.replace(yearMatch[0], '').trim();
  }

  // Also check for year with decimal (like "2022.6" meaning June 2022)
  if (!year) {
    const yearDecimalMatch = remainder.match(/\b(19[9][0-9]|20[0-3][0-9])\.\d+/);
    if (yearDecimalMatch) {
      year = yearDecimalMatch[0].split('.')[0];
      remainder = remainder.replace(yearDecimalMatch[0], '').trim();
    }
  }

  // The first word after make is typically the model
  // Everything else is variant
  const parts = remainder.split(/\s+/).filter(p => p);
  const model = parts[0] || '';
  const variant = parts.slice(1).join(' ');

  return {
    make: make || '',
    model: model || '',
    variant: variant || '',
    year: year || '',
  };
};

/**
 * Process an array of raw data with a combined column, splitting into separate fields
 * @param {Object[]} rawData - Array of row objects
 * @param {string} combinedColumn - The column name containing combined data
 * @param {Object} existingMapping - Current mapping object
 * @returns {Object[]} - Transformed data with split fields
 */
export const splitCombinedColumn = (rawData, combinedColumn, existingMapping) => {
  return rawData.map(row => {
    const combinedValue = row[combinedColumn];
    const split = splitMakeModel(combinedValue);

    return {
      ...row,
      // Add virtual columns for split data
      __split_make: split.make,
      __split_model: split.model,
      __split_variant: split.variant,
      __split_year: split.year || row[existingMapping['year']] || '', // Prefer explicit year column
    };
  });
};

/**
 * Extract color from a description string (like "Material Name" column)
 * @param {string} description - Full description text
 * @returns {string} - Detected color or empty string
 */
export const extractColorFromDescription = (description) => {
  if (!description || typeof description !== 'string') return '';

  // Common car colors to look for
  const colors = [
    'Black', 'White', 'Silver', 'Gray', 'Grey', 'Red', 'Blue', 'Green', 'Yellow',
    'Orange', 'Brown', 'Beige', 'Gold', 'Pearl White', 'Metallic', 'Sky Blue',
    'Manganese Black', 'Starry Gold', 'Rose Gold', 'Mountain Green', 'Pearl',
  ];

  const normalizedDesc = description.toLowerCase();

  for (const color of colors) {
    if (normalizedDesc.includes(color.toLowerCase())) {
      return color;
    }
  }

  // Check for color patterns like "- Sky Blue" or "/ Black"
  const colorPattern = /[-\/]\s*([A-Za-z\s]+)(?:\s*[-\/]|$)/g;
  const matches = [...description.matchAll(colorPattern)];
  if (matches.length > 0) {
    const lastMatch = matches[matches.length - 1];
    const potentialColor = lastMatch[1].trim();
    if (potentialColor.length < 30) { // Sanity check
      return potentialColor;
    }
  }

  return '';
};

/**
 * Get sample values from a column for analysis
 * @param {Object[]} rawData - Array of row objects
 * @param {string} columnName - Column to sample
 * @param {number} sampleSize - Number of samples to take
 * @returns {string[]} - Array of sample values
 */
export const getSampleValues = (rawData, columnName, sampleSize = 10) => {
  return rawData
    .slice(0, Math.min(sampleSize, rawData.length))
    .map(row => row[columnName])
    .filter(v => v !== null && v !== undefined)
    .map(v => String(v));
};

/**
 * Analyze all columns to detect which ones might contain combined data
 * @param {Object[]} rawData - Array of row objects
 * @param {string[]} columns - Column names
 * @returns {Object[]} - Array of analysis results
 */
export const analyzeColumnsForCombinedData = (rawData, columns) => {
  return columns.map(col => {
    const samples = getSampleValues(rawData, col);
    const analysis = detectCombinedMakeModel(samples);

    return {
      column: col,
      ...analysis,
      samples: samples.slice(0, 3), // First 3 for preview
    };
  }).filter(result => result.isCombined);
};
