import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { mockWriteText } from '../test/setup';

describe('LinguaFlow Frontend Application Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteText.mockClear();

    // Default mock for fetch
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/health')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: 'healthy',
              service: 'LinguaFlow Translation Backend',
              googleTranslateApiKeyConfigured: true,
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              translatedText: 'నమస్కారం, మీరు ఎలా ఉన్నారు?',
              detectedSourceLanguage: 'en',
            },
          }),
      });
    });
  });

  it('renders the application title and hero section successfully', async () => {
    render(<App />);
    const brandTitles = screen.getAllByText(/LinguaFlow/i);
    expect(brandTitles.length).toBeGreaterThan(0);
    expect(screen.getByText(/Translate Any Language,/i)).toBeInTheDocument();
    const taglines = screen.getAllByText(/Break Language Barriers/i);
    expect(taglines.length).toBeGreaterThan(0);
  });

  it('displays default languages (English as source, Telugu as target)', async () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Source Language' })).toHaveTextContent('English');
    expect(screen.getByRole('button', { name: 'Target Language' })).toHaveTextContent('Telugu');
  });

  it('translate button is initially disabled when source text is empty', () => {
    render(<App />);
    const translateBtn = screen.getByRole('button', { name: /Translate Text/i });
    expect(translateBtn).toBeDisabled();
  });

  it('enables the translate button when valid input is typed', async () => {
    const user = userEvent.setup();
    render(<App />);

    const textarea = screen.getByPlaceholderText(/Enter or paste text here/i);
    await user.type(textarea, 'Hello world');

    const translateBtn = screen.getByRole('button', { name: /Translate Text/i });
    expect(translateBtn).toBeEnabled();
  });

  it('displays loading state and renders successful translation response', async () => {
    const user = userEvent.setup();
    render(<App />);

    const textarea = screen.getByPlaceholderText(/Enter or paste text here/i);
    await user.type(textarea, 'Hello, how are you?');

    const translateBtn = screen.getByRole('button', { name: /Translate Text/i });
    await user.click(translateBtn);

    // Wait for the translated text to be displayed
    await waitFor(() => {
      expect(screen.getByText('నమస్కారం, మీరు ఎలా ఉన్నారు?')).toBeInTheDocument();
    });
  });

  it('handles API errors safely and displays clear error feedback', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/health')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'healthy', googleTranslateApiKeyConfigured: false }),
        });
      }
      return Promise.resolve({
        ok: false,
        status: 503,
        json: () =>
          Promise.resolve({
            success: false,
            error: 'Google Cloud Translation API key is not configured on the backend.',
            code: 'API_KEY_NOT_CONFIGURED',
          }),
      });
    });

    const user = userEvent.setup();
    render(<App />);

    const textarea = screen.getByPlaceholderText(/Enter or paste text here/i);
    await user.type(textarea, 'Test failure text');

    const translateBtn = screen.getByRole('button', { name: /Translate Text/i });
    await user.click(translateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Translation Failed/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Google Cloud Translation API key is not configured on the backend/i)
      ).toBeInTheDocument();
    });
  });

  it('swaps languages and contents when the swap button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const swapBtn = screen.getByRole('button', { name: /Swap source and target languages/i });
    expect(screen.getByRole('button', { name: 'Source Language' })).toHaveTextContent('English');
    expect(screen.getByRole('button', { name: 'Target Language' })).toHaveTextContent('Telugu');

    await user.click(swapBtn);

    expect(screen.getByRole('button', { name: 'Source Language' })).toHaveTextContent('Telugu');
    expect(screen.getByRole('button', { name: 'Target Language' })).toHaveTextContent('English');
  });

  it('clears all input and resets state when the clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const textarea = screen.getByPlaceholderText(/Enter or paste text here/i);
    await user.type(textarea, 'Some text to clear');
    expect(textarea).toHaveValue('Some text to clear');

    const clearBtn = screen.getByRole('button', { name: /Clear all text/i });
    await user.click(clearBtn);

    expect(textarea).toHaveValue('');
  });

  it('copies translated text to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const textarea = screen.getByPlaceholderText(/Enter or paste text here/i);
    await user.type(textarea, 'Hello');

    const translateBtn = screen.getByRole('button', { name: /Translate Text/i });
    await user.click(translateBtn);

    await waitFor(() => {
      expect(screen.getByText('నమస్కారం, మీరు ఎలా ఉన్నారు?')).toBeInTheDocument();
    });

    const copyBtn = screen.getByRole('button', { name: /Copy translated text to clipboard/i });
    await user.click(copyBtn);

    await waitFor(() => {
      expect(screen.getByText(/Copied!/i)).toBeInTheDocument();
    });
  });
});
