import {
  useGetGamificationProfileQuery,
  useGetGamificationHistoryQuery,
  useClaimGamificationRewardMutation,
} from '@/services/api/gamificationApi';
import calendarIcon from '@/assets/gamification_icons/calendar.png';
import crownIcon from '@/assets/gamification_icons/crown.png';
import flameIcon from '@/assets/gamification_icons/flame.png';
import friendsIcon from '@/assets/gamification_icons/friends.png';
import mapIcon from '@/assets/gamification_icons/map.png';
import pictureIcon from '@/assets/gamification_icons/picture.png';
import profileIcon from '@/assets/gamification_icons/profile.png';
import ratingIcon from '@/assets/gamification_icons/rating.png';
import verifiedIcon from '@/assets/gamification_icons/verified.png';
import CoinImage from '@/assets/icons/coin.png';
import { ScreenWithHeader } from '@/components/screen';
import { useCurrentUser } from '@/context/current-user';
import { formatNumber } from '@/lib/utils';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

export type GamificationTask = {
  emoji?: string;
  title: string;
  image?: any;
  points: number;
  isPinned?: boolean;
};

export const GAMIFICATION_CONFIG: Record<string, GamificationTask> = {
  COMPLETE_REGISTRATION: {
    image: verifiedIcon,
    title: 'Complete Registration',
    points: 100,
    isPinned: true,
  },
  COMPLETE_PROFILE: {
    image: profileIcon,
    title: 'Complete Profile',
    points: 150,
    isPinned: true,
  },
  ADD_PROFILE_PICTURE: {
    image: pictureIcon,
    title: 'Add Profile Picture',
    points: 50,
    isPinned: true,
  },
  SHARE_WITH_FRIEND: {
    image: friendsIcon,
    title: 'Share with Friend',
    points: 75,
    isPinned: true,
  },
  LEAVE_REVIEW: {
    image: ratingIcon,
    title: 'Leave Review',
    points: 50,
    isPinned: true,
  },
  DAILY_LOGIN: {
    image: calendarIcon,
    title: 'Daily Login',
    points: 25,
    isPinned: true,
  },

  COMPLETE_CIRCUIT: { image: mapIcon, title: 'Complete Circuit', points: 200 },
  COMPLETE_PREMIUM_CIRCUIT: {
    image: crownIcon,
    title: 'Complete Premium Circuit',
    points: 500,
  },
  COMPLETE_FIRST_CIRCUIT: {
    emoji: '🎯',
    title: 'Complete First Circuit',
    points: 300,
  },
  COMPLETE_5_CIRCUITS: {
    emoji: '🏆',
    title: 'Complete 5 Circuits',
    points: 1000,
  },
  COMPLETE_10_CIRCUITS: {
    emoji: '🌟',
    title: 'Complete 10 Circuits',
    points: 2000,
  },
  CREATE_CUSTOM_CIRCUIT: {
    emoji: '✏️',
    title: 'Create Custom Circuit',
    points: 250,
  },

  VISIT_POI: { emoji: '🗺️', title: 'Visit POI', points: 50 },
  VISIT_FIRST_POI: { emoji: '🎉', title: 'Visit First POI', points: 100 },
  VISIT_5_POIS: { emoji: '🗺️', title: 'Visit 5 POIs', points: 300 },
  VISIT_10_POIS: { emoji: '🏅', title: 'Visit 10 POIs', points: 600 },
  VISIT_25_POIS: { emoji: '🎖️', title: 'Visit 25 POIs', points: 1500 },
  VISIT_50_POIS: { image: crownIcon, title: 'Visit 50 POIs', points: 3000 },
  SAVE_POI: { emoji: '💾', title: 'Save POI', points: 25 },
  CHECK_IN_POI: { emoji: '✅', title: 'Check-in at POI', points: 50 },

  FIRST_REVIEW: { emoji: '📝', title: 'First Review', points: 100 },
  LEAVE_5_REVIEWS: { emoji: '✍️', title: 'Leave 5 Reviews', points: 300 },
  HELPFUL_REVIEW: { emoji: '👍', title: 'Helpful Review', points: 50 },

  WEEKLY_STREAK: { image: flameIcon, title: 'Weekly Streak', points: 200 },
  MONTHLY_STREAK: { image: flameIcon, title: 'Monthly Streak', points: 1000 },

  DISCOVER_NEW_CITY: { emoji: '🌆', title: 'Discover New City', points: 500 },
  VISIT_ALL_CATEGORIES: {
    emoji: '🎨',
    title: 'Visit All Categories',
    points: 1000,
  },
  NIGHT_EXPLORER: { emoji: '🌙', title: 'Night Explorer', points: 150 },
  EARLY_BIRD: { emoji: '🌅', title: 'Early Bird', points: 150 },
  WEEKEND_WARRIOR: { emoji: '🎊', title: 'Weekend Warrior', points: 200 },

  VISIT_PARTNER: { emoji: '🤝', title: 'Visit Partner', points: 100 },
  SCAN_QR_CODE: { emoji: '📱', title: 'Scan QR Code', points: 50 },

  PHOTOGRAPHY_LOVER: { emoji: '📷', title: 'Photography Lover', points: 300 },
  SOCIAL_BUTTERFLY: { emoji: '🦋', title: 'Social Butterfly', points: 400 },
  LOCAL_GUIDE: { emoji: '🗺️', title: 'Local Guide', points: 500 },
};

