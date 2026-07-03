import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ExpoSplashScreen from 'expo-splash-screen';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS,
  withDelay
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  
  // Animated shared values for the transitions
  const progress = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  const progressBarWidth = width * 0.72;
  const shieldSize = width * 0.30;

  const navigateToOnboarding = () => {
    router.replace('/onboarding');
  };

  useEffect(() => {
    // Stage 1: Fade in logo brand quickly (600ms)
    logoOpacity.value = withTiming(1, { duration: 600 });

    // Stage 2: Progress bar loading (takes 2 seconds)
    progress.value = withTiming(1, { duration: 2000 }, (finished) => {
      if (finished) {
        // Stage 3: Hold progress bar full (100%) for 800ms, then fade out screen and transition
        screenOpacity.value = withDelay(
          800,
          withTiming(0, { duration: 500 }, (finishedScreen) => {
            if (finishedScreen) {
              runOnJS(navigateToOnboarding)();
            }
          })
        );
      }
    });

    // Fallback: Ensure splash screen hides even if onLoad doesn't fire
    const timer = setTimeout(() => {
      ExpoSplashScreen.hideAsync().catch(() => {});
      if (Platform.OS === 'web') {
        const webSplash = document.getElementById('root-loading-splash');
        if (webSplash) webSplash.style.display = 'none';
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Animated Styles
  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: progress.value * progressBarWidth,
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
  }));

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[{ flex: 1 }, screenAnimatedStyle]}>
      <View className="flex-1 bg-white justify-center items-center relative">
        {/* Background Image (Covering the entire screen, styled as a light watermark) */}
        <Image
          source={require('../../assets/images/splash_bg.png')}
          className="absolute w-full h-full"
          style={{ opacity: 0.55 }} // 0.55 opacity makes the watermark background more visible and prominent
          contentFit="cover"
          transition={200}
          onLoad={() => {
            // Hide the native splash screen once our background image has loaded
            ExpoSplashScreen.hideAsync().catch(() => {});
            if (Platform.OS === 'web') {
              const webSplash = document.getElementById('root-loading-splash');
              if (webSplash) webSplash.style.display = 'none';
            }
          }}
        />

        {/* Bottom Content Area (Logo and Progress bar stacked together) */}
        <View style={styles.bottomArea} className="items-center z-10 px-6 absolute">
          {/* Logo Container (Small, absolute positioned at the bottom middle, fades in) */}
          <Animated.View 
            style={[styles.logoContainer, logoAnimatedStyle]} 
            className="items-center mb-5"
          >
            {/* Reduced High-Res Transparent Shiny Gold Shield */}
            <Image
              source={require('../../assets/images/logo_shield_transparent.png')}
              style={{ width: shieldSize, height: shieldSize }}
              contentFit="contain"
            />

            {/* LawyerSathi Title */}
            <Text style={styles.brandTitle}>LawyerSathi</Text>

            {/* Subtitle Slogan with Gold Side Lines */}
            <View style={styles.subtitleWrapper}>
              <View style={styles.subLine} />
              <Text style={styles.brandSubtitle}>Your Legal Supporter</Text>
              <View style={styles.subLine} />
            </View>
          </Animated.View>

          {/* Progress Container (Always visible, stays full at 100%) */}
          <View className="items-center">
            {/* Loading text first */}
            <Text className="text-gray-500 text-[10px] font-semibold tracking-wider mb-2">
              Loading...
            </Text>

            {/* Progress Bar Track placed BELOW the text */}
            <View style={{ width: progressBarWidth }} className="h-1.5 bg-neutral-200/80 rounded-full overflow-hidden">
              <Animated.View 
                style={[styles.progressBar, progressAnimatedStyle]} 
                className="h-full rounded-full"
              />
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bottomArea: {
    bottom: 30, // Positioned cleanly at the bottom without overflow
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  progressBar: {
    backgroundColor: '#D4AF37', // Standard warm gold color for optimal visibility on white
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: '#6D5218', // Deep rich dark golden-bronze for excellent contrast on light backgrounds
    fontSize: 26, // Decreased to previous size
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 6,
    // White text shadow to isolate text from background watermark details
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  subLine: {
    width: 20, // Decreased to previous size
    height: 1.5, // Thicker
    backgroundColor: '#6D5218',
    marginHorizontal: 8,
    opacity: 0.8,
  },
  brandSubtitle: {
    color: '#7C6021', // Rich dark gold-bronze for legibility
    fontSize: 12, // Decreased to previous size
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textAlign: 'center',
    // White text shadow to isolate text from background watermark details
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  }
});
