
import { GoogleGenAI, Modality } from "@google/genai";
import { GameState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateResponse = async (message: string, state: GameState) => {
  const systemInstruction = `
    You are Commander Zeta, the advanced AI of the starship ${state.shipName}. 
    The current captain is Captain ${state.captainName}.
    Ship Stats: Shields: ${state.resources.shields}%, Energy: ${state.resources.energy}%, Hull: ${state.resources.hull}%, Oxygen: ${state.resources.oxygen}%.
    Current Sector: ${state.currentSector}.
    Credits: ${state.credits}.
    Active Missions: ${state.missions.filter(m => m.status === 'active').map(m => m.title).join(', ') || 'None'}.
    
    Personality: Logic-driven, professional, loyal, but with a dry wit typical of advanced AIs. 
    Guidelines: 
    - Keep responses relatively concise but atmospheric. 
    - Address the user as "Captain".
    - If asked for "status report", summarize the current ship stats.
    - If asked about "missions", summarize active tasks.
    - Occasionally suggest a "sector scan" or "resource check".
    - Do not break character.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: message,
    config: {
      systemInstruction,
    },
  });

  return response.text || "Communication error. Re-establishing link...";
};

export const generateTTS = async (text: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Use Kore for a clean ship AI voice
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (err) {
    console.error("TTS generation failed", err);
    return undefined;
  }
};

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
