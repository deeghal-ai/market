import React from 'react';
import { ArrowRight, Check, AlertCircle } from 'lucide-react';
import { STANDARD_FIELDS, getRequiredFields } from '../constants/standardFields';

const ColumnMapping = ({ columns, mapping, onMappingChange, onConfirm, onCancel }) => {
  const requiredFields = getRequiredFields();
  const mappedFields = Object.values(mapping);
  const missingRequired = requiredFields.filter(f => !mappedFields.includes(f));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-navy">Map Your Columns</h2>
          <p className="text-sm text-gray-500 mt-1">Match your Excel columns to our standard fields</p>
        </div>
        {missingRequired.length > 0 && (
          <div className="flex items-center gap-1 text-amber-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{missingRequired.length} required field(s) unmapped</span>
          </div>
        )}
      </div>

      {/* Changed to 2 columns max and better spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
        {columns.map(col => (
          <div key={col} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            {/* Fixed width for column name - no truncation */}
            <div className="w-40 flex-shrink-0">
              <p
                className="text-sm font-medium text-gray-700 break-words"
                title={col}
              >
                {col}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {/* Dropdown takes remaining space */}
            <select
              value={mapping[col] || ''}
              onChange={(e) => onMappingChange(col, e.target.value)}
              className="filter-select flex-1 min-w-0"
            >
              <option value="">-- Skip --</option>
              <optgroup label="Grouping Fields (Required)">
                {STANDARD_FIELDS.grouping.map(f => (
                  <option key={f.key} value={f.key}>{f.label}{f.required ? ' *' : ''}</option>
                ))}
              </optgroup>
              <optgroup label="Listing Details">
                {STANDARD_FIELDS.listing.map(f => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </optgroup>
              <optgroup label="Vehicle-Specific">
                {STANDARD_FIELDS.vehicle.map(f => (
                  <option key={f.key} value={f.key}>{f.label}{f.required ? ' *' : ''}</option>
                ))}
              </optgroup>
            </select>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={missingRequired.length > 0}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          Confirm & Import
        </button>
      </div>
    </div>
  );
};

export default ColumnMapping;
