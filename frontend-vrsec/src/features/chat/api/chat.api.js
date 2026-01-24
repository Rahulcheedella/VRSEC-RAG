import { endpoints } from "../../../shared/api/endpoints";

export const sendChatMessage = async ({ dept, question, response_lang }) => {
  const res = await fetch(endpoints.chat(dept), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, response_lang }),
  });

  if (!res.ok) throw new Error("Chat request failed");
  return res.json();
};

export const uploadASRAudio = async ({ blob, source_lang }) => {
  const formData = new FormData();
  formData.append("audio", blob);
  formData.append("source_lang", source_lang);

  const res = await fetch(endpoints.asrUpload, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("ASR request failed");
  return res.json();
};

export const fetchTTSAudio = async ({ text, target_lang }) => {
  const res = await fetch(endpoints.ttsAudio, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, target_lang }),
  });

  if (!res.ok) throw new Error("TTS request failed");
  return res.blob();
};
