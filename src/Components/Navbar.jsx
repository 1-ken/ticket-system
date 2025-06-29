import React from 'react'
import { useLocation,useNavigate } from 'react-router-dom'
import logo from './logo.svg'

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  function pathMatchRoute(route) {
    if (route === location.pathname) {
      return true;
    }
  }
  return (
    <div>
      <div className="bg-[#ffffff] border-b shadow-sm sticky top-0 z-40">
      <header className="flex justify-between items-center px-3 max-w-6xl mx-auto">
        <div>
          <img
            onClick={() => navigate("/")}
            src={logo}
            alt="logo"
            className="h-9 sm:h-11 md:h-15 lg:h-19 xl:h-24 2xl:h-27 cursor-pointer rounded-full"
          />
        </div>
        <div>
          <ul className="flex space-x-4 sm:space-x-6 md:space-x-8 lg:space-x-10 xl:space-x-12 2xl:space-x-14">
            <li
              onClick={() => navigate("/")}
              className={`cursor-pointer py-2 md:py-3 font-bold text-base md:text-lg lg:text-xl xl:text-2xl text-[#080808] border-b-[3px] border-b-transparent ${
                pathMatchRoute("/") && "text-black border-b-black"
              }`}
            >
              Dashboard
            </li>
            <li
              onClick={() => navigate("/tickets")}
              className={`cursor-pointer py-2 md:py-3 font-bold text-base md:text-lg lg:text-xl xl:text-2xl text-[#080808] border-b-[3px] border-b-transparent ${
                pathMatchRoute("/tickets") && "text-black border-b-black"
              }`}
            >
              Tickets
            </li>
            
            <li
              onClick={() => navigate("/notifications")}
              className={`cursor-pointer py-2 md:py-3 font-bold text-base md:text-lg lg:text-xl xl:text-2xl text-[#080808] border-b-[3px] border-b-transparent ${
                pathMatchRoute("/notifications") && "text-black border-b-black"
              }`}
            >
              notification
            </li>
            <li
              onClick={() => navigate("/profile")}
              className={`cursor-pointer py-2 md:py-3 font-bold text-base md:text-lg lg:text-xl xl:text-2xl text-[#080808] border-b-[3px] border-b-transparent ${
                pathMatchRoute("/profile") && "text-black border-b-black"
              }`}
            >
              profile
            </li>
          </ul>
        </div>
      </header>
      </div>
    </div>
  )
}
