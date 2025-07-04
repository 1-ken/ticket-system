import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";

export const navigateBasedOnRole = async (user, navigate) => {
  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data();
      const role = userData.role;
      const status = userData.status;
      
      // Check if user is deactivated
      if (status === 'Inactive') {
        // Sign out the user immediately
        const auth = getAuth();
        await auth.signOut();
        
        // Show error message and prevent navigation
        toast.error("Your account has been deactivated. Please contact the administrator for assistance.");
        navigate("/");
        return;
      }
      
      // If no role is assigned, redirect to role selection
      if (!role) {
        navigate("/role-selection");
        return;
      }
      
      if (role === "technician") {
        navigate("/technician-home");
      } else if (role === "admin") {
        navigate("/admin-home");
      } else {
        navigate("/user-home");
      }
    } else {
      // Default to user home if no document exists
      navigate("/user-home");
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    // Default to user home on error
    navigate("/user-home");
  }
};
