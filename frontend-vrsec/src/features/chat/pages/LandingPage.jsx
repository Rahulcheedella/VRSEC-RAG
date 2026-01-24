// import React, { useRef } from 'react';
// import { motion, useScroll, useTransform } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import { Moon, Sun, ArrowDown, MessageSquare, Cpu, Code, Settings, Sparkles } from 'lucide-react';


// // Custom CSS for enhanced styling (own CSS added here)
// const customStyles = `
//   @keyframes gradientShift {
//     0% { background-position: 0% 50%; }
//     50% { background-position: 100% 50%; }
//     100% { background-position: 0% 50%; }
//   }
//   .animate-gradient-shift {
//     background-size: 300% 300%;
//     animation: gradientShift 20s ease infinite;
//   }
//   @keyframes float {
//     0%, 100% { transform: translateY(0px); }
//     50% { transform: translateY(-20px); }
//   }
//   .animate-float {
//     animation: float 6s ease-in-out infinite;
//   }
//   /* Update your customStyles string with this block */

// @keyframes shimmer {
//   0% { transform: translateX(-200%); }
//   100% { transform: translateX(200%); }
// }

// .shimmer::before {
//   content: '';
//   position: absolute;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   background: linear-gradient(
//     90deg, 
//     transparent, 
//     rgba(255, 255, 255, 0.4), 
//     transparent
//   );
//   /* 'linear' is the key here for a consistent, non-stuttering speed */
//   animation: shimmer 2.5s infinite linear; 
// }
//   @keyframes pulse-glow {
//     0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
//     50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
//   }
//   .animate-pulse-glow {
//     animation: pulse-glow 3s ease-in-out infinite;
//   }
//   .glass-card {
//     background: rgba(255, 255, 255, 0.05);
//     backdrop-filter: blur(16px);
//     border: 1px solid rgba(255, 255, 255, 0.1);
//     box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
//   }
//   .hover-lift {
//     transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
//   }
//   .hover-lift:hover {
//     transform: translateY(-10px) scale(1.02);
//   }
// `;

// // Departments array (unchanged)
// const departments = [
//   {
//     id: 'cse',
//     name: 'Computer Science',
//     short: 'CSE',
//     desc: 'Innovating the digital future through algorithms and AI.',
//     icon: <Code size={40} />,
//     image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop',
//     color: 'from-blue-600 to-blue-900'
//   },
//   {
//     id: 'ece',
//     name: 'Electronics & Comm',
//     short: 'ECE',
//     desc: 'Powering the world with circuits and signals.',
//     icon: <Cpu size={40} />,
//     image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop',
//     color: 'from-green-600 to-green-900'
//   },
//   {
//     id: 'mec',
//     name: 'Mechanical Eng',
//     short: 'MEC',
//     desc: 'Designing the machines that move the world.',
//     icon: <Settings size={40} />,
//     image: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&q=80&w=2070',
//     color: 'from-gray-600 to-grey-900'
//   },
// ];

// //https://unsplash.com/photos/black-and-gray-vehicle-part-qy27JnsH9sU

// // DepartmentSection with enhanced custom CSS
// const DepartmentSection = ({ dept, onNavigate }) => {
//   const ref = useRef(null);
//   const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
//   const yBg = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
//   const opacityText = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0, 1, 1, 0]);
//   const scaleIcon = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.1, 0.8]);

//   return (
//     <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden border-t border-white/10 bg-black">
//       <style>{customStyles}</style>
//       <motion.div
//         style={{ y: yBg, backgroundImage: `url(${dept.image})` }}
//         className="absolute inset-0 w-full h-[120%] bg-cover bg-center filter brightness-75"
//       >
//         <div className={`absolute inset-0 bg-gradient-to-b ${dept.color} mix-blend-multiply opacity-85`} />
//         <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
//       </motion.div>
//       <motion.div style={{ opacity: opacityText }} className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
//         <div className="glass-card p-8 md:p-12 rounded-3xl hover-lift">
//           <motion.div
//             style={{ scale: scaleIcon }}
//             initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
//             transition={{ type: 'spring', stiffness: 200, damping: 15 }}
//             className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg animate-float"
//           >
//             {dept.icon}
//           </motion.div>
//           <h2 className="text-4xl md:text-6xl font-serif font-bold mb-4 tracking-tight drop-shadow-md">{dept.name}</h2>
//           <p className="text-lg md:text-xl text-gray-200 mb-8 font-light max-w-2xl mx-auto italic tracking-wide">{dept.desc}</p>
//           <motion.button
//             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//             onClick={() => onNavigate(dept.id)}
//             className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white/20 text-white text-lg font-bold rounded-full overflow-hidden transition-all shimmer hover:bg-white/30 backdrop-blur-sm border border-white/30"
//           >
//             <span className="relative z-10">Chat with {dept.short} Bot</span>
//             <MessageSquare size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
//           </motion.button>
//         </div>
//       </motion.div>
//     </section>
//   );
// };

