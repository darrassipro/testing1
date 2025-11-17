import { useCurrentUser } from '@/context/current-user';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export function UserAvatar({
  size = 40,
  borderColor = '#fff',
}: {
  size?: number;
  borderColor?: string;
}) {
  const router = useRouter();
  // const { user } = useCurrentUser();
  const { user }: any = { user: null };
  return (
    <TouchableOpacity
      onPress={() => router.push('/(tabs)/profile')}
      className='rounded-full'
    >
      <Image
        source={{
          uri: user?.profileImage || 'https://avatar.iran.liara.run/public/36',
        }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor,
          borderWidth: 2,
        }}
      />
    </TouchableOpacity>
  );
}
