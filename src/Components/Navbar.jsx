import React, { useEffect, useState } from "react";
// import logo from "./logo.svg";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { navigateBasedOnRole } from "../utils/roleBasedNavigation";
import NotificationBell from "./NotificationBell";
import { FcCustomerSupport } from "react-icons/fc";

export default function Navbar() {
  const [pageState, setPageState] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setPageState("Profile")
      } else {
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

  const handleNavigation = (path) => {
    const user = auth.currentUser;
    if (user) {
      navigate(path);
    } else {
      navigate("/sign-in");
    }
  };
  return (
    <div className="bg-[#ffffff] border-b shadow-sm sticky top-0 z-40">
      <header className="flex justify-between items-center px-3 max-w-6xl mx-auto relative">
        <div>
          {/* <img
            onClick={handleDashboardClick}
            src={logo}
            alt="logo"
            className="h-10 sm:h-12 md:h-16 lg:h-20 xl:h-24 2xl:h-28 cursor-pointer rounded-full"
          /> */}
          <FcCustomerSupport 
            size={100} 
            onClick={handleDashboardClick}
            className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
          />
        </div>
        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden ml-auto mr-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        >
          <span className="sr-only">Open menu</span>
          {/* Hamburger icon */}
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <ul className="flex space-x-4 sm:space-x-6 md:space-x-8 lg:space-x-10 xl:space-x-12 2xl:space-x-14 items-center">
            <li

              onClick={handleDashboardClick}
              className={`cursor-pointer py-2 md:py-3 font-bold text-base md:text-lg lg:text-xl xl:text-2xl text-[#484744] border-b-[3px] border-b-transparent ${(pathMatchRoute("/user-home") || pathMatchRoute("/technician-home") || pathMatchRoute("/admin-home")) && "text-black border-b-black"
                }`}
            >
              Dashboard
            </li>
            <li

              onClick={() => handleNavigation("/tickets")}
              className={`cursor-pointer py-2 md:py-3 font-bold text-base md:text-lg lg:text-xl xl:text-2xl text-[#484744] border-b-[3px] border-b-transparent ${
                pathMatchRoute("/tickets") && "text-black border-b-black"
              }`}
            >
              Tickets
            </li>
            <li

              onClick={() => handleNavigation("/Knowledge-base")}
              className={`cursor-pointer py-2 md:py-3 font-bold text-base md:text-lg lg:text-xl xl:text-2xl text-[#484744] border-b-[3px] border-b-transparent ${
                pathMatchRoute("/Knowledge-base") && "text-black border-b-black"
              }`}
            >
              Knowledge Base
            </li>
            <li

              onClick={() => handleNavigation("/notifications")}
              className={`cursor-pointer py-2 md:py-3 font-bold text-base md:text-lg lg:text-xl xl:text-2xl text-[#484744] border-b-[3px] border-b-transparent ${
                pathMatchRoute("/notifications") && "text-black border-b-black"
              }`}
            >
              Notifications
            </li>

            <li className="py-2 md:py-3">
              <NotificationBell />
            </li>
            <li

              onClick={() => handleNavigation("/profile")}
              className={`cursor-pointer py-2 md:py-3 font-bold text-base md:text-lg lg:text-xl xl:text-2xl text-[#484744] border-b-[3px] border-b-transparent ${
                (pathMatchRoute("/profile") || pathMatchRoute("/sign-in")) &&
                "text-black border-b-black"
              }`}
            >
              {pageState}
            </li>
          </ul>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`${
            isOpen ? "block" : "hidden"
          } md:hidden absolute top-full right-0 left-0 bg-white shadow-lg transition-all duration-300 ease-in-out z-50`}
        >
          <ul className="flex flex-col py-2">
            <li
              onClick={() => {
                handleDashboardClick();
                setIsOpen(false);
              }}
              className={`cursor-pointer px-4 py-2 text-lg text-[#484744] hover:bg-gray-100 ${
                (pathMatchRoute("/user-home") ||
                  pathMatchRoute("/technician-home") ||
                  pathMatchRoute("/admin-home")) &&
                "text-black font-bold"
              }`}
            >
              Dashboard
            </li>
            <li
              onClick={() => {
                handleNavigation("/tickets");
                setIsOpen(false);
              }}
              className={`cursor-pointer px-4 py-2 text-lg text-[#484744] hover:bg-gray-100 ${
                pathMatchRoute("/tickets") && "text-black font-bold"
              }`}
            >
              Tickets
            </li>
            <li
              onClick={() => {
                handleNavigation("/Knowledge-base");
                setIsOpen(false);
              }}
              className={`cursor-pointer px-4 py-2 text-lg text-[#484744] hover:bg-gray-100 ${
                pathMatchRoute("/Knowledge-base") && "text-black font-bold"
              }`}
            >
              Knowledge Base
            </li>
            <li
              onClick={() => {
                handleNavigation("/notifications");
                setIsOpen(false);
              }}
              className={`cursor-pointer px-4 py-2 text-lg text-[#484744] hover:bg-gray-100 ${
                pathMatchRoute("/notifications") && "text-black font-bold"
              }`}
            >
              Notifications
            </li>
            <li className="px-4 py-2">
              <NotificationBell />
            </li>
            <li
              onClick={() => {
                handleNavigation("/profile");
                setIsOpen(false);
              }}
              className={`cursor-pointer px-4 py-2 text-lg text-[#484744] hover:bg-gray-100 ${
                (pathMatchRoute("/profile") || pathMatchRoute("/sign-in")) &&
                "text-black font-bold"
              }`}
            >
              {pageState}
            </li>
          </ul>
        </div >
      </header >
    </div >
  );
}
