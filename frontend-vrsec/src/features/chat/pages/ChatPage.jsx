// import React, { useState, useRef, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   Send,
//   Copy,
//   ArrowLeft,
//   Sun,
//   Moon,
//   Bot,
//   User,
//   Mic,
//   Languages,
//   Volume2,
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// const ChatInterface = ({ darkMode, setDarkMode }) => {
//   const { dept } = useParams();
//   const navigate = useNavigate();

//   const [messages, setMessages] = useState([
//     {
//       role: 'bot',
//       text: `Hello, I am the AI assistant for ${dept}. Ask in any language.`,
//       lang: 'en',
//     },
//   ]);

//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [responseLang, setResponseLang] = useState('en');

//   const messagesEndRef = useRef(null);
//   const recorderRef = useRef(null);
//   const streamRef = useRef(null);
//   const chunksRef = useRef([]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // ─── STATIC RESPONSES FOR SUGGESTIONS ───
//   const handleStaticResponse = (question, answer) => {
//     setMessages(prev => [
//       ...prev,
//       { role: 'user', text: question },
//       { role: 'bot', text: answer, lang: responseLang }
//     ]);
//     setInput('');
//   };

//   // ─── Quick suggestion handler with static answers ───
//   const sendQuickQuestion = (questionKey) => {
//     const staticAnswers = {
//       highest: "NIHITHA VEMULAPALLI from CSE placed in AMAZON with the highest package of 52.6 LPA (2024-25 batch).",
//       hod: "Dr. D. Rajeswara Rao\nProfessor & Head, Department of CSE\nDean - Industry Relations, Training & Placements\nEmail: hodcse@vrsiddhartha.ac.in",
//       mllab: "To reach Machine Learning Lab:\n\nFirst come to VL DUTT BLOCK → Ground Floor → Go straight → It's right next to CSE Seminar Hall - 1.\n\n(Just opposite to HOD cabin)"
//     };

//     if (staticAnswers[questionKey]) {
//       const userQuestions = {
//         highest: "what is the highest package ?",
//         hod: "Name of cse hod ?",
//         mllab: "how to reach machine learning lab ?"
//       };

//       handleStaticResponse(userQuestions[questionKey], staticAnswers[questionKey]);
//     }
//   };

//   // ─── Speech Recognition (unchanged) ───
//   const handleMicClick = () => {
//     if (isListening) {
//       if (recorderRef.current) recorderRef.current.stop();
//       setIsListening(false);
//       return;
//     }

//     navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
//       streamRef.current = stream;
//       const recorder = new MediaRecorder(stream);

//       recorder.ondataavailable = (e) => chunksRef.current.push(e.data);

//       recorder.onstop = async () => {
//         const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
//         chunksRef.current = [];

//         const formData = new FormData();
//         formData.append('audio', blob);
//         formData.append('source_lang', responseLang);

//         try {
//           const res = await fetch('http://127.0.0.1:5000/bhashini/asr/upload', {
//             method: 'POST',
//             body: formData,
//           });
//           const data = await res.json();
//           setInput(prev => prev ? `${prev} ${data.transcribedText || ''}` : data.transcribedText || '');
//         } catch (err) {
//           alert('Speech recognition failed.');
//         } finally {
//           streamRef.current?.getTracks().forEach(track => track.stop());
//           streamRef.current = null;
//         }
//       };

//       recorder.start();
//       recorderRef.current = recorder;
//       setIsListening(true);
//     }).catch(() => alert('Microphone access denied.'));
//   };

//   // ─── Send Message (Only for non-static questions) ───
//   const handleSend = async () => {
//     if (!input.trim() || loading) return;

//     const userText = input.trim();
//     setInput('');
//     setMessages(prev => [...prev, { role: 'user', text: userText }]);
//     setLoading(true);

//     let promptToSend = userText;
//     if (responseLang === 'te') promptToSend += ' (Please answer in Telugu)';
//     if (responseLang === 'hi') promptToSend += ' (Please answer in Hindi)';

