# CLAUDE.md - AutoMarket Pro

> **Purpose**: This file provides comprehensive context for AI assistants (Claude, Copilot, etc.) working on this codebase. Read this first before making any changes.

---

## 📋 Project Overview

**AutoMarket Pro** is a dealer inventory management system for an auto marketplace e-commerce platform. It allows car dealers to bulk upload their vehicle inventory via Excel files and intelligently groups similar vehicles into unified listings.

### Core Problem Solved
Dealers have hundreds of cars. Many cars are identical (same make, model, year, color) but differ only in VIN, mileage, etc. Instead of showing 50 separate listings for "2023 Toyota Camry Silver", we show **1 listing with count: 50**, and users can drill down to see individual vehicles.

### Key Value Proposition
1. **Bulk Upload**: Dealers upload Excel with all vehicles
2. **Smart Mapping**: System auto-detects column names (handles "mileage" vs "kms driven" vs "odometer")
3. **Intelligent Grouping**: Vehicles grouped by Make+Model+Year+Color into single listings
4. **Drill-Down**: Each listing shows count; clicking reveals individual vehicles with unique details (VIN, mileage, owners)

---

## 🏗️ Architecture

### Tech Stack
| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | React 18 | UI components |
| Build Tool | Vite 5 | Dev server, bundling |
| Styling | Tailwind CSS (CDN) + Custom CSS | Utility-first CSS with navy theme |
| Icons | Lucide React | Icon library |
| Fonts | Inter (Google Fonts) | Typography |
| Excel Parsing | SheetJS (xlsx) | Read/write Excel files |
| State | React useState + Custom Hook | No external state library |

### Folder Structure
```
auto-marketplace/
├── index.html                 # Entry HTML (Tailwind CDN + Inter font + navy config)
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite configuration
└── src/
    ├── main.jsx               # React DOM entry point + styles import
    ├── App.jsx                # Main application component (orchestrator)
    ├── styles.css             # [NEW] Custom CSS with navy theme, badges, buttons
    ├── components/
    │   ├── FileUpload.jsx     # Drag-and-drop file upload (navy themed)
    │   ├── ColumnMapping.jsx  # Map Excel columns to standard fields
    │   ├── FilterPanel.jsx    # Horizontal filter layout with Search/Advanced buttons
    │   ├── ListingsTable.jsx  # AD Ports styled table with seller, condition, regional specs
    │   └── ListingDetailModal.jsx  # Two-column modal with specs, shipping options
    ├── constants/
    │   └── standardFields.js  # Field definitions (grouping, listing, vehicle)
    ├── hooks/
    │   └── useListings.js     # Custom hook for listings state management
    └── utils/
        ├── columnSynonyms.js  # Auto-mapping dictionary & logic
        ├── groupingLogic.js   # Vehicle → Listing grouping algorithm
        └── excelParser.js     # SheetJS wrapper for Excel operations
```

---

## 🔑 Core Concepts

### 1. Three Field Categories

Fields are categorized based on their behavior:

```javascript
// From src/constants/standardFields.js

GROUPING FIELDS (4 fields) - Create unique listing identity
├── make      (required) - e.g., "Toyota"
├── model     (required) - e.g., "Camry"  
├── year      (required) - e.g., 2023
└── color     (required) - e.g., "Silver"

LISTING FIELDS (15 fields) - Same for all vehicles in listing
├── variant, bodyType, fuelType, transmission, drivetrain
├── engineSize, cylinders, horsepower, seatingCapacity, doors
└── condition, regionalSpecs, city, country, description

VEHICLE FIELDS (6 fields) - Unique per vehicle
├── vin             (required) - Unique identifier
├── registrationNumber
├── mileage         - Differs per vehicle
├── owners          - Differs per vehicle
├── warranty
└── price
```

### 2. Grouping Logic

```
INPUT: 12 individual vehicles from Excel
                    ↓
        generateListingKey(vehicle)
        Key = "toyota_camry_2023_silver"
                    ↓
        Group vehicles with same key
                    ↓
OUTPUT: 5 listings, each with count and nested vehicles array

Example Result:
{
  id: "toyota_camry_2023_silver",
  make: "Toyota",
  model: "Camry", 
  year: 2023,
  color: "Silver",
  count: 3,                    // 3 matching vehicles
  vehicles: [
    { vin: "ABC123", mileage: 15000, owners: 1 },
    { vin: "DEF456", mileage: 18000, owners: 1 },
    { vin: "GHI789", mileage: 12000, owners: 2 }
  ]
}
```

### 3. Column Auto-Mapping

Dealers use different column names. We auto-detect using synonyms:

