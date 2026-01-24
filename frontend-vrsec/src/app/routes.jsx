import React from "react";
import { Routes, Route } from "react-router-dom";

import LandingPage from "../features/chat/pages/LandingPage";
import ChatPage from "../features/chat/pages/ChatPage";
import TimetablePage from "../features/timetable/pages/TimetablePage";

const AppRoutes = ({ darkMode, setDarkMode }) => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
      <Route path="/chat/:dept" element={<ChatPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
      <Route path="/timetable" element={<TimetablePage />} />
    </Routes>
  );
};

export default AppRoutes;