// // Main LandingPage with enhanced custom CSS
// const LandingPage = ({ darkMode, setDarkMode }) => {
//   const navigate = useNavigate();
//   return (
//     <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 via-blue-950 to-black text-white font-sans selection:bg-blue-500 selection:text-white antialiased">
//       <style>{customStyles}</style>
//       {/* Hero Section */}
//       <section className="relative min-h-screen flex flex-col items-center overflow-hidden">
//         {/* Background with animated gradient */}
//         <div className="absolute inset-0 z-0 animate-gradient-shift bg-gradient-to-br from-gray-900 via-blue-900/50 to-black">
//           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBoMzB2MzBIMzB6TTAgMzBoMzB2MzBIMHoiIGZpbGw9InVybCgjYSkiIG9wYWNpdHk9Ii4wNSIvPjwvZz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmZmZmYiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIgc3RvcC1vcGFjaXR5PSIwIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZmZmZmZmIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PC9zdmc+')] opacity-10" />
//         </div>
//         {/* Theme Toggle */}
//         <div className="w-full flex justify-end p-6 relative z-50">
//           <button
//             onClick={() => setDarkMode(!darkMode)}
//             className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all shadow-md hover:shadow-lg border border-white/10"
//           >
//             {darkMode ? <Sun size={24} /> : <Moon size={24} />}
//           </button>
//         </div>
//         {/* Main Content */}
//         <div className="flex-grow flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 relative z-10 text-center space-y-10">
//           {/* Logo with glow */}
//           <motion.div
//   initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
//   animate={{ opacity: 1, scale: 1, rotate: 0 }}
//   transition={{ duration: 0.8, type: 'spring' }}
//   className="relative w-32 h-32 md:w-40 md:h-40 animate-float"
// >
//             <div className="absolute inset-0 bg-blue-500 blur-[60px] opacity-20 rounded-full animate-pulse-glow"></div>
//             <img
//               src="/VRSEC-Vijayawada-Logo.jpg"
//               onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
//               alt="VR Logo"
//               className="relative w-full h-full object-contain drop-shadow-2xl rounded-full border-4 border-white/20 shadow-lg"
//             />
//             <div className="hidden absolute inset-0 bg-white rounded-full items-center justify-center text-blue-600 text-4xl font-bold border-4 border-gray-200 shadow-inner">
//               VR
//             </div>
//           </motion.div>
//           {/* Text Content */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2, duration: 0.8 }}
//             className="space-y-4"
//           >
//             <h1 className="text-4xl md:text-6xl font-serif font-extrabold tracking-tighter text-white drop-shadow-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-blue-100 to-blue-50">
//               VR Siddhartha Engg College
//             </h1>
//             <p className="text-lg md:text-xl text-blue-100 font-light tracking-wide max-w-2xl mx-auto drop-shadow-md">
//               Velagapudi Ramakrishna Siddhartha Engineering College, Vijayawada
//             </p>
//           </motion.div>
//           {/* Launch Button with shimmer */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.4, duration: 0.8 }}
//           >
//             <button
//               onClick={() => navigate('/chat/college')}
//               className="relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-lg font-bold rounded-full shadow-lg shadow-green-500/30 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 border border-green-300/20 overflow-hidden shimmer"
//             >
//               <Sparkles size={20} className="text-yellow-200" />
//               Launch VR AI Assistant
//             </button>
//           </motion.div>
//         </div>
//         {/* Footer */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 1, duration: 1 }}
//           className="relative z-10 pb-12 pt-8 flex flex-col items-center gap-3 text-white/70"
//         >
//           <p className="text-sm uppercase tracking-[0.3em] font-medium drop-shadow-sm">
//             Select Your Department
//           </p>
//           <ArrowDown className="animate-bounce size-6 text-white/80" />
//         </motion.div>
//       </section>
//       {/* Department Sections */}
//       <div className="bg-black">
//         {departments.map((dept) => (
//           <DepartmentSection key={dept.id} dept={dept} onNavigate={(id) => navigate(`/chat/${id}`)} />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default LandingPage;




// // import React, { useRef } from 'react';
// // import { motion, useScroll, useTransform } from 'framer-motion';
// // import { useNavigate } from 'react-router-dom';
// // import { Moon, Sun, ArrowDown, MessageSquare, Cpu, Code, Settings, Sparkles, LayoutGrid } from 'lucide-react';

// // // Custom CSS for enhanced styling (own CSS added here)
// // const customStyles = `
// //   @keyframes gradientShift {
// //     0% { background-position: 0% 50%; }
// //     50% { background-position: 100% 50%; }
// //     100% { background-position: 0% 50%; }
// //   }
// //   .animate-gradient-shift {
// //     background-size: 300% 300%;
// //     animation: gradientShift 20s ease infinite;
// //   }
// //   @keyframes float {
// //     0%, 100% { transform: translateY(0px); }
// //     50% { transform: translateY(-20px); }
// //   }
// //   .animate-float {
// //     animation: float 6s ease-in-out infinite;
// //   }
// //   /* Update your customStyles string with this block */

