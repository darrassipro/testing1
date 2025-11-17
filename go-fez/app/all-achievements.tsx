import {
  useGetGamificationHistoryQuery,
  useGetGamificationProfileQuery,
  useClaimGamificationRewardMutation,
} from '@/services/api/gamificationApi';
import CoinImage from '@/assets/icons/coin.png';
import { ScreenWithHeader } from '@/components/screen';
import { useCurrentUser } from '@/context/current-user';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { GAMIFICATION_CONFIG } from './achievements';

export default function GamificationHistoryScreen() {
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const { data: gamificationProfileResponse, isLoading: profileLoading } = useGetGamificationProfileQuery(undefined, {
    skip: !currentUser,
  });
  const gamificationProfile = gamificationProfileResponse?.data;
  
  const { data: gamificationHistoryResponse, isLoading: historyLoading } = useGetGamificationHistoryQuery(undefined, {
    skip: !currentUser,
  });
  const gamificationHistory = gamificationHistoryResponse?.data || [];
  
  const [claimReward] = useClaimGamificationRewardMutation();
  const [claiming, setClaiming] = useState<string | null>(null);
  
  const loading = profileLoading || historyLoading;

  const handleClaim = async (id: string) => {
    try {
      setClaiming(id);
      if (id === 'claim_all') {
        const unclaimedTasks = gamificationHistory.filter(
          (item) =>
            !item.isClaimed &&
            (item.gamificationRule?.name === 'DAILY_LOGIN'
              ? !isActivityClaimed('DAILY_LOGIN')
              : true)
        );
        for (const task of unclaimedTasks) {
          await claimReward({ taskId: task.id }).unwrap();
        }
      } else {
        await claimReward({ taskId: id }).unwrap();
      }
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      alert('Failed to claim reward. Please try again.');
    } finally {
      setClaiming(null);
    }
  };

  const isActivityClaimed = (activityType: string) => {
    if (activityType === 'DAILY_LOGIN') {
      const today = new Date();
      return gamificationHistory.some((item) => {
        const itemDate = new Date(item.createdAt);
        return (
          item.gamificationRule?.name === activityType &&
          itemDate.getDate() === today.getDate() &&
          itemDate.getMonth() === today.getMonth() &&
          itemDate.getFullYear() === today.getFullYear() &&
          item.isClaimed === true
        );
      });
    }
    return gamificationHistory.some(
      (item) => item.gamificationRule?.name === activityType && item.isClaimed === true
    );
  };

  const isActivityCompleted = (task: any) => {
    if (!gamificationProfile) return false;
    if (task.gamificationRule?.name === 'DAILY_LOGIN') {
      const today = new Date();
      return gamificationHistory.some((item) => {
        const itemDate = new Date(item.createdAt);
        return (
          item.id === task.id &&
          itemDate.getDate() === today.getDate() &&
          itemDate.getMonth() === today.getMonth() &&
          itemDate.getFullYear() === today.getFullYear()
        );
      });
    }
    return gamificationHistory.some((item) => item.id === task.id);
  };

  const getPinnedTaskStatus = (task: any) => {
    if (task.isClaimed) {
      return 'claimed';
    }
    if (isActivityCompleted(task)) {
      return 'completed';
    }
    return 'locked';
  };

  const featuredTasks =
    gamificationHistory
      ?.sort((a, b) => (a.isClaimed ? 0 : 1) - (b.isClaimed ? 0 : 1))
      ?.map((task) => {
        const ruleName = task.gamificationRule?.name || '';
        return {
          ...task,
          image: GAMIFICATION_CONFIG[ruleName]?.image,
          emoji: GAMIFICATION_CONFIG[ruleName]?.emoji,
          status: getPinnedTaskStatus(task),
        };
      }) || [];

  featuredTasks.sort((b, a) => {
    const statusOrder = { claimed: 0, locked: 1, completed: 2 };
    return (
      statusOrder[a.status as keyof typeof statusOrder] -
      statusOrder[b.status as keyof typeof statusOrder]
    );
  });
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  const unclaimedPoints = featuredTasks
    .filter((task) => task.status === 'completed')
    .reduce((sum, task) => sum + task.points, 0);
  return (
    <ScreenWithHeader
      headerTitle='All Achievements'
      leftIcon={
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='chevron-back' size={24} color='#fff' />
        </TouchableOpacity>
      }
    >
      <View className='px-5 py-5'>
        <Text className='text-lg font-bold text-[#043155] mb-4'>
          All Achievements ({featuredTasks.length})
        </Text>
        <Text className='text-xs font-bold text-yellow-600 mb-4'>
          ({unclaimedPoints}) unclaimed points
        </Text>

        {loading ? (
          <View className='py-10'>
            <ActivityIndicator size='large' color='#007B3B' />
          </View>
        ) : (
          <View className='mb-6 rounded-3xl p-4'>
            {featuredTasks.map((task, index) => (
              <View
                key={task.id}
                className={`flex-row justify-between items-center py-3 ${
                  index !== featuredTasks.length - 1
                    ? 'border-b border-gray-200'
                    : ''
                }`}
              >
                <View className='flex-row items-center gap-3'>
                  <View className='p-3 rounded-xl bg-white justify-center items-center'>
                    {task.image ? (
                      <Image
                        style={{
                          width: 30,
                          height: 30,
                        }}
                        source={task.image}
                      />
                    ) : (
                      <Text className='text-2xl'>{task.emoji}</Text>
                    )}
                  </View>
                  <View>
                    <Text className='text-[15px] text-[#043155] font-medium'>
                      {task.gamificationRule?.description || 'Achievement'}
                    </Text>
                    <Text className='text-xs text-gray-500 font-light'>
                      {formatDate(task.createdAt)}
                    </Text>
                  </View>
                </View>
                <View className='flex-row items-center gap-1'>
                  {task.status === 'claimed' ? (
                    <View className='flex-row items-center gap-1 bg-green-50 px-3 py-1.5 rounded-xl'>
                      <Image
                        style={{
                          width: 20,
                          height: 20,
                        }}
                        source={CoinImage}
                      />
                      <Text className='text-base font-bold text-green-600'>
                        +{task.points}
                      </Text>
                    </View>
                  ) : task.status === 'locked' ? (
                    <View className='px-2 py-1 rounded-3xl flex-row gap-1 bg-white'>
                      <Image
                        style={{
                          width: 20,
                          height: 20,
                        }}
                        source={CoinImage}
                      />
                      <Text className='text-sm font-bold text-blue-900'>
                        {task.points}
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      className='bg-[#007B3B] px-2 py-1 rounded-xl flex-row gap-1'
                      onPress={() => handleClaim(task.id)}
                      disabled={
                        claiming === task.id || claiming === 'claim_all'
                      }
                    >
                      {claiming === task.id || claiming === 'claim_all' ? (
                        <ActivityIndicator size='small' color='#fff' />
                      ) : (
                        <>
                          <Text className='text-sm font-bold text-white'>
                            claim
                          </Text>
                          <Text className='text-sm font-bold text-white'>
                            {task.points}
                          </Text>
                          <Image
                            style={{
                              width: 20,
                              height: 20,
                            }}
                            source={CoinImage}
                          />
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
            <View className='flex-row justify-between'>
              <View />

              {unclaimedPoints > 0 ? (
                <TouchableOpacity
                  className='mt-4 self-end bg-[#007B3B] px-4 py-2 rounded-xl flex-row items-center gap-2'
                  onPress={() => handleClaim('claim_all')}
                >
                  <Text className='text-sm font-medium text-white'>
                    Claim All
                  </Text>
                  <View className='flex-row gap-1'>
                    <Image
                      style={{
                        width: 20,
                        height: 20,
                      }}
                      source={CoinImage}
                    />
                    <Text className='text-sm font-medium text-white'>
                      {unclaimedPoints}
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View className='mt-4 self-end'>&nbsp;</View>
              )}
            </View>
          </View>
        )}
      </View>
    </ScreenWithHeader>
  );
}
