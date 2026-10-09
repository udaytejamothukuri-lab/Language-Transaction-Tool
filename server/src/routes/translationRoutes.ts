import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { handleTranslate, handleHealth } from '../controllers/translationController';

const router = Router();

// Rate limiter for translation requests: 60 requests per minute
const translationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many translation requests from this IP. Please wait a moment before trying again.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

router.get('/health', handleHealth);
router.post('/translate', translationLimiter, handleTranslate);

export default router;
