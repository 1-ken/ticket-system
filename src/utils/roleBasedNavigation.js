import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export const navigateBasedOnRole = async (user, navigate) => {
  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data();
      const role = userData.role || "user";
      
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
