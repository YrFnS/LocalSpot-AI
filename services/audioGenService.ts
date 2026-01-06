
import { Modality } from "@google/genai";
import { Business } from "../types";
import { decodeBase64, decodeAudioData, getAudioContext } from "../utils/audioUtils";
import { ai } from "./aiClient";

export const generateConversationAudio = async (business: Business): Promise<ArrayBuffer | null> => {
    try {
        const prompt = `
            Generate a short, rapid-fire, natural conversation (approx 30-40 words total) between two friends, Alex and Jordan.
            They are discussing whether to go to "${business.name}" which is a ${business.types?.[0]}.
            
            Context:
            Vibe: ${business.vibe}
            Description: ${business.description}
            Rating: ${business.rating} stars.
            
            Tone: Casual, urban, slightly opinionated. Use slang.
            
            Script Format:
            Alex: [Line]
            Jordan: [Line]
            Alex: [Line]
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    multiSpeakerVoiceConfig: {
                        speakerVoiceConfigs: [
                            { speaker: 'Alex', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                            { speaker: 'Jordan', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
                        ]
                    }
                }
            }
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio generated");
        
        return decodeBase64(base64Audio).buffer;

    } catch (error) {
        console.error("Eavesdrop generation failed", error);
        return null;
    }
};

export const speakDescription = async (text: string, onStart?: () => void, onEnd?: () => void): Promise<void> => {
  try {
    const ctx = getAudioContext();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio");
    const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1);
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.onended = () => { if (onEnd) onEnd(); };
    if (onStart) onStart();
    source.start();
  } catch (error) {
    if (onEnd) onEnd();
  }
};
