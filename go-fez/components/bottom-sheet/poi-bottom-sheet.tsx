import Image1 from '@/assets/monuments/m1.jpg';
import Image2 from '@/assets/monuments/m2.jpg';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useState } from 'react';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Fontisto from '@expo/vector-icons/Fontisto';
import Octicons from '@expo/vector-icons/Octicons';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import Monument from '@/types/monument';

const { width } = Dimensions.get('window');

const GALLERY_IMAGES = [
  { id: 1, image: Image1 },
  { id: 2, image: Image2 },
];

const BUSINESS_HOURS = [
  { day: 'Monday', hours: '10:00 - 21:00' },
  { day: 'Tuesday', hours: '10:00 - 21:00' },
  { day: 'Wednesday', hours: '10:00 - 21:00' },
  { day: 'Thursday', hours: '10:00 - 21:00' },
  { day: 'Friday', hours: 'Closed' },
  { day: 'Saturday', hours: '10:00 - 21:00' },
  { day: 'Sunday', hours: '10:00 - 21:00' },
];

const REVIEWS = [
  {
    id: 1,
    name: 'John Smith',
    rating: 4.5,
    date: '01/01/2025',
    text: "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled",
    avatar: Image1,
  },
  {
    id: 2,
    name: 'John Smith',
    rating: 4.5,
    date: '01/01/2025',
    text: "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled",
    avatar: Image1,
  },
  {
    id: 3,
    name: 'John Smith',
    rating: 4.5,
    date: '01/01/2025',
    text: "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled",
    avatar: Image1,
  },
  {
    id: 4,
    name: 'John Smith',
    rating: 4.5,
    date: '01/01/2025',
    text: "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled",
    avatar: Image1,
  },
];

interface BottomSheetContentProps {
  selectedPoi: Monument | null;
  onClose?: () => void;
}

