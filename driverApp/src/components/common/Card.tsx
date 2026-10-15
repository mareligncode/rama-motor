import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'flat';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  children,
  className = '',
  style,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return 'bg-white border border-slate-200';
      case 'flat':
        return 'bg-slate-50 border border-slate-100';
      case 'elevated':
      default:
        return 'bg-white border border-slate-100 shadow-sm shadow-slate-200';
    }
  };

  return (
    <View
      className={`rounded-2xl p-4 ${getVariantStyles()} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
};