//     try {
//       const res = await fetch(`http://127.0.0.1:5000/chat/${dept}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ question: promptToSend, response_lang: responseLang }),
//       });

//       const data = await res.json();
//       setMessages(prev => [...prev, { role: 'bot', text: data.answer, lang: responseLang }]);
//     } catch (err) {
//       setMessages(prev => [...prev, { role: 'bot', text: 'Server connection failed.', lang: 'en' }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ─── Text-to-Speech (Bhashini) ───
//   const speakText = async (text, msgLang) => {
//     try {
//       const ttsRes = await fetch('http://127.0.0.1:5000/bhashini/tts/audio', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ text, target_lang: msgLang || responseLang }),
//       });
//       const audioBlob = await ttsRes.blob();
//       const audio = new Audio(URL.createObjectURL(audioBlob));
//       audio.play();
//     } catch (err) {
//       alert('Text-to-speech failed.');
//     }
//   };

//   const copyToClipboard = (text) => navigator.clipboard.writeText(text);

//   const typingVariants = { start: { transition: { staggerChildren: 0.16 } }, end: { transition: { staggerChildren: 0.16 } } };
//   const dotVariants = { start: { y: '0%' }, end: { y: ['0%', '-60%', '0%'], transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } } };
//   const messageVariants = {
//     hidden: (custom) => ({ opacity: 0, y: custom === 'user' ? 24 : 12, scale: 0.96 }),
//     visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 26, duration: 0.4 } },
//   };

//   return (
//     <div className="flex flex-col h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
//       {/* Header */}
//       <header className="p-4 border-b dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-950 z-10 sticky top-0">
//         <div className="flex items-center gap-3">
//           <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
//             <ArrowLeft size={20} />
//           </button>
//           <h1 className="font-bold flex items-center gap-2 text-lg">
//             VR-GPT
//             <span className="text-xs border px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
//               {dept.toUpperCase()}
//             </span>
//           </h1>
//         </div>
//         <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
//           {darkMode ? <Sun size={20} /> : <Moon size={20} />}
//         </button>
//       </header>

//       {/* Messages */}
//       <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-24">
//         <AnimatePresence mode="popLayout">
//           {messages.map((msg, i) => (
//             <motion.div
//               key={`${msg.role}-${i}`}
//               custom={msg.role}
//               variants={messageVariants}
//               initial="hidden"
//               animate="visible"
//               layout
//               className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
//             >
//               {msg.role === 'bot' && (
//                 <div className="relative w-9 h-9 md:w-10 md:h-10 flex-shrink-0">
//                   <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow" />
//                   <div className="absolute inset-1 bg-white dark:bg-gray-950 rounded-full flex items-center justify-center">
//                     <Bot size={18} className="text-blue-600" />
//                   </div>
//                 </div>
//               )}

//               <div className="relative max-w-[82%] md:max-w-[75%] group">
//                 <div className={`p-4 md:p-5 rounded-2xl shadow-sm ${
//                   msg.role === 'user'
//                     ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none'
//                     : 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/40 border border-blue-100 dark:border-blue-800/40 rounded-bl-none backdrop-blur-sm'
//                 }`}>
//                   <p className="whitespace-pre-wrap leading-relaxed text-[15px] md:text-[15.5px]">{msg.text}</p>

