import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DateRangePicker from '@/components/ui/DateRangePicker';
import FileUpload from '@/components/ui/FileUpload';
import apiClient from '@/utils/api';
import { Job } from '@/utils/types';
import { PlusIcon, MinusIcon, ArrowPathIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';

interface PipeOptimizationFormProps {
  onOptimizationComplete: (result: any) => void;
}

const PipeOptimizationForm: React.FC<PipeOptimizationFormProps> = ({ onOptimizationComplete }) => {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [pipes, setPipes] = useState<{ length: number; diameter: number; od: string }[]>([
    { length: 14.5, diameter: 1.9, od: '1.9' },
  ]);
  const [stockLength, setStockLength] = useState<number>(24);
  const [loading, setLoading] = useState<boolean>(false);
  const [jobsLoading, setJobsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null,
  });

  // Stock length options based on OD
  const stockLengthOptions = {
    '1.9': 24,      // 24' for 1.9" OD
    '2.375': 25,    // 25' for 2.375" OD
    '3.5 .216': 32, // 32' for 3.5" OD x .216 wall
    '3.5 .12': 26   // 26' for 3.5" OD x .120 wall
  };

  // OD options
  const odOptions = [
    { value: '1.9', label: '1.9" OD x 0.083 Wall' },
    { value: '2.375', label: '2.375" OD x 0.083 Wall' },
    { value: '3.5 .216', label: '3.5" OD x 0.216 Wall (SCH 40)' },
    { value: '3.5 .12', label: '3.5" OD x 0.12 Wall (SCH 10)' }
  ];

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setJobsLoading(true);
        const response = await apiClient.get('/jobs');
        setJobs(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedJobId(response.data.data[0].id);
        }
      } catch (error: any) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setJobsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Update stock length when OD changes
  const handleOdChange = (index: number, value: string) => {
    const newPipes = [...pipes];
    newPipes[index].od = value;
    
    // Update diameter based on OD
    if (value === '1.9') newPipes[index].diameter = 1.9;
    else if (value === '2.375') newPipes[index].diameter = 2.375;
    else if (value === '3.5 .216' || value === '3.5 .12') newPipes[index].diameter = 3.5;
    
    setPipes(newPipes);
    
    // Update stock length if all pipes have the same OD
    const allSameOd = newPipes.every(pipe => pipe.od === value);
    if (allSameOd) {
      setStockLength(stockLengthOptions[value as keyof typeof stockLengthOptions]);
    }
  };

  // Add pipe
  const handleAddPipe = () => {
    // Default to the same OD as the last pipe
    const lastPipe = pipes[pipes.length - 1];
    setPipes([...pipes, { length: 10, diameter: lastPipe.diameter, od: lastPipe.od }]);
  };

  // Remove pipe
  const handleRemovePipe = (index: number) => {
    const newPipes = [...pipes];
    newPipes.splice(index, 1);
    setPipes(newPipes);
  };

  // Update pipe length
  const handlePipeLengthChange = (index: number, value: number) => {
    const newPipes = [...pipes];
    newPipes[index].length = value;
    setPipes(newPipes);
  };

  // Handle file selection
  const handleFileChange = (file: File | null) => {
    setFile(file);
    setError(null);
  };

  // Toggle between manual entry and file upload
  const toggleMode = () => {
    setUploadMode(!uploadMode);
    setError(null);
  };

  // Run optimization
  const handleOptimize = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate inputs
      if (!selectedJobId) {
        setError('Please select a job');
        setLoading(false);
        return;
      }

      if (uploadMode) {
        // File upload mode
        if (!file) {
          setError('Please select a file');
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('jobId', selectedJobId);
        
        // Add date range if provided
        if (dateRange.startDate && dateRange.endDate) {
          formData.append('startDate', dateRange.startDate.toISOString());
          formData.append('endDate', dateRange.endDate.toISOString());
        }

        const response = await apiClient.post('/pipe-optimization/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        onOptimizationComplete(response.data.data);
      } else {
        // Manual entry mode
        if (pipes.length === 0) {
          setError('Please add at least one pipe');
          setLoading(false);
          return;
        }

        // Check for valid pipe lengths
        for (const pipe of pipes) {
          if (pipe.length <= 0) {
            setError('Pipe length must be a positive number');
            setLoading(false);
            return;
          }
          if (pipe.length > stockLength) {
            setError(`Pipe length (${pipe.length}ft) exceeds stock length (${stockLength}ft)`);
            setLoading(false);
            return;
          }
        }

        // Convert feet to inches for API
        const pipesInInches = pipes.map(pipe => ({
          ...pipe,
          length: pipe.length * 12 // Convert to inches
        }));

        // Run optimization
        const response = await apiClient.post('/pipe-optimization', {
          pipes: pipesInInches,
          jobId: selectedJobId,
          stockLength: stockLength * 12, // Convert to inches
          ...(dateRange.startDate && dateRange.endDate && {
            startDate: dateRange.startDate.toISOString(),
            endDate: dateRange.endDate.toISOString()
          })
        });

        onOptimizationComplete(response.data.data);
      }
    } catch (error: any) {
      console.error('Optimization failed:', error);
      setError(error.response?.data?.message || 'Optimization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Optimization Parameters">
      <div className="space-y-6">
        {/* Job selection */}
        <div>
          <Select
            label="Select Job"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            options={[
              { value: '', label: 'Select a job...' },
              ...jobs.map((job) => ({
                value: job.id,
                label: job.details.title || `Job #${job.id.substring(0, 8)}`,
              })),
            ]}
            disabled={jobsLoading}
            error={!selectedJobId ? 'Please select a job' : undefined}
          />
        </div>

        {/* Date range selection */}
        <div>
          <DateRangePicker
            label="Date Range (Optional)"
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={(range) => setDateRange(range)}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Select a date range to filter optimization data (optional)
          </p>
        </div>

        {/* Toggle between manual entry and file upload */}
        <div className="flex justify-end">
          <Button
            variant="secondary"
            onClick={toggleMode}
            leftIcon={uploadMode ? <PlusIcon className="h-5 w-5" /> : <DocumentArrowUpIcon className="h-5 w-5" />}
          >
            {uploadMode ? 'Manual Entry' : 'Upload File'}
          </Button>
        </div>

        {uploadMode ? (
          /* File upload mode */
          <div>
            <FileUpload
              label="Upload Excel or CSV File"
              accept=".xlsx,.xls,.xlsm,.csv"
              onChange={handleFileChange}
              maxSize={10} // 10MB
              hint="Upload an Excel or CSV file containing pipe specifications"
            />
          </div>
        ) : (
          /* Manual entry mode */
          <>
            {/* Stock length */}
            <div>
              <Input
                label="Stock Length (ft)"
                type="number"
                value={stockLength.toString()}
                onChange={(e) => setStockLength(Number(e.target.value))}
                min={1}
                step={0.5}
                error={stockLength <= 0 ? 'Stock length must be a positive number' : undefined}
              />
            </div>

            {/* Pipes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pipes to Cut
              </label>
              <div className="space-y-3">
                {pipes.map((pipe, index) => (
                  <div key={index} className="flex items-end gap-3">
                    <div className="flex-1">
                      <Select
                        label={`Pipe ${index + 1} OD`}
                        value={pipe.od}
                        onChange={(e) => handleOdChange(index, e.target.value)}
                        options={odOptions}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        label={`Pipe ${index + 1} Length (ft)`}
                        type="number"
                        value={pipe.length.toString()}
                        onChange={(e) => handlePipeLengthChange(index, Number(e.target.value))}
                        min={0.5}
                        max={stockLength}
                        step={0.5}
                        error={
                          pipe.length <= 0
                            ? 'Length must be positive'
                            : pipe.length > stockLength
                            ? 'Length exceeds stock length'
                            : undefined
                        }
                      />
                    </div>
                    <div>
                      <Button
                        variant="danger"
                        onClick={() => handleRemovePipe(index)}
                        disabled={pipes.length === 1}
                        leftIcon={<MinusIcon className="h-5 w-5" />}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <Button
                  variant="secondary"
                  onClick={handleAddPipe}
                  leftIcon={<PlusIcon className="h-5 w-5" />}
                >
                  Add Pipe
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Submit button */}
        <div>
          <Button
            onClick={handleOptimize}
            isLoading={loading}
            leftIcon={<ArrowPathIcon className="h-5 w-5" />}
          >
            Run Optimization
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PipeOptimizationForm;