// // @keyframes shimmer {
// //   0% { transform: translateX(-200%); }
// //   100% { transform: translateX(200%); }
// // }

// // .shimmer::before {
// //   content: '';
// //   position: absolute;
// //   top: 0;
// //   left: 0;
// //   width: 100%;
// //   height: 100%;
// //   background: linear-gradient(
// //     90deg, 
// //     transparent, 
// //     rgba(255, 255, 255, 0.4), 
// //     transparent
// //   );
// //   animation: shimmer 2.5s infinite linear; 
// // }
// //   @keyframes pulse-glow {
// //     0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
// //     50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
// //   }
// //   .animate-pulse-glow {
// //     animation: pulse-glow 3s ease-in-out infinite;
// //   }
// //   .glass-card {
// //     background: rgba(255, 255, 255, 0.05);
// //     backdrop-filter: blur(16px);
// //     border: 1px solid rgba(255, 255, 255, 0.1);
// //     box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
// //   }
// //   .hover-lift {
// //     transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
// //   }
// //   .hover-lift:hover {
// //     transform: translateY(-10px) scale(1.02);
// //   }
// // `;

// // // Departments array (unchanged)
// // const departments = [
// //   {
// //     id: 'cse',
// //     name: 'Computer Science',
// //     short: 'CSE',
// //     desc: 'Innovating the digital future through algorithms and AI.',
// //     icon: <Code size={40} />,
// //     image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop',
// //     color: 'from-blue-600 to-blue-900'
// //   },
// //   {
// //     id: 'ece',
// //     name: 'Electronics & Comm',
// //     short: 'ECE',
// //     desc: 'Powering the world with circuits and signals.',
// //     icon: <Cpu size={40} />,
// //     image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop',
// //     color: 'from-green-600 to-green-900'
// //   },
// //   {
// //     id: 'mec',
// //     name: 'Mechanical Eng',
// //     short: 'MEC',
// //     desc: 'Designing the machines that move the world.',
// //     icon: <Settings size={40} />,
// //     image: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&q=80&w=2070',
// //     color: 'from-gray-600 to-grey-900'
// //   },
// // ];

// // // DepartmentSection with enhanced custom CSS
// // const DepartmentSection = ({ dept, onNavigate }) => {
// //   const ref = useRef(null);
// //   const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
// //   const yBg = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
// //   const opacityText = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0, 1, 1, 0]);
// //   const scaleIcon = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.1, 0.8]);

// //   return (
// //     <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden border-t border-white/10 bg-black">
// //       <style>{customStyles}</style>
// //       <motion.div
// //         style={{ y: yBg, backgroundImage: `url(${dept.image})` }}
// //         className="absolute inset-0 w-full h-[120%] bg-cover bg-center filter brightness-75"
// //       >
// //         <div className={`absolute inset-0 bg-gradient-to-b ${dept.color} mix-blend-multiply opacity-85`} />
// //         <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
// //       </motion.div>
// //       <motion.div style={{ opacity: opacityText }} className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
// //         <div className="glass-card p-8 md:p-12 rounded-3xl hover-lift">
// //           <motion.div
// //             style={{ scale: scaleIcon }}
// //             initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
// //             transition={{ type: 'spring', stiffness: 200, damping: 15 }}
// //             className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg animate-float"
// //           >
// //             {dept.icon}
// //           </motion.div>
// //           <h2 className="text-4xl md:text-6xl font-serif font-bold mb-4 tracking-tight drop-shadow-md">{dept.name}</h2>
// //           <p className="text-lg md:text-xl text-gray-200 mb-8 font-light max-w-2xl mx-auto italic tracking-wide">{dept.desc}</p>
// //           <motion.button
// //             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
// //             onClick={() => onNavigate(dept.id)}
// //             className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white/20 text-white text-lg font-bold rounded-full overflow-hidden transition-all shimmer hover:bg-white/30 backdrop-blur-sm border border-white/30"
// //           >
// //             <span className="relative z-10">Chat with {dept.short} Bot</span>
// //             <MessageSquare size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
// //           </motion.button>
// //         </div>
// //       </motion.div>
// //     </section>
// //   );
// // };

// // // ────────────────────────────────────────────────
// // //  ADDED: Floating Exam Seating Arrangement Button
// // // ────────────────────────────────────────────────
// // const ExamSeatingFab = () => {
// //   const navigate = useNavigate();

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0, x: 60 }}
// //       animate={{ opacity: 1, x: 0 }}
// //       transition={{ delay: 1.2, duration: 0.7, type: "spring" }}
// //       className="fixed right-6 bottom-8 z-50 md:right-10 md:bottom-10"
// //     >
// //       <motion.button
// //         whileHover={{ scale: 1.12, rotate: 8 }}
// //         whileTap={{ scale: 0.92 }}
// //         onClick={() => navigate('/seating-arrangement')}
// //         className="group relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 
// //                    bg-gradient-to-br from-blue-600/30 to-indigo-700/30 
// //                    backdrop-blur-xl border border-white/20 rounded-full shadow-2xl 
// //                    hover:shadow-blue-500/40 transition-all duration-300 overflow-hidden"
// //         aria-label="Exam Seating Arrangement"
// //       >
// //         {/* Subtle shimmer effect matching your style */}
// //         <div className="absolute inset-0 shimmer opacity-40 pointer-events-none" />
        
