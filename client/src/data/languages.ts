import { Language } from '../types/translation';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', ttsLocale: 'en-US' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', ttsLocale: 'te-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', ttsLocale: 'hi-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', ttsLocale: 'ta-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', ttsLocale: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', ttsLocale: 'ml-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', ttsLocale: 'bn-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', ttsLocale: 'mr-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', ttsLocale: 'gu-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', ttsLocale: 'pa-IN' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', ttsLocale: 'ur-PK' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', ttsLocale: 'es-ES' },
  { code: 'fr', name: 'French', nativeName: 'Français', ttsLocale: 'fr-FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', ttsLocale: 'de-DE' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', ttsLocale: 'it-IT' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', ttsLocale: 'pt-BR' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', ttsLocale: 'ru-RU' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', ttsLocale: 'ja-JP' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', ttsLocale: 'ko-KR' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', ttsLocale: 'zh-CN' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', ttsLocale: 'ar-SA' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', ttsLocale: 'tr-TR' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', ttsLocale: 'id-ID' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', ttsLocale: 'th-TH' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', ttsLocale: 'vi-VN' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', ttsLocale: 'nl-NL' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', ttsLocale: 'pl-PL' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', ttsLocale: 'uk-UA' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', ttsLocale: 'el-GR' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', ttsLocale: 'he-IL' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', ttsLocale: 'ne-NP' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', ttsLocale: 'si-LK' },
];

export const AUTO_DETECT_LANGUAGE: Language = {
  code: 'auto',
  name: 'Detect Language',
  nativeName: 'Auto Detect',
};

export const DEFAULT_SOURCE_LANGUAGE_CODE = 'en';
export const DEFAULT_TARGET_LANGUAGE_CODE = 'te';

export function getLanguageByCode(code: string): Language | undefined {
  if (code === 'auto') return AUTO_DETECT_LANGUAGE;
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
}
