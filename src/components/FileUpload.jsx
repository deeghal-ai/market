import React, { useState } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';

const FileUpload = ({ onFileSelect }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files?.[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-all bg-white ${dragActive ? 'border-navy bg-navy/5' : 'border-gray-300 hover:border-navy/50'
        }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleChange}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-navy" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">Drop your Excel file here</p>
            <p className="text-sm text-gray-500 mt-1">or click to browse</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Supports .xlsx, .xls, .csv</span>
          </div>
        </div>
      </label>
    </div>
  );
};

export default FileUpload;