// //         <div className="relative z-10 text-white drop-shadow-lg">
// //           <LayoutGrid size={28} className="md:size-32" strokeWidth={1.8} />
// //         </div>

// //         {/* Tooltip on hover */}
// //         <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 
// //                         bg-black/80 backdrop-blur-md text-white text-sm font-medium 
// //                         px-4 py-2 rounded-lg border border-white/10 whitespace-nowrap
// //                         opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300">
// //           Exam Seating Arrangement
// //         </div>
// //       </motion.button>
// //     </motion.div>
// //   );
// // };

// // // Main LandingPage with enhanced custom CSS
// // const LandingPage = ({ darkMode, setDarkMode }) => {
// //   const navigate = useNavigate();
// //   return (
// //     <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 via-blue-950 to-black text-white font-sans selection:bg-blue-500 selection:text-white antialiased relative">
// //       <style>{customStyles}</style>
      
// //       {/* ──── Added Floating Action Button ──── */}
// //       <ExamSeatingFab />

// //       {/* Hero Section */}
// //       <section className="relative min-h-screen flex flex-col items-center overflow-hidden">
// //         {/* Background with animated gradient */}
// //         <div className="absolute inset-0 z-0 animate-gradient-shift bg-gradient-to-br from-gray-900 via-blue-900/50 to-black">
// //           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBoMzB2MzBIMzB6TTAgMzBoMzB2MzBIMHoiIGZpbGw9InVybCgjYSkiIG9wYWNpdHk9Ii4wNSIvPjwvZz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmZmZmYiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcmgiPSIjZmZmZmZmIiBzdG9wLW9wYWNpdHk9IjAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZmZmZmYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4=')] opacity-10" />
// //         </div>
// //         {/* Theme Toggle */}
// //         <div className="w-full flex justify-end p-6 relative z-50">
// //           <button
// //             onClick={() => setDarkMode(!darkMode)}
// //             className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all shadow-md hover:shadow-lg border border-white/10"
// //           >
// //             {darkMode ? <Sun size={24} /> : <Moon size={24} />}
// //           </button>
// //         </div>
// //         {/* Main Content */}
// //         <div className="flex-grow flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 relative z-10 text-center space-y-10">
// //           {/* Logo with glow */}
// //           <motion.div
// //             initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
// //             animate={{ opacity: 1, scale: 1, rotate: 0 }}
// //             transition={{ duration: 0.8, type: 'spring' }}
// //             className="relative w-32 h-32 md:w-40 md:h-40 animate-float"
// //           >
// //             <div className="absolute inset-0 bg-blue-500 blur-[60px] opacity-20 rounded-full animate-pulse-glow"></div>
// //             <img
// //               src="/VRSEC-Vijayawada-Logo.jpg"
// //               onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
// //               alt="VR Logo"
// //               className="relative w-full h-full object-contain drop-shadow-2xl rounded-full border-4 border-white/20 shadow-lg"
// //             />
// //             <div className="hidden absolute inset-0 bg-white rounded-full items-center justify-center text-blue-600 text-4xl font-bold border-4 border-gray-200 shadow-inner">
// //               VR
// //             </div>
// //           </motion.div>
// //           {/* Text Content */}
// //           <motion.div
// //             initial={{ opacity: 0, y: 20 }}
// //             animate={{ opacity: 1, y: 0 }}
// //             transition={{ delay: 0.2, duration: 0.8 }}
// //             className="space-y-4"
// //           >
// //             <h1 className="text-4xl md:text-6xl font-serif font-extrabold tracking-tighter text-white drop-shadow-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-blue-100 to-blue-50">
// //               VR Siddhartha Engg College
// //             </h1>
// //             <p className="text-lg md:text-xl text-blue-100 font-light tracking-wide max-w-2xl mx-auto drop-shadow-md">
// //               Velagapudi Ramakrishna Siddhartha Engineering College, Vijayawada
// //             </p>
// //           </motion.div>
// //           {/* Launch Button with shimmer */}
// //           <motion.div
// //             initial={{ opacity: 0, y: 20 }}
// //             animate={{ opacity: 1, y: 0 }}
// //             transition={{ delay: 0.4, duration: 0.8 }}
// //           >
// //             <button
// //               onClick={() => navigate('/chat/college')}
// //               className="relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-lg font-bold rounded-full shadow-lg shadow-green-500/30 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 border border-green-300/20 overflow-hidden shimmer"
// //             >
// //               <Sparkles size={20} className="text-yellow-200" />
// //               Launch VR AI Assistant
// //             </button>
// //           </motion.div>
// //         </div>
// //         {/* Footer */}
// //         <motion.div
// //           initial={{ opacity: 0 }}
// //           animate={{ opacity: 1 }}
// //           transition={{ delay: 1, duration: 1 }}
// //           className="relative z-10 pb-12 pt-8 flex flex-col items-center gap-3 text-white/70"
// //         >
// //           <p className="text-sm uppercase tracking-[0.3em] font-medium drop-shadow-sm">
// //             Select Your Department
// //           </p>
// //           <ArrowDown className="animate-bounce size-6 text-white/80" />
// //         </motion.div>
// //       </section>
// //       {/* Department Sections */}
// //       <div className="bg-black">
// //         {departments.map((dept) => (
// //           <DepartmentSection key={dept.id} dept={dept} onNavigate={(id) => navigate(`/chat/${id}`)} />
// //         ))}
// //       </div>
// //     </div>
// //   );
// // };

