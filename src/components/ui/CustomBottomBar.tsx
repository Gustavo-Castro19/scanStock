import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Palette } from '@/constants/theme';

export type MainTabType = 'acervo' | 'colecoes' | 'historico' | 'ajustes';

interface CustomBottomBarProps {
  activeTab: MainTabType;
  onTabChange: (tab: MainTabType) => void;
  onScanPress: () => void;
}

export const CustomBottomBar: React.FC<CustomBottomBarProps> = ({
  activeTab,
  onTabChange,
  onScanPress,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 12);

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomPadding }]}>
      <View style={styles.container}>
        {/* Left Side: Acervo & Coleções */}
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => onTabChange('acervo')}>
          <Feather
            name="grid"
            size={20}
            color={activeTab === 'acervo' ? Palette.primary : Palette.subtitle}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'acervo' && styles.tabLabelActive,
            ]}>
            Acervo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => onTabChange('colecoes')}>
          <Feather
            name="folder"
            size={20}
            color={activeTab === 'colecoes' ? Palette.primary : Palette.subtitle}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'colecoes' && styles.tabLabelActive,
            ]}>
            Coleções
          </Text>
        </TouchableOpacity>

        {/* Center Space for Floating Button */}
        <View style={styles.centerSpacer} />

        {/* Right Side: Histórico & Ajustes */}
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => onTabChange('historico')}>
          <Feather
            name="clock"
            size={20}
            color={activeTab === 'historico' ? Palette.primary : Palette.subtitle}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'historico' && styles.tabLabelActive,
            ]}>
            Histórico
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => onTabChange('ajustes')}>
          <Feather
            name="sliders"
            size={20}
            color={activeTab === 'ajustes' ? Palette.primary : Palette.subtitle}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'ajustes' && styles.tabLabelActive,
            ]}>
            Ajustes
          </Text>
        </TouchableOpacity>

        {/* Floating Scan Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onScanPress}
          style={styles.floatingButton}
          accessibilityLabel="Escanear item">
          <MaterialCommunityIcons name="barcode-scan" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  centerSpacer: {
    width: 68,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.subtitle,
  },
  tabLabelActive: {
    color: Palette.primary,
  },
  floatingButton: {
    position: 'absolute',
    left: '50%',
    top: -28,
    marginLeft: -32,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 12px rgba(15, 122, 107, 0.35)',
      },
    }),
  },
});
