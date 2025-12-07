import * as XLSX from 'xlsx';

/**
 * Excel Parser Utility
 * Wrapper around SheetJS for parsing Excel files
 */

/**
 * Parse an Excel file and return data
 * @param {File} file - File object from input
 * @returns {Promise<{data: Object[], columns: string[], sheetName: string}>}
 */
export const parseExcelFile = async (file) => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  
  // Get first sheet
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  // Convert to JSON
  const jsonData = XLSX.utils.sheet_to_json(sheet);
  
  // Extract columns
  const columns = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
  
  return {
    data: jsonData,
    columns,
    sheetName,
    rowCount: jsonData.length,
  };
};

/**
 * Parse multiple sheets from an Excel file
 * @param {File} file - File object from input
 * @returns {Promise<Object>} - Object with sheet names as keys
 */
export const parseAllSheets = async (file) => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  
  const sheets = {};
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    sheets[sheetName] = XLSX.utils.sheet_to_json(sheet);
  });
  
  return sheets;
};

/**
 * Export data to Excel file
 * @param {Object[]} data - Array of objects to export
 * @param {string} filename - Output filename
 * @param {string} sheetName - Sheet name (default: 'Sheet1')
 */
export const exportToExcel = (data, filename = 'export.xlsx', sheetName = 'Sheet1') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
};

/**
 * Get sample data for demo/testing
 * @returns {Object[]} - Sample vehicle data
 */
export const getSampleData = () => [
  { Brand: 'Toyota', Model: 'Camry', Year: 2023, Color: 'Silver', Variant: 'XLE', 'Body Type': 'Sedan', 'Fuel Type': 'Gasoline', Transmission: 'Automatic', VIN: 'ABC123456789', Mileage: 15000, 'No of Owners': 1 },
  { Brand: 'Toyota', Model: 'Camry', Year: 2023, Color: 'Silver', Variant: 'XLE', 'Body Type': 'Sedan', 'Fuel Type': 'Gasoline', Transmission: 'Automatic', VIN: 'DEF123456789', Mileage: 18000, 'No of Owners': 1 },
  { Brand: 'Toyota', Model: 'Camry', Year: 2023, Color: 'Silver', Variant: 'XLE', 'Body Type': 'Sedan', 'Fuel Type': 'Gasoline', Transmission: 'Automatic', VIN: 'GHI123456789', Mileage: 12000, 'No of Owners': 2 },
  { Brand: 'Honda', Model: 'Civic', Year: 2022, Color: 'Black', Variant: 'Sport', 'Body Type': 'Sedan', 'Fuel Type': 'Gasoline', Transmission: 'Manual', VIN: 'JKL123456789', Mileage: 25000, 'No of Owners': 1 },
  { Brand: 'Honda', Model: 'Civic', Year: 2022, Color: 'Black', Variant: 'Sport', 'Body Type': 'Sedan', 'Fuel Type': 'Gasoline', Transmission: 'Manual', VIN: 'MNO123456789', Mileage: 28000, 'No of Owners': 2 },
  { Brand: 'BMW', Model: 'X5', Year: 2024, Color: 'White', Variant: 'xDrive40i', 'Body Type': 'SUV', 'Fuel Type': 'Gasoline', Transmission: 'Automatic', VIN: 'PQR123456789', Mileage: 5000, 'No of Owners': 1 },
  { Brand: 'Mercedes', Model: 'C-Class', Year: 2023, Color: 'Blue', Variant: 'C300', 'Body Type': 'Sedan', 'Fuel Type': 'Gasoline', Transmission: 'Automatic', VIN: 'STU123456789', Mileage: 8000, 'No of Owners': 1 },
  { Brand: 'Mercedes', Model: 'C-Class', Year: 2023, Color: 'Blue', Variant: 'C300', 'Body Type': 'Sedan', 'Fuel Type': 'Gasoline', Transmission: 'Automatic', VIN: 'VWX123456789', Mileage: 9500, 'No of Owners': 1 },
  { Brand: 'Tesla', Model: 'Model 3', Year: 2024, Color: 'Red', Variant: 'Long Range', 'Body Type': 'Sedan', 'Fuel Type': 'Electric', Transmission: 'Automatic', VIN: 'YZA123456789', Mileage: 2000, 'No of Owners': 1 },
  { Brand: 'Tesla', Model: 'Model 3', Year: 2024, Color: 'Red', Variant: 'Long Range', 'Body Type': 'Sedan', 'Fuel Type': 'Electric', Transmission: 'Automatic', VIN: 'BCD123456789', Mileage: 3500, 'No of Owners': 1 },
  { Brand: 'Tesla', Model: 'Model 3', Year: 2024, Color: 'Red', Variant: 'Long Range', 'Body Type': 'Sedan', 'Fuel Type': 'Electric', Transmission: 'Automatic', VIN: 'EFG123456789', Mileage: 1500, 'No of Owners': 1 },
  { Brand: 'Tesla', Model: 'Model 3', Year: 2024, Color: 'Red', Variant: 'Long Range', 'Body Type': 'Sedan', 'Fuel Type': 'Electric', Transmission: 'Automatic', VIN: 'HIJ123456789', Mileage: 4000, 'No of Owners': 2 },
];
