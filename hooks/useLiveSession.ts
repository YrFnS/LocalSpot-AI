
import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from "@google/genai";
import { floatTo16BitPCM, arrayBufferToBase64, base64ToFloat32 } from '../../utils/audioStreamUtils';

interface UseLiveSessionProps {
  onToolCall: (name: string, args: any) => Promise<any>;
}

export interface LiveTranscript {
    id: string;
    role: 'user' | 'model';
    text: string;
    isComplete: boolean;
}

export const useLiveSession = ({ onToolCall }: UseLiveSessionProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); 
  const [volume, setVolume] = useState(0); 
  
  // Transcription State
  const [transcripts, setTranscripts] = useState<LiveTranscript[]>([]);
  const [realtimeText, setRealtimeText] = useState<{role: 'user'|'model', text: string} | null>(null);

  const ai = useRef(new GoogleGenAI({ apiKey: process.env.API_KEY })).current;
  const audioContext = useRef<AudioContext | null>(null);
  const inputSource = useRef<MediaStreamAudioSourceNode | null>(null);
  const processor = useRef<ScriptProcessorNode | null>(null);
  const nextStartTime = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<Promise<any> | null>(null);
  
  // Buffer for current turn text
  const textBuffer = useRef<{user: string, model: string}>({ user: '', model: '' });

  // Tools Definition
  const searchTool: FunctionDeclaration = {
    name: 'searchMap',
    description: 'Search for local businesses on the map based on user query.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'The search query for places, e.g., "coffee shops", "italian restaurants".',
        },
      },
      required: ['query'],
    },
  };

  const connect = async () => {
    if (isConnected) return;

    try {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000, 
      });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          tools: [{ functionDeclarations: [searchTool] }],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `You are "The Oracle", an advanced AI guide for LocalSpot. 
          You can see what the user sees when their vision uplink is active.
          Be concise, witty, and helpful. 
          If looking at a street, identify businesses or vibes.
          When asked to find places, call the 'searchMap' tool.`,
        },
        callbacks: {
          onopen: () => {
            console.log("Live Session Connected");
            setIsConnected(true);
            
            if (!audioContext.current) return;
            const ctx = audioContext.current;
            
            inputSource.current = ctx.createMediaStreamSource(stream);
            processor.current = ctx.createScriptProcessor(4096, 1, 1);
            
            processor.current.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(v => Math.max(v * 0.9, rms * 5)); 

              const pcm16 = floatTo16BitPCM(inputData);
              const base64 = arrayBufferToBase64(pcm16);
              
              sessionPromise.then(session => {
                  session.sendRealtimeInput({
                      media: {
                          mimeType: 'audio/pcm;rate=16000',
                          data: base64
                      }
                  });
              });
            };

            inputSource.current.connect(processor.current);
            processor.current.connect(ctx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const outText = msg.serverContent?.outputTranscription?.text;
            const inpText = msg.serverContent?.inputTranscription?.text;

            if (outText) {
                textBuffer.current.model += outText;
                setRealtimeText({ role: 'model', text: textBuffer.current.model });
            }
            if (inpText) {
                textBuffer.current.user += inpText;
                setRealtimeText({ role: 'user', text: textBuffer.current.user });
            }

            if (msg.serverContent?.turnComplete) {
                if (textBuffer.current.user) {
                    setTranscripts(prev => [...prev, { 
                        id: Date.now() + '-u', 
                        role: 'user', 
                        text: textBuffer.current.user, 
                        isComplete: true 
                    }]);
                }
                if (textBuffer.current.model) {
                    setTranscripts(prev => [...prev, { 
                        id: Date.now() + '-m', 
                        role: 'model', 
                        text: textBuffer.current.model, 
                        isComplete: true 
                    }]);
                }
                textBuffer.current = { user: '', model: '' };
                setRealtimeText(null);
                setIsSpeaking(false);
            }

            if (msg.toolCall) {
                for (const fc of msg.toolCall.functionCalls) {
                    if (fc.name === 'searchMap') {
                        const args = fc.args as any;
                        const result = await onToolCall(fc.name, args);
                        
                        sessionPromise.then(session => {
                            session.sendToolResponse({
                                functionResponses: [{
                                    id: fc.id,
                                    name: fc.name,
                                    response: { result: "Map updated successfully." } 
                                }]
                            });
                        });
                    }
                }
            }

            const modelAudio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (modelAudio) {
                setIsSpeaking(true);
                const float32 = base64ToFloat32(modelAudio);
                playAudioChunk(float32);
            }
          },
          onclose: () => {
            console.log("Live Session Closed");
            setIsConnected(false);
            setIsSpeaking(false);
          },
          onerror: (err) => {
            console.error("Live Session Error", err);
            setIsConnected(false);
          }
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (e) {
      console.error("Failed to connect live session", e);
      setIsConnected(false);
    }
  };

  const playAudioChunk = (data: Float32Array) => {
      if (!audioContext.current) return;
      const ctx = audioContext.current;
      const buffer = ctx.createBuffer(1, data.length, 24000); 
      buffer.getChannelData(0).set(data);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      const now = ctx.currentTime;
      const start = Math.max(now, nextStartTime.current);
      source.start(start);
      nextStartTime.current = start + buffer.duration;
  };

  const sendVideoFrame = (base64Image: string) => {
      if (sessionRef.current) {
          sessionRef.current.then(session => {
              session.sendRealtimeInput({
                  media: {
                      mimeType: 'image/jpeg',
                      data: base64Image
                  }
              });
          });
      }
  };

  const disconnect = () => {
     if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
     if (processor.current) processor.current.disconnect();
     if (inputSource.current) inputSource.current.disconnect();
     if (audioContext.current) audioContext.current.close();
     setIsConnected(false);
     setIsSpeaking(false);
     setVolume(0);
     setTranscripts([]);
     setRealtimeText(null);
     textBuffer.current = { user: '', model: '' };
     sessionRef.current = null;
  };

  return { connect, disconnect, isConnected, isSpeaking, volume, transcripts, realtimeText, sendVideoFrame };
};
