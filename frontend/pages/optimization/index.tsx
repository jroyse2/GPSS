import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import PipeOptimizationForm from '@/components/optimization/PipeOptimizationForm';
import PipeOptimizationResults from '@/components/optimization/PipeOptimizationResults';

const OptimizationPage: React.FC = () => {
  const [optimizationResult, setOptimizationResult] = useState<any>(null);

  const handleOptimizationComplete = (result: any) => {
    setOptimizationResult(result);
  };

  const handleReset = () => {
    setOptimizationResult(null);
  };

  return (
    <MainLayout title="Pipe Optimization | Capstone Portal">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pipe Optimization</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Optimize pipe cutting to minimize waste and maximize efficiency
          </p>
        </div>

        {/* Optimization form or results */}
        {optimizationResult ? (
          <PipeOptimizationResults result={optimizationResult} onReset={handleReset} />
        ) : (
          <PipeOptimizationForm onOptimizationComplete={handleOptimizationComplete} />
        )}
      </div>
    </MainLayout>
  );
};

export default OptimizationPage;