export default function GamificationHistoryScreen() {
  const router = useRouter();
  const [claiming, setClaiming] = useState<string | null>(null);

  // Use RTK Query hooks
  const { data: profileData, isLoading: isLoadingProfile } = useGetGamificationProfileQuery();
  const { data: historyData, isLoading: isLoadingHistory } = useGetGamificationHistoryQuery();
  const [claimReward] = useClaimGamificationRewardMutation();

  const gamificationProfile = profileData?.data;
  const gamificationHistory = historyData?.data || [];
  const loading = isLoadingProfile || isLoadingHistory;

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
      ?.sort((a, b) => a.isClaimed - b.isClaimed)
      ?.map((task) => ({
        ...task,
        image: GAMIFICATION_CONFIG[task.gamificationRule?.name]?.image,
        emoji: GAMIFICATION_CONFIG[task.gamificationRule?.name]?.emoji,
        status: getPinnedTaskStatus(task),
      })) || [];

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
      headerTitle='Achievements'
      leftIcon={
        <TouchableOpacity onPress={() => router.navigate('/profile')}>
          <Ionicons name='chevron-back' size={24} color='#fff' />
        </TouchableOpacity>
      }
      rightIcon={
        <View>
          <TouchableOpacity
            className='flex-row items-center gap-1 bg-white rounded-xl py-1 px-2'
            onPress={() => router.push('/congrats-screen')}
          >
            <Image
              style={{
                width: 24,
                height: 24,
              }}
              source={crownIcon}
            />

            <Text className='text-black font-bold'>
              {gamificationProfile?.points?.level}
            </Text>
          </TouchableOpacity>
        </View>
      }
      headerChildren={
        <View className='items-center relative w-full h-[50px]'></View>
      }
    >
      <View className='flex-1 items-center'>
        <View className='top-[-70] z-[200] w-[90%] h-[130px] justify-center bg-white px-6 py-8 rounded-3xl overflow-hidden absolute bottom-[-80px] shadow-lg'>
          <Image
            style={{
              width: 230,
              height: 230,
              position: 'absolute',
              top: -50,
              right: -50,
              opacity: 0.1,
            }}
            source={CoinImage}
          />
          <Text className='text-lg text-gray-600 capitalize'>balance</Text>
          <View className='flex-row items-center gap-2'>
            <Image
              style={{
                width: 35,
                height: 35,
              }}
              className='rounded-full'
              source={CoinImage}
            />
            <Text className='text-3xl font-bold'>
              {formatNumber(gamificationProfile?.points?.totalPoints || 0)}
            </Text>
          </View>
        </View>
      </View>
      <View className='px-5 py-5 mt-16'>
        <Text className='text-lg font-bold text-[#043155] mb-4'>
          Achievements
        </Text>

        {loading ? (
          <View className='py-10'>
            <ActivityIndicator size='large' color='#007B3B' />
          </View>
        ) : (
          <View className='mb-6 bg-green-50 rounded-3xl p-4'>
            {featuredTasks
              .filter((task) => task.status !== 'claimed')
              .map((task, index) => (
                <View
                  key={task.key}
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
                    <Text className='text-[15px] text-[#043155] font-medium'>
                      {task.gamificationRule?.description}
                    </Text>
                  </View>
                  <View className='flex-row items-center gap-1'>
                    {task.status === 'claimed' ? (
                      <Text className='text-sm text-green-600'>✓</Text>
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
              <View></View>
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

        <Text className='text-lg font-bold text-[#043155] mb-4'>
          Recent Activity
        </Text>

        {loading ? (
          <View className='py-10'>
            <ActivityIndicator size='large' color='#007B3B' />
          </View>
        ) : gamificationHistory.length === 0 ? (
          <View className='border border-gray-200 rounded-3xl p-6 items-center'>
            <Text className='text-gray-500'>No activity yet</Text>
          </View>
        ) : (
          <View className='border border-gray-200 rounded-3xl overflow-hidden'>
            {gamificationHistory
              ?.filter((i) => i.isClaimed)
              ?.slice(0, 5)
              .map((item, index) => {
                const activityType = item.gamificationRule?.name;
                const config = GAMIFICATION_CONFIG[activityType];

                if (!config) return null;

                return (
                  <View
                    key={item.id}
                    className={`p-4 flex-row justify-between items-center ${
                      index !== gamificationHistory.length - 1
                        ? 'border-b border-gray-200'
                        : ''
                    }`}
                  >
                    <View className='flex-row items-center gap-3 flex-1'>
                      <View className='w-12 h-12 rounded-full bg-green-50 justify-center items-center'>
                        {config.image ? (
                          <Image
                            style={{
                              width: 30,
                              height: 30,
                            }}
                            source={config.image}
                          />
                        ) : (
                          <Text className='text-2xl'>{config.emoji}</Text>
                        )}
                      </View>
                      <View className='flex-1'>
                        <Text className='text-[15px] font-semibold text-[#043155] mb-0.5'>
                          {config.title}
                        </Text>
                        <Text className='text-xs text-gray-600'>
                          {formatDate(item.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <View className='flex-row items-center gap-1 bg-green-50 px-3 py-1.5 rounded-xl'>
                      <Image
                        style={{
                          width: 20,
                          height: 20,
                        }}
                        source={CoinImage}
                      />
                      <Text className='text-base font-bold text-green-600'>
                        +{item.points}
                      </Text>
                    </View>
                  </View>
                );
              })}
          </View>
        )}
        <TouchableOpacity
          className='mt-4 self-end'
          onPress={() => router.push('/all-achievements')}
        >
          <Text className='text-sm font-medium text-blue-900'>
            View All Achievements
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWithHeader>
  );
}
