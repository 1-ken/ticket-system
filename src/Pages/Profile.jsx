import { getAuth, updateProfile, onAuthStateChanged } from "firebase/auth";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { db } from "../firebase";
import {
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import ReactLoading from "react-loading";
import { FcCustomerSupport } from "react-icons/fc";
import NotificationBell from "../Components/NotificationBell";
function Profile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [FormData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user data from Firestore
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            const userRole = userData.role || "user";
            
            // If user is admin, redirect to admin-home with profile tab
            if (userRole === 'admin') {
              navigate('/admin-home', { state: { activeTab: 'profile' } });
              return;
            }
            
            setFormData({
              name: user.displayName || userData.name || "",
              email: user.email || "",
              role: userRole,
            });
          } else {
            // If no Firestore document exists, use auth data
            setFormData({
              name: user.displayName || "",
              email: user.email || "",
              role: "user", // Default role
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Error loading profile data");
          setFormData({
            name: user.displayName || "",
            email: user.email || "",
            role: "user",
          });
        }
      } else {
        navigate("/sign-in");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, navigate]);
  const { name, email, role } = FormData;
  console.log(FormData)
  function onLogout() {
    auth.signOut();
    navigate("/");
  }

  const [changeDetail, setChangeDetail] = useState(false);

  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  }
  async function onSubmit() {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("Please sign in to update profile");
        navigate("/sign-in");
        return;
      }

      if (user.displayName !== name) {
        //update the name in the firebase auth
        await updateProfile(user, {
          displayName: name,
        });
        //update the name in the firestore
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, {
          name,
        });
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error("Could not update the details");
      console.log(error);
    }
  }
  if (loading) {
    return <div className="h-screen w-screen items-center justify-center flex flex-row" >
      <ReactLoading type={"spin"} color={"blue"} height={100} width={100} />
    </div>
  }

  return (
    <>
      {/* Admin Navigation - Show only for admin users */}
      {role === 'admin' && (
        <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <FcCustomerSupport 
                  size={60} 
                  onClick={() => navigate('/admin-home')}
                  className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
                />
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => {
                      navigate('/admin-home');
                      // You can add state or URL params here to set the active tab to 'overview'
                    }}
                    className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => {
                      navigate('/admin-home');
                      // You can add state or URL params here to set the active tab to 'analytics'
                    }}
                    className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Analytics
                  </button>
                  <button
                    onClick={() => {
                      navigate('/admin-home');
                      // You can add state or URL params here to set the active tab to 'tickets'
                    }}
                    className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Ticket Management
                  </button>
                  <button
                    onClick={() => {
                      navigate('/admin-home');
                      // You can add state or URL params here to set the active tab to 'technicians'
                    }}
                    className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Technician Panel
                  </button>
                  <button
                    onClick={() => {
                      navigate('/admin-home');
                      // You can add state or URL params here to set the active tab to 'users'
                    }}
                    className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    User Management
                  </button>
                  <button
                    onClick={() => {
                      navigate('/admin-home');
                      // You can add state or URL params here to set the active tab to 'reports'
                    }}
                    className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Reports
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <NotificationBell />
                <button
                  className="px-4 py-2 rounded-lg font-medium transition-colors bg-red-500 text-white"
                >
                  Profile
                </button>
                <button
                  onClick={() => auth.signOut()}
                  className="px-4 py-2 rounded-lg font-medium transition-colors bg-red-500 text-white hover:bg-red-600 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className={`max-w-6xl mx-auto flex justify-center items-center flex-col ${role === 'admin' ? 'pt-24' : ''}`}>
        <h1 className="text-3xl  text-center mt-6 font-bold ">My Profile</h1>
        <div className="w-full md:w-[50%] mt-6 px-3">
          <form>
            {/*name input*/}
            <input
              disabled={!changeDetail}
              onChange={onChange}
              id="name"
              type="text"
              value={name}
              className={`w-full px-4 py-6 text-xl text-gray-700 bg-white  border-gray-300 rounded transition ease-in-out mb-6 ${changeDetail && "bg-red-200 focus:bg-red-200"
                }`}
            />
            {/*email input*/}

            <input
              disabled={!changeDetail}
              id="email"
              type="text"
              value={email}
              className="w-full px-4 py-6 text-xl text-gray-700 bg-white  border-gray-300 rounded transition ease-in-out mb-6"
            />

            {/*role display*/}
            <div className="w-full px-4 py-6 text-xl text-gray-700 bg-gray-100 border-gray-300 rounded mb-6">
              <span className="font-semibold">Role: </span>
              <span className={`capitalize ${role === 'technician' ? 'text-blue-600' :
                role === 'admin' ? 'text-red-600' :
                  'text-green-600'
                }`}>
                {role}
              </span>
            </div>

            <div className="flex justify-between whitespace-nowrap text-sm  sm:text-lg">
              <p className="flex items-center">
                Do you want to change your name
                <span
                  onClick={() => {
                    changeDetail && onSubmit();
                    setChangeDetail((prevState) => !prevState);
                  }}
                  className="text-red-600 hover:text-red-700 cursor-pointer transition ease-in-out duration-200 ml-1"
                >
                  {changeDetail ? "Apply changes" : " Edit"}
                </span>
              </p>
              <p
                onClick={onLogout}
                className="text-blue-600 hover:to-blue-700 transition duration-200 ease-in-out cursor-pointer"
              >
                Sign Out
              </p>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}

export default Profile