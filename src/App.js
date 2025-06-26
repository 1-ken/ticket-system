import Navbar from "./Components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Knowledgebase from "./Pages/Knowledgebase";
import TechnicianHome from "./Pages/TechnicianHome";
import UserHome from "./Pages/UserHome";
import AdminHome from "./Pages/AdminHome";
import UserManagementDashboard from "./Pages/UserManagementDashboard";
import UserManagementDemo from "./Pages/UserManagementDemo";
import Profile from "./Pages/Profile";
import Notifications from "./Pages/Notifications";
import Tickets from "./Pages/Tickets";
import { ToastContainer } from "react-toastify";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import AdminSignUp from "./Pages/AdminSignUp";
import RoleSelection from "./Pages/RoleSelection";
import ForgotPassword from "./Pages/ForgotPassword";
import PrivateRoute from "./Components/PrivateRoute";
import NotificationTest from "./Components/NotificationTest";
import DebugNotifications from "./Components/DebugNotifications";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/technician-home" element={<TechnicianHome />} />
          <Route path="/user-home" element={<UserHome />} />
          <Route path="/admin-home" element={<AdminHome />} />
          <Route path="/admin/user-management" element={<PrivateRoute />}>
            <Route index element={<UserManagementDashboard />} />
          </Route>
          <Route path="/demo/user-management" element={<UserManagementDemo />} />
          <Route path="/profile" element={<PrivateRoute />}>
            <Route index element={<Profile />} />
          </Route>
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/admin-signup" element={<AdminSignUp />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/Knowledge-base" element={<Knowledgebase />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/test-notifications" element={<NotificationTest />} />
          <Route path="/debug-notifications" element={<DebugNotifications />} />
        </Routes>
      </Router>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default App;
