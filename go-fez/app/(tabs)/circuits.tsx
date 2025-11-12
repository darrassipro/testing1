import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CirclesScreen() {
  const circles = [
    {
      id: '1',
      name: 'Work Friends',
      members: 12,
      icon: 'briefcase',
      image: 'https://i.pravatar.cc/150?img=2',
    },
    {
      id: '2',
      name: 'College Buddies',
      members: 24,
      icon: 'school',
      image: 'https://i.pravatar.cc/150?img=3',
    },
    {
      id: '3',
      name: 'Gaming Squad',
      members: 8,
      icon: 'game-controller',
      image: 'https://i.pravatar.cc/150?img=4',
    },
    {
      id: '4',
      name: 'Family',
      members: 6,
      icon: 'home',
      image: 'https://i.pravatar.cc/150?img=5',
    },
  ];

  const renderCircleItem = ({ item }: { item: (typeof circles)[0] }) => (
    <TouchableOpacity style={styles.circleCard}>
      <Image source={{ uri: item.image }} style={styles.circleImage} />
      <View style={styles.circleInfo}>
        <Text style={styles.circleName}>{item.name}</Text>
        <Text style={styles.circleMembers}>{item.members} members</Text>
      </View>
      <Ionicons name='chevron-forward' size={16} color='#7a9abf' />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Circles</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name='add' size={24} color='#1a2f4d' />
        </TouchableOpacity>
      </View>

      <FlatList
        data={circles}
        renderItem={renderCircleItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2f4d',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a4668',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#00d466',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  circleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#243656',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  circleImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  circleInfo: {
    flex: 1,
  },
  circleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  circleMembers: {
    fontSize: 12,
    color: '#7a9abf',
    marginTop: 2,
  },
});
