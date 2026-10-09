import { Request, Response, NextFunction } from 'express';
import { googleTranslationService, TranslationServiceError } from '../services/googleTranslationService';
import { isValidLanguageCode } from '../constants/languages';

const MAX_TEXT_LENGTH = 5000;

export async function handleTranslate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body;

    // Validate text
    if (typeof text !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Invalid input: "text" field must be a string.',
        code: 'INVALID_TEXT_TYPE',
      });
      return;
    }

    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid input: "text" cannot be empty or contain only whitespace.',
        code: 'EMPTY_TEXT',
      });
      return;
    }

    if (text.length > MAX_TEXT_LENGTH) {
      res.status(400).json({
        success: false,
        error: `Input exceeds maximum limit of ${MAX_TEXT_LENGTH} characters (provided: ${text.length}).`,
        code: 'TEXT_TOO_LONG',
      });
      return;
    }

    // Validate targetLanguage
    if (typeof targetLanguage !== 'string' || !isValidLanguageCode(targetLanguage.trim())) {
      res.status(400).json({
        success: false,
        error: `Invalid target language code "${targetLanguage}". Please choose a supported language.`,
        code: 'INVALID_TARGET_LANGUAGE',
      });
      return;
    }

    // Validate sourceLanguage if provided
    let cleanSourceLanguage: string | undefined;
    if (sourceLanguage !== undefined && sourceLanguage !== null && sourceLanguage !== '') {
      if (typeof sourceLanguage !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid source language: must be a string or "auto".',
          code: 'INVALID_SOURCE_LANGUAGE_TYPE',
        });
        return;
      }
      const sLang = sourceLanguage.trim();
      if (sLang !== 'auto' && !isValidLanguageCode(sLang)) {
        res.status(400).json({
          success: false,
          error: `Invalid source language code "${sLang}". Please choose a supported language or "auto".`,
          code: 'INVALID_SOURCE_LANGUAGE',
        });
        return;
      }
      cleanSourceLanguage = sLang === 'auto' ? undefined : sLang;
    }

    const result = await googleTranslationService.translateText(
      text,
      targetLanguage.trim(),
      cleanSourceLanguage
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export function handleHealth(_req: Request, res: Response): void {
  const isKeyConfigured = googleTranslationService.isApiKeyConfigured();

  res.status(200).json({
    status: 'healthy',
    service: 'LinguaFlow Translation Backend',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    googleTranslateApiKeyConfigured: isKeyConfigured,
    setupNote: isKeyConfigured
      ? 'Google Cloud Translation API credential detected.'
      : 'API key not configured. Add GOOGLE_TRANSLATE_API_KEY to server/.env to enable live translations.',
  });
}
