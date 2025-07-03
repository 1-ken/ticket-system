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
export const getTicketsResolvedPerTechnician = async (tickets, users) => {
  const resolvedTickets = tickets.filter(ticket => 
    ticket.status === 'Resolved' && ticket.assignedTo
  );

  const technicianStats = {};
  
  resolvedTickets.forEach(ticket => {
    const techId = ticket.assignedTo;
    if (!technicianStats[techId]) {
      technicianStats[techId] = {
        count: 0,
        name: 'Unknown'
      };
    }
    technicianStats[techId].count++;
  });

  // Map technician IDs to names
  users.forEach(user => {
    if (technicianStats[user.id] && user.role === 'technician') {
      technicianStats[user.id].name = user.name || user.fullName || user.email;
    }
  });

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
export const getTechnicianWorkload = async (users) => {
  try {
    const technicians = users.filter(user => user.role === 'technician');
    const workloadData = [];

    for (const technician of technicians) {
      // Get open tickets assigned to this technician
      const openTicketsQuery = query(
        collection(db, 'tickets'),
        where('assignedTo', '==', technician.id),
        where('status', 'in', ['Open', 'In Progress'])
      );
      
      const openTicketsSnapshot = await getDocs(openTicketsQuery);
      const openTicketsCount = openTicketsSnapshot.size;

      workloadData.push({
        technicianId: technician.id,
        name: technician.name || technician.fullName || technician.email,
        openTickets: openTicketsCount
      });
    }

    return workloadData;
  } catch (error) {
    console.error('Error getting technician workload:', error);
    return [];
  }
};

// Get unassigned tickets
export const getUnassignedTickets = async () => {
  try {
    const unassignedQuery = query(
      collection(db, 'tickets'),
      where('assignedTo', '==', null),
      where('status', '!=', 'Closed')
    );
    
    const snapshot = await getDocs(unassignedQuery);
    const tickets = [];
    
    snapshot.forEach(doc => {
      tickets.push({ id: doc.id, ...doc.data() });
    });

    return tickets;
  } catch (error) {
    console.error('Error getting unassigned tickets:', error);
    return [];
  }
};
