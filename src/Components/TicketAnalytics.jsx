import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  getTicketsByPriority,
  getTicketsResolvedPerTechnician,
  getMostCommonCategories,
  getTicketTrends,
  calculateAverageResolutionTime
} from '../utils/analyticsUtils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const TicketAnalytics = ({ tickets, users }) => {
  const [priorityData, setPriorityData] = useState(null);
  const [technicianData, setTechnicianData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [averageResolutionTime, setAverageResolutionTime] = useState(0);

  useEffect(() => {
    if (tickets && users) {
      // Calculate all analytics data
      const calculateAnalytics = async () => {
        // Priority distribution
        const priorityStats = getTicketsByPriority(tickets);
        setPriorityData({
          labels: priorityStats.map(item => item.priority),
          datasets: [{
            label: 'Tickets by Priority',
            data: priorityStats.map(item => item.count),
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 206, 86, 0.5)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
            ],
            borderWidth: 1,
          }]
        });

        // Technician performance
        const techStats = await getTicketsResolvedPerTechnician(tickets, users);
        setTechnicianData({
          labels: techStats.map(tech => tech.name),
          datasets: [{
            label: 'Tickets Resolved',
            data: techStats.map(tech => tech.resolvedCount),
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          }]
        });

        // Category distribution
        const categoryStats = getMostCommonCategories(tickets);
        setCategoryData({
          labels: categoryStats.map(cat => cat.category),
          datasets: [{
            label: 'Issues by Category',
            data: categoryStats.map(cat => cat.count),
            backgroundColor: 'rgba(153, 102, 255, 0.5)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
          }]
        });

        // Ticket trends
        const trends = getTicketTrends(tickets);
        setTrendData({
          labels: trends.map(day => day.date),
          datasets: [
            {
              label: 'Created Tickets',
              data: trends.map(day => day.created),
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
            {
              label: 'Resolved Tickets',
              data: trends.map(day => day.resolved),
              borderColor: 'rgb(255, 99, 132)',
              tension: 0.1,
            }
          ]
        });

        // Average resolution time
        const avgTime = calculateAverageResolutionTime(tickets);
        setAverageResolutionTime(avgTime);
      };

      calculateAnalytics();
    }
  }, [tickets, users]);

  if (!tickets || !users) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Tickets</h3>
          <p className="text-3xl font-bold text-blue-600">{tickets.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Open Tickets</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {tickets.filter(t => t.status === 'Open').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Resolved Tickets</h3>
          <p className="text-3xl font-bold text-green-600">
            {tickets.filter(t => t.status === 'Resolved').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Avg. Resolution Time</h3>
          <p className="text-3xl font-bold text-purple-600">{averageResolutionTime}h</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Tickets by Priority</h3>
          {priorityData && (
            <div className="h-64">
              <Pie data={priorityData} options={{ maintainAspectRatio: false }} />
            </div>
          )}
        </div>

        {/* Technician Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Tickets Resolved per Technician</h3>
          {technicianData && (
            <div className="h-64">
              <Bar 
                data={technicianData} 
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Most Common Issues</h3>
          {categoryData && (
            <div className="h-64">
              <Bar 
                data={categoryData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Ticket Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Ticket Trends (30 Days)</h3>
          {trendData && (
            <div className="h-64">
              <Line 
                data={trendData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketAnalytics;
