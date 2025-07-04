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
  addDoc,
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
      status: "Open", // Explicit initial status
      createdBy: userId, // Ensure creator is set
      assignedTo: null, // Explicit null for unassigned tickets
      department: ticketData.department || "General",
      floor: ticketData.floor || "1",
      officeNumber: ticketData.officeNumber || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Create the ticket in Firestore
    await setDoc(ticketRef, ticket);

    // Create notifications for technicians - simplified approach
    try {
      console.log('🔔 Creating notifications for new ticket:', ticketId);
      
      // Create a broadcast notification that all technicians can see
      // We'll use a special notification that technicians can query for
      const broadcastNotificationRef = collection(db, "notifications");
      const broadcastNotification = {
        notificationId: `BROADCAST_${Date.now()}`,
        uid: 'technicians', // Special uid for technician broadcasts
        message: `🎫 NEW TICKET CREATED: ${ticketData.title} (${ticketData.department}, Floor ${ticketData.floor})`,
        read: false,
        timestamp: serverTimestamp(),
        type: 'new_ticket',
        ticketId: ticketId,
        broadcast: true // Flag to indicate this is a broadcast notification
      };

      await addDoc(broadcastNotificationRef, broadcastNotification);
      console.log('✅ Created broadcast notification for technicians');
      
    } catch (notificationError) {
      // Log the error but don't fail the ticket creation
      console.error('⚠️ Failed to create notifications for technicians:', notificationError);
      // The ticket was still created successfully
    }

    return { success: true, ticketId };
  } catch (error) {
    console.error("Error creating ticket:", error);
    return { success: false, error: error.message };
  }
};

// Get tickets for a user (based on role)
export const getUserTickets = async (userId, userRole) => {
  try {
    let tickets = [];

    if (userRole === "admin") {
      // Admin can see all tickets
      const q = query(collection(db, "tickets"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        tickets.push({ id: doc.id, ...doc.data() });
      });
    } else if (userRole === "technician") {
      // Get assigned tickets
      const assignedQuery = query(
        collection(db, "tickets"),
        where("assignedTo", "==", userId),
        orderBy("createdAt", "desc")
      );
      const assignedSnapshot = await getDocs(assignedQuery);
      
      // Get unassigned tickets
      const unassignedQuery = query(
        collection(db, "tickets"),
        where("assignedTo", "==", null),
        orderBy("createdAt", "desc")
      );
      const unassignedSnapshot = await getDocs(unassignedQuery);

      // Combine results
      assignedSnapshot.forEach((doc) => {
        tickets.push({ id: doc.id, ...doc.data() });
      });
      unassignedSnapshot.forEach((doc) => {
        tickets.push({ id: doc.id, ...doc.data() });
      });

      // Sort combined results by createdAt
      tickets.sort((a, b) => b.createdAt - a.createdAt);
    } else {
      // User can only see their own tickets
      const q = query(
        collection(db, "tickets"),
        where("createdBy", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        tickets.push({ id: doc.id, ...doc.data() });
      });
    }

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
    const ticketDoc = await getDoc(ticketRef);

    if (!ticketDoc.exists()) {
      return { success: false, error: "Ticket not found" };
    }

    const ticketData = ticketDoc.data();

    // Update ticket status
    await updateDoc(ticketRef, {
      status: status,
      updatedAt: serverTimestamp(),
    });

    // Create notification for ticket owner
    if (ticketData.createdBy !== userId) {
      await createNotification(
        ticketData.createdBy,
        `Your ticket (${ticketData.title}) has been updated to ${status}`
      );
    }

    // Create notification for assigned technician
    if (ticketData.assignedTo && ticketData.assignedTo !== userId) {
      await createNotification(
        ticketData.assignedTo,
        `Ticket ${ticketData.ticketId} (${ticketData.title}) has been updated to ${status}`
      );
    }

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
    const ticketDoc = await getDoc(ticketRef);

    if (!ticketDoc.exists()) {
      return { success: false, error: "Ticket not found" };
    }

    const ticketData = ticketDoc.data();

    await updateDoc(ticketRef, {
      assignedTo: technicianId,
      status: "In Progress",
      updatedAt: serverTimestamp(),
    });

    // Notify ticket owner
    await createNotification(
      ticketData.createdBy,
      `Your ticket (${ticketData.title}) has been assigned to a technician`
    );

    return { success: true };
  } catch (error) {
    console.error("Error assigning ticket:", error);
    return { success: false, error: error.message };
  }
};

