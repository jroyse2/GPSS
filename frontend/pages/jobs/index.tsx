import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import apiClient from '@/utils/api';
import { Job, JobStatus, JobPriority } from '@/utils/types';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const JobsPage: React.FC = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const params: Record<string, string> = {};
        if (statusFilter !== 'all') params.status = statusFilter;
        if (priorityFilter !== 'all') params.priority = priorityFilter;
        if (searchQuery) params.search = searchQuery;

        // Fetch jobs
        const response = await apiClient.get('/jobs', { params });
        setJobs(response.data.data);
      } catch (error: any) {
        console.error('Failed to fetch jobs:', error);
        setError(error.response?.data?.message || 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [statusFilter, priorityFilter, searchQuery]);

  // Navigate to job details
  const handleJobClick = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  // Navigate to create job page
  const handleCreateJob = () => {
    router.push('/jobs/create');
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: JobStatus) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  // Get priority badge variant
  const getPriorityBadgeVariant = (priority: JobPriority) => {
    switch (priority) {
      case 'low':
        return 'default';
      case 'medium':
        return 'info';
      case 'high':
        return 'warning';
      case 'urgent':
        return 'danger';
      default:
        return 'default';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <MainLayout title="Jobs | Capstone Portal">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jobs</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage and track all manufacturing jobs
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              onClick={handleCreateJob}
              leftIcon={<PlusIcon className="h-5 w-5" />}
            >
              Create Job
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                label="Search Jobs"
                placeholder="Search by title, customer, or ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
              />
            </div>

            {/* Status filter */}
            <div className="w-full md:w-48">
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
            </div>

            {/* Priority filter */}
            <div className="w-full md:w-48">
              <Select
                label="Priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Priorities' },
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' },
                ]}
              />
            </div>
          </div>
        </Card>

        {/* Jobs list */}
        <Card>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 p-4 rounded-md">
              {error}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No jobs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Job
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Priority
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      onClick={() => handleJobClick(job.id)}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {job.details.title || `Job #${job.id.substring(0, 8)}`}
                        </div>
                        {job.details.customer && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {job.details.customer}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(job.status)} rounded>
                          {job.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getPriorityBadgeVariant(job.priority)}>
                          {job.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(job.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default JobsPage;