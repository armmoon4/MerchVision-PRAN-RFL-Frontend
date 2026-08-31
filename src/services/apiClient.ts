// API Client configuration that seamlessly points to the user's FastAPI backend
export const getApiBaseUrl = (): string => {
  const customUrl = localStorage.getItem('MERCHVISION_API_BASE_URL') || localStorage.getItem('PRISM_API_BASE_URL');
  if (customUrl && customUrl.trim() !== '') {
    return customUrl.trim().replace(/\/+$/, '');
  }
  return (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';
};

export const setApiBaseUrl = (url: string): void => {
  if (!url || url.trim() === '') {
    localStorage.removeItem('MERCHVISION_API_BASE_URL');
    localStorage.removeItem('PRISM_API_BASE_URL');
  } else {
    localStorage.setItem('MERCHVISION_API_BASE_URL', url.trim().replace(/\/+$/, ''));
  }
};

export const buildApiUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://') || endpoint.startsWith('data:')) {
    return endpoint;
  }
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return base ? `${base}${cleanEndpoint}` : cleanEndpoint;
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const url = buildApiUrl(endpoint);
  const method = options.method || 'GET';
  const startTime = Date.now();

  console.log(`[MerchVision Backend API] -> ${method} ${url}`, {
    method,
    headers: options.headers,
    bodyType: options.body instanceof FormData ? 'FormData (multipart)' : typeof options.body
  });

  try {
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;
    console.log(`[MerchVision Backend API] <- ${response.status} ${response.statusText} (${duration}ms) for ${method} ${url}`);
    return response;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[MerchVision Backend API] Connection Failed (${duration}ms) for ${method} ${url}:`, error);
    console.warn(`[MerchVision Backend API Troubleshooting Tip] If your FastAPI server is running on http://localhost:8000, ensure CORS is enabled:\n  from fastapi.middleware.cors import CORSMiddleware\n  app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])`);
    throw error;
  }
};