export default function PoiBottomSheetContent({
  selectedPoi,
  onClose,
}: BottomSheetContentProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [rating, setRating] = useState(0);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <View style={styles.starsContainer}>
        {Array(fullStars)
          .fill(0)
          .map((_, i) => (
            <Fontisto key={`full-${i}`} name='star' size={12} color='#FFB800' />
          ))}
        {/* {hasHalfStar && <Fontisto name='star-half' size={12} color='#FFB800' />} */}
        {Array(emptyStars)
          .fill(0)
          .map((_, i) => (
            <Fontisto
              key={`full-${i}`}
              name='star'
              size={12}
              color='#9c9c9cff'
            />
          ))}
      </View>
    );
  };

  if (!selectedPoi) {
    return null;
  }
  return (
    <BottomSheetScrollView style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <AntDesign name='close' size={20} color='#1f1f1fff' />
      </TouchableOpacity>

      {/* Floating Image */}
      <View style={styles.floatingImageContainer}>
        <Image
          style={styles.floatingImage}
          source={selectedPoi.imageUrl}
          contentFit='cover'
        />
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.poiName}>{selectedPoi.title}</Text>
        <Text style={styles.poiSubtitle}>{selectedPoi.type}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingText}>4.7</Text>
          <View style={styles.starsContainer}>
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <MaterialCommunityIcons
                  key={i}
                  name='star'
                  size={12}
                  color='#FFB800'
                />
              ))}
          </View>
          <Text style={styles.reviewCountSmall}>(84 reviews)</Text>
        </View>
      </View>

      {/* Gallery Section */}
      <View style={styles.gallerySection}>
        <ScrollView
          horizontal
          pagingEnabled
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / (width - 32)
            );
            setActiveImageIndex(index);
          }}
        >
          {GALLERY_IMAGES.map((item) => (
            <Image
              key={item.id}
              source={item.image}
              style={styles.galleryImage}
              contentFit='cover'
            />
          ))}
        </ScrollView>
        {/* <View style={styles.dotsContainer}>
          {GALLERY_IMAGES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, activeImageIndex === i && styles.activeDot]}
            />
          ))}
        </View> */}
      </View>

      {/* Audio Guide Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio guide</Text>
        <View style={styles.audioGuideContainer}>
          <TouchableOpacity style={styles.playButton}>
            <FontAwesome5 name='play' size={20} color='#007036' />
          </TouchableOpacity>
          <View style={styles.waveform}>
            {Array(30)
              .fill(0)
              .map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveformBar,
                    { height: Math.random() * 24 + 8 },
                  ]}
                />
              ))}
          </View>
        </View>
      </View>

      {/* Contact Info Section */}
      <View
        style={[
          styles.section,
          {
            borderColor: '#E0E0E0',
            borderWidth: 1,
            borderRadius: 16,
          },
        ]}
      >
        <View style={styles.infoRow}>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Address</Text>
            <View className='flex-row gap-2'>
              <Feather name='map-pin' size={16} color='#666' />
              <Text style={styles.infoText}>12 Fes 20100 Rsc, Morocco</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={[styles.infoContent, { gap: 4 }]}>
            <Text style={styles.infoLabel}>Phone</Text>
            <View className='flex-row gap-2'>
              <FontAwesome6 name='phone-volume' size={16} color='#666' />
              <TouchableOpacity>
                <Link
                  href='tel:0612345678'
                  style={[styles.infoText, styles.linkText]}
                >
                  <Text style={styles.infoText}>0612345678</Text>
                </Link>
              </TouchableOpacity>
            </View>
            <View className='flex-row gap-2'>
              <FontAwesome6 name='phone-volume' size={16} color='#666' />
              <TouchableOpacity>
                <Link
                  href='tel:0612345678'
                  style={[styles.infoText, styles.linkText]}
                >
                  <Text style={styles.infoText}>0612345678</Text>
                </Link>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Website</Text>

            <View className='flex-row gap-2 mt-2'>
              <Feather name='globe' size={18} color='#007036' />
              <TouchableOpacity>
                <Link
                  href='https://anass-dabaghi.vercel.app'
                  style={[styles.infoText, styles.linkText]}
                >
                  www.burjialshamal.com
                </Link>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Business Hours Section */}
      <View
        style={[
          styles.section,
          {
            borderColor: '#E0E0E0',
            borderWidth: 1,
            borderRadius: 16,
          },
        ]}
      >
        <View style={styles.businessStatusRow}>
          <Text style={styles.sectionTitle}>Business Status & Hours</Text>
          <TouchableOpacity style={styles.statusBadge}>
            <Text style={[styles.statusText, { color: '#007036' }]}>
              Open now
            </Text>
            <Feather name='chevron-down' size={14} color='#141414ff' />
          </TouchableOpacity>
        </View>

        <View style={styles.hoursTable}>
          {BUSINESS_HOURS.map((item, index) => (
            <View key={index} style={styles.hoursRow}>
              <Text style={styles.dayText}>{item.day}</Text>
              <Text
                style={[
                  styles.hoursText,
                  item.hours === 'Closed' && styles.closedText,
                ]}
              >
                {item.hours}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Rating Distribution */}
      <View style={[styles.section, { borderRadius: 16 }]}>
        <View style={styles.ratingDistribution}>
          <View style={styles.ratingLeft}>
            <Text style={styles.ratingNumberLarge}>4.7</Text>
            <View style={styles.starsContainer}>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <MaterialCommunityIcons
                    key={i}
                    name='star'
                    size={14}
                    color='#FFB800'
                  />
                ))}
            </View>
            <Text style={styles.reviewCount}>1,450 Reviews</Text>
          </View>

          <View style={styles.ratingBars}>
            {[
              { stars: 5, count: 70 },
              { stars: 4, count: 60 },
              { stars: 3, count: 30 },
              { stars: 2, count: 15 },
              { stars: 1, count: 10 },
            ].map((item, i) => (
              <View key={i} style={styles.barRow}>
                <Fontisto name='star' size={10} color='orange' />
                <Text style={styles.starLabel}>{item.stars.toFixed(1)}</Text>
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${(item.count / 70) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Reviews Section */}
      <View style={styles.section}>
        {REVIEWS.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View className='flex-row justify-between'>
              <View className='flex-row gap-2'>
                <Image
                  source={review.avatar}
                  style={styles.reviewAvatar}
                  contentFit='cover'
                />
                <View>
                  <Text style={styles.reviewerName}>{review.name}</Text>
                  <Text className='text-xs' style={{ color: '#666' }}>
                    3 weeks ago
                  </Text>
                </View>
              </View>

              <Text style={styles.reviewDate}>{review.date}</Text>
            </View>
            <View style={styles.reviewContent}>
              <View className='flex-row items-center gap-1'>
                <Text className='font-bold'>{review.rating}</Text>
                {renderStars(review.rating)}
              </View>
              <Text style={styles.reviewText} numberOfLines={4}>
                {review.text}
              </Text>
              <View className='mt-4 flex-row-reverse'>
                <Fontisto name='heart-alt' size={14} color='black' />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Write Review Section */}
      <View style={styles.writeReviewSection}>
        <TextInput
          style={styles.textArea}
          placeholder='Write a review'
          placeholderTextColor='#999'
          multiline
          numberOfLines={4}
        />
        <View className='flex-row gap-4 items-center justify-between w-full'>
          <View style={styles.ratingInput}>
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setRating(i + 1)}>
                  <Octicons
                    name='star-fill'
                    size={18}
                    color={i < rating ? '#FFB800' : '#bdbdbdff'}
                  />
                </TouchableOpacity>
              ))}
          </View>
          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </BottomSheetScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 16,
    zIndex: 32,
  },
  floatingImageContainer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  floatingImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#fff',
  },
  titleSection: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  poiName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  poiSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  textArea: {
    flex: 1,
    width: '100%',
    height: 100,
    textAlignVertical: 'top',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewCountSmall: {
    fontSize: 12,
    color: '#666',
  },
  gallerySection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  galleryImage: {
    width: width / 2,
    height: 160,
    borderRadius: 8,
    marginRight: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
  },
  activeDot: {
    backgroundColor: '#007036',
    width: 20,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBlock: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#303030ff',
    marginBottom: 12,
  },
  audioGuideContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 16,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 27,
    gap: 6,
  },
  waveformBar: {
    flex: 1,
    backgroundColor: '#007036',
    width: 4,
    height: 19,
    borderRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 13,
    color: '#000',
    marginBottom: 2,
  },
  linkText: {
    color: '#007036',
  },
  businessStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  hoursTable: {
    gap: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  dayText: {
    fontSize: 13,
    color: '#333',
  },
  hoursText: {
    fontSize: 13,
    color: '#666',
  },
  closedText: {
    color: '#ff4444',
  },
  ratingDistribution: {
    flexDirection: 'row-reverse',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    gap: 24,
  },
  ratingLeft: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingNumberLarge: {
    fontSize: 40,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  ratingBars: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starLabel: {
    fontSize: 12,
    color: '#666',
    width: 20,
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#007036',
    borderRadius: 4,
  },
  reviewCard: {
    gap: 12,
    marginBottom: 20,
    paddingBottom: 20,
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 16,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  reviewDate: {
    fontSize: 12,
    color: '#2b2b2bff',
  },
  reviewText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginTop: 6,
  },
  writeReviewSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
  },
  writeReviewTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  ratingInput: {
    flexDirection: 'row',
    gap: 4,
  },
  submitButton: {
    backgroundColor: '#007036',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
