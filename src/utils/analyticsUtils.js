import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

// Calculate average resolution time
export const calculateAverageResolutionTime = (tickets) => {
  const resolvedTickets = tickets.filter(ticket => 
    ticket.status === 'Resolved' && ticket.createdAt && ticket.updatedAt
  );

  if (resolvedTickets.length === 0) return 0;

  const totalTime = resolvedTickets.reduce((sum, ticket) => {
    const createdTime = ticket.createdAt?.toDate?.() || new Date(ticket.createdAt);
    const resolvedTime = ticket.updatedAt?.toDate?.() || new Date(ticket.updatedAt);
    const diffInHours = (resolvedTime - createdTime) / (1000 * 60 * 60);
    return sum + diffInHours;
  }, 0);

  return Math.round(totalTime / resolvedTickets.length);
};

// Get tickets by priority distribution
export const getTicketsByPriority = (tickets) => {
  const priorities = ['Low', 'Medium', 'High'];
  return priorities.map(priority => ({
    priority,
    count: tickets.filter(ticket => ticket.priority === priority).length
  }));
};

// Get tickets resolved per technician
export const getTicketsResolvedPerTechnician = (tickets, users) => {
  // Get all technicians first
  const technicians = users.filter(user => user.role === 'technician');
  
  // Initialize stats for all technicians
  const technicianStats = {};
  technicians.forEach(tech => {
    technicianStats[tech.id] = {
      count: 0,
      name: tech.name || tech.fullName || tech.email || 'Unknown Technician'
    };
  });

  // Count resolved tickets for each technician
  const resolvedTickets = tickets.filter(ticket => 
    ticket.status === 'Resolved' && ticket.assignedTo
  );

  resolvedTickets.forEach(ticket => {
    const techId = ticket.assignedTo;
    if (technicianStats[techId]) {
      technicianStats[techId].count++;
    }
  });

  // Convert to array format for charts
  return Object.entries(technicianStats).map(([id, data]) => ({
    technicianId: id,
    name: data.name,
    resolvedCount: data.count
  }));
};

// Get most common issue categories
export const getMostCommonCategories = (tickets) => {
  const categoryCount = {};
  
  tickets.forEach(ticket => {
    const category = ticket.category || 'Uncategorized';
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });

  return Object.entries(categoryCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
};

// Get ticket trends over time (last 30 days)
export const getTicketTrends = (tickets) => {
  const last30Days = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    last30Days.push({
      date: date.toISOString().split('T')[0],
      created: 0,
      resolved: 0
    });
  }

  tickets.forEach(ticket => {
    const createdDate = ticket.createdAt?.toDate?.() || new Date(ticket.createdAt);
    const createdDateStr = createdDate.toISOString().split('T')[0];
    
    const dayIndex = last30Days.findIndex(day => day.date === createdDateStr);
    if (dayIndex !== -1) {
      last30Days[dayIndex].created++;
    }

    if (ticket.status === 'Resolved') {
      const resolvedDate = ticket.updatedAt?.toDate?.() || new Date(ticket.updatedAt);
      const resolvedDateStr = resolvedDate.toISOString().split('T')[0];
      
      const resolvedDayIndex = last30Days.findIndex(day => day.date === resolvedDateStr);
      if (resolvedDayIndex !== -1) {
        last30Days[resolvedDayIndex].resolved++;
      }
    }
  });

  return last30Days;
};

// Get technician workload
export const getTechnicianWorkload = (tickets, users) => {
  try {
    const technicians = users.filter(user => user.role === 'technician');
    const workloadData = [];

    technicians.forEach(technician => {
      // Count open tickets assigned to this technician from the existing tickets data
      const openTicketsCount = tickets.filter(ticket => 
        ticket.assignedTo === technician.id && 
        (ticket.status === 'Open' || ticket.status === 'In Progress')
      ).length;

      workloadData.push({
        technicianId: technician.id,
        name: technician.name || technician.fullName || technician.email || 'Unknown Technician',
        openTickets: openTicketsCount
      });
    });

    return workloadData;
  } catch (error) {
    console.error('Error getting technician workload:', error);
    return [];
  }
};

// Get unassigned tickets from existing data
export const getUnassignedTickets = (tickets) => {
  return tickets.filter(ticket => 
    !ticket.assignedTo && ticket.status !== 'Closed'
  );
};
