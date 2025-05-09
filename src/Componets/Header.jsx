import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from './logo.svg'
export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const pathMatchRoute = (route) => route === location.pathname;

  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-50">
      <header className="flex justify-between items-center px-3 max-w-6xl mx-auto">
        {/* Logo */}
        <div className="mt-5px">
       <img src={Logo} alt="Logo" className="h-8" /> {/* Adjust height as needed */}
        </div>

        {/* Navigation Links */}
        <ul className="flex space-x-10">
          <li
            onClick={() => navigate("/")}
            className={`cursor-pointer py-3 text-sm font-semibold border-b-[3px] ${
              pathMatchRoute("/") ? "text-black border-b-red-500" : "text-gray-400 border-b-transparent"
            }`}
          >
            Home
          </li>
          <li
            onClick={() => navigate("/Offer")}
            className={`cursor-pointer py-3 text-sm font-semibold border-b-[3px] ${
              pathMatchRoute("/Offer") ? "text-black border-b-red-500" : "text-gray-400 border-b-transparent"
            }`}
          >
            Offers
          </li>
          <li
            onClick={() => navigate("/sign-in")}
            className={`cursor-pointer py-3 text-sm font-semibold border-b-[3px] ${
              pathMatchRoute("/sign-in") ? "text-black border-b-red-500" : "text-gray-400 border-b-transparent"
            }`}
          >
            Sign In
          </li>
        </ul>
      </header>
    </div>
  );
}
