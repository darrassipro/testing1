import PoiBottomSheetContent from '@/components/bottom-sheet/poi-bottom-sheet';
import SearchBottomSheetContent from '@/components/bottom-sheet/search-bottom-sheet';
import CircuitMapViewer from '@/components/circuit-map-viewer';
import Monument from '@/types/monument';
import BottomSheet from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

const MAPTILER_API_KEY = 'cKuGgc1qdSgluaz2JWLK';
const INITIAL_REGION = {
  latitude: 34.0626,
  longitude: -5.0077,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const LOCATIONS: Monument[] = [
  {
    order: 0,
    id: 1,
    latitude: 34.035615256120536,
    longitude: -5.0045507241720495,
    title: 'Fez Medina',
    type: 'landmark',
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/todowi-1cde9.appspot.com/o/images%2Fapp-logo.jpg?alt=media&token=e30e4cc9-26d1-4b99-9d43-3b621dfb9418',
  },
  {
    id: 2,
    latitude: 34.03110809354263,
    longitude: -5.025674582284621,
    order: 1,
    title: 'Restaurant',
    type: 'restaurant',
    imageUrl:
      'https://lh3.googleusercontent.com/ogw/AF2bZyh701yQrQKktBrUmCPLh1unsWA2blvKctfxSkA95muB93mc=s40-c-mo',
  },
  {
    id: 3,
    latitude: 33.988265227621085,
    longitude: -5.020685716677097,
    title: 'Museum',
    type: 'museum',
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/todowi-1cde9.appspot.com/o/images%2Fapp-logo.jpg?alt=media&token=e30e4cc9-26d1-4b99-9d43-3b621dfb9418',
  },
  {
    id: 4,
    latitude: 34.01979385617872,
    longitude: -5.002375588532311,
    title: 'Shop',
    type: 'shop',
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/todowi-1cde9.appspot.com/o/images%2Fapp-logo.jpg?alt=media&token=e30e4cc9-26d1-4b99-9d43-3b621dfb9418',
  },
];

export default function HomeScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [height * 0.5, height * 0.8], [height]);
  const [selectedMonument, setSelectedMonument] = useState<Monument | null>(
    null
  );

  const handleMarkerPress = useCallback((location: Monument) => {
    setSelectedMonument(location);
    bottomSheetRef.current?.snapToIndex(1);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.mapcontainer}>
          <CircuitMapViewer
            monuments={LOCATIONS}
            currentPoiIndex={0}
            completedPoiIds={['1', '2']}
            showUserLocation={true}
            showCircuitRoute={true}
            showUserRoute={true}
            onMarkerPress={(monument) => {
              handleMarkerPress(monument);
            }}
            onPathCalculated={(distance, duration) => {
              console.log(`Route: ${distance}m, ${duration}s`);
            }}
          />
        </View>
        <BottomSheet
          handleIndicatorStyle={{ backgroundColor: '#ccc' }}
          containerStyle={
            {
              // marginInline: 10,
              // paddingInline: 50,
            }
          }
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          enableOverDrag={false}
        >
          <PoiBottomSheetContent
            onClose={() => {
              bottomSheetRef.current?.close();
              setSelectedMonument(null);
            }}
            selectedPoi={selectedMonument}
          />
        </BottomSheet>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapcontainer: {
    width: '100%',
    height: '100%',
  },
});
