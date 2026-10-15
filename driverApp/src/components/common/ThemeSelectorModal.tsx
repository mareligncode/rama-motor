import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { ThemeMode } from '../../constants/theme';

interface ThemeSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  visible,
  onClose,
}) => {
  const { themeMode, setThemeMode, colors, isDark } = useTheme();
  const { translations } = useTranslation();

  const options: { mode: ThemeMode; label: string; sub: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    {
      mode: 'light',
      label: translations.profile.themeLight,
      sub: 'Crisp courier white & emerald',
      icon: 'sunny-outline',
    },
    {
      mode: 'dark',
      label: translations.profile.themeDark,
      sub: 'Night shift dark slate & green glow',
      icon: 'moon-outline',
    },
    {
      mode: 'system',
      label: translations.profile.themeSystem,
      sub: 'Follows phone display appearance',
      icon: 'phone-portrait-outline',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/60 justify-end"
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{ backgroundColor: colors.surface }}
          className="rounded-t-3xl p-6 border-t border-slate-200 dark:border-slate-800"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <View className="flex-row items-center">
              <View
                style={{ backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE' }}
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
              >
                <Ionicons
                  name={isDark ? "moon" : "sunny"}
                  size={20}
                  color={isDark ? "#4ADE80" : "#00684A"}
                />
              </View>
              <View>
                <Text
                  style={{ color: colors.textPrimary }}
                  className="text-lg font-bold"
                >
                  {translations.profile.theme}
                </Text>
                <Text
                  style={{ color: colors.textSecondary }}
                  className="text-xs"
                >
                  Choose courier appearance mode
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={{ backgroundColor: colors.surfaceVariant }}
              className="w-8 h-8 rounded-full items-center justify-center"
            >
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View className="py-4 space-y-3">
            {options.map((opt) => {
              const isSelected = themeMode === opt.mode;
              return (
                <TouchableOpacity
                  key={opt.mode}
                  onPress={async () => {
                    await setThemeMode(opt.mode);
                    onClose();
                  }}
                  style={{
                    backgroundColor: isSelected
                      ? isDark
                        ? '#0E3A2B'
                        : '#E6F4EE'
                      : colors.surfaceVariant,
                    borderColor: isSelected
                      ? isDark
                        ? '#00A86B'
                        : '#00684A'
                      : 'transparent',
                  }}
                  className="p-4 rounded-2xl flex-row items-center justify-between border mb-2.5"
                >
                  <View className="flex-row items-center flex-1">
                    <Ionicons
                      name={opt.icon}
                      size={22}
                      color={
                        isSelected
                          ? isDark
                            ? '#4ADE80'
                            : '#00684A'
                          : colors.textSecondary
                      }
                    />
                    <View className="ml-3.5 flex-1">
                      <Text
                        style={{
                          color: isSelected
                            ? isDark
                              ? '#4ADE80'
                              : '#00684A'
                            : colors.textPrimary,
                          fontWeight: isSelected ? '700' : '600',
                        }}
                        className="text-sm"
                      >
                        {opt.label}
                      </Text>
                      <Text
                        style={{ color: colors.textSecondary }}
                        className="text-xs mt-0.5"
                      >
                        {opt.sub}
                      </Text>
                    </View>
                  </View>

                  {isSelected && (
                    <View
                      style={{
                        backgroundColor: isDark ? '#4ADE80' : '#00684A',
                      }}
                      className="w-6 h-6 rounded-full items-center justify-center"
                    >
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
