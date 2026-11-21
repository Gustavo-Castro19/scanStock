import React, { useState } from 'react';
import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useCatalog } from '@/context/CatalogContext';
import { CollectionType, ItemStatus } from '@/types/catalog';
import { Palette } from '@/constants/theme';

export default function NewItemScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name?: string;
    collection?: string;
    location?: string;
    code?: string;
    quantity?: string;
    scannedCode?: string;
  }>();

  const { addItem } = useCatalog();

  const [title, setTitle] = useState(params.name || '');
  const [collection, setCollection] = useState<CollectionType>(
    (params.collection as CollectionType) || 'Laboratório'
  );
  const [location, setLocation] = useState(params.location || '');
  const [code, setCode] = useState(params.scannedCode || params.code || '');
  const [quantity, setQuantity] = useState(
    params.quantity ? parseInt(params.quantity, 10) || 1 : 1
  );
  const [status, setStatus] = useState<ItemStatus>(
    collection === 'Livros' ? 'Na estante' : collection === 'Estoque' ? 'Estoque regular' : 'Disponível'
  );
  const [photos, setPhotos] = useState<string[]>([]);

  const collections: CollectionType[] = ['Livros', 'Laboratório', 'Estoque'];

  const getStatusOptions = (): ItemStatus[] => {
    if (collection === 'Livros') {
      return ['Na estante', 'Emprestado', 'Manutenção'];
    }
    if (collection === 'Estoque') {
      return ['Estoque regular', 'Estoque baixo'];
    }
    return ['Disponível', 'Emprestado', 'Manutenção'];
  };

  const savePhoto = async (uri: string, fileName?: string | null) => {
    const extension = fileName?.split('.').pop()?.toLowerCase() || uri.match(/\.([a-z0-9]+)(?:\?|$)/i)?.[1] || 'jpg';
    const destination = new File(Paths.document, `item-${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`);
    await new File(uri).copy(destination);
    return destination.uri;
  };

  const addPickedPhotos = async (assets: ImagePicker.ImagePickerAsset[]) => {
    try {
      const savedPhotos = await Promise.all(assets.map((asset) => savePhoto(asset.uri, asset.fileName)));
      setPhotos((current) => [...current, ...savedPhotos].slice(0, 3));
    } catch {
      Alert.alert('Não foi possível salvar a foto', 'Tente escolher ou tirar a foto novamente.');
    }
  };

  const handleChooseFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para adicionar fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 3 - photos.length,
      quality: 0.8,
    });
    if (!result.canceled) await addPickedPhotos(result.assets);
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso à câmera para tirar uma foto.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) await addPickedPhotos(result.assets);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Por favor, informe o nome do item.');
      return;
    }

    const avatarColor =
      collection === 'Livros'
        ? Palette.livros
        : collection === 'Laboratório'
        ? Palette.laboratorio
        : Palette.estoque;

    let statusType: 'success' | 'warning' | 'danger' | 'neutral' = 'success';
    if (status === 'Emprestado' || status === 'Estoque baixo') statusType = 'warning';
    if (status === 'Manutenção') statusType = 'danger';

    let statusBadge: string = status;
    if (collection === 'Estoque') {
      statusBadge = `${quantity} un.${status === 'Estoque baixo' ? ' · baixo' : ''}`;
    }

    try {
      await addItem({
        title: title.trim(),
        subtitle: `${collection} · ${location.trim() || 'Sem local'}`,
        collection,
        location: location.trim() || 'Não especificado',
        code: code.trim(),
        quantity,
        status,
        statusBadge,
        statusType,
        avatarColor,
        photos,
      });
      router.replace('/');
    } catch {
      alert('Não foi possível salvar o item. Verifique o armazenamento e tente novamente.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Voltar">
            <Feather name="arrow-left" size={22} color={Palette.darkText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novo item</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* PHOTO BANNER matching prototype */}
          <View style={styles.photoSection}>
            <View style={styles.photoBanner}>
              {photos.length ? (
                <Image source={{ uri: photos[photos.length - 1] }} style={StyleSheet.absoluteFill} contentFit="cover" />
              ) : (
                <View style={styles.cameraIconContainer}>
                  <View style={styles.lensOuter}><View style={styles.lensInner} /></View>
                </View>
              )}
              <View style={styles.photoCountBadge}>
                <Text style={styles.photoCountText}>{photos.length} de 3 fotos</Text>
              </View>
            </View>
            <View style={styles.photoActions}>
              <TouchableOpacity disabled={photos.length >= 3} onPress={handleChooseFromGallery} style={styles.photoAction}>
                <Feather name="image" size={17} color={Palette.primary} />
                <Text style={styles.photoActionText}>Galeria</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={photos.length >= 3} onPress={handleTakePhoto} style={styles.photoAction}>
                <Feather name="camera" size={17} color={Palette.primary} />
                <Text style={styles.photoActionText}>Tirar foto</Text>
              </TouchableOpacity>
              {photos.length > 0 && (
                <TouchableOpacity onPress={() => setPhotos((current) => current.slice(0, -1))} style={styles.photoAction}>
                  <Feather name="trash-2" size={17} color={Palette.dangerText} />
                  <Text style={[styles.photoActionText, { color: Palette.dangerText }]}>Remover</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* FORM FIELDS */}
          <View style={styles.formContainer}>
            {/* Nome */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nome</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Nome do item ou livro"
                  placeholderTextColor={Palette.muted}
                />
              </View>
            </View>

            {/* Coleção & Local */}
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.fieldLabel}>Coleção</Text>
                <View style={styles.collectionSelector}>
                  {collections.map((col) => {
                    const isSelected = collection === col;
                    return (
                      <TouchableOpacity
                        key={col}
                        onPress={() => {
                          setCollection(col);
                          const validStatuses = col === 'Livros'
                            ? ['Na estante', 'Emprestado', 'Manutenção']
                            : col === 'Estoque'
                            ? ['Estoque regular', 'Estoque baixo']
                            : ['Disponível', 'Emprestado', 'Manutenção'];
                          if (!validStatuses.includes(status)) {
                            setStatus(col === 'Livros' ? 'Na estante' : col === 'Estoque' ? 'Estoque regular' : 'Disponível');
                          }
                        }}
                        style={[
                          styles.colOption,
                          isSelected && styles.colOptionSelected,
                        ]}>
                        <Text
                          style={[
                            styles.colOptionText,
                            isSelected && styles.colOptionTextSelected,
                          ]}>
                          {col}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Local */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Local</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Ex: Armário B2, Estante 2"
                  placeholderTextColor={Palette.muted}
                />
              </View>
            </View>

            {/* Código & Quantidade */}
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.fieldLabel}>Código</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    value={code}
                    onChangeText={setCode}
                    placeholder="[Nº PATRIMÔNIO]"
                    placeholderTextColor={Palette.muted}
                  />
                </View>
              </View>

              <View style={styles.flex1}>
                <Text style={styles.fieldLabel}>Quantidade</Text>
                <View style={[styles.inputBox, styles.stepperBox]}>
                  <Text style={styles.stepperNumber}>{quantity}</Text>
                  <View style={styles.stepperButtons}>
                    <TouchableOpacity
                      onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                      style={styles.stepperBtn}>
                      <Text style={styles.stepperSymbol}>−</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setQuantity((q) => q + 1)}
                      style={styles.stepperBtn}>
                      <Text style={styles.stepperSymbol}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Situação */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Situação</Text>
              <View style={styles.statusRow}>
                {getStatusOptions().map((st) => {
                  const isSelected = status === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      activeOpacity={0.7}
                      onPress={() => setStatus(st)}
                      style={[
                        styles.statusPill,
                        isSelected && styles.statusPillSelected,
                      ]}>
                      <Text
                        style={[
                          styles.statusPillText,
                          isSelected && styles.statusPillTextSelected,
                        ]}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* SAVE CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSave}
            style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Salvar no acervo</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.lightBg,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Palette.darkText,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  photoBanner: {
    marginHorizontal: 16,
    height: 180,
    borderRadius: 20,
    backgroundColor: '#C5D0CB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  photoSection: {
    gap: 10,
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  photoAction: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  photoActionText: {
    color: Palette.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  cameraIconContainer: {
    width: 120,
    height: 84,
    borderRadius: 12,
    backgroundColor: '#14171A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lensOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2B3430',
    borderWidth: 4,
    borderColor: '#9AA8A2',
  },
  lensInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#14171A',
    marginTop: 12,
    marginLeft: 12,
  },
  photoCountBadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  photoCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.darkText,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Palette.subtitle,
  },
  inputBox: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Palette.inputBorder,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 16,
    color: Palette.darkText,
    paddingVertical: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  collectionSelector: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  colOption: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Palette.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colOptionSelected: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  colOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.darkText,
  },
  colOptionTextSelected: {
    color: '#FFFFFF',
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.darkText,
  },
  stepperButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepperSymbol: {
    color: Palette.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusPill: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Palette.inputBorder,
  },
  statusPillSelected: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  statusPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.darkText,
  },
  statusPillTextSelected: {
    color: '#FFFFFF',
  },
  footer: {
    marginTop: 'auto',
    padding: 16,
  },
  saveButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
