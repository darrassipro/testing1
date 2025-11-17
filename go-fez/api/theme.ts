import { THEMES_URL } from './constants';

export async function getAllThemes() {
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${THEMES_URL}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Only log non-network errors in development
      if (__DEV__ && response.status !== 0) {
        console.warn(
          `Failed to fetch themes: ${response.status} ${response.statusText}`
        );
      }
      return [];
    }

    const json = await response.json();
    if (!json || !json.data) {
      return [];
    }
    return json.data;
  } catch (error: any) {
    // Only log errors that aren't network failures or aborted requests
    if (__DEV__) {
      if (error.name === 'AbortError') {
        console.warn('Theme fetch timeout - server may be unavailable');
      } else if (error.message !== 'Network request failed') {
        console.warn('Error fetching themes:', error.message || error);
      }
    }
    return [];
  }
}

export async function getThemeById(id: string) {
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${THEMES_URL}/${id}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Only log non-network errors in development
      if (__DEV__ && response.status !== 0) {
        console.warn(
          `Failed to fetch themes: ${response.status} ${response.statusText}`
        );
      }
      return null;
    }

    const json = await response.json();
    if (!json || !json.data) {
      return null;
    }
    return json.data;
  } catch (error: any) {
    if (__DEV__) {
      if (error.name === 'AbortError') {
        console.warn('Theme fetch timeout - server may be unavailable');
      } else if (error.message !== 'Network request failed') {
        console.warn('Error fetching themes:', error.message || error);
      }
    }
    return [];
  }
}
