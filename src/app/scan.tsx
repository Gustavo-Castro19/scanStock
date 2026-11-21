import { useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { CollectionType } from '@/types/catalog';
import { Palette } from '@/constants/theme';

export default function CameraScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedCategory, setSelectedCategory] = useState<CollectionType>('Livros');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  const handleBarcodeScanned = (scanningResult: { data: string; type: string }) => {
    if (!isScanning) return;
    setIsScanning(false);
    // Custom item from real scan
    Alert.alert(
      'Código lido!',
      `Conteúdo: ${scanningResult.data}\nTipo: ${scanningResult.type}`,
      [
        {
          text: 'Cadastrar',
          onPress: () => {
            router.push({
              pathname: '/new-item',
              params: {
                scannedCode: scanningResult.data,
                collection: selectedCategory,
              },
            });
          },
        },
        {
          text: 'Continuar escaneando',
          onPress: () => setIsScanning(true),
        },
      ]
    );
  };

  const handleManualEntry = () => {
    router.push({ pathname: '/new-item', params: { collection: selectedCategory } });
  };

  const categories: CollectionType[] = ['Livros', 'Laboratório', 'Estoque'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Camera preview */}
      <View style={StyleSheet.absoluteFill}>
        {permission?.granted && Platform.OS !== 'web' ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            enableTorch={torchEnabled}
            onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39', 'upc_a'],
            }}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.cameraMockBackground]} />
        )}
      </View>

      {/* TOP BAR matching prototype */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.circleButton}
          accessibilityLabel="Fechar">
          <Feather name="x" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Category Pill Switcher */}
        <View style={styles.categoryPillContainer}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillSelected,
                ]}>
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected
                      ? styles.categoryPillTextSelected
                      : styles.categoryPillTextUnselected,
                  ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Torch / Flash Button */}
        <TouchableOpacity
          onPress={() => setTorchEnabled((prev) => !prev)}
          style={[
            styles.circleButton,
            torchEnabled && { backgroundColor: Palette.primary },
          ]}
          accessibilityLabel="Flash">
          <MaterialCommunityIcons
            name={torchEnabled ? 'flash' : 'flash-outline'}
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      {/* Scan target */}
      <View style={styles.viewfinderContainer}>
        <View style={styles.targetBracket} />

      </View>

      {/* Permission helper if camera not granted */}
      {!permission?.granted && Platform.OS !== 'web' && (
        <TouchableOpacity
          style={styles.permissionBar}
          onPress={requestPermission}>
          <Text style={styles.permissionText}>
            Toque aqui para conceder acesso à câmera
          </Text>
        </TouchableOpacity>
      )}

      {/* Actions */}
      <View style={styles.bottomSheet}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleManualEntry}
          style={styles.addButton}>
          <Text style={styles.addButtonText}>Cadastrar manualmente</Text>
        </TouchableOpacity>

        <Text style={styles.helperFooterText}>
          Leia um código de barras ou preencha os dados manualmente
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.darkBg,
  },
  cameraMockBackground: {
    backgroundColor: '#0E1211',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    zIndex: 10,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.darkSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillContainer: {
    flexDirection: 'row',
    backgroundColor: Palette.darkSurface,
    borderRadius: 22,
    padding: 4,
  },
  categoryPill: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  categoryPillSelected: {
    backgroundColor: '#FFFFFF',
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryPillTextSelected: {
    color: Palette.darkBg,
  },
  categoryPillTextUnselected: {
    color: '#B8C2BE',
  },
  viewfinderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  targetBracket: {
    position: 'absolute',
    width: 266,
    height: 326,
    borderWidth: 3,
    borderColor: Palette.reticle,
    borderRadius: 18,
  },
  permissionBar: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 14,
  },
  addButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helperFooterText: {
    textAlign: 'center',
    fontSize: 13,
    color: Palette.subtitle,
  },
});
