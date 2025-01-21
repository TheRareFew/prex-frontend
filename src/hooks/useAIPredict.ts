import { useState } from 'react';

const apiUrl = process.env.REACT_APP_API_URL;
if (!apiUrl) {
  throw new Error('API URL not configured');
}

export const useAIPredict = () => {
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const predict = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const data = await response.json();
      setAiResponse(data.response);
      setError(null);
      return data.response;
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      setAiResponse(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    predict,
    aiResponse,
    error,
    isLoading,
  };
}; 