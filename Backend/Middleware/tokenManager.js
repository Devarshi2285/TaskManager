// tokenManager.js
import { createBrowserHistory } from 'history';

export const history = createBrowserHistory();

export const getNewAccessToken = async () => {
  const refreshtoken = localStorage.getItem('refreshtoken');
  if (!refreshtoken) {
    throw new Error('Unable to refresh token');
  }

  const response = await fetch('http://localhost:3004/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshtoken }),
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('token', data.newAccessToken);
    return data.newAccessToken;
  } else if (response.status === 401) {
    throw new Error('Unable to refresh token');
  }
};

export const navigateToSignup = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshtoken');
  history.push('/signup');
};
