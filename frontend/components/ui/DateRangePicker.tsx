import React, { useState } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface DateRangePickerProps {
  label?: string;
  startDate: Date | null;
  endDate: Date | null;
  onChange: (range: { startDate: Date | null; endDate: Date | null }) => void;
  error?: string;
  disabled?: boolean;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  label,
  startDate,
  endDate,
  onChange,
  error,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    onChange({ startDate: date, endDate });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    onChange({ startDate, endDate: date });
  };

  const formatDateForInput = (date: Date | null) => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  const formatDateForDisplay = (date: Date | null) => {
    if (!date) return '';
    return format(date, 'MMM dd, yyyy');
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          className={`w-full flex items-center justify-between px-3 py-2 border ${
            error
              ? 'border-red-300 dark:border-red-700'
              : 'border-gray-300 dark:border-gray-600'
          } rounded-md shadow-sm bg-white dark:bg-gray-700 text-left focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <span className={`block truncate ${!startDate && !endDate ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
            {startDate && endDate
              ? `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`
              : startDate
              ? `From ${formatDateForDisplay(startDate)}`
              : endDate
              ? `Until ${formatDateForDisplay(endDate)}`
              : 'Select date range'}
          </span>
          <CalendarIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-300 dark:border-gray-600 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formatDateForInput(startDate)}
                  onChange={handleStartDateChange}
                  max={endDate ? formatDateForInput(endDate) : undefined}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formatDateForInput(endDate)}
                  onChange={handleEndDateChange}
                  min={startDate ? formatDateForInput(startDate) : undefined}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                onClick={() => setIsOpen(false)}
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-500">{error}</p>
      )}
    </div>
  );
};

export default DateRangePicker;