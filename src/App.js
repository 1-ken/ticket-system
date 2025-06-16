import Navbar from "./Components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Knowledgebase from "./Pages/Knowledgebase";
import TechnicianHome from "./Pages/TechnicianHome"
import UserHome from "./Pages/UserHome"
import Profile from "./Pages/Profile";
import Notifications from "./Pages/Notifications";
import Tickets from "./Pages/Tickets";
import { ToastContainer } from "react-toastify";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import ForgotPassword from "./Pages/ForgotPassword";
import PrivateRoute from "./Components/PrivateRoute";

function App() {
  return (
    <>
      <Router>
      <Navbar/>
        <Routes>
          <Route path="/technician-home" element={<TechnicianHome/>}/>
          <Route path="/user-home" element={<UserHome/>}/>
          <Route path="/profile" element={<PrivateRoute/>}>
            <Route index element={<Profile/>}/>
          </Route>        
          <Route path="/notifications" element={<Notifications/>}/>
          <Route path="/tickets" element = {<Tickets/>}/>
          <Route path="/sign-in" element = {<SignIn/>}/>
          <Route path="/sign-up" element = {<SignUp/>}/>
          <Route path="/Knowledge-base" element = {<Knowledgebase/>}/>

          <Route path="/forgot-password" element = {<ForgotPassword/>}/>
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