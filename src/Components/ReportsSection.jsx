import React, { useState, useEffect } from 'react';
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
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  calculateAverageResolutionTime,
  getMostCommonCategories,
  getTicketTrends,
  getTicketsResolvedPerTechnician
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

const ReportsSection = ({ tickets, users }) => {
  const [reportData, setReportData] = useState({
    totalResolved: 0,
    averageResolutionTime: 0,
    mostCommonCategories: [],
    technicianPerformance: [],
    monthlyTrends: null,
    resolutionTimeByPriority: null,
    ticketVolumeByDepartment: null
  });

  useEffect(() => {
    if (tickets && users) {
      generateReports();
    }
  }, [tickets, users]);

  const generateReports = async () => {
    // Basic metrics
    const resolvedTickets = tickets.filter(t => t.status === 'Resolved');
    const totalResolved = resolvedTickets.length;
    const averageResolutionTime = calculateAverageResolutionTime(tickets);
    const mostCommonCategories = getMostCommonCategories(tickets);
    const technicianPerformance = await getTicketsResolvedPerTechnician(tickets, users);

    // Monthly trends (last 12 months)
    const monthlyTrends = generateMonthlyTrends(tickets);

    // Resolution time by priority
    const resolutionTimeByPriority = calculateResolutionTimeByPriority(tickets);

    // Ticket volume by department
    const ticketVolumeByDepartment = calculateTicketVolumeByDepartment(tickets);

    setReportData({
      totalResolved,
      averageResolutionTime,
      mostCommonCategories,
      technicianPerformance,
      monthlyTrends,
      resolutionTimeByPriority,
      ticketVolumeByDepartment
    });
  };

  const generateMonthlyTrends = (tickets) => {
    const last12Months = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      last12Months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        key: monthKey,
        created: 0,
        resolved: 0
      });
    }

    tickets.forEach(ticket => {
      const createdDate = ticket.createdAt?.toDate?.() || new Date(ticket.createdAt);
      const createdKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
      
      const monthIndex = last12Months.findIndex(m => m.key === createdKey);
      if (monthIndex !== -1) {
        last12Months[monthIndex].created++;
      }

      if (ticket.status === 'Resolved') {
        const resolvedDate = ticket.updatedAt?.toDate?.() || new Date(ticket.updatedAt);
        const resolvedKey = `${resolvedDate.getFullYear()}-${String(resolvedDate.getMonth() + 1).padStart(2, '0')}`;
        
        const resolvedMonthIndex = last12Months.findIndex(m => m.key === resolvedKey);
        if (resolvedMonthIndex !== -1) {
          last12Months[resolvedMonthIndex].resolved++;
        }
      }
    });

    return {
      labels: last12Months.map(m => m.month),
      datasets: [
        {
          label: 'Tickets Created',
          data: last12Months.map(m => m.created),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
        },
        {
          label: 'Tickets Resolved',
          data: last12Months.map(m => m.resolved),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.1,
        }
      ]
    };
  };

  const calculateResolutionTimeByPriority = (tickets) => {
    const priorities = ['Low', 'Medium', 'High'];
    const resolutionTimes = priorities.map(priority => {
      const priorityTickets = tickets.filter(t => 
        t.priority === priority && t.status === 'Resolved' && t.createdAt && t.updatedAt
      );

      if (priorityTickets.length === 0) return 0;

      const totalTime = priorityTickets.reduce((sum, ticket) => {
        const createdTime = ticket.createdAt?.toDate?.() || new Date(ticket.createdAt);
        const resolvedTime = ticket.updatedAt?.toDate?.() || new Date(ticket.updatedAt);
        const diffInHours = (resolvedTime - createdTime) / (1000 * 60 * 60);
        return sum + diffInHours;
      }, 0);

      return Math.round(totalTime / priorityTickets.length);
    });

    return {
      labels: priorities,
      datasets: [{
        label: 'Average Resolution Time (hours)',
        data: resolutionTimes,
        backgroundColor: [
          'rgba(34, 197, 94, 0.5)',
          'rgba(251, 191, 36, 0.5)',
          'rgba(239, 68, 68, 0.5)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      }]
    };
  };

  const calculateTicketVolumeByDepartment = (tickets) => {
    const departmentCount = {};
    
    tickets.forEach(ticket => {
      const department = ticket.department || 'General';
      departmentCount[department] = (departmentCount[department] || 0) + 1;
    });

    const departments = Object.keys(departmentCount);
    const counts = Object.values(departmentCount);

    return {
      labels: departments,
      datasets: [{
        data: counts,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF'
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF'
        ]
      }]
    };
  };

  const exportReport = () => {
    const reportContent = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalTickets: tickets.length,
        resolvedTickets: reportData.totalResolved,
        averageResolutionTime: reportData.averageResolutionTime,
        resolutionRate: ((reportData.totalResolved / tickets.length) * 100).toFixed(1)
      },
      mostCommonCategories: reportData.mostCommonCategories,
      technicianPerformance: reportData.technicianPerformance
    };

    const dataStr = JSON.stringify(reportContent, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `ticket-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (!tickets || !users) {
    return <div>Loading reports...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Report Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
          <p className="text-gray-600">Comprehensive insights into ticket system performance</p>
        </div>
        <button
          onClick={exportReport}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Tickets</h3>
          <p className="text-3xl font-bold text-blue-600">{tickets.length}</p>
          <p className="text-sm text-gray-500">All time</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Resolved Tickets</h3>
          <p className="text-3xl font-bold text-green-600">{reportData.totalResolved}</p>
          <p className="text-sm text-gray-500">
            {((reportData.totalResolved / tickets.length) * 100).toFixed(1)}% resolution rate
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Avg. Resolution Time</h3>
          <p className="text-3xl font-bold text-purple-600">{reportData.averageResolutionTime}h</p>
          <p className="text-sm text-gray-500">Hours to resolve</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Active Technicians</h3>
          <p className="text-3xl font-bold text-orange-600">
            {users.filter(u => u.role === 'technician').length}
          </p>
          <p className="text-sm text-gray-500">Available staff</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Trends (12 Months)</h3>
          {reportData.monthlyTrends && (
            <div className="h-64">
              <Line 
                data={reportData.monthlyTrends}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { stepSize: 1 }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Resolution Time by Priority */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Resolution Time by Priority</h3>
          {reportData.resolutionTimeByPriority && (
            <div className="h-64">
              <Bar 
                data={reportData.resolutionTimeByPriority}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Hours'
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Ticket Volume by Department */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Tickets by Department</h3>
          {reportData.ticketVolumeByDepartment && (
            <div className="h-64">
              <Doughnut 
                data={reportData.ticketVolumeByDepartment}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Most Common Issues */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Most Common Issues</h3>
          <div className="space-y-3">
            {reportData.mostCommonCategories.slice(0, 5).map((category, index) => (
              <div key={category.category} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  {index + 1}. {category.category}
                </span>
                <span className="text-sm text-gray-500">{category.count} tickets</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technician Performance Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Technician Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Technician
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tickets Resolved
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.technicianPerformance.map((tech) => (
                <tr key={tech.technicianId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tech.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tech.resolvedCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ 
                            width: `${Math.min((tech.resolvedCount / Math.max(...reportData.technicianPerformance.map(t => t.resolvedCount))) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {tech.resolvedCount > 0 ? 'Active' : 'No resolutions'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsSection;
