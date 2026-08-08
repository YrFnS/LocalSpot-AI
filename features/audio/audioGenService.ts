export const speakDescription = (text: string, onStart?: () => void, onEnd?: () => void): Promise<void> => {
  if (!text || !("speechSynthesis" in window)) {
    onEnd?.();
    return Promise.resolve();
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
  return Promise.resolve();
};
