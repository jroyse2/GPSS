// pages/dashboard/index.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/utils/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({ totalJobs: 0, activeJobs: 0, completedJobs: 0 });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use Promise.all to fetch multiple endpoints in parallel
        // Add try-catch to handle potential errors for each request separately
        try {
          console.log('[Dashboard] Fetching job stats');
          const statsResponse = await apiClient.get('/jobs/stats');
          setStats(statsResponse.data.data || { totalJobs: 0, activeJobs: 0, completedJobs: 0 });
        } catch (err) {
          console.error('[Dashboard] Failed to fetch job stats:', err);
          // Use default values if stats fetch fails
          setStats({ totalJobs: 0, activeJobs: 0, completedJobs: 0 });
        }
        
        try {
          console.log('[Dashboard] Fetching recent jobs');
          const jobsResponse = await apiClient.get('/jobs?limit=5');
          setRecentJobs(jobsResponse.data.data || []);
        } catch (err) {
          console.error('[Dashboard] Failed to fetch recent jobs:', err);
          setRecentJobs([]);
        }
      } catch (err) {
        console.error('[Dashboard] Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 p-4 rounded-md mb-6">
              <p>{error}</p>
              <button 
                className="mt-2 text-sm text-red-600 dark:text-red-300 underline"
                onClick={() => router.reload()}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Jobs</h2>
                  <p className="text-3xl font-bold">{stats.totalJobs}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Jobs</h2>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.activeJobs}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Completed Jobs</h2>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completedJobs}</p>
                </div>
              </div>
              
              {/* Recent Jobs */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium">Recent Jobs</h2>
                </div>
                <div className="p-6">
                  {recentJobs.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {recentJobs.map((job: any) => (
                            <tr key={job.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{job.title}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  job.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                  job.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                }`}>
                                  {job.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {new Date(job.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No recent jobs found.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Dashboard;