// // export default LandingPage;

// // import React, { useRef } from 'react';
// // import { motion, useScroll, useTransform } from 'framer-motion';
// // import { useNavigate } from 'react-router-dom';
// // import { Moon, Sun, ArrowDown, MessageSquare, Cpu, Code, Settings, Sparkles, LayoutGrid } from 'lucide-react';

// // // Custom CSS for enhanced styling (own CSS added here)
// // const customStyles = `
// //   @keyframes gradientShift {
// //     0% { background-position: 0% 50%; }
// //     50% { background-position: 100% 50%; }
// //     100% { background-position: 0% 50%; }
// //   }
// //   .animate-gradient-shift {
// //     background-size: 300% 300%;
// //     animation: gradientShift 20s ease infinite;
// //   }
// //   @keyframes float {
// //     0%, 100% { transform: translateY(0px); }
// //     50% { transform: translateY(-20px); }
// //   }
// //   .animate-float {
// //     animation: float 6s ease-in-out infinite;
// //   }
// //   /* Update your customStyles string with this block */

// // @keyframes shimmer {
// //   0% { transform: translateX(-200%); }
// //   100% { transform: translateX(200%); }
// // }

// // .shimmer::before {
// //   content: '';
// //   position: absolute;
// //   top: 0;
// //   left: 0;
// //   width: 100%;
// //   height: 100%;
// //   background: linear-gradient(
// //     90deg, 
// //     transparent, 
// //     rgba(255, 255, 255, 0.4), 
// //     transparent
// //   );
// //   /* 'linear' is the key here for a consistent, non-stuttering speed */
// //   animation: shimmer 2.5s infinite linear; 
// // }
// //   @keyframes pulse-glow {
// //     0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
// //     50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
// //   }
// //   .animate-pulse-glow {
// //     animation: pulse-glow 3s ease-in-out infinite;
// //   }
// //   .glass-card {
// //     background: rgba(255, 255, 255, 0.05);
// //     backdrop-filter: blur(16px);
// //     border: 1px solid rgba(255, 255, 255, 0.1);
// //     box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
// //   }
// //   .hover-lift {
// //     transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
// //   }
// //   .hover-lift:hover {
// //     transform: translateY(-10px) scale(1.02);
// //   }
// // `;

// // // Departments array (unchanged)
// // const departments = [
// //   {
// //     id: 'cse',
// //     name: 'Computer Science',
// //     short: 'CSE',
// //     desc: 'Innovating the digital future through algorithms and AI.',
// //     icon: <Code size={40} />,
// //     image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop',
// //     color: 'from-blue-600 to-blue-900'
// //   },
// //   {
// //     id: 'ece',
// //     name: 'Electronics & Comm',
// //     short: 'ECE',
// //     desc: 'Powering the world with circuits and signals.',
// //     icon: <Cpu size={40} />,
// //     image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop',
// //     color: 'from-green-600 to-green-900'
// //   },
// //   {
// //     id: 'mec',
// //     name: 'Mechanical Eng',
// //     short: 'MEC',
// //     desc: 'Designing the machines that move the world.',
// //     icon: <Settings size={40} />,
// //     image: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&q=80&w=2070',
// //     color: 'from-gray-600 to-grey-900'
// //   },
// // ];

// // //https://unsplash.com/photos/black-and-gray-vehicle-part-qy27JnsH9sU

// // // DepartmentSection with enhanced custom CSS
// // const DepartmentSection = ({ dept, onNavigate }) => {
// //   const ref = useRef(null);
// //   const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
// //   const yBg = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
// //   const opacityText = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0, 1, 1, 0]);
// //   const scaleIcon = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.1, 0.8]);

