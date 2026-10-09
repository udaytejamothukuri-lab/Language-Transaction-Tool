import { useState, useEffect, useCallback, useRef } from 'react';
import { getLanguageByCode } from '../data/languages';

export interface UseSpeechReturn {
  speak: (text: string, langCode?: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  currentlySpeakingText: string | null;
  supported: boolean;
  speechError: string | null;
  clearError: () => void;
}

export function useSpeech(): UseSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlySpeakingText, setCurrentlySpeakingText] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);

      const updateVoices = () => {
        voicesRef.current = window.speechSynthesis.getVoices();
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      return () => {
        window.speechSynthesis.cancel();
      };
    } else {
      setSupported(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setSpeechError(null);
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentlySpeakingText(null);
  }, []);

  const speak = useCallback(
    (text: string, langCode?: string) => {
      clearError();

      if (!supported || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setSpeechError('Text-to-speech is not supported in this browser.');
        return;
      }

      const trimmedText = text.trim();
      if (!trimmedText) {
        setSpeechError('No text available to speak.');
        return;
      }

      // Stop previous utterance
      window.speechSynthesis.cancel();

      try {
        const utterance = new SpeechSynthesisUtterance(trimmedText);

        // Find best matching voice and locale
        const langInfo = langCode ? getLanguageByCode(langCode) : undefined;
        const targetLocale = langInfo?.ttsLocale || (langCode && langCode !== 'auto' ? langCode : 'en-US');

        utterance.lang = targetLocale;

        const voices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          // 1. Exact match on full locale (e.g., 'te-IN')
          let matchedVoice = voices.find(
            (v) => v.lang.toLowerCase() === targetLocale.toLowerCase()
          );

          // 2. Match on 2-letter language code prefix (e.g. 'te' or 'en')
          if (!matchedVoice && targetLocale) {
            const prefix = targetLocale.split('-')[0].toLowerCase();
            matchedVoice = voices.find((v) =>
              v.lang.toLowerCase().startsWith(prefix)
            );
          }

          if (matchedVoice) {
            utterance.voice = matchedVoice;
          }
        }

        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          setIsSpeaking(true);
          setCurrentlySpeakingText(trimmedText);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          setCurrentlySpeakingText(null);
        };

        utterance.onerror = (event) => {
          // Ignore canceled error if user clicked stop
          if (event.error !== 'canceled' && event.error !== 'interrupted') {
            setSpeechError(`Speech synthesis error: ${event.error || 'unable to play audio'}`);
          }
          setIsSpeaking(false);
          setCurrentlySpeakingText(null);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        setSpeechError(err instanceof Error ? err.message : 'Failed to initialize speech synthesis');
        setIsSpeaking(false);
        setCurrentlySpeakingText(null);
      }
    },
    [supported, clearError]
  );

  return {
    speak,
    stop,
    isSpeaking,
    currentlySpeakingText,
    supported,
    speechError,
    clearError,
  };
}
