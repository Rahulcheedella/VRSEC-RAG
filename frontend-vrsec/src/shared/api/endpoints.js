export const API_BASE_FLASK = import.meta.env.VITE_FLASK_BASE_URL || '';
export const API_BASE_TIMETABLE = import.meta.env.VITE_TIMETABLE_BASE_URL || '';

export const endpoints = {
  chat: (dept) => `${API_BASE_FLASK}/api/v1/rag/${dept}/chat`,
  asrUpload: `${API_BASE_FLASK}/api/v1/bhashini/asr/upload`,
  ttsAudio: `${API_BASE_FLASK}/api/v1/bhashini/tts/audio`,

  generateTimetable: `${API_BASE_FLASK}/api/v1/timetable/generate`,
};
