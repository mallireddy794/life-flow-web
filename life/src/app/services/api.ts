const BASE_URL = 'http://127.0.0.1:5000';

export async function apiRequest(endpoint: string, method: string = 'GET', data?: any) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    
    const contentType = response.headers.get("content-type");
    let result;
    if (contentType && contentType.includes("application/json")) {
        result = await response.json();
    } else {
        const text = await response.text();
        throw new Error(`Server Error: ${response.status} - ${text.substring(0, 100)}`);
    }

    if (!response.ok) {
      throw new Error(result.error || 'Something went wrong');
    }

    return result;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error("Unable to connect to the server. Please check if the backend is running.");
    }
    console.error('API Error:', error.message);
    throw error;
  }
}
