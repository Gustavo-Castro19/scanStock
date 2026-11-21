import React, { useState } from 'react';
import { Image } from 'expo-image';
import {
  Alert,
  Modal,
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
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Palette } from '@/constants/theme';

export default function ItemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getItemById, registerLoan, registerReturn, moveItem, deleteItem } = useCatalog();

  const item = getItemById(id || '');

  // Loan Modal state
  const [loanModalVisible, setLoanModalVisible] = useState(false);
  const [borrowerName, setBorrowerName] = useState('');
  const [returnDate, setReturnDate] = useState('28/11/2026');

  // Move Modal state
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [newLocation, setNewLocation] = useState('');

  if (!item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Feather name="alert-circle" size={48} color={Palette.muted} />
          <Text style={styles.notFoundTitle}>Item não encontrado</Text>
          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>Voltar ao Acervo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isBorrowed = item.status === 'Emprestado';

  const handleReturn = async () => {
    Alert.alert(
      'Registrar devolução',
      `Confirmar a devolução de "${item.title}" para ${item.location}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar devolução',
          onPress: async () => {
            try {
              await registerReturn(item.id);
            } catch {
              Alert.alert('Falha ao salvar', 'Não foi possível registrar a devolução. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  const handleConfirmLoan = async () => {
    if (!borrowerName.trim()) {
      alert('Informe o nome do responsável pelo empréstimo.');
      return;
    }
    try {
      await registerLoan(item.id, borrowerName.trim(), returnDate.trim() || '28/11/2026');
      setLoanModalVisible(false);
      setBorrowerName('');
    } catch {
      Alert.alert('Falha ao salvar', 'Não foi possível registrar o empréstimo. Tente novamente.');
    }
  };

  const handleConfirmMove = async () => {
    if (!newLocation.trim()) {
      alert('Informe a nova localização do item.');
      return;
    }
    try {
      await moveItem(item.id, newLocation.trim());
      setMoveModalVisible(false);
      setNewLocation('');
    } catch {
      Alert.alert('Falha ao salvar', 'Não foi possível mover o item. Tente novamente.');
    }
  };

  const handleDelete = () => {
    Alert.alert('Excluir item', `Tem certeza que deseja excluir "${item.title}" do acervo?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteItem(item.id);
            router.replace('/');
          } catch {
            Alert.alert('Falha ao excluir', 'Não foi possível excluir o item. Tente novamente.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* PHOTO BANNER matching prototype */}
        <View style={[styles.photoHeader, { backgroundColor: '#B9C5BF' }]}>
          {item.photos?.[0] && <Image source={{ uri: item.photos[0] }} style={StyleSheet.absoluteFill} contentFit="cover" />}
          <TouchableOpacity
            style={styles.floatingHeaderBtnLeft}
            onPress={() => router.back()}
            accessibilityLabel="Voltar">
            <Feather name="arrow-left" size={20} color={Palette.darkText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.floatingHeaderBtnRight}
            onPress={handleDelete}
            accessibilityLabel="Excluir">
            <Feather name="trash-2" size={18} color={Palette.dangerText} />
          </TouchableOpacity>

          {/* Visual camera/item mock */}
          {!item.photos?.[0] && <View style={[styles.itemMockAvatar, { backgroundColor: item.avatarColor }]}>
            <View style={styles.lensOuter}><View style={styles.lensInner} /></View>
          </View>}

          <View style={styles.photoCountBadge}>
            <Text style={styles.photoCountText}>{item.photos?.length || 0} / 3</Text>
          </View>
        </View>

        {/* DETAILS SCROLL BODY */}
        <ScrollView contentContainerStyle={styles.detailsContent}>
          {/* Status badge & Title */}
          <View style={styles.titleSection}>
            <StatusBadge label={item.statusBadge} type={item.statusType} />
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemSubtitle}>
              {item.collection} · adicionada em {item.createdAt}
            </Text>
          </View>

          {/* Código & Local Cards */}
          <View style={styles.infoCardsRow}>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardLabel}>Código</Text>
              <Text style={styles.infoCardValue}>{item.code || '[Nº PATRIMÔNIO]'}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardLabel}>Local</Text>
              <Text style={styles.infoCardValue}>{item.location}</Text>
            </View>
          </View>

          {/* Custody Card if Emprestado matching prototype */}
          {isBorrowed && (
            <View style={styles.borrowedBox}>
              <Text style={styles.borrowedLabel}>Com</Text>
              <Text style={styles.borrowedName}>
                {item.borrowedTo?.responsible || '[NOME DO RESPONSÁVEL]'}
              </Text>
              <Text style={styles.borrowedDate}>
                Devolução prevista: {item.borrowedTo?.expectedReturnDate || 'Em breve'}
              </Text>
            </View>
          )}

          {/* Histórico Timeline matching prototype */}
          <View style={styles.historySection}>
            <Text style={styles.historySectionTitle}>Histórico</Text>
            <View style={styles.timelineContainer}>
              {item.history.map((event, idx) => (
                <View key={event.id || idx} style={styles.timelineRow}>
                  <View
                    style={[
                      styles.timelineDot,
                      { backgroundColor: event.color || Palette.primary },
                    ]}
                  />
                  <View style={styles.timelineTextContainer}>
                    <Text style={styles.timelineTitle}>{event.title}</Text>
                    <Text style={styles.timelineDesc}>
                      {event.date} {event.responsible ? `· ${event.responsible}` : ''}
                    </Text>
                    {event.description && event.description !== event.responsible && (
                      <Text style={styles.timelineNote}>{event.description}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* BOTTOM ACTION BAR matching prototype */}
        <View style={styles.bottomActionBar}>
          {isBorrowed ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleReturn}
              style={styles.primaryActionButton}>
              <Text style={styles.primaryActionText}>Registrar devolução</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setLoanModalVisible(true)}
              style={styles.primaryActionButton}>
              <Text style={styles.primaryActionText}>Emprestar item</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setNewLocation(item.location);
              setMoveModalVisible(true);
            }}
            style={styles.secondaryActionButton}>
            <Text style={styles.secondaryActionText}>Mover</Text>
          </TouchableOpacity>
        </View>

        {/* LOAN MODAL */}
        <Modal
          visible={loanModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setLoanModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Emprestar item</Text>
              <Text style={styles.modalSubtitle}>
                Informe quem ficará com &quot;{item.title}&quot;
              </Text>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Nome do responsável</Text>
                <TextInput
                  style={styles.modalInput}
                  value={borrowerName}
                  onChangeText={setBorrowerName}
                  placeholder="Ex: Prof. Carlos Silva"
                  placeholderTextColor={Palette.muted}
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Devolução prevista</Text>
                <TextInput
                  style={styles.modalInput}
                  value={returnDate}
                  onChangeText={setReturnDate}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={Palette.muted}
                />
              </View>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setLoanModalVisible(false)}>
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={handleConfirmLoan}>
                  <Text style={styles.modalConfirmText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MOVE MODAL */}
        <Modal
          visible={moveModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setMoveModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Mover item</Text>
              <Text style={styles.modalSubtitle}>
                Local atual: {item.location}
              </Text>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Nova localização</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newLocation}
                  onChangeText={setNewLocation}
                  placeholder="Ex: Armário C1, Bancada 2"
                  placeholderTextColor={Palette.muted}
                />
              </View>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setMoveModalVisible(false)}>
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={handleConfirmMove}>
                  <Text style={styles.modalConfirmText}>Salvar local</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Palette.darkText,
  },
  backLink: {
    padding: 10,
  },
  backLinkText: {
    color: Palette.primary,
    fontWeight: '600',
  },
  photoHeader: {
    height: 220,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingHeaderBtnLeft: {
    position: 'absolute',
    left: 12,
    top: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  floatingHeaderBtnRight: {
    position: 'absolute',
    right: 12,
    top: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  itemMockAvatar: {
    width: 150,
    height: 104,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lensOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#2B3430',
    borderWidth: 5,
    borderColor: '#9AA8A2',
  },
  lensInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#14171A',
    marginTop: 14,
    marginLeft: 14,
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
  detailsContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 32,
  },
  titleSection: {
    gap: 6,
  },
  itemTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Palette.darkText,
    marginTop: 6,
  },
  itemSubtitle: {
    fontSize: 14,
    color: Palette.subtitle,
  },
  infoCardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Palette.lightSurface,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  infoCardLabel: {
    fontSize: 12,
    color: Palette.subtitle,
  },
  infoCardValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.darkText,
    marginTop: 2,
  },
  borrowedBox: {
    backgroundColor: Palette.noticeBg,
    borderRadius: 14,
    padding: 14,
    gap: 2,
  },
  borrowedLabel: {
    fontSize: 12,
    color: Palette.warningText,
    fontWeight: '600',
  },
  borrowedName: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.darkText,
  },
  borrowedDate: {
    fontSize: 13,
    color: Palette.subtitle,
  },
  historySection: {
    marginTop: 8,
  },
  historySectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.darkText,
    marginBottom: 12,
  },
  timelineContainer: {
    gap: 14,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  timelineTextContainer: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.darkText,
  },
  timelineDesc: {
    fontSize: 13,
    color: Palette.subtitle,
    marginTop: 1,
  },
  timelineNote: {
    fontSize: 12,
    color: Palette.muted,
    marginTop: 2,
  },
  bottomActionBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
    backgroundColor: '#FFFFFF',
  },
  primaryActionButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActionButton: {
    width: 96,
    height: 56,
    borderWidth: 1,
    borderColor: Palette.inputBorder,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    color: Palette.darkText,
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.darkText,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Palette.subtitle,
  },
  modalField: {
    gap: 6,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Palette.subtitle,
  },
  modalInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.inputBorder,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Palette.darkText,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.subtitle,
  },
  modalConfirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
