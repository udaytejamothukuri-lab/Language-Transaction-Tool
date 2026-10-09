export interface Language {
  code: string;
  name: string;
  nativeName: string;
  ttsLocale?: string;
}

export interface TranslationRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string; // 'auto' or specific code
}

export interface TranslationResponseData {
  translatedText: string;
  detectedSourceLanguage?: string;
}

export interface TranslationResponse {
  success: boolean;
  data?: TranslationResponseData;
  error?: string;
  code?: string;
}

export interface BackendHealthResponse {
  status: string;
  service: string;
  uptimeSeconds: number;
  timestamp: string;
  googleTranslateApiKeyConfigured: boolean;
  setupNote?: string;
}
