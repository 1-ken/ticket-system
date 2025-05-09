import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import { BrowserRouter as Router,Route,Routes } from "react-router-dom";
function App() {
  return (
    <>
      <Router>
        <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/sign-in" element={<Signin/>}/>
        <Route path="/sign-up" element={<Signup/>}/>
        <Route path="/forgot-password" element={<ForgotPassword/>}/>
        </Routes>
      </Router>
    </>
  );
}

export default App; 
