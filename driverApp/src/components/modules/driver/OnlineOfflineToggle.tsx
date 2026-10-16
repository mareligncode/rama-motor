import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Easing,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { useTranslation } from '../../../hooks/useTranslation';

interface OnlineOfflineToggleProps {
  isOnline: boolean;
  onToggle: () => void;
  variant?: 'pill' | 'switch' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const OnlineOfflineToggle: React.FC<OnlineOfflineToggleProps> = ({
  isOnline,
  onToggle,
  variant = 'pill',
  size = 'md',
  disabled = false,
}) => {
  const { colors, isDark } = useTheme();
  const { translations } = useTranslation();

  // Animation values
  const toggleAnim = useRef(new Animated.Value(isOnline ? 1 : 0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.7)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  // Track state changes and animate toggle
  useEffect(() => {
    Animated.spring(toggleAnim, {
      toValue: isOnline ? 1 : 0,
      friction: 6,
      tension: 50,
      useNativeDriver: false,
    }).start();
  }, [isOnline, toggleAnim]);

  // Pulsing radar animation when online
  useEffect(() => {
    if (!isOnline) {
      pulseAnim.setValue(1);
      pulseOpacity.setValue(0);
      return;
    }

    const pulseLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 2.2,
            duration: 1600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.7,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [isOnline, pulseAnim, pulseOpacity]);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.94,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 4,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  // Status label
  const statusLabel = isOnline
    ? translations?.driver?.online || 'ONLINE'
    : translations?.driver?.offline || 'OFFLINE';

  // SWITCH VARIANT (Clean mechanical toggle switch for profile & cards)
  if (variant === 'switch') {
    const trackWidth = size === 'sm' ? 48 : size === 'lg' ? 64 : 56;
    const trackHeight = size === 'sm' ? 28 : size === 'lg' ? 36 : 32;
    const thumbSize = size === 'sm' ? 22 : size === 'lg' ? 30 : 26;
    const travelDistance = trackWidth - thumbSize - 6;

    const thumbTranslateX = toggleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [3, travelDistance + 3],
    });

    const trackBgColor = toggleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [isDark ? '#334155' : '#CBD5E1', '#00684A'],
    });

    return (
      <TouchableOpacity
        onPress={onToggle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        disabled={disabled}
        accessibilityRole="switch"
        accessibilityState={{ checked: isOnline }}
        accessibilityLabel={`Toggle duty status. Currently ${statusLabel}`}
      >
        <Animated.View
          style={[
            styles.switchTrack,
            {
              width: trackWidth,
              height: trackHeight,
              borderRadius: trackHeight / 2,
              backgroundColor: trackBgColor,
              transform: [{ scale: pressScale }],
            },
            isOnline && styles.switchOnlineShadow,
          ]}
        >
          <Animated.View
            style={[
              styles.switchThumb,
              {
                width: thumbSize,
                height: thumbSize,
                borderRadius: thumbSize / 2,
                transform: [{ translateX: thumbTranslateX }],
                backgroundColor: '#FFFFFF',
              },
            ]}
          >
            <Ionicons
              name={isOnline ? 'checkmark' : 'power'}
              size={size === 'sm' ? 12 : 14}
              color={isOnline ? '#00684A' : '#64748B'}
            />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  // PILL VARIANT (Hero button for top dashboard card)
  const isPillSm = size === 'sm';
  const pillPaddingX = isPillSm ? 12 : 14;
  const pillPaddingY = isPillSm ? 6 : 9;

  // Background and border colors
  const containerBg = isOnline
    ? '#00684A'
    : isDark
    ? '#1E293B'
    : '#F1F5F9';

  const containerBorder = isOnline
    ? '#00A86B'
    : isDark
    ? '#334155'
    : '#CBD5E1';

  const textColor = isOnline
    ? '#FFFFFF'
    : isDark
    ? '#E2E8F0'
    : '#1E293B';

  const dotColor = isOnline ? '#34D399' : isDark ? '#94A3B8' : '#64748B';

  return (
    <TouchableOpacity
      onPress={onToggle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.88}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`Toggle duty. Currently ${statusLabel}`}
    >
      <Animated.View
        style={[
          styles.pillContainer,
          {
            backgroundColor: containerBg,
            borderColor: containerBorder,
            paddingHorizontal: pillPaddingX,
            paddingVertical: pillPaddingY,
            transform: [{ scale: pressScale }],
          },
          isOnline ? styles.onlineGlow : styles.offlineShadow,
        ]}
      >
        {/* Left Status Indicator / Radar Pulse */}
        <View style={styles.indicatorWrapper}>
          {isOnline && (
            <Animated.View
              style={[
                styles.radarPing,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseOpacity,
                },
              ]}
            />
          )}
          <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
        </View>

        {/* Status Text */}
        <View style={styles.textContainer}>
          <Text
            numberOfLines={1}
            style={[
              styles.statusText,
              {
                color: textColor,
                fontSize: isPillSm ? 11 : 12,
              },
            ]}
          >
            {statusLabel}
          </Text>
        </View>

        {/* Right Toggle Icon Knob */}
        <View
          style={[
            styles.knobBadge,
            {
              backgroundColor: isOnline
                ? '#FFFFFF'
                : isDark
                ? '#334155'
                : '#E2E8F0',
            },
          ]}
        >
          <Ionicons
            name={isOnline ? 'power' : 'power-outline'}
            size={isPillSm ? 11 : 13}
            color={isOnline ? '#00684A' : isDark ? '#CBD5E1' : '#475569'}
          />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
    borderWidth: 1.5,
  },
  onlineGlow: {
    shadowColor: '#00A86B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  offlineShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  indicatorWrapper: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    position: 'relative',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  radarPing: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34D399',
  },
  textContainer: {
    marginRight: 8,
  },
  statusText: {
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  knobBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchTrack: {
    justifyContent: 'center',
    paddingHorizontal: 2,
    position: 'relative',
  },
  switchOnlineShadow: {
    shadowColor: '#00684A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  switchThumb: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2.5,
    elevation: 2,
  },
});
