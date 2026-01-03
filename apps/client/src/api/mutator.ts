/**
 * Custom fetch wrapper for Orval-generated API client.
 * 
 * This mutator prepends the API base URL to relative paths, allowing the
 * frontend to call the backend directly (using CORS) instead of a proxy.
 * 
 * The base URL is configurable via VITE_API_URL environment variable,
 * defaulting to http://localhost:5046 (the ASP.NET Core API).
 */
export const customInstance = async <T>(
  url: string,
  options: RequestInit = {},
): Promise<T> => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5046';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error || errorData.message) {
          errorMessage = errorData.error || errorData.message;
        }
      } catch {
        // If we can't parse the error response, use the status text
      }
      throw new Error(errorMessage);
    }

    const body = [204, 205, 304].includes(response.status) ? null : await response.text();
    const data = body ? JSON.parse(body) : {};
    const status = response.status as 200;

    // Wrap the response to match Orval's expected format
    return {
      data,
      status,
      headers: response.headers,
    } as T;
  } catch (error) {
    // Re-throw fetch errors with more context
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Failed to fetch from ${fullUrl}. ${error.message}`);
    }
    throw error;
  }
};

export default customInstance;
