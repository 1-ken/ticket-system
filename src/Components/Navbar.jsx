import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { navigateBasedOnRole } from "../utils/roleBasedNavigation";

export default function Navbar() {
  const [pageState, setPageState] = useState();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if(user){
        setPageState("Profile")
      }else{
        setPageState("Sign In")
      }
    });
    return () => unsubscribe();
  }, [auth]);
  function pathMatchRoute(route) {
    if (route === location.pathname) {
      return true;
    }
  }

  const handleDashboardClick = async () => {
    const user = auth.currentUser;
    if (user) {
      await navigateBasedOnRole(user, navigate);
    } else {
      navigate("/sign-in");
    }
  };
  return (
    <div className="bg-[#ffffff] border-b shadow-sm sticky top-0 z-40">
      <header className="flex justify-between items-center px-3 max-w-6xl mx-auto">
        <div>
          <img
            onClick={handleDashboardClick}
            src={logo}
            alt="logo"
            className="h-10 sm:h-12 md:h-16 lg:h-20 xl:h-24 2xl:h-28 cursor-pointer rounded-full"
          />
        </div>
        <div>
          <ul className="flex space-x-4 sm:space-x-6 md:space-x-8 lg:space-x-10 xl:space-x-12 2xl:space-x-14">
            <li
              onClick={handleDashboardClick}
              className={`cursor-pointer py-2 md:py-3 font-bold text-base md:text-lg lg:text-xl xl:text-2xl text-[#484744] border-b-[3px] border-b-transparent ${
                (pathMatchRoute("/user-home") || pathMatchRoute("/technician-home") || pathMatchRoute("/admin-home")) && "text-black border-b-black"
              }`}
            >
              Dashboard
            </li>
            <li
              onClick={() => navigate("/tickets")}
              className={`cursor-pointer py-2 md:py-3 font-bold text-base md:text-lg lg:text-xl xl:text-2xl text-[#484744] border-b-[3px] border-b-transparent ${
                pathMatchRoute("/tickets") && "text-black border-b-black"
              }`}
            >
              Tickets
            </li>
            <li
              onClick={() => navigate("/Knowledge-base")}
              className={`cursor-pointer py-2 md:py-3 font-bold text-base md:text-lg lg:text-xl xl:text-2xl text-[#484744] border-b-[3px] border-b-transparent ${
                pathMatchRoute("/programs") && "text-black border-b-black"
              }`}
            >
              Knowledge Base
            </li>
            <li
              onClick={() => navigate("/notifications")}
              className={`cursor-pointer py-2 md:py-3 font-bold text-base md:text-lg lg:text-xl xl:text-2xl text-[#484744] border-b-[3px] border-b-transparent ${
                pathMatchRoute("/notifications") && "text-black border-b-black"
              }`}
            >
              Notifications
            </li>
            <li
                onClick={() => navigate("/profile")}
                className={`cursor-pointer py-2 md:py-3 font-bold text-base md:text-lg lg:text-xl xl:text-2xl text-[#484744] border-b-[3px] border-b-transparent ${
                  (pathMatchRoute("/profile") || pathMatchRoute("/sign-in")) &&
                  "text-black border-b-black"
                }`}
              >
                {pageState}
              </li>
          </ul>
        </div>
      </header>
    </div>
  );
}