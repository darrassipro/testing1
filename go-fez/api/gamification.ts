import { GAMIFICATION_URL } from './constants';
import { getLoginCredentials } from './utils';

export async function getLeaderboard() {
  const response = await fetch(`${GAMIFICATION_URL}/leaderboard`);
  if (response.status !== 200) {
    throw new Error('Failed to fetch leaderboard');
  }
  const json = await response.json();
  if (!json) {
    throw new Error('No data found');
  }
  return json.data;
}

export async function getUserGamificationProfile() {
  const credentials = await getLoginCredentials();
  if (!credentials) {
    throw new Error('No login credentials found');
  }

  const response = await fetch(`${GAMIFICATION_URL}/no-cookies/profile`, {
    headers: {
      Authorization: `Bearer ${credentials.accessToken}`,
    },
  });
  if (response.status !== 200) {
    throw new Error('Failed to fetch user gamification profile');
  }
  const json = await response.json();
  if (!json) {
    throw new Error('No data found');
  }
  return json.data;
}
const gams = [
  {
    id: '12114bd5-f223-4121-af27-43ca5331be4d',
    points: 150,
    userId: 2,
    createdAt: '2025-11-10 01:34:08.000000',
    isClaimed: 1,
    updatedAt: '2025-11-10 17:54:22.000000',
    gamificationRuleId: '990243af-2f5b-4e38-84a5-8545cf3306a5',
  },
  {
    id: '197d8fdd-875e-424f-8dd0-c4207411ee5b',
    points: 350,
    userId: 2,
    createdAt: '2025-11-10 11:55:51.000000',
    isClaimed: 1,
    updatedAt: '2025-11-10 17:54:29.000000',
    gamificationRuleId: '2e3caef0-b2b6-42b1-9b06-7bda335f6f4a',
  },
  {
    id: '38c20b3c-9798-40db-9eb9-5943a86acbdc',
    points: 350,
    userId: 2,
    createdAt: '2025-11-10 01:34:11.000000',
    isClaimed: 1,
    updatedAt: '2025-11-10 17:54:39.000000',
    gamificationRuleId: '2e3caef0-b2b6-42b1-9b06-7bda335f6f4a',
  },
  {
    id: '56cf8a42-e35f-41f2-968b-c8bda1962407',
    points: 150,
    userId: 2,
    createdAt: '2025-11-10 11:56:04.000000',
    isClaimed: 0,
    updatedAt: '2025-11-10 17:54:39.000000',
    gamificationRuleId: '990243af-2f5b-4e38-84a5-8545cf3306a5',
  },
  {
    id: '83f621bc-f572-4277-8505-8ca5c8c82a6d',
    points: 5,
    userId: 2,
    createdAt: '2025-11-10 15:55:10.000000',
    isClaimed: 1,
    updatedAt: '2025-11-10 15:55:53.000000',
    gamificationRuleId: 'd62880c8-3693-49bc-82fc-32476ffe9a98',
  },
  {
    id: 'a704af29-9323-42f4-9db6-04caeaab1c72',
    points: 5,
    userId: 2,
    createdAt: '2025-11-14 15:21:03.000000',
    isClaimed: 0,
    updatedAt: '2025-11-14 15:21:27.000000',
    gamificationRuleId: 'd62880c8-3693-49bc-82fc-32476ffe9a98',
  },
  {
    id: 'a98a75b7-4261-4069-9195-292639e24a1e',
    points: 5,
    userId: 2,
    createdAt: '2025-11-10 11:30:16.000000',
    isClaimed: 1,
    updatedAt: '2025-11-10 12:24:16.000000',
    gamificationRuleId: 'd62880c8-3693-49bc-82fc-32476ffe9a98',
  },
  {
    id: 'b29bcad9-00c4-4f39-8801-c6e71fe4e449',
    points: 5,
    userId: 2,
    createdAt: '2025-11-14 15:21:03.000000',
    isClaimed: 1,
    updatedAt: '2025-11-14 15:21:27.000000',
    gamificationRuleId: 'd62880c8-3693-49bc-82fc-32476ffe9a98',
  },
];
export async function getUserGamificationHistory() {
  console.log('Fetching gamification history...');
  const credentials = await getLoginCredentials();
  if (!credentials) {
    return [];
  }
  try {
    const response = await fetch(`${GAMIFICATION_URL}/no-cookies/history`, {
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
      },
    });
    if (response.status !== 200) {
      return [];
    }
    const json = await response.json();
    if (!json) {
      return [];
    }
    return json.data;
  } catch (error) {
    console.error('Error fetching gamification history:', error);
    return [];
  }
}

export async function createGamificationReward(ruleName: string) {
  const credentials = await getLoginCredentials();
  if (!credentials) {
    throw new Error('No login credentials found');
  }

  try {
    const response = await fetch(
      `${GAMIFICATION_URL}/no-cookies/complete-gamification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${credentials.accessToken}`,
        },
        body: JSON.stringify({ gamificationRuleName: ruleName }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to claim reward');
    }

    return await response.json();
  } catch (error) {
    console.error('Error claiming reward:', error);
    throw error;
  }
}

export async function claimGamificationReward(id: string) {
  const credentials = await getLoginCredentials();
  if (!credentials) {
    throw new Error('No login credentials found');
  }

  try {
    const response = await fetch(
      `${GAMIFICATION_URL}/no-cookies/claim-gamification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${credentials.accessToken}`,
        },
        body: JSON.stringify({ taskId: id }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to claim reward');
    }

    return await response.json();
  } catch (error) {
    console.error('Error claiming reward:', error);
    throw error;
  }
}
