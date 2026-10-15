import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#00684A] active:bg-[#005038] border-[#00684A]';
      case 'secondary':
        return 'bg-[#111827] active:bg-black border-[#111827]';
      case 'outline':
        return 'bg-transparent border border-[#00684A] active:bg-[#E6F4EE]';
      case 'ghost':
        return 'bg-transparent border-transparent active:bg-slate-100';
      case 'danger':
        return 'bg-red-600 active:bg-red-700 border-red-600';
      default:
        return 'bg-[#00684A] border-[#00684A]';
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return 'text-[#00684A] font-bold';
      case 'danger':
        return 'text-white font-bold';
      default:
        return 'text-white font-bold';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'py-2 px-3 rounded-lg';
      case 'lg':
        return 'py-4 px-6 rounded-2xl';
      case 'md':
      default:
        return 'py-3.5 px-5 rounded-xl';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      case 'md':
      default:
        return 'text-base';
    }
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      disabled={isDisabled}
      className={`flex-row items-center justify-center border ${getVariantStyles()} ${getSizeStyles()} ${
        isDisabled ? 'opacity-50' : 'opacity-100'
      }`}
      activeOpacity={0.8}
      style={style}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? '#059669' : '#FFFFFF'}
        />
      ) : (
        <View className="flex-row items-center justify-center space-x-2">
          {leftIcon ? <View className="mr-2">{leftIcon}</View> : null}
          <Text className={`${getTextStyles()} ${getTextSize()} tracking-wide`}>{title}</Text>
          {rightIcon ? <View className="ml-2">{rightIcon}</View> : null}
        </View>
      )}
    </TouchableOpacity>
  );
};
