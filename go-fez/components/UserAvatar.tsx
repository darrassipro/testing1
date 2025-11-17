import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '@/lib/types';

interface UserAvatarProps {
  user: User;
  size?: number;
  onPress?: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 40, onPress }) => {
  const initials = user?.firstName && user?.lastName
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : 'U';

  const avatarContent = user?.profileImage ? (
    <Image
      source={{ uri: user.profileImage }}
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
    />
  ) : (
    <View style={[styles.avatarPlaceholder, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initialsText, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.container}>
        {avatarContent}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{avatarContent}</View>;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default UserAvatar;
