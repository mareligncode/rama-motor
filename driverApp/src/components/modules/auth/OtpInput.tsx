import React, { useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';

interface OtpInputProps {
  code: string;
  onChangeCode: (code: string) => void;
  length?: number;
  error?: string;
  devCodeHint?: string;
  onDevCodeFill?: () => void;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  code,
  onChangeCode,
  length = 6,
  error,
  devCodeHint,
  onDevCodeFill,
}) => {
  const inputRef = useRef<TextInput>(null);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const digits = code.split('');

  return (
    <View className="w-full items-center my-4">
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={(text) => {
          const sanitized = text.replace(/\D/g, '').slice(0, length);
          onChangeCode(sanitized);
        }}
        keyboardType="number-pad"
        maxLength={length}
        style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
        autoFocus
      />

      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePress}
        className="flex-row justify-between w-full max-w-xs"
      >
        {Array.from({ length }).map((_, index) => {
          const digit = digits[index] || '';
          const isFocused = index === digits.length;

          return (
            <View
              key={index}
              className={`w-12 h-14 rounded-xl border-2 items-center justify-center bg-white ${
                error
                  ? 'border-red-500'
                  : isFocused
                  ? 'border-emerald-600 bg-emerald-50/30'
                  : digit
                  ? 'border-slate-800'
                  : 'border-slate-200'
              }`}
            >
              <Text className="text-2xl font-bold text-slate-900">{digit}</Text>
            </View>
          );
        })}
      </TouchableOpacity>

      {error ? (
        <Text className="text-xs text-red-500 font-medium mt-3 text-center">{error}</Text>
      ) : null}

      {devCodeHint ? (
        <TouchableOpacity
          onPress={onDevCodeFill}
          className="mt-4 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 flex-row items-center"
        >
          <Text className="text-xs font-semibold text-emerald-800">
            Dev OTP: <Text className="font-bold underline">{devCodeHint}</Text> (Tap to auto-fill)
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};