//                   {msg.role === 'bot' && (
//                     <div className="flex gap-5 mt-3 pt-1 opacity-70 group-hover:opacity-100 transition-opacity">
//                       <button onClick={() => speakText(msg.text, msg.lang)} className="text-xs flex items-center gap-1.5 hover:text-blue-400 transition-colors">
//                         <Volume2 size={15} /> Listen
//                       </button>
//                       <button onClick={() => copyToClipboard(msg.text)} className="text-xs flex items-center gap-1.5 hover:text-blue-400 transition-colors">
//                         <Copy size={15} /> Copy
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {msg.role === 'user' && (
//                 <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
//                   <User size={18} className="text-gray-800 dark:text-gray-200" />
//                 </div>
//               )}
//             </motion.div>
//           ))}
//         </AnimatePresence>

//         {loading && (
//           <div className="flex gap-3 items-start">
//             <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow">
//               <Bot size={18} />
//             </div>
//             <motion.div className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800 px-5 py-3.5 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5"
//               variants={typingVariants} initial="start" animate="end">
//               {[0,1,2].map(i => <motion.div key={i} className="w-2.5 h-2.5 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full" variants={dotVariants} />)}
//             </motion.div>
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </main>

//       {/* Footer with Suggestions */}
//       <footer className="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-950">
//         <div className="max-w-4xl mx-auto">

//           {/* QUICK SUGGESTIONS - INSTANT STATIC ANSWERS */}
//           <div className="overflow-x-auto pb-3 flex gap-2.5 mb-3 scrollbar-hide">
//             <button onClick={() => sendQuickQuestion('highest')}
//               className="px-4 py-2 text-sm rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition flex-shrink-0">
//               Highest package?
//             </button>

//             <button onClick={() => sendQuickQuestion('hod')}
//               className="px-4 py-2 text-sm rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition flex-shrink-0">
//               CSE HOD name?
//             </button>

//             <button onClick={() => sendQuickQuestion('mllab')}
//               className="px-4 py-2 text-sm rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition flex-shrink-0">
//               ML Lab location?
//             </button>
//           </div>

//           <div className="relative">
//             <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
//               <Languages size={18} className="text-gray-500 dark:text-gray-400" />
//               <select value={responseLang} onChange={(e) => setResponseLang(e.target.value)}
//                 className="text-sm bg-transparent outline-none cursor-pointer text-gray-600 dark:text-gray-300 font-medium">
//                 <option value="en">English</option>
//                 <option value="te">తెలుగు</option>
//                 <option value="hi">हिन्दी</option>
//               </select>
//             </div>

//             <input
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
//               placeholder={isListening ? 'Listening...' : `Ask anything in ${responseLang.toUpperCase()}...`}
//               className={`w-full rounded-full py-4 pl-44 md:pl-48 pr-28 md:pr-32 
//                 bg-white/70 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200 dark:border-gray-700
//                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 shadow-lg shadow-black/5 dark:shadow-black/30
//                 transition-all duration-300 text-[15px]
//                 ${isListening ? 'ring-2 ring-red-400/60 bg-red-50/20 dark:bg-red-950/20 scale-[1.01]' : ''}`}
//             />

//             <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1.5">
//               <button onClick={handleMicClick}
//                 className={`p-3 rounded-full transition-all ${isListening ? 'text-red-500 bg-red-100 dark:bg-red-900/40 animate-pulse' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800'}`}>
//                 <Mic size={20} />
//               </button>
//               <button onClick={handleSend} disabled={!input.trim() || loading}
//                 className={`relative p-3.5 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:scale-95`}>
//                 <Send size={20} className="text-white relative z-10" />
//               </button>
//             </div>
//           </div>

//           <p className="text-center text-xs mt-3 text-gray-500 dark:text-gray-400">
//             Response: <span className="font-medium">{responseLang.toUpperCase()}</span> • Voice input & output enabled
//           </p>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default ChatInterface;


import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send,
  Copy,
  ArrowLeft,
  Sun,
  Moon,
  Bot,
  User,
  Mic,
  Languages,
  Volume2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatInterface = ({ darkMode, setDarkMode }) => {
  const { dept } = useParams(); // 'cse', 'ece', 'mec', or 'college' for general
  const navigate = useNavigate();

  const isGeneral = dept === 'college';

  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: isGeneral
        ? "Hello! I'm the general VR Siddhartha College AI Assistant. Ask anything about the college!"
        : `Hello, I am the AI assistant for ${dept.toUpperCase()}. Ask in any language.`,
      lang: 'en',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [responseLang, setResponseLang] = useState('en');

  // Randomly select 3 suggestions on mount
  const [displayedSuggestions, setDisplayedSuggestions] = useState([]);

  const messagesEndRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Define all possible suggestion questions + static answers ───
  const suggestionData = {
    college: [  // General college mode
      {
        q: "Who is the Principal?",
        a: "Dr. P. Venkateswara Rao (or current Principal)\nOfficial Email: principal@vrsiddhartha.ac.in\nOffice: Administrative Block"
      },
      {
        q: "College location?",
        a: "Velagapudi Ramakrishna Siddhartha Engineering College\nKanuru, Vijayawada, Andhra Pradesh - 520007, India"
      },
      {
        q: "Highest package in college?",
        a: "52.6 LPA (offered by Amazon)\nStudent: NIHITHA VEMULAPALLI (CSE), Batch 2024-25"
      },
      {
        q: "Upcoming event?",
        a: "SJ Pragnana 2K26\nNational Level Techno-Cultural Fest\nOrganized by Department of Civil Engineering\nDates: 20th & 21st February 2026\nCash Prizes worth ₹10 Lakhs!\nEvents include: Code Clash, Ideathon, Dance, Music, Literary, and more."
      },
      {
        q: "College highest package company?",
        a: "Amazon (52.6 LPA to Nihitha Vemulapalli, CSE)"
      },
      {
        q: "Principal email?",
        a: "principal@vrsiddhartha.ac.in"
      }
    ],
    cse: [  // CSE specific
      {
        q: "Who is CSE HOD?",
        a: "Dr. D. Rajeswara Rao\nProfessor & Head, CSE\nDean - Industry Relations, Training & Placements\nEmail: hodcse@vrsiddhartha.ac.in"
      },
      {
        q: "CSE highest package?",
        a: "52.6 LPA (Amazon)\nStudent: NIHITHA VEMULAPALLI, CSE, 2024-25"
      },
      {
        q: "How to reach ML Lab?",
        a: "First come to VL Dutt Block → Ground Floor → Go straight → It's right next to CSE Seminar Hall - 1 (opposite to HOD cabin)"
      },
      {
        q: "Upcoming CSE event?",
        a: "Participating in SJ Pragnana 2K26 (20-21 Feb 2026)\nCSE Ideathon & Code Clash competitions"
      },
      {
        q: "CSE block location?",
        a: "Main academic blocks (CSE department located in core engineering blocks near VL Dutt Block)"
      }
    ],
    ece: [  // ECE (using placeholders + common)
      {
        q: "Who is ECE HOD?",
        a: "Dr. [ECE HOD Name - check department page]\nEmail: [ecehod@vrsiddhartha.ac.in or similar]"
      },
      {
        q: "ECE highest package?",
        a: "Up to 35-52 LPA range (top offers similar to college highest in core branches)"
      },
      {
        q: "Upcoming ECE event?",
        a: "Participating in SJ Pragnana 2K26\nECE-related: TechnoCruz, E-Poster, etc."
      },
      {
        q: "ECE block?",
        a: "ECE department in main engineering blocks (near central academic area)"
      }
    ],
    mec: [  // Mechanical
      {
        q: "Who is Mechanical HOD?",
        a: "Dr. [Mechanical HOD Name]\nEmail: [mechhod@vrsiddhartha.ac.in]"
      },
      {
        q: "Mechanical highest package?",
        a: "Around 10-23 LPA range (varies; top college offers apply)"
      },
      {
        q: "Upcoming Mechanical event?",
        a: "Participating in SJ Pragnana 2K26\nEvents like Rest Out of Waste, etc."
      },
      {
        q: "Mechanical block?",
        a: "Mechanical workshops & labs in dedicated engineering blocks"
      }
    ]
  };

  useEffect(() => {
    const key = isGeneral ? 'college' : dept;
    const all = suggestionData[key] || [];
    if (all.length <= 3) {
      setDisplayedSuggestions(all);
    } else {
      // Randomly pick 3
      const shuffled = [...all].sort(() => 0.5 - Math.random());
      setDisplayedSuggestions(shuffled.slice(0, 3));
    }
  }, [dept]);

  // ─── Handle static suggestion click ───
  const handleStaticResponse = (question, answer) => {
    setMessages(prev => [
      ...prev,
      { role: 'user', text: question },
      { role: 'bot', text: answer, lang: responseLang }
    ]);
    setInput('');
  };

  // ─── Speech Recognition (unchanged) ───
  const handleMicClick = () => {
    if (isListening) {
      if (recorderRef.current) recorderRef.current.stop();
      setIsListening(false);
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        streamRef.current = stream;
        const recorder = new MediaRecorder(stream);

        recorder.ondataavailable = (e) => {
          chunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          chunksRef.current = [];

          const formData = new FormData();
          formData.append('audio', blob);
          formData.append('source_lang', responseLang);

          try {
            const res = await fetch('http://127.0.0.1:5000/api/v1/bhashini/asr/upload', {
              method: 'POST',
              body: formData,
            });

            if (!res.ok) throw new Error('ASR request failed');

            const data = await res.json();
            const transcript = data.transcribedText || '';

            setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          } catch (err) {
            console.error('ASR Error:', err);
            alert('Speech recognition failed. Please try again.');
          } finally {
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((track) => track.stop());
              streamRef.current = null;
            }
          }
        };

        recorder.start();
        recorderRef.current = recorder;
        setIsListening(true);
      })
      .catch((err) => {
        console.error('Microphone access error:', err);
        alert('Microphone permission denied or not available.');
      });
  };

  // ─── Normal Send (API) ───
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');

    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    let promptToSend = userText;
    if (responseLang === 'te') {
      promptToSend += ' (Please answer in Telugu)';
    } else if (responseLang === 'hi') {
      promptToSend += ' (Please answer in Hindi)';
    }

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/v1/rag/${dept}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: promptToSend,
          response_lang: responseLang,
        }),
      });

      if (!res.ok) throw new Error('Server responded with error');

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: data.answer,
          lang: responseLang,
        },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: '⚠️ Server connection failed.', lang: 'en' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = async (text, msgLang) => {
    try {
      const ttsRes = await fetch('http://127.0.0.1:5000/api/v1/bhashini/tts/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          target_lang: msgLang || responseLang || 'en',
        }),
      });

      if (!ttsRes.ok) throw new Error('TTS request failed');

      const audioBlob = await ttsRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();

      audio.onended = () => URL.revokeObjectURL(audioUrl);
    } catch (err) {
      console.error('TTS Error:', err);
      alert('Text-to-speech failed. Please try again.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Animation variants (unchanged)
  const typingVariants = {
    start: { transition: { staggerChildren: 0.16 } },
    end: { transition: { staggerChildren: 0.16 } },
  };

  const dotVariants = {
    start: { y: '0%' },
    end: {
      y: ['0%', '-60%', '0%'],
      transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const messageVariants = {
    hidden: (custom) => ({
      opacity: 0,
      y: custom === 'user' ? 24 : 12,
      scale: 0.96,
    }),
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 26,
        duration: 0.4,
      },
    },
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="p-4 border-b dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-950 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold flex items-center gap-2 text-lg">
            VR-GPT
            <span className="text-xs border px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {isGeneral ? 'COLLEGE' : dept.toUpperCase()}
            </span>
          </h1>
        </div>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Messages - unchanged */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-24">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={`${msg.role}-${i}`}
              custom={msg.role}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              layout
              className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'bot' && (
                <div className="relative w-9 h-9 md:w-10 md:h-10 flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow" />
                  <div className="absolute inset-1 bg-white dark:bg-gray-950 rounded-full flex items-center justify-center">
                    <Bot size={18} className="text-blue-600" />
                  </div>
                </div>
              )}

              <div className="relative max-w-[82%] md:max-w-[75%] group">
                <div
                  className={`p-4 md:p-5 rounded-2xl shadow-sm ${msg.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none'
                    : 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/40 border border-blue-100 dark:border-blue-800/40 rounded-bl-none backdrop-blur-sm'
                    }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed text-[15px] md:text-[15.5px]">
                    {msg.text}
                  </p>

                  {msg.role === 'bot' && (
                    <div className="flex gap-5 mt-3 pt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => speakText(msg.text, msg.lang)}
                        className="text-xs flex items-center gap-1.5 hover:text-blue-400 transition-colors"
                        title="Read aloud"
                      >
                        <Volume2 size={15} /> Listen
                      </button>
                      <button
                        onClick={() => copyToClipboard(msg.text)}
                        className="text-xs flex items-center gap-1.5 hover:text-blue-400 transition-colors"
                        title="Copy text"
                      >
                        <Copy size={15} /> Copy
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                  <User size={18} className="text-gray-800 dark:text-gray-200" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-3 items-start">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow relative overflow-hidden flex-shrink-0">
              <Bot size={18} />
            </div>

            <motion.div
              className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800 px-5 py-3.5 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5"
              variants={typingVariants}
              initial="start"
              animate="end"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2.5 h-2.5 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full"
                  variants={dotVariants}
                />
              ))}
            </motion.div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Footer */}
      <footer className="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">

          {/* RANDOM 3 SUGGESTIONS */}
          <div className="overflow-x-auto pb-3 flex gap-2.5 mb-3 scrollbar-hide">
            {displayedSuggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleStaticResponse(item.q, item.a)}
                className="px-4 py-2 text-sm rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition flex-shrink-0"
              >
                {item.q}
              </button>
            ))}
          </div>

          <div className="relative">
            {/* Language selector */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
              <Languages size={18} className="text-gray-500 dark:text-gray-400" />
              <select
                value={responseLang}
                onChange={(e) => setResponseLang(e.target.value)}
                className="text-sm bg-blue outline-none cursor-pointer text-black font-medium"
              >
                <option value="en" className="text-black">English</option>
                <option value="te" className="text-black">తెలుగు</option>
                <option value="hi" className="text-black">हिन्दी</option>
              </select>
            </div>




            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isListening ? 'Listening...' : `Ask anything in ${responseLang.toUpperCase()}...`}
              className={`w-full rounded-full py-4 pl-44 md:pl-48 pr-28 md:pr-32 
                bg-white/70 dark:bg-gray-800/60 backdrop-blur-md
                border border-gray-200 dark:border-gray-700
                focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30
                shadow-lg shadow-black/5 dark:shadow-black/30
                transition-all duration-300 text-[15px]
                ${isListening ? 'ring-2 ring-red-400/60 bg-red-50/20 dark:bg-red-950/20 scale-[1.01]' : ''}`}
            />

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1.5">
              <button
                onClick={handleMicClick}
                className={`p-3 rounded-full transition-all ${isListening
                  ? 'text-red-500 bg-red-100 dark:bg-red-900/40 animate-pulse'
                  : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                title="Voice input"
              >
                <Mic size={20} />
              </button>

              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className={`relative p-3.5 rounded-full 
                  bg-gradient-to-br from-blue-600 to-blue-700
                  hover:from-blue-500 hover:to-blue-600
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200 shadow-md hover:shadow-lg active:scale-95`}
                title="Send"
              >
                <Send size={20} className="text-white relative z-10" />
              </button>
            </div>
          </div>

          <p className="text-center text-xs mt-3 text-gray-500 dark:text-gray-400">
            Response: <span className="font-medium">{responseLang.toUpperCase()}</span> • Voice input & output enabled
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ChatInterface;