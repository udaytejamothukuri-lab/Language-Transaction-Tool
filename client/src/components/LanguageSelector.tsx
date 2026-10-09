import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, Sparkles } from 'lucide-react';
import { SUPPORTED_LANGUAGES, AUTO_DETECT_LANGUAGE } from '../data/languages';
import { Language } from '../types/translation';

interface LanguageSelectorProps {
  id: string;
  label: string;
  selectedCode: string;
  onSelectLanguage: (code: string) => void;
  allowAutoDetect?: boolean;
  detectedLanguageCode?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  id,
  label,
  selectedCode,
  onSelectLanguage,
  allowAutoDetect = false,
  detectedLanguageCode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Find currently selected language
  const isAuto = selectedCode === 'auto';
  const selectedLang = isAuto
    ? AUTO_DETECT_LANGUAGE
    : SUPPORTED_LANGUAGES.find((lang) => lang.code === selectedCode) || SUPPORTED_LANGUAGES[0];

  const detectedLangObj = detectedLanguageCode
    ? SUPPORTED_LANGUAGES.find((l) => l.code === detectedLanguageCode)
    : undefined;

  // Filter languages based on search query
  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full sm:w-auto" ref={dropdownRef}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>

      {/* Selector Trigger Button */}
      <button
        id={id}
        aria-label={label}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-60 flex items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 hover:border-slate-300 rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-sm shadow-sm"
      >
        <div className="flex items-center gap-2 truncate">
          {isAuto && <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />}
          <span className="truncate">{selectedLang.name}</span>
          {isAuto && detectedLangObj ? (
            <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium border border-indigo-100 shrink-0">
              Detected: {detectedLangObj.name}
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-normal truncate hidden sm:inline">
              ({selectedLang.nativeName})
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-indigo-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute z-50 mt-1.5 w-full sm:w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top"
        >
          {/* Search Box */}
          <div className="px-3 pb-2 pt-1 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search languages..."
                aria-label="Filter languages"
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* List options */}
          <div className="max-h-64 overflow-y-auto py-1">
            {/* Auto Detect Option (if enabled and matches query) */}
            {allowAutoDetect &&
              (!searchQuery || 'detect language auto'.includes(searchQuery.toLowerCase())) && (
                <button
                  type="button"
                  role="option"
                  aria-selected={isAuto}
                  onClick={() => {
                    onSelectLanguage('auto');
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-sm transition-colors ${
                    isAuto
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>Auto Detect</span>
                  </div>
                  {isAuto && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              )}

            {/* Separator if auto detect is shown */}
            {allowAutoDetect && (
              <div className="my-1 border-t border-slate-100" />
            )}

            {/* Filtered Languages */}
            {filteredLanguages.length === 0 ? (
              <div className="px-4 py-4 text-center text-xs text-slate-400">
                No languages found matching "{searchQuery}"
              </div>
            ) : (
              filteredLanguages.map((lang: Language) => {
                const isSelected = !isAuto && selectedCode === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelectLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-sm transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="truncate">{lang.name}</span>
                      <span className="text-xs text-slate-400 font-normal truncate">
                        {lang.nativeName}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