// Add comment to ticket
export const addTicketComment = async (ticketId, authorId, message) => {
  try {
    const ticketRef = doc(db, "tickets", ticketId);
    const ticketDoc = await getDoc(ticketRef);

    if (!ticketDoc.exists()) {
      return { success: false, error: "Ticket not found" };
    }

    const ticketData = ticketDoc.data();
    const commentId = `CMT${Date.now()}`;
    const commentRef = doc(
      db,
      "tickets",
      ticketId,
      "ticket_comments",
      commentId
    );

    const comment = {
      commentId: commentId,
      authorId: authorId,
      message: message,
      timestamp: serverTimestamp(),
    };

    await setDoc(commentRef, comment);

    // Notify ticket owner if comment is from someone else
    if (ticketData.createdBy !== authorId) {
      await createNotification(
        ticketData.createdBy,
        `New comment on your ticket (${ticketData.title})`
      );
    }

    // Notify assigned technician if comment is from someone else
    if (ticketData.assignedTo && ticketData.assignedTo !== authorId) {
      await createNotification(
        ticketData.assignedTo,
        `New comment on ticket ${ticketData.ticketId} (${ticketData.title})`
      );
    }

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
    const feedbackRef = doc(
      db,
      "tickets",
      ticketId,
      "feedback",
      "user_feedback"
    );

    const feedback = {
      rating: rating,
      comment: comment,
      submittedBy: userId,
      submittedAt: serverTimestamp(),
    };

    await setDoc(feedbackRef, feedback);

    // Get ticket details
    const ticketDoc = await getDoc(doc(db, "tickets", ticketId));
    if (ticketDoc.exists()) {
      const ticketData = ticketDoc.data();

      // Notify assigned technician about feedback
      if (ticketData.assignedTo) {
        await createNotification(
          ticketData.assignedTo,
          `Feedback received for ticket ${ticketData.ticketId} (${ticketData.title}): ${rating} stars`
        );
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error adding feedback:", error);
    return { success: false, error: error.message };
  }
};

// Create notification
export const createNotification = async (uid, message, type = null) => {
  try {
    console.log('📬 Creating notification:', { uid, message, type });
    
    if (!uid) {
      console.error('❌ Cannot create notification: uid is required');
      return { success: false, error: 'User ID is required' };
    }
    
    if (!message) {
      console.error('❌ Cannot create notification: message is required');
      return { success: false, error: 'Message is required' };
    }

    const notificationRef = collection(db, "notifications");

    const notification = {
      notificationId: `NTF${Date.now()}`,
      uid: uid,
      message: message,
      read: false,
      timestamp: serverTimestamp(),
      type: type
    };

    const docRef = await addDoc(notificationRef, notification);
    console.log('✅ Successfully created notification:', { 
      uid, 
      type, 
      message: message.substring(0, 50) + '...', 
      docId: docRef.id 
    });
    return { success: true, docId: docRef.id };
  } catch (error) {
    console.error("❌ Error creating notification:", error);
    return { success: false, error: error.message };
  }
};

// Get user notifications
export const getUserNotifications = async (userId) => {
  try {
    // Validate userId
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    const q = query(
      collection(db, "notifications"),
      where("uid", "==", userId),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    const notifications = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Ensure we have valid notification data
      if (data && data.uid && data.message !== undefined) {
        notifications.push({ id: doc.id, ...data });
      }
    });

    return { success: true, notifications };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    
    // Handle specific Firestore errors
    if (error.code === 'permission-denied') {
      return { success: false, error: "Permission denied. Please check your authentication." };
    } else if (error.code === 'unavailable') {
      return { success: false, error: "Service temporarily unavailable. Please try again." };
    } else if (error.message.includes('network') || error.message.includes('connection')) {
      return { success: false, error: "Network connection error. Please check your internet connection." };
    }
    
    return { success: false, error: error.message };
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, {
      read: true,
    });
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: error.message };
  }
};

// Update user role
export const updateUserRole = async (userId, newRole) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: error.message };
  }
};

// Deactivate user account
export const deactivateUserAccount = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      status: 'inactive',
      deactivatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error deactivating user account:", error);
    return { success: false, error: error.message };
  }
};

// Bulk assign tickets
export const bulkAssignTickets = async (ticketIds, technicianId) => {
  try {
    const promises = ticketIds.map(ticketId => 
      assignTicket(ticketId, technicianId)
    );
    
    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.success).length;
    
    return { 
      success: true, 
      message: `${successCount} tickets assigned successfully` 
    };
  } catch (error) {
    console.error("Error bulk assigning tickets:", error);
    return { success: false, error: error.message };
  }
};

// Get ticket history
export const getTicketHistory = async (ticketId) => {
  try {
    const historyRef = collection(db, "tickets", ticketId, "history");
    const q = query(historyRef, orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);

    const history = [];
    querySnapshot.forEach((doc) => {
      history.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, history };
  } catch (error) {
    console.error("Error fetching ticket history:", error);
    return { success: false, error: error.message };
  }
};

// Add ticket history entry
export const addTicketHistory = async (ticketId, action, details, userId) => {
  try {
    const historyRef = collection(db, "tickets", ticketId, "history");
    const historyEntry = {
      action,
      details,
      userId,
      timestamp: serverTimestamp(),
    };

    await addDoc(historyRef, historyEntry);
    return { success: true };
  } catch (error) {
    console.error("Error adding ticket history:", error);
    return { success: false, error: error.message };
  }
};
