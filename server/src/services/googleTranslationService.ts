import axios, { AxiosError } from 'axios';

export interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string;
}

export class TranslationServiceError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode = 500, code = 'TRANSLATION_ERROR') {
    super(message);
    this.name = 'TranslationServiceError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#x60;/g, '`')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}

export class GoogleTranslationService {
  private readonly apiUrl = 'https://translation.googleapis.com/language/translate/v2';

  public isApiKeyConfigured(): boolean {
    const key = process.env.GOOGLE_TRANSLATE_API_KEY;
    return Boolean(key && key.trim() !== '' && key !== 'your_google_cloud_translation_api_key');
  }

  public async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<TranslationResult> {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY?.trim();

    if (!apiKey || apiKey === 'your_google_cloud_translation_api_key') {
      throw new TranslationServiceError(
        'Google Cloud Translation API key is not configured on the backend. Please add GOOGLE_TRANSLATE_API_KEY to server/.env.',
        503,
        'API_KEY_NOT_CONFIGURED'
      );
    }

    const payload: Record<string, string> = {
      q: text,
      target: targetLanguage,
      format: 'text',
    };

    if (sourceLanguage && sourceLanguage !== 'auto') {
      payload.source = sourceLanguage;
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        payload,
        {
          params: { key: apiKey },
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      const translations = response.data?.data?.translations;
      if (!translations || !Array.isArray(translations) || translations.length === 0) {
        throw new TranslationServiceError(
          'Translation API returned an empty or invalid response.',
          502,
          'INVALID_API_RESPONSE'
        );
      }

      const primary = translations[0];
      const translatedRaw = primary.translatedText ?? '';
      const translatedText = decodeHtmlEntities(translatedRaw);
      const detectedSourceLanguage = primary.detectedSourceLanguage;

      return {
        translatedText,
        detectedSourceLanguage,
      };
    } catch (err: unknown) {
      if (err instanceof TranslationServiceError) {
        throw err;
      }

      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError<{ error?: { message?: string; code?: number; status?: string } }>;
        const status = axiosErr.response?.status;
        const apiMessage = axiosErr.response?.data?.error?.message;

        if (status === 400) {
          throw new TranslationServiceError(
            `Invalid translation request: ${apiMessage || 'Invalid parameters or unsupported language code.'}`,
            400,
            'BAD_REQUEST'
          );
        }

        if (status === 401 || status === 403) {
          throw new TranslationServiceError(
            `Google Cloud authentication failed: ${apiMessage || 'Please verify that your GOOGLE_TRANSLATE_API_KEY is valid and the Cloud Translation API is enabled.'}`,
            status,
            'API_AUTH_FAILED'
          );
        }

        if (status === 429) {
          throw new TranslationServiceError(
            'Google Cloud Translation quota or rate limit exceeded. Please try again shortly or check your Google Cloud Console quota.',
            429,
            'QUOTA_EXCEEDED'
          );
        }

        if (axiosErr.code === 'ECONNABORTED' || axiosErr.message.includes('timeout')) {
          throw new TranslationServiceError(
            'Translation service request timed out after 10 seconds. Please check your internet connection.',
            504,
            'GATEWAY_TIMEOUT'
          );
        }

        if (!axiosErr.response) {
          throw new TranslationServiceError(
            'Unable to reach Google Cloud Translation API. Please check your network connection.',
            503,
            'NETWORK_ERROR'
          );
        }

        throw new TranslationServiceError(
          `Translation service error: ${apiMessage || axiosErr.message}`,
          status || 500,
          'API_ERROR'
        );
      }

      const message = err instanceof Error ? err.message : 'An unexpected error occurred during translation.';
      throw new TranslationServiceError(message, 500, 'INTERNAL_ERROR');
    }
  }
}

export const googleTranslationService = new GoogleTranslationService();
