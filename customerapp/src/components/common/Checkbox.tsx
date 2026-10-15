import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

export interface CheckboxProps {
  checked: boolean;
  onToggle: (newChecked: boolean) => void;
  label?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  error?: boolean;
  size?: number;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onToggle,
  label,
  children,
  disabled = false,
  error = false,
  size = 22,
}) => {
  const { isDark, colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      onPress={() => onToggle(!checked)}
      className="flex-row items-start my-2"
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: 6,
          backgroundColor: checked
            ? '#00684A'
            : isDark
            ? '#1E293B'
            : '#FFFFFF',
          borderColor: error
            ? '#EF4444'
            : checked
            ? '#00684A'
            : isDark
            ? '#334155'
            : '#CBD5E1',
          borderWidth: 2,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 2,
          marginRight: 10,
        }}
      >
        {checked && (
          <Ionicons
            name="checkmark-sharp"
            size={size - 6}
            color="#FFFFFF"
            style={{ fontWeight: 'bold' }}
          />
        )}
      </View>

      <View className="flex-1">
        {label ? (
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 13,
              lineHeight: 18,
            }}
          >
            {label}
          </Text>
        ) : (
          children
        )}
      </View>
    </TouchableOpacity>
  );
};
