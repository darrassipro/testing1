import { AUTH_URL } from './constants';
import { getLoginCredentials, saveLoginCredentials } from './utils';

export async function loginWithEmailAndPassword(
  email: string,
  password: string
) {
  const response = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  if (!data) {
    throw new Error('No data received');
  }

  const { token, refreshToken } = data.tokens;
  saveLoginCredentials(token, refreshToken);
  return data;
}

export async function getCurrentUser() {
  const credentials = await getLoginCredentials();
  if (!credentials.accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${AUTH_URL}/nc/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${credentials.accessToken}`,
    },
  });

  console.log(response.status);
  if (!response.ok) {
    throw new Error('Failed to fetch current user');
  }

  const data = await response.json();
  return data.data;
}
