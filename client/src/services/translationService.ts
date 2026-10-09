import { TranslationRequest, TranslationResponse, TranslationResponseData, BackendHealthResponse } from '../types/translation';

export class ApiError extends Error {
  public code?: string;
  public status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export async function translateText(request: TranslationRequest): Promise<TranslationResponseData> {
  let response: Response;

  try {
    response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  } catch {
    throw new ApiError(
      'Unable to connect to the backend server. Please verify that the server is running on port 5000.',
      'NETWORK_ERROR'
    );
  }

  let data: TranslationResponse;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      `Server returned an invalid non-JSON response (HTTP ${response.status}).`,
      'INVALID_RESPONSE',
      response.status
    );
  }

  if (!response.ok || !data.success || !data.data) {
    const message = data.error || `Translation request failed with status ${response.status}.`;
    throw new ApiError(message, data.code, response.status);
  }

  return data.data;
}

export async function fetchBackendHealth(): Promise<BackendHealthResponse> {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) {
      throw new Error(`Health check returned status ${response.status}`);
    }
    const data: BackendHealthResponse = await response.json();
    return data;
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? error.message : 'Backend is currently offline or unreachable',
      'BACKEND_OFFLINE'
    );
  }
}
