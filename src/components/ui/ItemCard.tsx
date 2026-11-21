import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { CatalogItem } from '@/types/catalog';
import { Palette } from '@/constants/theme';
import { StatusBadge } from './StatusBadge';

interface ItemCardProps {
  item: CatalogItem;
  onPress: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onPress }) => {
  const getCategoryIcon = () => {
    switch (item.collection) {
      case 'Livros':
        return <Feather name="book" size={20} color="#FFFFFF" />;
      case 'Laboratório':
        return <Feather name="cpu" size={20} color="#FFFFFF" />;
      case 'Estoque':
        return <Feather name="box" size={20} color="#FFFFFF" />;
      default:
        return <Feather name="layers" size={20} color="#FFFFFF" />;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.container}>
      <View style={[styles.avatar, { backgroundColor: item.avatarColor || Palette.livros }]}>
        {item.photos?.[0] ? <Image source={{ uri: item.photos[0] }} style={styles.avatarImage} contentFit="cover" /> : getCategoryIcon()}
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.collection} · {item.location}
        </Text>
      </View>
      <StatusBadge label={item.statusBadge} type={item.statusType} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.darkText,
  },
  subtitle: {
    fontSize: 13,
    color: Palette.subtitle,
    marginTop: 2,
  },
});
