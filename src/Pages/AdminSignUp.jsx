import React, { useState } from "react";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import { Link } from "react-router-dom";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { navigateBasedOnRole } from "../utils/roleBasedNavigation";

export default function AdminSignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    adminKey: "",
  });
  const { name, email, password, adminKey } = formData;

  // This should be stored securely in environment variables in production
  const ADMIN_SECRET_KEY = "ADMIN_SECRET_2024_SECURE_KEY";

  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    
    // Verify admin key
    if (adminKey !== ADMIN_SECRET_KEY) {
      toast.error("Invalid admin key. Access denied.");
      return;
    }

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      updateProfile(auth.currentUser, {
        displayName: name,
      });
      
      const userData = {
        uid: user.uid,
        name: name,
        email: email,
        role: "admin",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      };

      await setDoc(doc(db, "users", user.uid), userData);
      
      // Navigate based on user role
      await navigateBasedOnRole(user, navigate);
      toast.success("Admin account created successfully");
    } catch (error) {
      toast.error("Something went wrong with the admin registration");
      console.error(error);
    }
  }

  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold text-red-600">Admin Registration</h1>
      <div className="flex flex-wrap justify-center items-center px-6 py-12 max-w-6xl mx-auto">
        <div className="md:w-[67%] lg:w-[50%] mb-12 md:mb-6 lg:ml-20">
          <img
            className="w-full rounded-2xl"
            src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="admin"
          />
        </div>
        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-5">
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
            <p className="text-red-700 text-sm">
              <strong>Warning:</strong> This is a secure admin registration page. 
              You need a valid admin key to create an admin account.
            </p>
          </div>
          <form onSubmit={onSubmit}>
            <input
              className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
              id="adminKey"
              placeholder="Admin Secret Key"
              type={showAdminKey ? "text" : "password"}
              value={adminKey}
              onChange={onChange}
              required
            />
            <div className="relative mb-6">
              {showAdminKey ? (
                <AiFillEyeInvisible
                  className="absolute right-3 top-3 text-xl cursor-pointer"
                  onClick={() => setShowAdminKey((prevState) => !prevState)}
                />
              ) : (
                <AiFillEye
                  className="absolute right-3 top-3 text-xl cursor-pointer"
                  onClick={() => setShowAdminKey((prevState) => !prevState)}
                />
              )}
            </div>
            
            <input
              className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
              id="name"
              placeholder="Full Name"
              type="text"
              value={name}
              onChange={onChange}
              required
            />
            <input
              className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
              id="email"
              placeholder="Email address"
              type="email"
              value={email}
              onChange={onChange}
              required
            />
            <div className="relative mb-6">
              <input
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
                id="password"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={onChange}
                required
              />
              {showPassword ? (
                <AiFillEyeInvisible
                  className="absolute right-3 top-3 text-xl cursor-pointer"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              ) : (
                <AiFillEye
                  className="absolute right-3 top-3 text-xl cursor-pointer"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              )}
            </div>
            
            <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg mb-6">
              <p>
                Regular user?
                <Link
                  className="text-blue-600 hover:text-blue-700 transition duration-200 ease-in-out ml-1"
                  to="/sign-up"
                >
                  Sign up here
                </Link>
              </p>
              <p>
                <Link
                  className="text-blue-600 hover:text-blue-700 transition duration-200 ease-in-out"
                  to="/sign-in"
                >
                  Sign in
                </Link>
              </p>
            </div>
            
            <button
              className="w-full bg-red-600 text-white px-7 py-2 text-sm font-medium uppercase rounded shadow-md hover:bg-red-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-red-800"
              type="submit"
            >
              Create Admin Account
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
