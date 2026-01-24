import React, { useEffect, useState } from "react";
import AppRoutes from "./routes";

const App = () => {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return <AppRoutes darkMode={darkMode} setDarkMode={setDarkMode} />;
};

export default App;

// // import React, { useState, useEffect } from 'react';
// // import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// // import LandingPage from './pages/LandingPage';
// // import ChatInterface from './pages/interface';
// // import TimetableForm from './pages/timetable';

// // function App() {
// //   const [darkMode, setDarkMode] = useState(false);

// //   // Toggle Dark Mode Class on HTML tag
// //   useEffect(() => {
// //     if (darkMode) {
// //       document.documentElement.classList.add('dark');
// //     } else {
// //       document.documentElement.classList.remove('dark');
// //     }
// //   }, [darkMode]);

// //   return (
// //     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
// //       <Router>
// //         <Routes>
// //           <Route path="/" element={<LandingPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
// //           <Route path="/chat/:dept" element={<ChatInterface darkMode={darkMode} setDarkMode={setDarkMode} />} />
// //         </Routes>
// //       </Router>
// //     </div>
// //   );
// // }

// // export default App;


// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import LandingPage from '../pages/LandingPage';
// import ChatInterface from '../pages/interface';
// import TimetableForm from '../pages/timetable';   // this is already correct

// function App() {
//   const [darkMode, setDarkMode] = useState(false);

//   useEffect(() => {
//     if (darkMode) {
//       document.documentElement.classList.add('dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//     }
//   }, [darkMode]);

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
//       <Router>
//         <Routes>
//           <Route path="/" element={<LandingPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
//           <Route path="/chat/:dept" element={<ChatInterface darkMode={darkMode} setDarkMode={setDarkMode} />} />
          
//           {/* Add this line */}
//           <Route path="/timetable" element={<TimetableForm />} />

//           {/* Optional: catch-all for 404 pages */}
//           <Route path="*" element={<div className="p-10 text-center">
//             <h1 className="text-4xl font-bold">404</h1>
//             <p className="mt-4">Page not found</p>
//           </div>} />
//         </Routes>
//       </Router>
//     </div>
//   );
// }

// export default App;