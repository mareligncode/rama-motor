import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  isPassword = false,
  className,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="w-full mb-4">
      {label ? (
        <Text className="text-sm font-semibold text-slate-700 mb-1.5">{label}</Text>
      ) : null}

      <View
        className={`flex-row items-center bg-white border rounded-xl px-3.5 py-3 ${
          error
            ? 'border-red-500'
            : isFocused
            ? 'border-emerald-600 ring-2 ring-emerald-100'
            : 'border-slate-200'
        }`}
      >
        {leftIcon ? <View className="mr-2.5">{leftIcon}</View> : null}

        <TextInput
          className="flex-1 text-slate-900 text-base py-0"
          placeholderTextColor="#94A3B8"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="ml-2"
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <View className="ml-2">{rightIcon}</View>
        ) : null}
      </View>

      {error ? (
        <Text className="text-xs text-red-500 font-medium mt-1 ml-1">{error}</Text>
      ) : helper ? (
        <Text className="text-xs text-slate-500 mt-1 ml-1">{helper}</Text>
      ) : null}
    </View>
  );
};