```javascript
// From src/utils/columnSynonyms.js
mileage: ['mileage', 'kms driven', 'kilometers', 'odometer', 'odometer reading', 'km', 'miles']
make: ['make', 'brand', 'manufacturer', 'oem']
vin: ['vin', 'vehicle identification number', 'chassis number', 'chassis']
```

The `autoDetectMapping()` function matches uploaded column names to standard fields.

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER JOURNEY                               │
└─────────────────────────────────────────────────────────────────────┘

STEP 1: UPLOAD
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ User drops   │ ──▶ │ parseExcelFile() │ ──▶ │ rawData[]       │
│ Excel file   │     │ (excelParser.js) │     │ columns[]       │
└──────────────┘     └──────────────────┘     └─────────────────┘
                                                      │
                                                      ▼
STEP 2: MAPPING                               ┌─────────────────┐
┌──────────────┐     ┌──────────────────┐     │autoDetectMapping│
│ User adjusts │ ──▶ │ ColumnMapping    │ ◀── │ (columnSynonyms)│
│ mappings     │     │ component        │     └─────────────────┘
└──────────────┘     └──────────────────┘
                              │
                              ▼
STEP 3: IMPORT        ┌──────────────────┐     ┌─────────────────┐
                      │transformToVehicle│ ──▶ │ vehicles[]      │
                      │ (groupingLogic)  │     │ (normalized)    │
                      └──────────────────┘     └─────────────────┘
                                                      │
                                                      ▼
STEP 4: GROUP         ┌──────────────────┐     ┌─────────────────┐
                      │groupVehiclesInto │ ──▶ │ listings[]      │
                      │Listings()        │     │ (with counts)   │
                      └──────────────────┘     └─────────────────┘
                                                      │
                                                      ▼
STEP 5: DISPLAY       ┌──────────────────┐     ┌─────────────────┐
                      │ ListingsTable    │ ──▶ │ UI with filters │
                      │ FilterPanel      │     │ selection, sort │
                      └──────────────────┘     └─────────────────┘
                                                      │
                                                      ▼
STEP 6: DETAIL        ┌──────────────────┐
                      │ListingDetailModal│ Shows individual vehicles
                      └──────────────────┘
```

---

## 📁 File-by-File Documentation

### `/src/App.jsx`
**Role**: Main orchestrator component
**State**:
- `step`: Current wizard step ('upload' | 'mapping' | 'listings')
- `rawData`: Parsed Excel data (array of objects)
- `columns`: Column names from Excel
- `mapping`: User's column-to-field mapping
- `fileName`: Uploaded file name
- `detailListing`: Currently viewed listing (for modal)

**Key Functions**:
- `handleFileSelect(file)`: Parses Excel, triggers mapping step
- `handleMappingChange(column, field)`: Updates mapping state
- `handleConfirmMapping()`: Triggers grouping and shows listings
- `handleReset()`: Returns to upload step

---

### `/src/components/FileUpload.jsx`
**Role**: Drag-and-drop file upload interface
**Props**: `onFileSelect(file)` - callback when file is selected
**Features**: Drag detection, file input, visual feedback

---

### `/src/components/ColumnMapping.jsx`
**Role**: UI for mapping Excel columns to standard fields
**Props**:
- `columns`: Array of Excel column names
- `mapping`: Current mapping object
- `onMappingChange(column, field)`: Update mapping
- `onConfirm()`: Proceed to listings
- `onCancel()`: Return to upload

**Behavior**: 
- Shows required fields with asterisk (*)
- Prevents confirmation if required fields unmapped
- Dropdown grouped by field category

---

### `/src/components/FilterPanel.jsx`
**Role**: Filter dropdowns for listings table
**Props**:
- `filterOptions`: Object with unique values per field
- `filters`: Current active filters
- `onFilterChange(key, value)`: Update filter

---

### `/src/components/ListingsTable.jsx`
**Role**: Main data table with sorting, selection
**Props**:
- `listings`: Array of listing objects
- `selectedIds`: Array of selected listing IDs
- `onSelectionChange(ids)`: Update selection
- `onViewDetail(listing)`: Open detail modal

**Features**:
- Sortable columns (click header)
- Checkbox selection (individual + select all)
- Count badge per listing
- Color swatch display

---

### `/src/components/ListingDetailModal.jsx`
**Role**: Modal showing full listing details and individual vehicles
**Props**:
- `listing`: Listing object to display
- `onClose()`: Close modal

**Displays**:
- Listing specs (variant, body type, fuel, etc.)
- Description
- Table of individual vehicles (VIN, mileage, owners, etc.)

---

### `/src/constants/standardFields.js`
**Role**: Single source of truth for field definitions
**Exports**:
- `STANDARD_FIELDS`: Object with grouping, listing, vehicle arrays
- `getAllFields()`: Returns flat array of all fields
- `getRequiredFields()`: Returns array of required field keys

---

### `/src/hooks/useListings.js`
**Role**: Custom hook encapsulating listings state logic
**Returns**:
- State: `listings`, `filteredListings`, `selectedIds`, `filters`, `filterOptions`, `stats`
- Actions: `importVehicles`, `setFilter`, `selectAll`, `deselectAll`, `toggleSelection`, `setSelection`, `deleteSelected`, `deleteListing`, `reset`

---

### `/src/utils/columnSynonyms.js`
**Role**: Column name variations and auto-detection
**Exports**:
- `COLUMN_SYNONYMS`: Dictionary of field → [synonyms]
- `autoDetectMapping(columns)`: Returns mapping object
- `addSynonym(fieldKey, synonym)`: Add new synonym at runtime

---

### `/src/utils/groupingLogic.js`
**Role**: Core grouping algorithm
**Exports**:
- `generateListingKey(vehicle)`: Creates grouping key
- `groupVehiclesIntoListings(vehicles)`: Main grouping function
- `transformToVehicles(rawData, mapping)`: Apply mapping to raw data
- `getListingsStats(listings)`: Calculate summary stats

---

### `/src/utils/excelParser.js`
**Role**: SheetJS wrapper for Excel operations
**Exports**:
- `parseExcelFile(file)`: Parse uploaded file
- `parseAllSheets(file)`: Parse all sheets
- `exportToExcel(data, filename)`: Export to Excel
- `getSampleData()`: Returns demo data for testing

---

## 🎯 Common Tasks

### Adding a New Field

1. **Add to constants** (`src/constants/standardFields.js`):
```javascript
// Add to appropriate category
listing: [
  // ... existing fields
  { key: 'newField', label: 'New Field Display Name' },
]
```

2. **Add synonyms** (`src/utils/columnSynonyms.js`):
```javascript
COLUMN_SYNONYMS = {
  // ... existing
  newField: ['new field', 'new_field', 'newfield', 'alternate name'],
}
```

3. **Display in table** (`src/components/ListingsTable.jsx`) - if needed
4. **Display in modal** (`src/components/ListingDetailModal.jsx`) - if needed

---

### Changing Grouping Criteria

Edit `src/utils/groupingLogic.js`:

```javascript
// Current: Groups by make + model + year + color
const GROUPING_KEYS = ['make', 'model', 'year', 'color'];

