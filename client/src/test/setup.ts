import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Web Speech API in test environment
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn().mockReturnValue([
      { name: 'English Voice', lang: 'en-US', default: true },
      { name: 'Telugu Voice', lang: 'te-IN', default: false },
    ]),
    onvoiceschanged: null,
  },
  writable: true,
  configurable: true,
});

(global as any).SpeechSynthesisUtterance = vi.fn().mockImplementation((text) => ({
  text,
  lang: 'en-US',
  rate: 1,
  pitch: 1,
  volume: 1,
  onstart: null,
  onend: null,
  onerror: null,
}));

// Set isSecureContext to true for JSDOM
Object.defineProperty(window, 'isSecureContext', {
  value: true,
  writable: true,
  configurable: true,
});

// Mock Clipboard API with vi.fn()
export const mockWriteText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
  configurable: true,
});

document.execCommand = vi.fn().mockReturnValue(true);
