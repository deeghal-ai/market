import React, { useMemo } from 'react';
import { ArrowRight, Check, AlertCircle, Sparkles, Zap, Info } from 'lucide-react';
import { STANDARD_FIELDS, getRequiredFields, isCombinedField, getCombinedFieldInfo } from '../constants/standardFields';
import { detectCombinedMakeModel, getSampleValues, splitMakeModel } from '../utils/smartSplit';

const ColumnMapping = ({ columns, mapping, rawData, onMappingChange, onConfirm, onCancel }) => {
  const requiredFields = getRequiredFields();
  const mappedFields = Object.values(mapping);

  // Helper to check if combined field actually extracts certain data from the column
  const checkCombinedExtraction = (columnName, field) => {
    if (!rawData || rawData.length === 0) return { hasYear: false, hasColor: false };

    const samples = getSampleValues(rawData, columnName, 5);
    if (samples.length === 0) return { hasYear: false, hasColor: false };

    // Check what's actually extracted
    const extractions = samples.map(s => splitMakeModel(s));
    const hasYear = extractions.some(e => e.year && e.year.length === 4);
    const hasColor = false; // Color extraction is less reliable, require explicit mapping

    return { hasYear, hasColor };
  };

  // Check required fields, accounting for combined fields that fill them
  const getFilledRequiredFields = () => {
    const filled = new Set();

    // First, find which columns are mapped to combined fields
    const combinedMappings = {};
    Object.entries(mapping).forEach(([col, field]) => {
      if (isCombinedField(field)) {
        combinedMappings[field] = col;
      }
    });

    mappedFields.forEach(field => {
      if (requiredFields.includes(field)) {
        filled.add(field);
      }

      // Combined fields fill multiple required fields - but verify extraction works
      if (field === 'combined_make_model' || field === 'combined_make_model_variant' || field === 'combined_full_description') {
        // All combined fields can extract make and model
        const columnName = combinedMappings[field];
        if (columnName) {
          const { hasYear } = checkCombinedExtraction(columnName, field);
          filled.add('make');
          filled.add('model');
          if (hasYear) {
            filled.add('year');
          }
        }
      }
    });

    return filled;
  };

  const filledRequired = getFilledRequiredFields();
  const missingRequired = requiredFields.filter(f => !filledRequired.has(f));

  // Analyze columns for combined data suggestions
  const columnAnalysis = useMemo(() => {
    if (!rawData || rawData.length === 0) return {};

    const analysis = {};
    columns.forEach(col => {
      const samples = getSampleValues(rawData, col, 5);
      const detection = detectCombinedMakeModel(samples);
      if (detection.isCombined) {
        analysis[col] = {
          ...detection,
          samples,
          preview: samples.slice(0, 2).map(s => splitMakeModel(s)),
        };
      }
    });
    return analysis;
  }, [rawData, columns]);

  // Check if a column has a smart split suggestion
  const hasSuggestion = (col) => columnAnalysis[col]?.isCombined;

  // Get preview for a combined mapping
  const getPreview = (col, field) => {
    if (!rawData || !isCombinedField(field)) return null;

    const samples = getSampleValues(rawData, col, 2);
    if (samples.length === 0) return null;

    const preview = samples.map(s => splitMakeModel(s));
    return preview;
  };

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
            <span>{missingRequired.length} required field(s) unmapped: {missingRequired.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Smart Split Info Banner */}
      {Object.keys(columnAnalysis).length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Smart Split Detected!</p>
              <p className="text-xs text-blue-600 mt-0.5">
                We found columns that appear to contain combined data (like "Audi A6").
                Use the 🔀 options to automatically split them.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Column Mappings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
        {columns.map(col => {
          const currentMapping = mapping[col];
          const suggestion = columnAnalysis[col];
          const preview = currentMapping && isCombinedField(currentMapping)
            ? getPreview(col, currentMapping)
            : null;

          return (
            <div
              key={col}
              className={`p-3 rounded-lg border ${suggestion && !currentMapping
                ? 'bg-blue-50 border-blue-200'
                : isCombinedField(currentMapping)
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-100'
                }`}
            >
              <div className="flex items-center gap-3">
                {/* Column name */}
                <div className="w-36 flex-shrink-0">
                  <p className="text-sm font-medium text-gray-700 break-words" title={col}>
                    {col}
                  </p>
                  {suggestion && !currentMapping && (
                    <p className="text-xs text-blue-600 mt-0.5 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Combined data detected
                    </p>
                  )}
                </div>

                <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />

                {/* Dropdown */}
                <select
                  value={currentMapping || ''}
                  onChange={(e) => onMappingChange(col, e.target.value)}
                  className={`filter-select flex-1 min-w-0 ${isCombinedField(currentMapping) ? 'border-green-400 bg-green-50' : ''
                    }`}
                >
                  <option value="">-- Skip --</option>

                  {/* Smart Split Options - Show first if detected */}
                  {(suggestion || isCombinedField(currentMapping)) && (
                    <optgroup label="🔀 Smart Split (Auto-Extract)">
                      {STANDARD_FIELDS.combined.map(f => (
                        <option key={f.key} value={f.key}>
                          {f.label}
                        </option>
                      ))}
                    </optgroup>
                  )}

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

                  {/* Show Smart Split at bottom too for columns without detection */}
                  {!suggestion && !isCombinedField(currentMapping) && (
                    <optgroup label="🔀 Smart Split (Auto-Extract)">
                      {STANDARD_FIELDS.combined.map(f => (
                        <option key={f.key} value={f.key}>
                          {f.label}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Preview when combined field is selected */}
              {preview && preview.length > 0 && (
                <div className="mt-2 ml-40 pl-7">
                  <p className="text-xs text-green-700 font-medium mb-1">Preview extraction:</p>
                  {preview.map((p, idx) => (
                    <div key={idx} className="text-xs text-green-600 bg-green-100 rounded px-2 py-1 mb-1">
                      {p.make && <span>Make: <strong>{p.make}</strong></span>}
                      {p.model && <span> → Model: <strong>{p.model}</strong></span>}
                      {p.variant && <span> → Variant: <strong>{p.variant}</strong></span>}
                      {p.year && <span> → Year: <strong>{p.year}</strong></span>}
                    </div>
                  ))}
                </div>
              )}

              {/* Sample values for suggestions */}
              {suggestion && !currentMapping && suggestion.samples && (
                <div className="mt-2 ml-40 pl-7">
                  <p className="text-xs text-blue-600 mb-1">Sample values:</p>
                  {suggestion.samples.slice(0, 2).map((s, idx) => (
                    <p key={idx} className="text-xs text-gray-500 truncate">"{s}"</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-6 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-200 border border-blue-300"></span>
            Smart split suggested
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-200 border border-green-300"></span>
            Smart split active
          </span>
          <span className="flex items-center gap-1">
            <span className="text-red-500">*</span>
            Required field
          </span>
        </div>
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
