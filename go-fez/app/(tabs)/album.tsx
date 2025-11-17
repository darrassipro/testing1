import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const imageSize = (width - 48) / 2;

export default function AlbumScreen() {
  const albums = [
    { id: '1', title: 'Summer Vacation', count: 24 },
    { id: '2', title: 'Beach Day', count: 18 },
    { id: '3', title: 'Mountain Trip', count: 32 },
    { id: '4', title: 'City Lights', count: 15 },
    { id: '5', title: 'Friends Gathering', count: 42 },
    { id: '6', title: 'Family Moments', count: 28 },
  ];

  const renderAlbumItem = ({ item }: { item: (typeof albums)[0] }) => (
    <TouchableOpacity style={styles.albumCard}>
      <Image
        source={{
          uri: `https://picsum.photos/${imageSize}/${imageSize}?random=${item.id}`,
        }}
        style={styles.albumImage}
      />
      <View style={styles.albumOverlay}>
        <Text style={styles.albumTitle}>{item.title}</Text>
        <Text style={styles.albumCount}>{item.count} photos</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Albums</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name='add' size={24} color='#1a2f4d' />
        </TouchableOpacity>
      </View>

      <FlatList
        data={albums}
        renderItem={renderAlbumItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true}
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
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  albumCard: {
    width: imageSize,
    height: imageSize,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#243656',
  },
  albumImage: {
    width: '100%',
    height: '100%',
  },
  albumOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  albumCount: {
    fontSize: 12,
    color: '#00d4ff',
    marginTop: 2,
  },
});
