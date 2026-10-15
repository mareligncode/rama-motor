import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  editable?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  error,
  placeholder = '912 345 678',
  editable = true,
}) => {
  const handleChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, '');
    onChangeText(digitsOnly);
  };

  return (
    <View className="w-full mb-4">
      <Text className="text-sm font-semibold text-slate-700 mb-1.5">Driver Mobile Number</Text>
      <View
        className={`flex-row items-center bg-white border rounded-xl overflow-hidden px-3.5 py-3 ${
          error ? 'border-red-500' : 'border-slate-200'
        }`}
      >
        <View className="flex-row items-center pr-3 mr-3 border-r border-slate-200">
          <Text className="text-xl mr-1.5">🇪🇹</Text>
          <Text className="text-base font-bold text-slate-800">+251</Text>
        </View>

        <TextInput
          className="flex-1 text-slate-900 text-base py-0 tracking-wider font-medium"
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType="phone-pad"
          maxLength={10}
          editable={editable}
          autoFocus
        />
      </View>
      {error ? (
        <Text className="text-xs text-red-500 font-medium mt-1 ml-1">{error}</Text>
      ) : (
        <Text className="text-xs text-slate-400 mt-1 ml-1">
          Enter 9 digits starting with 9 or 7 (e.g. 911 234 567)
        </Text>
      )}
    </View>
  );
};