// Example: Add variant to grouping
const GROUPING_KEYS = ['make', 'model', 'year', 'color', 'variant'];
```

⚠️ **Important**: If you add to `GROUPING_KEYS`, also add to `STANDARD_FIELDS.grouping` in constants and mark as `required: true`.

---

### Adding a New Filter

1. Add to `filterOptions` in `useListings.js`:
```javascript
const filterOptions = useMemo(() => ({
  // ... existing
  newField: [...new Set(listings.map(l => l.newField).filter(Boolean))].sort(),
}), [listings]);
```

2. Filter automatically appears in `FilterPanel.jsx` (it iterates `filterOptions`).

---

### Adding Export Functionality

Use the existing `exportToExcel` utility:
```javascript
import { exportToExcel } from './utils/excelParser';

// In component
const handleExport = () => {
  const exportData = listings.map(l => ({
    Make: l.make,
    Model: l.model,
    // ... flatten as needed
  }));
  exportToExcel(exportData, 'inventory_export.xlsx');
};
```

---

## ⚠️ Known Issues & Limitations

1. **No persistence**: Data is lost on page refresh (in-memory only)
2. **No authentication**: Single-user demo
3. **No image support**: Vehicle images not handled
4. **First vehicle wins**: For listing-level fields, first vehicle's value is used
5. **Case sensitivity**: Grouping key is lowercased, but display keeps original case
6. **Large files**: No chunking/streaming for very large Excel files (1000+ rows may lag)

---

## 🚀 Future Enhancement Ideas

### Short-term
- [ ] LocalStorage persistence for demo
- [ ] Export filtered/selected listings to Excel
- [ ] Edit listing details inline
- [ ] Image upload per vehicle
- [ ] Pagination for large datasets

### Medium-term
- [ ] Backend API integration (Node/Express or Python/FastAPI)
- [ ] Database storage (PostgreSQL/MongoDB)
- [ ] Multi-dealer support with authentication
- [ ] Saved mapping templates per dealer
- [ ] Bulk edit selected listings

### Long-term
- [ ] Price analytics and suggestions
- [ ] VIN decoder integration
- [ ] Marketplace listing publication
- [ ] Inventory alerts (low stock, etc.)
- [ ] Mobile app for dealers

---

## 🧪 Testing Notes

### Sample Data
Use "Load Sample Data" button on upload screen, or call:
```javascript
import { getSampleData } from './utils/excelParser';
const testData = getSampleData(); // Returns 12 vehicles → 5 listings
```

### Test Cases to Verify
1. Upload Excel with different column names (should auto-map)
2. Upload with missing required fields (should block import)
3. Upload with duplicate vehicles (should group correctly)
4. Filter combinations (should intersect correctly)
5. Select all → filter → verify selection persists
6. View detail modal for multi-vehicle listing

---

## 📝 Code Style Guidelines

- **Components**: PascalCase, one component per file
- **Hooks**: camelCase, prefix with `use`
- **Utils**: camelCase, pure functions preferred
- **Constants**: UPPER_SNAKE_CASE for objects, camelCase for functions
- **Tailwind**: Use utility classes, avoid custom CSS
- **State**: Keep minimal, derive when possible (useMemo)

---

## 🔗 Related Files from Original Requirements

The project was built based on two Excel templates:

1. **Lot_1_cars.xlsx**: Contains listing-level fields
   - Brand, Model, Variant, Year, Color, Body Type, Fuel Type, etc.

2. **Stock_Details_Set6_5vehicles.xlsx**: Contains vehicle-specific fields
   - VIN, Registration Number, Mileage, No of Owners, Warranty

The system expects a **single combined Excel** with all columns, and handles grouping automatically.

---

*Last updated: December 2024*
*For questions about this codebase, refer to the original conversation or contact the development team.*

---

## 🎨 UI Redesign Evolution (December 2024)

### Overview
The application underwent a complete UI redesign to match the **AD Ports Group marketplace** aesthetic. This was a visual styling overhaul while maintaining all existing functionality.

### Design Reference
The redesign was based on AD Ports Group vehicle marketplace screenshots showing:
- Clean white header with centered navigation
- Horizontal filter layout with Search/Advanced Filters buttons
- Professional table with Image, Vehicle Info, Seller, Regional Specs columns
- Two-column detail modal with shipping options and seller info

### New Files Added

#### `/src/styles.css`
Custom CSS file with:
- **CSS Variables**: Navy color palette (`--color-navy: #1a2b4a`)
- **Button Classes**: `.btn-primary` (navy filled), `.btn-secondary` (outline)
- **Badge Classes**: `.badge-used`, `.badge-excellent`, `.badge-like-new`, `.badge-regional`
- **Filter Styles**: `.filter-select` with custom dropdown arrow
- **Table Styles**: `.table-header`, `.table-row` with hover states
- **Card Styles**: `.card`, `.seller-card`, `.shipping-card`

