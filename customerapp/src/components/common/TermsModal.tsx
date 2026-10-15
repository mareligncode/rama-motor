import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from './Button';

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  visible,
  onClose,
  onAccept,
}) => {
  const { isDark, colors } = useTheme();
  const { translations } = useTranslation();

  const handleOpenSampleLink = async () => {
    const sampleUrl = 'https://rama-delivery.et/terms';
    try {
      const supported = await Linking.canOpenURL(sampleUrl);
      if (supported) {
        await Linking.openURL(sampleUrl);
      } else {
        Alert.alert(
          'Sample Terms Link',
          `Sample legal URL:\n${sampleUrl}\n\nThis is a sample regulatory link for Rama Delivery Ethiopia.`
        );
      }
    } catch {
      Alert.alert(
        'Sample Terms Link',
        `Sample legal URL:\n${sampleUrl}\n\nRegistered under Addis Ababa Transport Bureau.`
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: '88%',
          }}
          className="p-6 shadow-2xl"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-[#00684A] items-center justify-center mr-3">
                <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text
                  style={{ color: colors.textPrimary }}
                  className="text-lg font-black tracking-tight"
                >
                  Rama Delivery
                </Text>
                <Text
                  style={{ color: colors.textSecondary }}
                  className="text-xs font-medium"
                >
                  {translations.auth.termsOfService} &amp; {translations.auth.privacyPolicy}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={{ backgroundColor: colors.surfaceVariant }}
              className="w-8 h-8 rounded-full items-center justify-center active:opacity-70"
            >
              <Ionicons name="close" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Terms Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="my-4"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Government & Compliance Badge */}
            <View
              style={{
                backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE',
                borderColor: isDark ? '#00A86B' : '#00684A',
              }}
              className="p-3.5 rounded-xl border mb-4"
            >
              <View className="flex-row items-center mb-1">
                <Ionicons name="ribbon" size={16} color="#00684A" />
                <Text className="text-xs font-black text-[#00684A] ml-1.5 uppercase">
                  {translations.auth.licensedTransport}
                </Text>
              </View>
              <Text
                style={{ color: isDark ? '#9AE6B4' : '#047857' }}
                className="text-xs font-medium leading-4"
              >
                Complies with Addis Ababa City Administration Transport Bureau courier dispatch regulations and National ID (Fayda eSignet) compliance standards.
              </Text>
            </View>

            {/* Section 1: Motorcycle Delivery Service */}
            <View className="mb-4">
              <View className="flex-row items-center mb-1.5">
                <Ionicons name="cube" size={16} color="#00684A" className="mr-1.5" />
                <Text style={{ color: colors.textPrimary }} className="text-sm font-bold ml-1">
                  1. Motorcycle Parcel Delivery Scope
                </Text>
              </View>
              <Text
                style={{ color: colors.textSecondary }}
                className="text-xs leading-5"
              >
                Rama Delivery operates dedicated 2-wheel motor fleet dispatch for legal parcels, food, documents, packages, and goods within Addis Ababa and surrounding Oromia Special Zones. Sender confirms packages contain zero prohibited, illicit, or hazardous materials.
              </Text>
            </View>

            {/* Section 2: Fayda National ID & Verification */}
            <View className="mb-4">
              <View className="flex-row items-center mb-1.5">
                <Ionicons name="card" size={16} color="#2563EB" className="mr-1.5" />
                <Text style={{ color: colors.textPrimary }} className="text-sm font-bold ml-1">
                  2. Fayda ID Verification &amp; Security
                </Text>
              </View>
              <Text
                style={{ color: colors.textSecondary }}
                className="text-xs leading-5"
              >
                In compliance with Ethiopian National ID Proclamation, couriers are Fayda-verified. Customers and couriers agree to safeguard digital delivery verification codes (OTP / PIN) to prevent unauthorized parcel handovers.
              </Text>
            </View>

            {/* Section 3: Telebirr & Cashless Payments */}
            <View className="mb-4">
              <View className="flex-row items-center mb-1.5">
                <Ionicons name="wallet" size={16} color="#059669" className="mr-1.5" />
                <Text style={{ color: colors.textPrimary }} className="text-sm font-bold ml-1">
                  3. Telebirr, CBE Birr &amp; Cashless Settlement
                </Text>
              </View>
              <Text
                style={{ color: colors.textSecondary }}
                className="text-xs leading-5"
              >
                Courier fares are calculated dynamically based on GPS distance and live traffic. Instant Telebirr wallet settlements and CBE Birr payouts are processed via licensed National Bank of Ethiopia financial gateways.
              </Text>
            </View>

            {/* Section 4: Privacy & Data Protection */}
            <View className="mb-4">
              <View className="flex-row items-center mb-1.5">
                <Ionicons name="lock-closed" size={16} color="#7C3AED" className="mr-1.5" />
                <Text style={{ color: colors.textPrimary }} className="text-sm font-bold ml-1">
                  4. Privacy &amp; Phone Number Masking
                </Text>
              </View>
              <Text
                style={{ color: colors.textSecondary }}
                className="text-xs leading-5"
              >
                Customer and recipient phone numbers are masked and safeguarded during order fulfillment. Location tracking data is strictly utilized for parcel transit tracking and emergency police dispatch (991).
              </Text>
            </View>

            {/* External Sample Legal Link Box */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleOpenSampleLink}
              style={{
                backgroundColor: colors.surfaceVariant,
                borderColor: '#00684A',
              }}
              className="flex-row items-center justify-between p-3.5 rounded-xl border border-dashed my-2"
            >
              <View className="flex-row items-center flex-1 mr-2">
                <Ionicons name="globe-outline" size={20} color="#00684A" />
                <View className="ml-2.5 flex-1">
                  <Text className="text-xs font-bold text-[#00684A]">
                    {translations.auth.sampleTermsLink}
                  </Text>
                  <Text
                    style={{ color: colors.textMuted }}
                    className="text-[10px] mt-0.5"
                  >
                    https://rama-delivery.et/terms
                  </Text>
                </View>
              </View>
              <Ionicons name="open-outline" size={16} color="#00684A" />
            </TouchableOpacity>

            {/* Emergency Hotline Info */}
            <View className="flex-row items-center justify-center mt-3">
              <Ionicons name="call" size={13} color={colors.textMuted} />
              <Text
                style={{ color: colors.textMuted }}
                className="text-[11px] ml-1.5 font-medium"
              >
                24/7 Rama Hotline: +251 11 812 3456 • Emergency: 991
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="flex-row space-x-3 pt-2">
            <View className="flex-1 mr-2">
              <Button
                title={translations.common.accept || 'Accept & Close'}
                onPress={() => {
                  if (onAccept) onAccept();
                  onClose();
                }}
                size="md"
              />
            </View>
            <View className="w-24">
              <Button
                title={translations.common.close}
                variant="outline"
                onPress={onClose}
                size="md"
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
