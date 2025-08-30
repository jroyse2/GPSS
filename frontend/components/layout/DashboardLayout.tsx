import React from 'react';
import MainLayout from './MainLayout';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <MainLayout title="Dashboard - Capstone Portal">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 md:p-6">
        {children}
      </div>
    </MainLayout>
  );
};

export default DashboardLayout;