import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';

interface Cut {
  length: number;
  diameter: number;
  position: number;
  rfidCode?: string;
  partNumber?: string;
  drillOperations?: string;
}

interface CuttingPlan {
  stockIndex: number;
  stockLength: number;
  cuts: Cut[];
  remainingLength: number;
  utilization_percent?: number;
}

interface OptimizationResult {
  stockPieces: number;
  wastage: number;
  totalLength: number;
  utilization: number;
  cuttingPlan: CuttingPlan[];
}

interface PipeOptimizationResultsProps {
  result: OptimizationResult;
  onReset: () => void;
}

const PipeOptimizationResults: React.FC<PipeOptimizationResultsProps> = ({ result, onReset }) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // Generate colors for different pipes
  const generateColor = (index: number): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-orange-500',
      'bg-teal-500',
      'bg-cyan-500',
    ];
    return colors[index % colors.length];
  };

  // Format length from inches to feet and inches
  const formatLength = (inches: number): string => {
    const feet = Math.floor(inches / 12);
    const remainingInches = Math.round((inches % 12) * 100) / 100;
    
    if (remainingInches === 0) {
      return `${feet}'`;
    } else {
      return `${feet}' ${remainingInches}"`;
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle export to CSV
  const handleExport = () => {
    // Create CSV content
    let csvContent = 'Stock Index,Stock Length,Cut Index,Pipe Length,Diameter,Position,RFID Code,Part Number,Drill Operations\n';
    
    result.cuttingPlan.forEach(stock => {
      stock.cuts.forEach((cut, cutIndex) => {
        csvContent += `${stock.stockIndex + 1},${formatLength(stock.stockLength)},${cutIndex + 1},${formatLength(cut.length)},${cut.diameter}",${formatLength(cut.position)},"${cut.rfidCode || ''}","${cut.partNumber || ''}","${cut.drillOperations || ''}"\n`;
      });
    });
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pipe-optimization-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Optimization Results</h2>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            leftIcon={<ArrowDownTrayIcon className="h-5 w-5" />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
          <Button
            variant="secondary"
            leftIcon={<PrinterIcon className="h-5 w-5" />}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button variant="primary" onClick={onReset}>
            New Optimization
          </Button>
        </div>
      </div>

      {/* Print header - only visible when printing */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-bold text-center">Pipe Optimization Results</h1>
        <p className="text-center text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Summary */}
      <Card title="Summary" className="print:shadow-none print:border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Stock Pieces
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {result.stockPieces}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Length
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatLength(result.totalLength)}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Wastage
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatLength(result.wastage)}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Utilization
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {result.utilization.toFixed(2)}%
            </div>
          </div>
        </div>
      </Card>

      {/* Cutting Plan */}
      <Card 
        title="Cutting Plan" 
        className="print:shadow-none print:border"
        action={
          <Button 
            variant="link" 
            onClick={() => setShowDetails(!showDetails)}
            className="print:hidden"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
        }
      >
        <div className="space-y-6">
          {result.cuttingPlan.map((plan) => (
            <div
              key={plan.stockIndex}
              className="border border-gray-200 dark:border-gray-700 rounded-md p-4"
            >
              <div className="flex justify-between mb-2">
                <div className="font-medium">Stock #{plan.stockIndex + 1}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 space-x-4">
                  <span>Length: {formatLength(plan.stockLength)}</span>
                  <span>Remaining: {formatLength(plan.remainingLength)}</span>
                  {plan.utilization_percent && (
                    <span>Utilization: {plan.utilization_percent.toFixed(2)}%</span>
                  )}
                </div>
              </div>

              {/* Visualization */}
              <div className="relative h-12 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden mb-3">
                {/* Waste element indicator */}
                <div 
                  className="absolute h-full bg-gray-300 dark:bg-gray-600 right-0"
                  style={{ width: '2px' }}
                  title="Waste Element (2 inches)"
                ></div>
                
                {plan.cuts.map((cut, index) => (
                  <div
                    key={index}
                    className={`absolute h-full ${generateColor(index)} flex items-center justify-center`}
                    style={{
                      left: `${(cut.position / plan.stockLength) * 100}%`,
                      width: `${(cut.length / plan.stockLength) * 100}%`,
                    }}
                    title={`Length: ${formatLength(cut.length)}, Diameter: ${cut.diameter}"`}
                  >
                    <span className="text-white text-xs font-medium truncate px-1">
                      {cut.length > 36 ? formatLength(cut.length) : ''}
                    </span>
                  </div>
                ))}
              </div>

              {/* RFID Labels */}
              <div className="flex flex-wrap gap-2 mb-3">
                {plan.cuts.map((cut, index) => (
                  <div
                    key={index}
                    className={`text-xs px-2 py-1 rounded text-white ${generateColor(index)}`}
                  >
                    {cut.rfidCode || `Pipe ${index + 1}`}
                  </div>
                ))}
              </div>

              {/* Detailed cut information */}
              {(showDetails || window.matchMedia('print').matches) && (
                <div className="mt-3">
                  <div className="text-sm font-medium mb-2">Cut Details:</div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Cut #
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Length
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Diameter
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Position
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            RFID Code
                          </th>
                          {(plan.cuts[0]?.partNumber || plan.cuts[0]?.drillOperations) && (
                            <>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Part Number
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Drill Operations
                              </th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {plan.cuts.map((cut, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {index + 1}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatLength(cut.length)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {cut.diameter}"
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatLength(cut.position)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {cut.rfidCode || '-'}
                            </td>
                            {(plan.cuts[0]?.partNumber || plan.cuts[0]?.drillOperations) && (
                              <>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {cut.partNumber || '-'}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {cut.drillOperations || 'NONE'}
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default PipeOptimizationResults;