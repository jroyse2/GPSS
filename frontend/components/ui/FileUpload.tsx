import React, { useState, useRef } from 'react';
import { DocumentArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  label?: string;
  accept?: string;
  onChange: (file: File | null) => void;
  maxSize?: number; // in MB
  hint?: string;
  error?: string;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  onChange,
  maxSize = 10, // Default 10MB
  hint,
  error,
  disabled = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      onChange(null);
      return;
    }

    // Check file size
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      alert(`File size exceeds the maximum allowed size of ${maxSize}MB`);
      return;
    }

    // Check file type if accept is provided
    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      
      if (!acceptedTypes.some(type => {
        // Handle mime types (e.g., "image/png") and extensions (e.g., ".png")
        return type === fileExtension || 
               file.type === type || 
               (type.includes('*') && file.type.startsWith(type.replace('*', '')));
      })) {
        alert(`File type not accepted. Please upload a file with one of these extensions: ${accept}`);
        return;
      }
    }

    setSelectedFile(file);
    onChange(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const file = e.dataTransfer.files?.[0] || null;
    validateAndSetFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (size: number): string => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 ${
          isDragging
            ? 'border-primary bg-primary/5 dark:bg-primary/10'
            : error
            ? 'border-red-300 dark:border-red-700'
            : 'border-gray-300 dark:border-gray-600'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={accept}
          disabled={disabled}
          ref={fileInputRef}
        />
        
        <div className="space-y-2 text-center">
          {selectedFile ? (
            <div className="flex items-center justify-center space-x-2">
              <DocumentArrowUpIcon className="h-8 w-8 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          ) : (
            <>
              <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {isDragging ? 'Drop the file here' : 'Drag and drop file here, or click to browse'}
                </p>
                {accept && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Accepted file types: {accept}
                  </p>
                )}
                {maxSize && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Maximum file size: {maxSize}MB
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-500">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;