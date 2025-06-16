import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  addDoc
} from "firebase/firestore";
import { db } from "../firebase";

// Generate unique ticket ID
export const generateTicketId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `TKT${timestamp}${randomStr}`.toUpperCase();
};

// Create a new ticket
export const createTicket = async (ticketData, userId) => {
  try {
    const ticketId = generateTicketId();
    const ticketRef = doc(db, "tickets", ticketId);
    
    const ticket = {
      ticketId: ticketId,
      title: ticketData.title,
      description: ticketData.description,
      category: ticketData.category,
      priority: ticketData.priority,
      status: "Open",
      createdBy: userId,
      assignedTo: null,
      department: ticketData.department,
      floor: ticketData.floor,
      officeNumber: ticketData.officeNumber,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(ticketRef, ticket);
    return { success: true, ticketId };
  } catch (error) {
    console.error("Error creating ticket:", error);
    return { success: false, error: error.message };
  }
};

// Get tickets for a user (based on role)
export const getUserTickets = async (userId, userRole) => {
  try {
    let q;
    
    if (userRole === "admin") {
      // Admin can see all tickets
      q = query(collection(db, "tickets"), orderBy("createdAt", "desc"));
    } else if (userRole === "technician") {
      // Technician can see assigned tickets and unassigned tickets
      q = query(
        collection(db, "tickets"), 
        where("assignedTo", "in", [userId, null]),
        orderBy("createdAt", "desc")
      );
    } else {
      // User can only see their own tickets
      q = query(
        collection(db, "tickets"), 
        where("createdBy", "==", userId),
        orderBy("createdAt", "desc")
      );
    }

    const querySnapshot = await getDocs(q);
    const tickets = [];
    querySnapshot.forEach((doc) => {
      tickets.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, tickets };
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return { success: false, error: error.message };
  }
};

// Update ticket status
export const updateTicketStatus = async (ticketId, status, userId) => {
  try {
    const ticketRef = doc(db, "tickets", ticketId);
    await updateDoc(ticketRef, {
      status: status,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return { success: false, error: error.message };
  }
};

// Assign ticket to technician
export const assignTicket = async (ticketId, technicianId) => {
  try {
    const ticketRef = doc(db, "tickets", ticketId);
    await updateDoc(ticketRef, {
      assignedTo: technicianId,
      status: "In Progress",
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error assigning ticket:", error);
    return { success: false, error: error.message };
  }
};

// Add comment to ticket
export const addTicketComment = async (ticketId, authorId, message) => {
  try {
    const commentId = `CMT${Date.now()}`;
    const commentRef = doc(db, "tickets", ticketId, "ticket_comments", commentId);
    
    const comment = {
      commentId: commentId,
      authorId: authorId,
      message: message,
      timestamp: serverTimestamp()
    };

    await setDoc(commentRef, comment);
    return { success: true };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { success: false, error: error.message };
  }
};

// Get ticket comments
export const getTicketComments = async (ticketId) => {
  try {
    const commentsRef = collection(db, "tickets", ticketId, "ticket_comments");
    const q = query(commentsRef, orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);
    
    const comments = [];
    querySnapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, comments };
  } catch (error) {
    console.error("Error fetching comments:", error);
    return { success: false, error: error.message };
  }
};

// Add feedback for closed ticket
export const addTicketFeedback = async (ticketId, userId, rating, comment) => {
  try {
    const feedbackRef = doc(db, "tickets", ticketId, "feedback", "user_feedback");
    
    const feedback = {
      rating: rating,
      comment: comment,
      submittedBy: userId,
      submittedAt: serverTimestamp()
    };

    await setDoc(feedbackRef, feedback);
    return { success: true };
  } catch (error) {
    console.error("Error adding feedback:", error);
    return { success: false, error: error.message };
  }
};

// Create notification
export const createNotification = async (uid, message) => {
  try {
    const notificationRef = collection(db, "notifications");
    
    const notification = {
      notificationId: `NTF${Date.now()}`,
      uid: uid,
      message: message,
      read: false,
      timestamp: serverTimestamp()
    };

    await addDoc(notificationRef, notification);
    return { success: true };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: error.message };
  }
};

// Get user notifications
export const getUserNotifications = async (userId) => {
  try {
    const q = query(
      collection(db, "notifications"), 
      where("uid", "==", userId),
      orderBy("timestamp", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const notifications = [];
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, notifications };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, error: error.message };
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: error.message };
  }
};
