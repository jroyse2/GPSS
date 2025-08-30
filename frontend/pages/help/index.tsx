import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  QuestionMarkCircleIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('faq');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // FAQ data
  const faqs = [
    {
      question: 'How do I create a new job?',
      answer:
        'To create a new job, navigate to the Jobs page and click on the "Create Job" button. Fill in the required information in the form and click "Submit".',
    },
    {
      question: 'How does the pipe optimization work?',
      answer:
        'The pipe optimization feature uses an algorithm to minimize waste when cutting pipes. It takes into account the required pipe lengths and diameters, and calculates the most efficient way to cut them from standard stock lengths.',
    },
    {
      question: 'Can I change my password?',
      answer:
        'Yes, you can change your password in the Profile page. Click on your username in the top right corner, select "Profile", and then use the "Change Password" form.',
    },
    {
      question: 'How do I schedule resources?',
      answer:
        'Resource scheduling is available in the Scheduling page. You can assign resources to jobs, set time slots, and manage availability.',
    },
    {
      question: 'What do the different job statuses mean?',
      answer:
        'Jobs can have one of four statuses: "Pending" (not started), "In Progress" (currently being worked on), "Completed" (finished), or "Cancelled" (no longer active).',
    },
  ];

  // Filter FAQs based on search query
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle contact form submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);

    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setSuccess('Your message has been sent. We will get back to you soon.');
      // Reset form
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <MainLayout title="Help & Support | Capstone Portal">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Find answers to common questions or contact support
          </p>
        </div>

        {/* Search */}
        <Card>
          <div className="max-w-lg mx-auto">
            <Input
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
            />
          </div>
        </Card>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('faq')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'faq'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <QuestionMarkCircleIcon className="h-5 w-5 mr-2" />
                FAQ
              </div>
            </button>
            <button
              onClick={() => setActiveTab('guides')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'guides'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <BookOpenIcon className="h-5 w-5 mr-2" />
                Guides
              </div>
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contact'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                Contact Support
              </div>
            </button>
          </nav>
        </div>

        {/* Tab content */}
        <div className="mt-6">
          {/* FAQ tab */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-8">
                  <QuestionMarkCircleIcon className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    No FAQs found matching your search
                  </p>
                </div>
              ) : (
                filteredFaqs.map((faq, index) => (
                  <Card key={index}>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {faq.question}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">{faq.answer}</p>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Guides tab */}
          {activeTab === 'guides' && (
            <div className="space-y-6">
              <Card title="Getting Started">
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Introduction to the Capstone Portal
                    </h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                      Learn about the key features and how to navigate the portal.
                    </p>
                    <Button variant="link" className="mt-2 p-0">
                      Read Guide
                    </Button>
                  </div>
                  <div className="border-l-4 border-primary pl-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Job Management
                    </h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                      Learn how to create, update, and track jobs in the system.
                    </p>
                    <Button variant="link" className="mt-2 p-0">
                      Read Guide
                    </Button>
                  </div>
                  <div className="border-l-4 border-primary pl-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Pipe Optimization
                    </h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                      Learn how to use the pipe optimization feature to minimize waste.
                    </p>
                    <Button variant="link" className="mt-2 p-0">
                      Read Guide
                    </Button>
                  </div>
                </div>
              </Card>

              <Card title="Advanced Topics">
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Resource Scheduling
                    </h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                      Learn how to efficiently schedule resources and manage time.
                    </p>
                    <Button variant="link" className="mt-2 p-0">
                      Read Guide
                    </Button>
                  </div>
                  <div className="border-l-4 border-primary pl-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Workflow Management
                    </h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                      Learn how to create and manage workflows for your manufacturing processes.
                    </p>
                    <Button variant="link" className="mt-2 p-0">
                      Read Guide
                    </Button>
                  </div>
                  <div className="border-l-4 border-primary pl-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Reports and Analytics
                    </h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                      Learn how to generate reports and analyze performance metrics.
                    </p>
                    <Button variant="link" className="mt-2 p-0">
                      Read Guide
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Contact Support tab */}
          {activeTab === 'contact' && (
            <Card title="Contact Support">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Name"
                    name="name"
                    required
                    placeholder="Your name"
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    required
                    placeholder="Your email address"
                  />
                </div>
                <div>
                  <Input
                    label="Subject"
                    name="subject"
                    required
                    placeholder="What is your question about?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    required
                    placeholder="How can we help you?"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  ></textarea>
                </div>

                {/* Success message */}
                {success && (
                  <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 p-3 rounded-md text-sm">
                    {success}
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <Button type="submit" isLoading={submitting}>
                    Send Message
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default HelpPage;