// //   return (
// //     <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden border-t border-white/10 bg-black">
// //       <style>{customStyles}</style>
// //       <motion.div
// //         style={{ y: yBg, backgroundImage: `url(${dept.image})` }}
// //         className="absolute inset-0 w-full h-[120%] bg-cover bg-center filter brightness-75"
// //       >
// //         <div className={`absolute inset-0 bg-gradient-to-b ${dept.color} mix-blend-multiply opacity-85`} />
// //         <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
// //       </motion.div>
// //       <motion.div style={{ opacity: opacityText }} className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
// //         <div className="glass-card p-8 md:p-12 rounded-3xl hover-lift">
// //           <motion.div
// //             style={{ scale: scaleIcon }}
// //             initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
// //             transition={{ type: 'spring', stiffness: 200, damping: 15 }}
// //             className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg animate-float"
// //           >
// //             {dept.icon}
// //           </motion.div>
// //           <h2 className="text-4xl md:text-6xl font-serif font-bold mb-4 tracking-tight drop-shadow-md">{dept.name}</h2>
// //           <p className="text-lg md:text-xl text-gray-200 mb-8 font-light max-w-2xl mx-auto italic tracking-wide">{dept.desc}</p>
// //           <motion.button
// //             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
// //             onClick={() => onNavigate(dept.id)}
// //             className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white/20 text-white text-lg font-bold rounded-full overflow-hidden transition-all shimmer hover:bg-white/30 backdrop-blur-sm border border-white/30"
// //           >
// //             <span className="relative z-10">Chat with {dept.short} Bot</span>
// //             <MessageSquare size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
// //           </motion.button>
// //         </div>
// //       </motion.div>
// //     </section>
// //   );
// // };

// // // Main LandingPage with enhanced custom CSS
// // const LandingPage = ({ darkMode, setDarkMode }) => {
// //   const navigate = useNavigate();
// //   return (
// //     <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 via-blue-950 to-black text-white font-sans selection:bg-blue-500 selection:text-white antialiased">
// //       <style>{customStyles}</style>
// //       {/* Hero Section */}
// //       <section className="relative min-h-screen flex flex-col items-center overflow-hidden">
// //         {/* Background with animated gradient */}
// //         <div className="absolute inset-0 z-0 animate-gradient-shift bg-gradient-to-br from-gray-900 via-blue-900/50 to-black">
// //           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBoMzB2MzBIMzB6TTAgMzBoMzB2MzBIMHoiIGZpbGw9InVybCgjYSkiIG9wYWNpdHk9Ii4wNSIvPjwvZz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmZmZmYiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIgc3RvcC1vcGFjaXR5PSIwIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZmZmZmZmIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PC9zdmc+')] opacity-10" />
// //         </div>
// //         {/* Theme Toggle */}
// //         <div className="w-full flex justify-end p-6 relative z-50">
// //           <button
// //             onClick={() => setDarkMode(!darkMode)}
// //             className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all shadow-md hover:shadow-lg border border-white/10"
// //           >
// //             {darkMode ? <Sun size={24} /> : <Moon size={24} />}
// //           </button>
// //         </div>
// //         {/* Main Content */}
// //         <div className="flex-grow flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 relative z-10 text-center space-y-10">
// //           {/* Logo with glow */}
// //           <motion.div
// //   initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
// //   animate={{ opacity: 1, scale: 1, rotate: 0 }}
// //   transition={{ duration: 0.8, type: 'spring' }}
// //   className="relative w-32 h-32 md:w-40 md:h-40 animate-float"
// // >
// //             <div className="absolute inset-0 bg-blue-500 blur-[60px] opacity-20 rounded-full animate-pulse-glow"></div>
// //             <img
// //               src="/VRSEC-Vijayawada-Logo.jpg"
// //               onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
// //               alt="VR Logo"
// //               className="relative w-full h-full object-contain drop-shadow-2xl rounded-full border-4 border-white/20 shadow-lg"
// //             />
// //             <div className="hidden absolute inset-0 bg-white rounded-full items-center justify-center text-blue-600 text-4xl font-bold border-4 border-gray-200 shadow-inner">
// //               VR
// //             </div>
// //           </motion.div>
// //           {/* Text Content */}
// //           <motion.div
// //             initial={{ opacity: 0, y: 20 }}
// //             animate={{ opacity: 1, y: 0 }}
// //             transition={{ delay: 0.2, duration: 0.8 }}
// //             className="space-y-4"
// //           >
// //             <h1 className="text-4xl md:text-6xl font-serif font-extrabold tracking-tighter text-white drop-shadow-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-blue-100 to-blue-50">
// //               VR Siddhartha Engg College
// //             </h1>
// //             <p className="text-lg md:text-xl text-blue-100 font-light tracking-wide max-w-2xl mx-auto drop-shadow-md">
// //               Velagapudi Ramakrishna Siddhartha Engineering College, Vijayawada
// //             </p>
// //           </motion.div>
// //           {/* Launch Button with shimmer */}
// //           <motion.div
// //             initial={{ opacity: 0, y: 20 }}
// //             animate={{ opacity: 1, y: 0 }}
// //             transition={{ delay: 0.4, duration: 0.8 }}
// //           >
// //             <button
// //               onClick={() => navigate('/chat/college')}
// //               className="relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-lg font-bold rounded-full shadow-lg shadow-green-500/30 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 border border-green-300/20 overflow-hidden shimmer"
// //             >
// //               <Sparkles size={20} className="text-yellow-200" />
// //               Launch VR AI Assistant
// //             </button>
// //           </motion.div>
// //         </div>
// //         {/* Footer */}
// //         <motion.div
// //           initial={{ opacity: 0 }}
// //           animate={{ opacity: 1 }}
// //           transition={{ delay: 1, duration: 1 }}
// //           className="relative z-10 pb-12 pt-8 flex flex-col items-center gap-3 text-white/70"
// //         >
// //           <p className="text-sm uppercase tracking-[0.3em] font-medium drop-shadow-sm">
// //             Select Your Department
// //           </p>
// //           <ArrowDown className="animate-bounce size-6 text-white/80" />
// //         </motion.div>
// //       </section>
// //       {/* Department Sections */}
// //       <div className="bg-black">
// //         {departments.map((dept) => (
// //           <DepartmentSection key={dept.id} dept={dept} onNavigate={(id) => navigate(`/chat/${id}`)} />
// //         ))}
// //       </div>

