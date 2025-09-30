import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Franchises from "./pages/Franchises";
import Notifications from "./pages/Notifications";
import History from "./pages/History"
import Items from "./pages/Items"
import Orders from "./pages/Orders";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/franchises" element={<Franchises />} />
        <Route path="/items" element={<Items />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
