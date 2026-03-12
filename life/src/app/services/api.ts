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
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Something went wrong');
    }

    return result;
  } catch (error: any) {
    console.error('API Error:', error.message);
    throw error;
  }
}
