import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Car, Trash2, Search, ShoppingCart, User, ChevronDown, Menu } from 'lucide-react';

// Components
import FileUpload from './components/FileUpload';
import ColumnMapping from './components/ColumnMapping';
import FilterPanel from './components/FilterPanel';
import ListingsTable from './components/ListingsTable';
import ListingDetailModal from './components/ListingDetailModal';

// Hooks
import useListings from './hooks/useListings';

// Utils
import { parseExcelFile, getSampleData } from './utils/excelParser';
import { autoDetectMapping } from './utils/columnSynonyms';

function App() {
  // App state
  const [step, setStep] = useState('upload'); // upload, mapping, listings
  const [rawData, setRawData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [mapping, setMapping] = useState({});
  const [fileName, setFileName] = useState('');
  const [detailListing, setDetailListing] = useState(null);

  // Listings state (custom hook)
  const {
    filteredListings,
    selectedIds,
    filters,
    filterOptions,
    stats,
    importVehicles,
    setFilter,
    setSelection,
    deleteSelected,
    reset: resetListings,
  } = useListings();

  // Handle file selection
  const handleFileSelect = async (file) => {
    try {
      setFileName(file.name);
      const result = await parseExcelFile(file);

      if (result.data.length > 0) {
        setColumns(result.columns);
        setRawData(result.data);
        setMapping(autoDetectMapping(result.columns));
        setStep('mapping');
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing file. Please check the format.');
    }
  };

  // Handle mapping change
  const handleMappingChange = (column, field) => {
    setMapping(prev => {
      const updated = { ...prev };
      // Remove field from other columns if already mapped (except for combined fields)
      if (field && !field.startsWith('combined_')) {
        Object.keys(updated).forEach(key => {
          if (updated[key] === field && key !== column) {
            delete updated[key];
          }
        });
      }
      if (field) {
        updated[column] = field;
      } else {
        delete updated[column];
      }
      return updated;
    });
  };

  // Confirm mapping and import
  const handleConfirmMapping = () => {
    importVehicles(rawData, mapping);
    setStep('listings');
  };

  // Load sample data
  const loadSampleData = () => {
    const sampleData = getSampleData();
    const cols = Object.keys(sampleData[0]);
    setColumns(cols);
    setRawData(sampleData);
    setMapping(autoDetectMapping(cols));
    setFileName('sample_inventory.xlsx');
    setStep('mapping');
  };

  // Reset to upload
  const handleReset = () => {
    setStep('upload');
    setRawData([]);
    setColumns([]);
    setMapping({});
    setFileName('');
    setDetailListing(null);
    resetListings();
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="3" fill="#1a2b4a" />
                  <circle cx="14" cy="5" r="2" fill="#1a2b4a" />
                  <circle cx="14" cy="23" r="2" fill="#1a2b4a" />
                  <circle cx="5" cy="14" r="2" fill="#1a2b4a" />
                  <circle cx="23" cy="14" r="2" fill="#1a2b4a" />
                  <circle cx="7.5" cy="7.5" r="1.5" fill="#1a2b4a" />
                  <circle cx="20.5" cy="7.5" r="1.5" fill="#1a2b4a" />
                  <circle cx="7.5" cy="20.5" r="1.5" fill="#1a2b4a" />
                  <circle cx="20.5" cy="20.5" r="1.5" fill="#1a2b4a" />
                </svg>
              </div>
              <span className="text-lg font-bold text-navy tracking-tight">AUTOMARKET PRO</span>
            </div>

            {/* Center Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <a href="#" className="nav-link px-4 py-2 text-gray-700 hover:text-navy font-medium">Vehicles</a>
              <a href="#" className="nav-link px-4 py-2 text-gray-700 hover:text-navy font-medium">Get Started</a>
              <button className="nav-link px-4 py-2 text-gray-700 hover:text-navy font-medium inline-flex items-center gap-1">
                More <ChevronDown className="w-4 h-4" />
              </button>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-500 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600">
                <span>ر.إ</span>
                <span>AED</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </div>
              <button className="relative p-2 text-gray-500 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">1</span>
              </button>
              <button className="p-2 text-gray-500 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors">
                <User className="w-5 h-5" />
              </button>
              {step === 'listings' && (
                <button
                  onClick={handleReset}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-navy border border-navy rounded-lg hover:bg-navy hover:text-white transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  New Upload
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Step Indicator */}
        {step !== 'listings' && (
          <div className="flex items-center justify-center gap-4 mb-8">
            {['upload', 'mapping', 'listings'].map((s, idx) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-2 ${step === s ? 'text-navy' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === s ? 'bg-navy text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                    {idx + 1}
                  </div>
                  <span className="font-medium capitalize hidden sm:inline">{s}</span>
                </div>
                {idx < 2 && (
                  <div className={`w-16 h-0.5 ${['mapping', 'listings'].indexOf(step) >= idx ? 'bg-navy' : 'bg-gray-200'
                    }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-navy">Upload Dealer Inventory</h2>
              <p className="text-gray-500 mt-2">Upload an Excel file with your vehicle inventory</p>
            </div>
            <FileUpload onFileSelect={handleFileSelect} />
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 mb-3">Or try with sample data</p>
              <button
                onClick={loadSampleData}
                className="btn-secondary"
              >
                Load Sample Data (12 vehicles → 5 listings)
              </button>
            </div>
          </div>
        )}

        {/* Mapping Step */}
        {step === 'mapping' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
              <FileSpreadsheet className="w-5 h-5 text-navy" />
              <span className="text-sm text-gray-700">
                <strong>{fileName}</strong> • {rawData.length} rows • {columns.length} columns
              </span>
            </div>
            <ColumnMapping
              columns={columns}
              mapping={mapping}
              rawData={rawData}
              onMappingChange={handleMappingChange}
              onConfirm={handleConfirmMapping}
              onCancel={handleReset}
            />
          </div>
        )}

        {/* Listings Step */}
        {step === 'listings' && (
          <div className="space-y-4">
            {/* Filters */}
            <FilterPanel
              filterOptions={filterOptions}
              filters={filters}
              onFilterChange={setFilter}
            />

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-4 p-4 bg-navy/5 rounded-lg border border-navy/20">
                <span className="text-sm text-navy font-medium">
                  {selectedIds.length} listing(s) selected
                </span>
                <div className="flex-1" />
                <button
                  onClick={deleteSelected}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
              </div>
            )}

            {/* Table */}
            <ListingsTable
              listings={filteredListings}
              selectedIds={selectedIds}
              onSelectionChange={setSelection}
              onViewDetail={setDetailListing}
            />
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <ListingDetailModal
        listing={detailListing}
        onClose={() => setDetailListing(null)}
      />
    </div>
  );
}

export default App;
