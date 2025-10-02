import type { RPMInput } from '../types';

export const generateRPM = async (data: RPMInput): Promise<string> => {
  try {
    const response = await fetch('/.netlify/functions/generate-rpm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        // Use the specific error from the backend, or a fallback.
        throw new Error(result.error || `Terjadi kesalahan: ${response.statusText}`);
    }
    
    return result.rpm;

  } catch (error) {
    console.error("Error calling backend function:", error);
    // Re-throw the error so the UI can catch its message and display it.
    throw error;
  }
};
