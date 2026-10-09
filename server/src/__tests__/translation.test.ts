import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import axios from 'axios';
import { createApp } from '../app';

// Mock axios so tests do NOT make real external calls or incur charges
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('Backend API Endpoints (Mocked Suite)', () => {
  const originalEnv = process.env;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.GOOGLE_TRANSLATE_API_KEY = 'test_mock_api_key_12345';
    app = createApp();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('GET /api/health', () => {
    it('returns a successful health status and indicates API key configuration status', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('googleTranslateApiKeyConfigured', true);
      expect(res.body).toHaveProperty('timestamp');
    });

    it('indicates when API key is missing or set to placeholder', async () => {
      process.env.GOOGLE_TRANSLATE_API_KEY = 'your_google_cloud_translation_api_key';
      const unconfiguredApp = createApp();

      const res = await request(unconfiguredApp).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.googleTranslateApiKeyConfigured).toBe(false);
    });
  });

  describe('POST /api/translate - Input Validation', () => {
    it('rejects missing or non-string input', async () => {
      const res = await request(app)
        .post('/api/translate')
        .send({ text: 12345, targetLanguage: 'te' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('INVALID_TEXT_TYPE');
    });

    it('rejects an empty string', async () => {
      const res = await request(app)
        .post('/api/translate')
        .send({ text: '   ', targetLanguage: 'te' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('EMPTY_TEXT');
    });

    it('rejects excessively long text (> 5000 chars)', async () => {
      const longText = 'a'.repeat(5001);
      const res = await request(app)
        .post('/api/translate')
        .send({ text: longText, targetLanguage: 'te' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('TEXT_TOO_LONG');
    });

    it('rejects invalid target language codes', async () => {
      const res = await request(app)
        .post('/api/translate')
        .send({ text: 'Hello world', targetLanguage: 'klingon' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('INVALID_TARGET_LANGUAGE');
    });

    it('rejects invalid source language codes', async () => {
      const res = await request(app)
        .post('/api/translate')
        .send({ text: 'Hello world', targetLanguage: 'te', sourceLanguage: 'invalid_lang' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('INVALID_SOURCE_LANGUAGE');
    });
  });

  describe('POST /api/translate - Service Integration & Mocking', () => {
    it('handles missing API credentials safely with 503 code', async () => {
      delete process.env.GOOGLE_TRANSLATE_API_KEY;
      const noKeyApp = createApp();

      const res = await request(noKeyApp)
        .post('/api/translate')
        .send({ text: 'Hello', targetLanguage: 'te' });

      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('API_KEY_NOT_CONFIGURED');
      expect(res.body.error).toContain('GOOGLE_TRANSLATE_API_KEY');
    });

    it('successfully translates and decodes HTML entities when Google API returns 200', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          data: {
            translations: [
              {
                translatedText: '&#39;నమస్కారం&#39; &amp; స్వాగతం',
                detectedSourceLanguage: 'en',
              },
            ],
          },
        },
      });

      const res = await request(app)
        .post('/api/translate')
        .send({ text: 'Hello and welcome', targetLanguage: 'te', sourceLanguage: 'en' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.translatedText).toBe("'నమస్కారం' & స్వాగతం");
      expect(res.body.data.detectedSourceLanguage).toBe('en');
    });

    it('handles automatic language detection where source is omitted', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          data: {
            translations: [
              {
                translatedText: 'Hola mundo',
                detectedSourceLanguage: 'en',
              },
            ],
          },
        },
      });

      const res = await request(app)
        .post('/api/translate')
        .send({ text: 'Hello world', targetLanguage: 'es', sourceLanguage: 'auto' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.translatedText).toBe('Hola mundo');
      expect(res.body.data.detectedSourceLanguage).toBe('en');
    });

    it('handles Google API 401/403 authorization failures with safe messages', async () => {
      const axiosError: any = new Error('Request failed with status code 403');
      axiosError.isAxiosError = true;
      axiosError.response = {
        status: 403,
        data: { error: { message: 'The request is missing a valid API key.' } },
      };
      mockedAxios.post.mockRejectedValueOnce(axiosError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      const res = await request(app)
        .post('/api/translate')
        .send({ text: 'Hello', targetLanguage: 'te' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('API_AUTH_FAILED');
      expect(res.body.error).toContain('Google Cloud authentication failed');
    });

    it('handles 404 for nonexistent route', async () => {
      const res = await request(app).get('/api/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
