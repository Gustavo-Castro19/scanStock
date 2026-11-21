import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Palette } from '@/constants/theme';

interface StatusBadgeProps {
  label: string;
  type?: 'success' | 'warning' | 'danger' | 'neutral';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, type = 'neutral' }) => {
  const getColors = () => {
    switch (type) {
      case 'success':
        return { bg: Palette.successBg, text: Palette.successText };
      case 'warning':
        return { bg: Palette.warningBg, text: Palette.warningText };
      case 'danger':
        return { bg: Palette.dangerBg, text: Palette.dangerText };
      default:
        return { bg: Palette.lightSurface, text: Palette.subtitle };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