### Key Design Changes

| Component | Before | After |
|-----------|--------|-------|
| **Header** | Blue gradient with Car icon | White with snowflake logo, centered nav, action icons |
| **Filter Panel** | Vertical dropdowns | Horizontal layout, Search button, Advanced Filters button |
| **Listings Table** | Basic columns | Image, Vehicle Info, Seller, Regional Specs, Mileage, Price, Actions |
| **Detail Modal** | Single column | Two-column: specs+vehicles left, price+shipping+seller right |
| **Color Scheme** | Blue (#3b82f6) | Navy (#1a2b4a) |
| **Typography** | System fonts | Inter (Google Fonts) |

### Design Decisions

1. **No Hardcoded Defaults**: Empty fields show field labels with no value (e.g., "Transmission:") rather than fake data
2. **Condition Badges**: Only appear if condition field is mapped from Excel
3. **Seller Info**: Shows empty state if not mapped (no generated fake seller names)
4. **Visual-Only E-commerce**: Add to Cart, Shipping Options, Negotiate Price are UI elements without backend functionality
5. **Image Placeholders**: Car icon placeholder since app doesn't support image uploads

### Tailwind Configuration
Custom Tailwind config added to `index.html`:
```javascript
tailwind.config = {
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        navy: { DEFAULT: '#1a2b4a', dark: '#0f1a2e', light: '#2d4a6f' }
      }
    }
  }
}
```

### Component Updates Summary

| File | Changes |
|------|---------|
| `App.jsx` | New header with logo, nav, Search/Cart/Profile icons |
| `FilterPanel.jsx` | Horizontal layout, Search button, Advanced Filters, Clear All |
| `ListingsTable.jsx` | New columns, condition badges, seller column, regional specs, styled actions |
| `ListingDetailModal.jsx` | Two-column layout, image gallery, shipping options, vehicle specs grid |
| `FileUpload.jsx` | Navy color scheme |
| `ColumnMapping.jsx` | Navy theme, consistent button styling |