// //       {/* Seating Arrangement Floating Icon */}
// //       <motion.button
// //         initial={{ opacity: 0, x: 30 }}
// //         animate={{ opacity: 1, x: 0 }}
// //         transition={{ delay: 1, duration: 0.8 }}
// //         whileHover={{ scale: 1.08 }}
// //         whileTap={{ scale: 0.95 }}
// //         onClick={() => navigate('/seatingarrangement')}
// //         className="fixed right-6 top-1/2 -translate-y-1/2 z-[999] w-16 h-16 rounded-2xl glass-card hover-lift flex items-center justify-center border border-white/20 shadow-lg shimmer"
// //         title="Exam Seating Arrangement"
// //       >
// //         <LayoutGrid size={28} className="text-white drop-shadow-md" />
// //       </motion.button>
// //     </div>
// //   );
// // };

// // export default LandingPage;


import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, ArrowDown, MessageSquare, Cpu, Code, Settings, Sparkles } from 'lucide-react';

// Custom CSS for enhanced styling (own CSS added here)
const customStyles = `
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .animate-gradient-shift {
    background-size: 300% 300%;
    animation: gradientShift 20s ease infinite;
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-200%); }
    100% { transform: translateX(200%); }
  }

  .shimmer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg, 
      transparent, 
      rgba(255, 255, 255, 0.4), 
      transparent
    );
    animation: shimmer 2.5s infinite linear; 
  }

  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
    50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
  }
  .animate-pulse-glow {
    animation: pulse-glow 3s ease-in-out infinite;
  }
  .glass-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
  }
  .hover-lift {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .hover-lift:hover {
    transform: translateY(-10px) scale(1.02);
  }
`;

// Departments array (unchanged)
const departments = [
  {
    id: 'cse',
    name: 'Computer Science',
    short: 'CSE',
    desc: 'Innovating the digital future through algorithms and AI.',
    icon: <Code size={40} />,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop',
    color: 'from-blue-600 to-blue-900'
  },
  {
    id: 'ece',
    name: 'Electronics & Comm',
    short: 'ECE',
    desc: 'Powering the world with circuits and signals.',
    icon: <Cpu size={40} />,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop',
    color: 'from-green-600 to-green-900'
  },
  {
    id: 'mec',
    name: 'Mechanical Eng',
    short: 'MEC',
    desc: 'Designing the machines that move the world.',
    icon: <Settings size={40} />,
    image: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&q=80&w=2070',
    color: 'from-gray-600 to-grey-900'
  },
];

// DepartmentSection component (unchanged)
const DepartmentSection = ({ dept, onNavigate }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0, 1, 1, 0]);
  const scaleIcon = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.1, 0.8]);

  return (
    <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden border-t border-white/10 bg-black">
      <style>{customStyles}</style>
      <motion.div
        style={{ y: yBg, backgroundImage: `url(${dept.image})` }}
        className="absolute inset-0 w-full h-[120%] bg-cover bg-center filter brightness-75"
      >
        <div className={`absolute inset-0 bg-gradient-to-b ${dept.color} mix-blend-multiply opacity-85`} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
      </motion.div>
      <motion.div style={{ opacity: opacityText }} className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <div className="glass-card p-8 md:p-12 rounded-3xl hover-lift">
          <motion.div
            style={{ scale: scaleIcon }}
            initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg animate-float"
          >
            {dept.icon}
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-4 tracking-tight drop-shadow-md">{dept.name}</h2>
          <p className="text-lg md:text-xl text-gray-200 mb-8 font-light max-w-2xl mx-auto italic tracking-wide">{dept.desc}</p>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate(dept.id)}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white/20 text-white text-lg font-bold rounded-full overflow-hidden transition-all shimmer hover:bg-white/30 backdrop-blur-sm border border-white/30"
          >
            <span className="relative z-10">Chat with {dept.short} Bot</span>
            <MessageSquare size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
};

