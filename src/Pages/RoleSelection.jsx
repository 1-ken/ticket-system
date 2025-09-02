import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { toast } from "react-toastify";
import { navigateBasedOnRole } from "../utils/roleBasedNavigation";

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("Please sign in first");
        navigate("/sign-in");
        return;
      }

      // Update user role in Firestore
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        role: selectedRole,
      });

      toast.success("Role selected successfully!");
      
      // Navigate based on selected role
      await navigateBasedOnRole(user, navigate);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome!</h1>
          <p className="text-gray-600">
            Please select your role to complete your account setup
          </p>
        </div>

        <form onSubmit={handleRoleSubmit}>
          <div className="mb-6">
            <p className="text-lg font-medium mb-4 text-gray-700">
              What describes you best?
            </p>
            <div className="space-y-3">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={selectedRole === "user"}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="mr-3 text-blue-600"
                />
                <div>
                  <span className="font-medium text-gray-900">User</span>
                  <p className="text-sm text-gray-500">
                    I need support and want to submit tickets
                  </p>
                </div>
              </label>
              
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="technician"
                  checked={selectedRole === "technician"}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="mr-3 text-blue-600"
                />
                <div>
                  <span className="font-medium text-gray-900">Technician</span>
                  <p className="text-sm text-gray-500">
                    I provide technical support and resolve tickets
                  </p>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
            }`}
          >
            {loading ? "Setting up your account..." : "Continue"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            You can change your role later in your profile settings
          </p>
        </div>
      </div>
    </section>
  );
}
