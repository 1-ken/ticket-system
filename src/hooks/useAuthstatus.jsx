import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export function useAuthstatus() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [userStatus, setUserStatus] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Fetch user data from Firestore
                const userRef = doc(db, "users", user.uid);
                try {
                    const userDoc = await getDoc(userRef);
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUserRole(userData.role);
                        setUserStatus(userData.status);

                        // Check if user is deactivated
                        if (userData.status === 'Inactive') {
                            // Sign out the user
                            await auth.signOut();
                            setLoggedIn(false);
                            setUserRole(null);
                            setUserStatus(null);
                            // Show error message
                            toast.error("Your account has been deactivated. Please contact the administrator for assistance.");
                            navigate("/");
                        } else {
                            setLoggedIn(true);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setLoggedIn(false);
                }
            } else {
                setLoggedIn(false);
                setUserRole(null);
                setUserStatus(null);
            }
            setCheckingStatus(false);
        });

        return () => unsubscribe();
    }, [navigate]);

    return { loggedIn, checkingStatus, userRole, userStatus };
}