// ────────────────────────────────────────────────
//  NEW: Floating Timetable Button (bottom-right)
// ────────────────────────────────────────────────
const TimetableFab = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.3, duration: 0.7, type: "spring", stiffness: 180 }}
      className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100]"
    >
      <motion.button
        whileHover={{ scale: 1.15, rotate: 4 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => navigate('/timetable')}
        className={`
          group relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20
          glass-card rounded-full shadow-2xl hover:shadow-blue-500/50
          border border-white/25 overflow-hidden shimmer
          transition-all duration-300
        `}
        aria-label="Exam Timetable Generator"
        title="Generate Exam Timetable"
      >
        {/* Subtle shimmer overlay */}
        <div className="absolute inset-0 shimmer opacity-35 pointer-events-none" />

        {/* Icon */}
        <div className="relative z-10 text-white drop-shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <path d="M8 14h.01" />
            <path d="M12 14h.01" />
            <path d="M16 14h.01" />
            <path d="M8 18h.01" />
            <path d="M12 18h.01" />
            <path d="M16 18h.01" />
          </svg>
        </div>

        {/* Tooltip on hover */}
        <div className="
          absolute right-full mr-4 top-1/2 -translate-y-1/2 
          bg-black/85 backdrop-blur-md text-white text-sm font-medium 
          px-4 py-2 rounded-lg border border-white/15 whitespace-nowrap
          opacity-0 group-hover:opacity-100 pointer-events-none 
          transition-opacity duration-300
        ">
          Exam Timetable Generator
        </div>
      </motion.button>
    </motion.div>
  );
};

// Main LandingPage component
const LandingPage = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 via-blue-950 to-black text-white font-sans selection:bg-blue-500 selection:text-white antialiased relative">
      <style>{customStyles}</style>

      {/* Floating timetable button */}
      <TimetableFab />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center overflow-hidden">
        {/* Background with animated gradient */}
        <div className="absolute inset-0 z-0 animate-gradient-shift bg-gradient-to-br from-gray-900 via-blue-900/50 to-black">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBoMzB2MzBIMzB6TTAgMzBoMzB2MzBIMHoiIGZpbGw9InVybCgjYSkiIG9wYWNpdHk9Ii4wNSIvPjwvZz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmZmZmYiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIgc3RvcC1vcGFjaXR5PSIwIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZmZmZmZmIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PC9zdmc+')] opacity-10" />
        </div>

        {/* Theme Toggle */}
        <div className="w-full flex justify-end p-6 relative z-50">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all shadow-md hover:shadow-lg border border-white/10"
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-grow flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 relative z-10 text-center space-y-10">
          {/* Logo with glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="relative w-32 h-32 md:w-40 md:h-40 animate-float"
          >
            <div className="absolute inset-0 bg-blue-500 blur-[60px] opacity-20 rounded-full animate-pulse-glow"></div>
            <img
              src="/VRSEC-Vijayawada-Logo.jpg"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              alt="VR Logo"
              className="relative w-full h-full object-contain drop-shadow-2xl rounded-full border-4 border-white/20 shadow-lg"
            />
            <div className="hidden absolute inset-0 bg-white rounded-full items-center justify-center text-blue-600 text-4xl font-bold border-4 border-gray-200 shadow-inner">
              VR
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-6xl font-serif font-extrabold tracking-tighter text-white drop-shadow-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-blue-100 to-blue-50">
              VR Siddhartha Engg College
            </h1>
            <p className="text-lg md:text-xl text-blue-100 font-light tracking-wide max-w-2xl mx-auto drop-shadow-md">
              Velagapudi Ramakrishna Siddhartha Engineering College, Vijayawada
            </p>
          </motion.div>

          {/* Launch Button with shimmer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <button
              onClick={() => navigate('/chat/college')}
              className="relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-lg font-bold rounded-full shadow-lg shadow-green-500/30 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 border border-green-300/20 overflow-hidden shimmer"
            >
              <Sparkles size={20} className="text-yellow-200" />
              Launch VR AI Assistant
            </button>
          </motion.div>
        </div>

        {/* Footer / Scroll Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="relative z-10 pb-12 pt-8 flex flex-col items-center gap-3 text-white/70"
        >
          <p className="text-sm uppercase tracking-[0.3em] font-medium drop-shadow-sm">
            Select Your Department
          </p>
          <ArrowDown className="animate-bounce size-6 text-white/80" />
        </motion.div>
      </section>

      {/* Department Sections */}
      <div className="bg-black">
        {departments.map((dept) => (
          <DepartmentSection key={dept.id} dept={dept} onNavigate={(id) => navigate(`/chat/${id}`)} />
        ))}
      </div>
    </div>
  );
};

export default LandingPage;