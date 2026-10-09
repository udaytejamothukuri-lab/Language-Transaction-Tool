import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeftRight,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Trash2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Loader2,
  CornerDownLeft,
  Key,
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import {
  DEFAULT_SOURCE_LANGUAGE_CODE,
  DEFAULT_TARGET_LANGUAGE_CODE,
  getLanguageByCode,
  SUPPORTED_LANGUAGES,
} from '../data/languages';
import { translateText, ApiError } from '../services/translationService';
import { useSpeech } from '../hooks/useSpeech';

const MAX_CHAR_LIMIT = 5000;

interface TranslationWorkspaceProps {
  apiKeyConfigured?: boolean;
}

export const TranslationWorkspace: React.FC<TranslationWorkspaceProps> = ({
  apiKeyConfigured = false,
}) => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState<string>(DEFAULT_SOURCE_LANGUAGE_CODE);
  const [targetLanguage, setTargetLanguage] = useState<string>(DEFAULT_TARGET_LANGUAGE_CODE);
  const [detectedSourceLang, setDetectedSourceLang] = useState<string | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  // Text-to-speech hooks
  const speech = useSpeech();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Clear copy feedback timeout
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
        setCopyFeedback(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  // Main translation function
  const handleTranslate = useCallback(async () => {
    const trimmed = sourceText.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setErrorMessage(null);
    setErrorCode(null);

    try {
      const result = await translateText({
        text: trimmed,
        targetLanguage,
        sourceLanguage: sourceLanguage === 'auto' ? undefined : sourceLanguage,
      });

      setTranslatedText(result.translatedText);
      if (result.detectedSourceLanguage) {
        setDetectedSourceLang(result.detectedSourceLanguage);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
        setErrorCode(err.code || null);
        if (err.code === 'API_KEY_NOT_CONFIGURED') {
          setShowConfigGuide(true);
        }
      } else {
        setErrorMessage(err instanceof Error ? err.message : 'Translation request failed.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [sourceText, targetLanguage, sourceLanguage]);

  // Keyboard shortcut: Ctrl + Enter or Cmd + Enter to trigger translation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && sourceText.trim()) {
        handleTranslate();
      }
    }
  };

  // Swap Languages
  const handleSwapLanguages = () => {
    speech.stop();

    let newTarget = sourceLanguage;
    let newSource = targetLanguage;

    // Handle auto-detection gracefully
    if (sourceLanguage === 'auto') {
      if (detectedSourceLang && detectedSourceLang !== targetLanguage) {
        newTarget = detectedSourceLang;
      } else {
        // Find a fallback valid source language
        const fallback = SUPPORTED_LANGUAGES.find((l) => l.code !== targetLanguage)?.code || 'en';
        newTarget = fallback;
      }
    }

    setSourceLanguage(newSource);
    setTargetLanguage(newTarget);
    setDetectedSourceLang(undefined);

    // If translated text exists, swap text contents
    if (translatedText) {
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
  };

  // Clear workspace
  const handleClear = () => {
    speech.stop();
    setSourceText('');
    setTranslatedText('');
    setDetectedSourceLang(undefined);
    setErrorMessage(null);
    setErrorCode(null);
    textareaRef.current?.focus();
  };

  // Copy translated text
  const handleCopy = async () => {
    if (!translatedText) return;

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(translatedText);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = translatedText;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (!successful) throw new Error('Copy command failed');
      }
      setIsCopied(true);
      setCopyFeedback('Translation copied to clipboard!');
    } catch {
      setCopyFeedback('Failed to copy. Please copy manually.');
    }
  };

  // Speech handler for source text
  const handleSpeakSource = () => {
    if (!sourceText.trim()) return;
    const activeLang = sourceLanguage === 'auto' ? detectedSourceLang || 'en' : sourceLanguage;
    if (speech.isSpeaking && speech.currentlySpeakingText === sourceText.trim()) {
      speech.stop();
    } else {
      speech.speak(sourceText, activeLang);
    }
  };

  // Speech handler for translated text
  const handleSpeakTarget = () => {
    if (!translatedText.trim()) return;
    if (speech.isSpeaking && speech.currentlySpeakingText === translatedText.trim()) {
      speech.stop();
    } else {
      speech.speak(translatedText, targetLanguage);
    }
  };

  const isSourceValid = sourceText.trim().length > 0;
  const targetLangObj = getLanguageByCode(targetLanguage);
  const detectedLangObj = detectedSourceLang ? getLanguageByCode(detectedSourceLang) : undefined;

  return (
    <section id="workspace" className="scroll-mt-24 py-8">
      {/* Workspace Card Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 overflow-hidden transition-all">
        
        {/* Workspace Toolbar Header */}
        <div className="bg-slate-50/80 px-4 sm:px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2">
            <LanguageSelector
              id="source-lang-select"
              label="Source Language"
              selectedCode={sourceLanguage}
              onSelectLanguage={(code) => {
                setSourceLanguage(code);
                if (code !== 'auto') setDetectedSourceLang(undefined);
              }}
              allowAutoDetect={true}
              detectedLanguageCode={detectedSourceLang}
            />

            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwapLanguages}
              aria-label="Swap source and target languages"
              title="Swap languages"
              className="p-2.5 rounded-xl bg-white text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            <LanguageSelector
              id="target-lang-select"
              label="Target Language"
              selectedCode={targetLanguage}
              onSelectLanguage={(code) => setTargetLanguage(code)}
              allowAutoDetect={false}
            />
          </div>

          {/* Quick Actions (Clear button & shortcuts info) */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {sourceText && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Clear all text"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}

            <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
              <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">Ctrl</span>
              <span>+</span>
              <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">Enter</span>
              <span className="ml-1 text-slate-400">to translate</span>
            </div>
          </div>
        </div>

        {/* Translation Panels Grid (Side by side on desktop, stacked on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-[380px]">
          
          {/* LEFT PANEL: SOURCE TEXT */}
          <div className="flex flex-col p-5 sm:p-6 bg-white relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Source Text
              </span>
              {detectedSourceLang && sourceLanguage === 'auto' && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  <Sparkles className="w-3 h-3" />
                  Detected: {detectedLangObj?.name || detectedSourceLang}
                </span>
              )}
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              id="source-textarea"
              value={sourceText}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHAR_LIMIT) {
                  setSourceText(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter or paste text here to translate... (e.g., 'Hello, how are you?')"
              aria-label="Source text input"
              maxLength={MAX_CHAR_LIMIT}
              rows={8}
              className="w-full flex-1 resize-none bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-base sm:text-lg leading-relaxed"
            />

            {/* Bottom Source Controls */}
            <div className="flex items-center justify-between pt-4 mt-auto border-t border-slate-100">
              <div className="flex items-center gap-2">
                {/* Speech Button for Source */}
                <button
                  type="button"
                  onClick={handleSpeakSource}
                  disabled={!isSourceValid || !speech.supported}
                  aria-label={
                    speech.isSpeaking && speech.currentlySpeakingText === sourceText.trim()
                      ? 'Stop speaking source text'
                      : 'Listen to source text'
                  }
                  title={
                    !speech.supported
                      ? 'Speech synthesis not supported'
                      : speech.isSpeaking && speech.currentlySpeakingText === sourceText.trim()
                      ? 'Stop audio'
                      : 'Listen to source text'
                  }
                  className={`p-2 rounded-xl transition-all ${
                    speech.isSpeaking && speech.currentlySpeakingText === sourceText.trim()
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                      : isSourceValid
                      ? 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200'
                      : 'text-slate-300 border border-slate-100 cursor-not-allowed'
                  }`}
                >
                  {speech.isSpeaking && speech.currentlySpeakingText === sourceText.trim() ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                {speech.isSpeaking && speech.currentlySpeakingText === sourceText.trim() && (
                  <span className="text-xs text-indigo-600 font-medium animate-pulse">
                    Speaking source...
                  </span>
                )}
              </div>

              {/* Character Counter */}
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <span className={sourceText.length > MAX_CHAR_LIMIT * 0.9 ? 'text-amber-600 font-semibold' : ''}>
                  {sourceText.length.toLocaleString()}
                </span>
                <span>/</span>
                <span>{MAX_CHAR_LIMIT.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: TRANSLATED TEXT */}
          <div className="flex flex-col p-5 sm:p-6 bg-slate-50/50 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Translated Text ({targetLangObj?.name})
              </span>

              {copyFeedback && (
                <span
                  role="status"
                  aria-live="polite"
                  className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 animate-in fade-in"
                >
                  {copyFeedback}
                </span>
              )}
            </div>

            {/* Translated Output / Empty State / Error State */}
            <div className="flex-1 min-h-[160px] flex flex-col justify-start">
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-400">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                  <p className="text-sm font-medium text-slate-600">Translating text...</p>
                  <p className="text-xs text-slate-400 mt-1">Connecting to translation API</p>
                </div>
              ) : errorMessage ? (
                <div className="flex-1 flex flex-col justify-center p-4 bg-red-50/80 border border-red-200 rounded-2xl text-red-700">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-red-800">Translation Failed</h4>
                      <p className="text-xs text-red-600 mt-1 leading-relaxed">{errorMessage}</p>

                      {errorCode === 'API_KEY_NOT_CONFIGURED' && (
                        <button
                          type="button"
                          onClick={() => setShowConfigGuide(!showConfigGuide)}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-red-50 text-red-700 border border-red-300 rounded-lg text-xs font-medium transition-colors"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>How to set up Google Cloud API key</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : translatedText ? (
                <div
                  aria-live="polite"
                  className="w-full flex-1 text-slate-800 text-base sm:text-lg leading-relaxed select-text whitespace-pre-wrap font-medium break-words"
                >
                  {translatedText}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-400 select-none">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 flex items-center justify-center text-indigo-400 mb-3">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Translation will appear here</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Type or paste text on the left, then click &ldquo;Translate Text&rdquo; or press Ctrl+Enter.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Target Controls */}
            <div className="flex items-center justify-between pt-4 mt-auto border-t border-slate-200/60">
              <div className="flex items-center gap-2">
                {/* Speech Button for Target */}
                <button
                  type="button"
                  onClick={handleSpeakTarget}
                  disabled={!translatedText || isLoading || !speech.supported}
                  aria-label={
                    speech.isSpeaking && speech.currentlySpeakingText === translatedText.trim()
                      ? 'Stop speaking translation'
                      : 'Listen to translation'
                  }
                  title={
                    !speech.supported
                      ? 'Speech synthesis not supported'
                      : speech.isSpeaking && speech.currentlySpeakingText === translatedText.trim()
                      ? 'Stop audio'
                      : 'Listen to translation'
                  }
                  className={`p-2 rounded-xl transition-all ${
                    speech.isSpeaking && speech.currentlySpeakingText === translatedText.trim()
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                      : translatedText
                      ? 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200'
                      : 'text-slate-300 border border-slate-100 cursor-not-allowed'
                  }`}
                >
                  {speech.isSpeaking && speech.currentlySpeakingText === translatedText.trim() ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                {speech.isSpeaking && speech.currentlySpeakingText === translatedText.trim() && (
                  <span className="text-xs text-indigo-600 font-medium animate-pulse">
                    Speaking translation...
                  </span>
                )}
              </div>

              {/* Copy Button */}
              <button
                type="button"
                onClick={handleCopy}
                disabled={!translatedText || isLoading}
                aria-label="Copy translated text to clipboard"
                title="Copy translated text"
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  isCopied
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : translatedText
                    ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 shadow-xs'
                    : 'text-slate-300 border-slate-100 cursor-not-allowed'
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Global Translation Action Bar */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span>
              Real-time translation via Google Cloud Translation API (Backend securely proxies requests)
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              id="translate-button"
              type="button"
              onClick={handleTranslate}
              disabled={!isSourceValid || isLoading}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md ${
                !isSourceValid || isLoading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-indigo-500/25 hover:shadow-indigo-500/35 active:scale-98'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <span>Translate Text</span>
                  <CornerDownLeft className="w-4 h-4 opacity-80" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Setup Guide Banner (If API key not configured or requested) */}
      {(showConfigGuide || !apiKeyConfigured) && (
        <div className="mt-6 bg-gradient-to-br from-indigo-50/90 to-blue-50/60 border border-indigo-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-indigo-950">
                  Google Cloud Translation API Configuration Guide
                </h4>
                {apiKeyConfigured && (
                  <button
                    type="button"
                    onClick={() => setShowConfigGuide(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Dismiss
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                To execute live translations via the Google Cloud Translation API v2, configure your backend API key:
              </p>

              <ol className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <li className="bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs">
                  <span className="font-bold text-indigo-600 block mb-1">1. Cloud Console</span>
                  Visit Google Cloud Console &amp; select or create a project.
                </li>
                <li className="bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs">
                  <span className="font-bold text-indigo-600 block mb-1">2. Enable API</span>
                  Enable the &ldquo;Cloud Translation API&rdquo; in the API Library.
                </li>
                <li className="bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs">
                  <span className="font-bold text-indigo-600 block mb-1">3. Create Credentials</span>
                  Generate an API Key under Credentials (restrict to Translation API).
                </li>
                <li className="bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs">
                  <span className="font-bold text-indigo-600 block mb-1">4. Add to .env</span>
                  Set <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-800">GOOGLE_TRANSLATE_API_KEY</code> in <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-800">server/.env</code>.
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
