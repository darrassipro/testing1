import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  Pressable,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  Feather,
  FontAwesome,
  FontAwesome5,
  MaterialIcons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.7; // 70% de la largeur de l'écran

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    firstName?: string;
    lastName?: string;
    profileImage?: string;
    city?: {
      name?: string;
    };
  } | null;
}

export default function NavigationDrawer({
  isOpen,
  onClose,
  user,
}: NavigationDrawerProps) {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  // Le drawer part de la gauche, donc il commence à -DRAWER_WIDTH (hors écran à gauche)
  const slideAnim = React.useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const translateX = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isOpen) {
      isClosingViaGesture.current = false;
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      // Reset translateX when opening
      translateX.setValue(0);
    } else {
      // Si on ferme via geste, ne pas déclencher l'animation ici (elle est déjà en cours)
      if (isClosingViaGesture.current) {
        return;
      }

      // Fermeture normale (via clic sur overlay)
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Reset translateX après la fermeture complète
        translateX.setValue(0);
      });
    }
  }, [isOpen]);

  const lastTranslationX = React.useRef(0);
  const isAnimating = React.useRef(false);
  const isClosingViaGesture = React.useRef(false);

  const handleGesture = (event: any) => {
    if (isAnimating.current) return;

    const { translationX } = event.nativeEvent;
    lastTranslationX.current = translationX;

    // Limiter le mouvement vers la droite (empêcher de dépasser 0)
    // Le drawer glisse vers la gauche pour se fermer, donc translationX négatif
    if (translationX > 0) {
      translateX.setValue(0);
    } else {
      translateX.setValue(translationX);
    }
  };

  const handleGestureStateChange = (event: any) => {
    const { state, velocityX } = event.nativeEvent;

    if (state === State.END || state === State.CANCELLED) {
      if (isAnimating.current) return;

      const currentTranslation = lastTranslationX.current;
      console.log('Gesture ended:', {
        translationX: currentTranslation,
        velocityX,
      });

      // Seuil de fermeture : au moins 30% de la largeur du drawer ou vitesse rapide
      const threshold = DRAWER_WIDTH * 0.3;
      const velocityThreshold = -1000; // Vitesse plus élevée pour éviter les fermetures accidentelles

      // Si l'utilisateur glisse vers la gauche suffisamment OU avec une vitesse très rapide
      const shouldClose =
        currentTranslation < -threshold || velocityX < velocityThreshold;

      if (shouldClose) {
        // Fermer le drawer directement depuis sa position actuelle
        console.log('Closing drawer via gesture');
        isAnimating.current = true;
        isClosingViaGesture.current = true;

        // Obtenir la position actuelle de slideAnim
        slideAnim.stopAnimation((currentSlideValue) => {
          // Animer slideAnim vers la position de fermeture en synchronisant avec translateX
          Animated.parallel([
            Animated.timing(slideAnim, {
              toValue: -DRAWER_WIDTH,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
          ]).start(() => {
            translateX.setValue(0);
            isAnimating.current = false;
            isClosingViaGesture.current = false;
            onClose();
          });
        });
      } else {
        // Revenir à la position ouverte avec animation
        isAnimating.current = true;
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start(() => {
          isAnimating.current = false;
        });
      }

      // Réinitialiser la référence
      lastTranslationX.current = 0;
    }
  };

  const userName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || 'User';
  const userCity = user?.city?.name || 'Fes, Morocco';

  const handleNavigation = (route: string) => {
    onClose();
    // Navigation logic - adjust routes based on your app structure
    if (route === 'home') {
      router.push('/(tabs)/home');
    } else if (route === 'themes') {
      // Navigate to themes page - for now, stay on explore
      // TODO: Create dedicated themes page if needed
    } else if (route === 'circuits') {
      // Navigate to circuits page - for now, stay on explore
      // TODO: Create dedicated circuits page if needed
    } else if (route === 'album') {
      // Navigate to album page - for now, stay on explore
      // TODO: Create dedicated album page if needed
    } else if (route === 'profile') {
      // Navigate to profile page - for now, stay on explore
      // TODO: Create dedicated profile page if needed
    }
  };

  const handleLogout = () => {
    onClose();
    // Implement logout logic here
    // For example: AsyncStorage.removeItem('token'), dispatch logout action, etc.
  };

  const handleSwitchLanguage = () => {
    onClose();
    // Implement language switching logic here
  };

  return (
    <>
      {/* Overlay - couvre toute l'écran pour l'effet visuel */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: opacityAnim,
          },
        ]}
        pointerEvents={isOpen ? 'none' : 'none'}
      />

      {/* Overlay cliquable sur la partie droite (30%) */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.overlayClickable,
            {
              opacity: opacityAnim,
            },
          ]}
          pointerEvents={isOpen ? 'auto' : 'none'}
        />
      </TouchableWithoutFeedback>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: Animated.add(slideAnim, translateX) }],
          },
        ]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <PanGestureHandler
          onGestureEvent={handleGesture}
          onHandlerStateChange={handleGestureStateChange}
          activeOffsetX={[-10, 10]}
          failOffsetY={[-5, 5]}
          enabled={isOpen}
        >
          <View style={{ flex: 1 }}>
            <View style={[styles.drawerContent, { paddingTop: top }]}>
              {/* Profile Section */}
              <TouchableOpacity
                style={styles.profileSection}
                onPress={() => {
                  handleNavigation('profile');
                }}
                activeOpacity={0.7}
              >
                <View style={styles.profileImageContainer}>
                  {user?.profileImage ? (
                    <Image
                      source={{ uri: user.profileImage }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <View
                      style={[
                        styles.profileImage,
                        styles.profileImagePlaceholder,
                      ]}
                    >
                      <Text style={styles.profileImageText}>
                        {userName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName} numberOfLines={1}>
                    {userName}
                  </Text>
                  <Text style={styles.profileCity} numberOfLines={1}>
                    {userCity}
                  </Text>
                </View>
                <Feather name='chevron-right' size={20} color='#9ca3af' />
              </TouchableOpacity>

              {/* Main Navigation Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Main Navigation</Text>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigation('home')}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemContent}>
                    <FontAwesome name='home' size={20} color='#0065B0' />
                    <Text
                      style={[styles.menuItemText, styles.menuItemTextActive]}
                    >
                      Home
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigation('themes')}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemContent}>
                    <FontAwesome5 name='mountain' size={20} color='#6b7280' />
                    <Text style={styles.menuItemText}>Themes</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigation('circuits')}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemContent}>
                    <MaterialIcons name='place' size={20} color='#6b7280' />
                    <Text style={styles.menuItemText}>Circuits</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigation('album')}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemContent}>
                    <MaterialCommunityIcons
                      name='bookmark-outline'
                      size={20}
                      color='#6b7280'
                    />
                    <Text style={styles.menuItemText}>Album</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Info & Support Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Info & Support</Text>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    onClose();
                    // Navigate to contact support
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemContent}>
                    <Feather name='message-circle' size={20} color='#6b7280' />
                    <Text style={styles.menuItemText}>Contact Support</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    onClose();
                    // Navigate to settings
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemContent}>
                    <Feather name='settings' size={20} color='#6b7280' />
                    <Text style={styles.menuItemText}>Settings</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Profil Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Profil</Text>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleSwitchLanguage}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemContent}>
                    <MaterialIcons name='language' size={20} color='#6b7280' />
                    <Text style={styles.menuItemText}>Switch Language</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleLogout}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemContent}>
                    <MaterialIcons
                      name='exit-to-app'
                      size={20}
                      color='#6b7280'
                    />
                    <Text style={styles.menuItemText}>Log out</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </PanGestureHandler>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  overlayClickable: {
    position: 'absolute',
    top: 0,
    left: DRAWER_WIDTH,
    right: 0,
    bottom: 0,
    zIndex: 1002,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#ffffff',
    zIndex: 1001,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  drawerContent: {
    flex: 1,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  profileImageContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profileImagePlaceholder: {
    backgroundColor: '#0065B0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
    marginRight: 8,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  profileCity: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuItem: {
    marginBottom: 4,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 16,
  },
  menuItemTextActive: {
    color: '#0065B0',
    fontWeight: '600',
  },
});
