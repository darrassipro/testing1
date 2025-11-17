import { useGetLeaderboardQuery, useGetGamificationProfileQuery, LeaderboardEntry } from '@/services/api/gamificationApi';
import CrownImage from '@/assets/gamification_icons/crown.png';
import MapIcon from '@/assets/gamification_icons/map.png';
import PinIcon from '@/assets/gamification_icons/pin.png';
import { ScreenWithHeader } from '@/components/screen';
import { useCurrentUser } from '@/context/current-user';
import { formatNumber } from '@/lib/utils';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type LeaderboardItem = {
  totalPoints: number;
  level: number;
  user: any;
  order: number;
};

export default function CongratsScreen() {
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const { data: gamificationProfileResponse } = useGetGamificationProfileQuery(undefined, {
    skip: !currentUser,
  });
  const gamificationProfile = gamificationProfileResponse?.data;
  
  const { data: leaderboardResponse } = useGetLeaderboardQuery({ limit: 10 });
  
  const leaderboardData = useMemo(() => {
    if (!leaderboardResponse?.data) return [];
    return leaderboardResponse.data
      .filter((item: LeaderboardEntry) => item.totalPoints > 0)
      .sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.totalPoints - a.totalPoints)
      .slice(0, 10)
      .map((item: LeaderboardEntry, index: number) => ({
        ...item,
        order: index + 1,
      }));
  }, [leaderboardResponse]);
  return (
    <ScreenWithHeader
      headerTitle='My level'
      leftIcon={
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='chevron-back' size={24} color='#fff' />
        </TouchableOpacity>
      }
      headerChildren={
        <View className='items-center w-full'>
          <View className='mt-8 items-center'>
            <View
              style={{
                borderColor: '#119100ff',
                borderWidth: 10,
                borderRadius: '100%',
                padding: 6,
              }}
            >
              <View className='w-30 h-30 rounded-full bg-white justify-center items-center border-4 border-white'>
                <Image source={MapIcon} style={{ width: 120, height: 120 }} />
              </View>
            </View>
            <LinearGradient
              colors={['#007036', '#01994A']}
              style={{
                borderRadius: 9999,
              }}
              className='mt-[-15px] px-4 py-1 border-3 border-[#4169E1] flex-row items-center gap-2'
            >
              <Image source={CrownImage} style={{ width: 30, height: 30 }} />
              <Text className='text-2xl font-bold text-white'>
                {gamificationProfile?.level || 1}
              </Text>
            </LinearGradient>
          </View>
          <Text className='text-white font-bold mt-5 text-lg'>
            you are on level {gamificationProfile?.level || 1}
          </Text>

          <View className='bg-green-50 mx-5 mt-8 p-5 rounded-3xl rounded-lg w-full'>
            <View className='flex-row justify-between items-center'>
              <View className='flex-row items-center gap-2'>
                <View className='p-2 rounded-full bg-green-100 justify-center items-center'>
                  <Image source={PinIcon} style={{ width: 35, height: 35 }} />
                </View>
                <View>
                  <Text className='text-base font-bold'>Go on a trip to</Text>
                  <Text className='text-lg font-bold text-green-800'>
                    Reach the next level
                  </Text>
                </View>
              </View>
              <View
                className='px-2 py-1 flex-row gap-2 rounded-xl bg-green-700 items-center'
                style={{
                  borderRadius: 15,
                }}
              >
                <Image source={CrownImage} style={{ width: 20, height: 20 }} />
                <Text className='text-lg font-bold text-white'>
                  {(gamificationProfile?.level || 1) + 1}
                </Text>
              </View>
            </View>
          </View>
        </View>
      }
    >
      <View className='p-5'>
        <View className='flex-row justify-between mb-4'>
          <Text className='text-base text-[#043155] font-semibold'>
            Top Users
          </Text>
        </View>

        <View className='rounded-2xl'>
          {leaderboardData.map((item, index) => (
            <View
              key={index}
              className={`flex-row justify-between items-center py-3 rounded-xl px-4 ${
                index !== leaderboardData.length - 1
                  ? 'border-b border-gray-300'
                  : ''
              } ${item.user.id === currentUser.id ? 'bg-yellow-300' : ''}`}
            >
              <View className='flex-row items-center gap-3'>
                <Text
                  className={`text-gray-700 font-bold w-6 ${[1, 2, 3].includes(item.order) ? 'text-xl text-green-700' : 'text-base'}`}
                >
                  #{item.order}
                </Text>
                <View
                  className={`p-1 border-4 rounded-full bg-white ${
                    [1, 2, 3].includes(item.order)
                      ? 'border-green-700'
                      : 'border-gray-400'
                  }`}
                >
                  <View
                    className={`w-10 h-10 rounded-full bg-white justify-center items-center overflow-hidden`}
                  >
                    <Image
                      style={{ width: 40, height: 40 }}
                      source={{
                        uri:
                          item.user.profileImage ||
                          'https://avatar.iran.liara.run/public/36',
                      }}
                    />
                  </View>
                </View>
                <View>
                  <Text className='text-base text-[#043155] font-bold'>
                    {item.user.firstName} {item.user.lastName}
                  </Text>
                  <Text className='text-gray-700 text-sm font-semibold'>
                    {formatNumber(item.totalPoints)} points
                  </Text>
                </View>
              </View>
              <View className='flex-row items-center gap-1'>
                <Text className='text-base text-[#043155] font-bold'>
                  {item.level}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          className='mt-4 items-center'
          onPress={() => router.push('/all-achievements')}
        >
          <Text className='text-[#4169E1] text-sm'>
            See all my achievements
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWithHeader>
  );
}
