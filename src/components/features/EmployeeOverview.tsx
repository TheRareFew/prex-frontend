import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEmployeeMetrics, EmployeeMetrics } from '../../hooks/useEmployeeMetrics';

const MetricCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
  <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{value}</p>
  </div>
);

const EmployeeMetricsDetail: React.FC<{ metrics: EmployeeMetrics }> = ({ metrics }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">
          {metrics.full_name || 'Unknown Employee'}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Department: {metrics.department || 'Unassigned'}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <MetricCard title="Total Tickets Assigned" value={metrics.total_tickets_assigned} />
          <MetricCard title="Total Tickets Resolved" value={metrics.total_tickets_resolved} />
          <MetricCard title="Current Open Tickets" value={metrics.current_open_tickets} />
          <MetricCard 
            title="Average Resolution Time" 
            value={metrics.avg_resolution_time || 'N/A'} 
          />
          <MetricCard title="Total Messages Sent" value={metrics.total_messages_sent} />
          <MetricCard 
            title="Avg Messages per Ticket" 
            value={metrics.avg_messages_per_ticket.toFixed(2)} 
          />
          <MetricCard title="Articles Created" value={metrics.total_articles_created} />
          <MetricCard title="Articles Published" value={metrics.total_articles_published} />
          <MetricCard 
            title="Article Approval Rate" 
            value={`${metrics.article_approval_rate.toFixed(1)}%`} 
          />
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2 dark:text-white">Ticket Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2 dark:text-gray-300">By Priority</h4>
              {Object.entries(metrics.tickets_by_priority).map(([priority, count]) => (
                <div key={priority} className="flex justify-between items-center mb-1">
                  <span className="text-gray-600 dark:text-gray-400 capitalize">{priority}</span>
                  <span className="font-medium dark:text-white">{count}</span>
                </div>
              ))}
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2 dark:text-gray-300">By Category</h4>
              {Object.entries(metrics.tickets_by_category).map(([category, count]) => (
                <div key={category} className="flex justify-between items-center mb-1">
                  <span className="text-gray-600 dark:text-gray-400 capitalize">{category}</span>
                  <span className="font-medium dark:text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2 dark:text-white">Monthly Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricCard 
              title="Monthly Tickets Resolved" 
              value={metrics.monthly_tickets_resolved} 
            />
            <MetricCard 
              title="Monthly Response Rate" 
              value={`${metrics.monthly_response_rate.toFixed(1)}%`} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const EmployeeOverview: React.FC = () => {
  const { isManager, userRole } = useAuth();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>();
  const { metrics, selectedMetrics, loading, error } = useEmployeeMetrics(selectedEmployeeId);

  if (!isManager && userRole !== 'admin') {
    return (
      <div className="p-4 text-red-600">
        Access denied. Manager or admin privileges required.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">Loading employee metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error loading metrics: {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4 dark:text-white">
        Employee Overview
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Employee List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-4 dark:text-white">Employees</h2>
            <div className="space-y-2">
              {metrics.map((metric) => (
                <button
                  key={metric.employee_id}
                  onClick={() => setSelectedEmployeeId(metric.employee_id)}
                  className={`w-full text-left p-2 rounded ${
                    selectedEmployeeId === metric.employee_id
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="font-medium dark:text-white">
                    {metric.full_name || 'Unknown Employee'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {metric.department || 'No Department'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics Detail */}
        <div className="lg:col-span-3">
          {selectedMetrics ? (
            <EmployeeMetricsDetail metrics={selectedMetrics} />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-gray-600 dark:text-gray-300">
                Select an employee to view their metrics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 