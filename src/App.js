import Navbar from "./Components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/TechnicianHome"
import Profile from "./Pages/Profile";
import Notifications from "./Pages/Notifications";
import Tickets from "./Pages/Tickets";

function App() {
  return (
    <>
      <Router>
      <Navbar/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/profile" element={<Profile/>}/>        
          <Route path="/notifications" element={<Notifications/>}/>
          <Route path="/tickets" element = {<Tickets/>}/>
        </Routes>
    
      </Router>
    </>
  );
}

export default App;