import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Palette } from '@/constants/theme';

export default function GuideScreen() {
  const router = useRouter();

  const steps = [
    {
      step: '1',
      title: 'Apontar',
      desc: 'Escolha a coleção e aponte a câmera para um código de barras compatível.',
      highlight: false,
    },
    {
      step: '2',
      title: 'Reconhecer',
      desc: 'O código lido é preenchido no cadastro. Nome, local e quantidade são informados por você.',
      highlight: true,
    },
    {
      step: '3',
      title: 'Confirmar',
      desc: 'Revise nome, local e quantidade. Corrija o que estiver errado.',
      highlight: false,
    },
    {
      step: '4',
      title: 'Salvar',
      desc: 'O item é salvo no acervo depois que você revisa os dados.',
      highlight: true,
    },
    {
      step: '5',
      title: 'Consultar',
      desc: 'Busque, veja onde está, registre empréstimo ou devolução de estoque.',
      highlight: false,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeBtn}
          accessibilityLabel="Fechar guia">
          <Feather name="x" size={22} color={Palette.darkText} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Title & subtitle matching prototype */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Fluxo: do objeto ao acervo</Text>
          <Text style={styles.subtitle}>
            Cinco passos, o mesmo caminho para livros, equipamentos e estoque.
          </Text>
        </View>

        {/* Steps List */}
        <View style={styles.stepsContainer}>
          {steps.map((item, idx) => (
            <View key={item.step} style={styles.stepWrapper}>
              <View
                style={[
                  styles.stepCard,
                  item.highlight ? styles.stepCardHighlighted : styles.stepCardNormal,
                ]}>
                <View
                  style={[
                    styles.stepBadge,
                    item.highlight ? styles.stepBadgeHighlighted : styles.stepBadgeNormal,
                  ]}>
                  <Text style={styles.stepBadgeText}>{item.step}</Text>
                </View>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDesc}>{item.desc}</Text>
              </View>

              {idx < steps.length - 1 && (
                <View style={styles.arrowContainer}>
                  <Feather name="arrow-down" size={20} color={Palette.muted} />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Alert Card "Se não reconhecer" matching prototype */}
        <View style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#7A4A00" />
            <Text style={styles.noticeTitle}>Se não reconhecer</Text>
          </View>
          <Text style={styles.noticeText}>
            Preencha o nome, local e demais dados manualmente. O item pode ser completado depois.
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            router.back();
            router.push('/scan');
          }}
          style={styles.startScanButton}>
          <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
          <Text style={styles.startScanButtonText}>Iniciar escaneamento agora</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.lightSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    gap: 24,
  },
  titleSection: {
    gap: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Palette.darkText,
  },
  subtitle: {
    fontSize: 15,
    color: Palette.subtitle,
    lineHeight: 20,
  },
  stepsContainer: {
    gap: 8,
  },
  stepWrapper: {
    alignItems: 'stretch',
  },
  stepCard: {
    borderRadius: 18,
    padding: 18,
    gap: 8,
  },
  stepCardNormal: {
    backgroundColor: Palette.lightSurface,
  },
  stepCardHighlighted: {
    backgroundColor: Palette.primaryLight,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeNormal: {
    backgroundColor: Palette.darkText,
  },
  stepBadgeHighlighted: {
    backgroundColor: Palette.primary,
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.darkText,
  },
  stepDesc: {
    fontSize: 14,
    lineHeight: 20,
    color: Palette.description,
  },
  arrowContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  noticeCard: {
    backgroundColor: Palette.noticeBg,
    borderRadius: 14,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F8E2C0',
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noticeTitle: {
    fontWeight: '700',
    color: Palette.warningText,
    fontSize: 14,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
    color: Palette.description,
  },
  startScanButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: Palette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  startScanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
