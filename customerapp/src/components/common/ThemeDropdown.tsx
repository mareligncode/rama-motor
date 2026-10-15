import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { ThemeMode } from '../../constants/theme';

interface ThemeDropdownProps {
  compact?: boolean;
}

export const ThemeDropdown: React.FC<ThemeDropdownProps> = ({ compact = false }) => {
  const { themeMode, setThemeMode, isDark, colors } = useTheme();
  const { translations } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const themeOptions: {
    mode: ThemeMode;
    label: string;
    sublabel: string;
    icon: keyof typeof Ionicons.glyphMap;
    previewBg: string;
    previewAccent: string;
  }[] = [
    {
      mode: 'light',
      label: translations.profile.themeLight || 'Light Mode',
      sublabel: 'White & Deep Forest Green',
      icon: 'sunny-outline',
      previewBg: '#FFFFFF',
      previewAccent: '#00684A',
    },
    {
      mode: 'dark',
      label: translations.profile.themeDark || 'Dark Mode',
      sublabel: 'Night Slate & Emerald Glow',
      icon: 'moon-outline',
      previewBg: '#0F172A',
      previewAccent: '#4ADE80',
    },
    {
      mode: 'system',
      label: translations.profile.themeSystem || 'System Default',
      sublabel: 'Follows OS Display Setting',
      icon: 'phone-portrait-outline',
      previewBg: '#334155',
      previewAccent: '#38BDF8',
    },
  ];

  const currentOption = themeOptions.find((opt) => opt.mode === themeMode) || themeOptions[0];

  const handleSelect = async (mode: ThemeMode) => {
    await setThemeMode(mode);
    setDropdownOpen(false);
  };

  return (
    <View className="relative z-50">
      {/* Trigger Button with Dropdown Chevron */}
      <TouchableOpacity
        onPress={() => setDropdownOpen(true)}
        activeOpacity={0.8}
        style={{
          backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE',
          borderColor: isDark ? '#00A86B' : '#00684A',
        }}
        className={`flex-row items-center border rounded-full ${
          compact ? 'px-2.5 py-1' : 'px-3 py-1.5'
        }`}
      >
        <Ionicons
          name={isDark ? 'moon' : 'sunny'}
          size={14}
          color={isDark ? '#4ADE80' : '#00684A'}
          style={{ marginRight: 4 }}
        />
        <Text
          style={{ color: isDark ? '#4ADE80' : '#00684A' }}
          className="text-xs font-bold capitalize mr-1"
        >
          {themeMode === 'system' ? `Auto (${isDark ? 'Dark' : 'Light'})` : themeMode}
        </Text>
        <Ionicons
          name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
          size={12}
          color={isDark ? '#4ADE80' : '#00684A'}
        />
      </TouchableOpacity>

      {/* Dropdown Menu Modal */}
      <Modal
        visible={dropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDropdownOpen(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
                className="w-full max-w-sm rounded-3xl p-5 border shadow-2xl"
              >
                {/* Header */}
                <View className="flex-row items-center justify-between pb-3.5 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <View className="flex-row items-center">
                    <View
                      style={{ backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE' }}
                      className="w-9 h-9 rounded-full items-center justify-center mr-2.5"
                    >
                      <Ionicons
                        name="color-palette-outline"
                        size={18}
                        color={isDark ? '#4ADE80' : '#00684A'}
                      />
                    </View>
                    <View>
                      <Text
                        style={{ color: colors.textPrimary }}
                        className="text-base font-extrabold"
                      >
                        Theme Changer
                      </Text>
                      <Text
                        style={{ color: colors.textSecondary }}
                        className="text-xs"
                      >
                        Active: {currentOption.label}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => setDropdownOpen(false)}
                    style={{ backgroundColor: colors.surfaceVariant }}
                    className="w-7 h-7 rounded-full items-center justify-center"
                  >
                    <Ionicons name="close" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Dropdown Menu Options */}
                <View className="space-y-2.5">
                  {themeOptions.map((opt) => {
                    const isSelected = themeMode === opt.mode;
                    return (
                      <TouchableOpacity
                        key={opt.mode}
                        onPress={() => handleSelect(opt.mode)}
                        activeOpacity={0.8}
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
                        className="p-3.5 rounded-2xl flex-row items-center justify-between border mb-2"
                      >
                        <View className="flex-row items-center flex-1">
                          {/* Color Palette Preview Swatch */}
                          <View
                            style={{
                              backgroundColor: opt.previewBg,
                              borderColor: opt.previewAccent,
                            }}
                            className="w-8 h-8 rounded-xl border-2 items-center justify-center mr-3 shadow-sm"
                          >
                            <Ionicons
                              name={opt.icon}
                              size={16}
                              color={opt.previewAccent}
                            />
                          </View>

                          <View className="flex-1">
                            <View className="flex-row items-center">
                              <Text
                                style={{
                                  color: isSelected
                                    ? isDark
                                      ? '#4ADE80'
                                      : '#00684A'
                                    : colors.textPrimary,
                                  fontWeight: isSelected ? '800' : '600',
                                }}
                                className="text-sm mr-1.5"
                              >
                                {opt.label}
                              </Text>
                              {isSelected && (
                                <View
                                  style={{
                                    backgroundColor: isDark ? '#4ADE80' : '#00684A',
                                  }}
                                  className="px-1.5 py-0.5 rounded-md"
                                >
                                  <Text className="text-[9px] font-black text-white">
                                    ACTIVE
                                  </Text>
                                </View>
                              )}
                            </View>
                            <Text
                              style={{ color: colors.textSecondary }}
                              className="text-[11px] mt-0.5"
                            >
                              {opt.sublabel}
                            </Text>
                          </View>
                        </View>

                        {/* Radio Checkmark */}
                        <View
                          style={{
                            borderColor: isSelected
                              ? isDark
                                ? '#4ADE80'
                                : '#00684A'
                              : colors.border,
                            backgroundColor: isSelected
                              ? isDark
                                ? '#4ADE80'
                                : '#00684A'
                              : 'transparent',
                          }}
                          className="w-5 h-5 rounded-full border-2 items-center justify-center ml-2"
                        >
                          {isSelected && (
                            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Live Preview Tip */}
                <View
                  style={{
                    backgroundColor: colors.surfaceVariant,
                  }}
                  className="rounded-xl p-2.5 mt-3 flex-row items-center"
                >
                  <Ionicons name="sparkles" size={14} color="#00684A" />
                  <Text
                    style={{ color: colors.textSecondary }}
                    className="text-[11px] font-medium ml-1.5 flex-1"
                  >
                    Theme instantly applies across backgrounds, inputs, modals, and text colors.
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};
