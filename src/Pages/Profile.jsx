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
            setFormData({
              name: user.displayName || userData.name || "",
              email: user.email || "",
              role: userData.role || "user", // Default to "user" if no role found
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
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <>
      <section className="max-w-6xl mx-auto flex justify-center items-center flex-col">
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