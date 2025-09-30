import React from "react";
import "./Header.css"
import { useNavigate, useLocation } from "react-router-dom";
import { Bell } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="dashboard-header">
      <div className="left-links">
        <span onClick={() => navigate("/home")}>LOGO</span>
      </div>
      <div className="nav-links">
        <span onClick={() => navigate("/home")} className={location.pathname === "/home" ? "active" : ""}>Home</span>
        <span onClick={() => navigate("/franchises")} className={location.pathname === "/franchises" ? "active" : ""}>Franchises</span>
        <span onClick={() => navigate("/orders")} className={location.pathname === "/orders" ? "active" : ""}>Orders</span>
        <span onClick={() => navigate("/items")} className={location.pathname === "/items" ? "active" : ""}>Items</span>
        <span onClick={() => navigate("/notifications")} ><div className={location.pathname === "/notifications" ? "active1" : "bell"}><Bell /></div></span>
        {location.pathname === "/home" && (
          <span onClick={() => navigate("/")}>Logout</span>
        )}
      </div>
    </div>
  );
};

export default Header;
