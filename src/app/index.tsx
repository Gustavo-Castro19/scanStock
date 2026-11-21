import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCatalog } from '@/context/CatalogContext';
import { CustomBottomBar, MainTabType } from '@/components/ui/CustomBottomBar';
import { ItemCard } from '@/components/ui/ItemCard';
import { CollectionType } from '@/types/catalog';
import { Palette } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { items, resetToDefaultItems } = useCatalog();

  const [activeTab, setActiveTab] = useState<MainTabType>('acervo');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<'Todos' | CollectionType>('Todos');

  // Filter items for the Acervo tab
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCollection =
        selectedCollection === 'Todos' || item.collection === selectedCollection;

      if (!matchesCollection) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSubtitle = item.subtitle?.toLowerCase().includes(q) ?? false;
      const matchLocation = item.location.toLowerCase().includes(q);
      const matchCode = item.code?.toLowerCase().includes(q) ?? false;
      const matchStatus = item.statusBadge?.toLowerCase().includes(q) ?? false;

      return matchTitle || matchSubtitle || matchLocation || matchCode || matchStatus;
    });
  }, [items, selectedCollection, searchQuery]);

  // Aggregate statistics for Collections tab
  const stats = useMemo(() => {
    const livros = items.filter((i) => i.collection === 'Livros');
    const lab = items.filter((i) => i.collection === 'Laboratório');
    const estoque = items.filter((i) => i.collection === 'Estoque');

    return {
      livros: {
        total: livros.length,
        naEstante: livros.filter((i) => i.status === 'Na estante' || i.status === 'Disponível').length,
        emprestados: livros.filter((i) => i.status === 'Emprestado').length,
      },
      lab: {
        total: lab.length,
        disponivel: lab.filter((i) => i.status === 'Disponível').length,
        emprestado: lab.filter((i) => i.status === 'Emprestado').length,
        manutencao: lab.filter((i) => i.status === 'Manutenção').length,
      },
      estoque: {
        total: estoque.length,
        totalUnidades: estoque.reduce((acc, curr) => acc + (curr.quantity || 0), 0),
        baixoEstoque: estoque.filter((i) => i.statusType === 'warning').length,
      },
    };
  }, [items]);

  // Combined audit log for Histórico tab
  const allHistory = useMemo(() => {
    const events: {
      eventId: string;
      itemId: string;
      itemTitle: string;
      itemCollection: CollectionType;
      avatarColor: string;
      title: string;
      description: string;
      date: string;
      color?: string;
    }[] = [];

    items.forEach((item) => {
      item.history.forEach((h) => {
        events.push({
          eventId: h.id,
          itemId: item.id,
          itemTitle: item.title,
          itemCollection: item.collection,
          avatarColor: item.avatarColor,
          title: h.title,
          description: h.description,
          date: h.date,
          color: h.color,
        });
      });
    });

    return events;
  }, [items]);

  const collections: ('Todos' | CollectionType)[] = ['Todos', 'Livros', 'Laboratório', 'Estoque'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* TAB 1: ACERVO */}
        {activeTab === 'acervo' && (
          <View style={styles.flex1}>
            {/* Header matching prototype */}
            <View style={styles.header}>
              <View style={styles.headerTopRow}>
                <View>
                  <Text style={styles.screenTitle}>Acervo</Text>
                  <Text style={styles.screenSubtitle}>
                    {items.length} itens em 3 coleções
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push('/new-item')}
                  style={styles.headerAddButton}
                  accessibilityLabel="Adicionar manualmente">
                  <Feather name="plus" size={20} color={Palette.primary} />
                </TouchableOpacity>
              </View>

              {/* Search Bar matching prototype */}
              <View style={styles.searchBar}>
                <Feather name="search" size={18} color={Palette.subtitle} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar por nome, código ou local"
                  placeholderTextColor={Palette.subtitle}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  clearButtonMode="while-editing"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Feather name="x-circle" size={16} color={Palette.subtitle} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Filter Chips matching prototype */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContainer}>
                {collections.map((col) => {
                  const isSelected = selectedCollection === col;
                  return (
                    <TouchableOpacity
                      key={col}
                      onPress={() => setSelectedCollection(col)}
                      activeOpacity={0.7}
                      style={[
                        styles.chip,
                        isSelected ? styles.chipSelected : styles.chipUnselected,
                      ]}>
                      <Text
                        style={[
                          styles.chipText,
                          isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                        ]}>
                        {col}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Item List */}
            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <ItemCard
                  item={item}
                  onPress={() => router.push(`/item/${item.id}`)}
                />
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Feather name="inbox" size={48} color={Palette.muted} />
                  <Text style={styles.emptyTitle}>Nenhum item encontrado</Text>
                  <Text style={styles.emptySubtitle}>
                    {searchQuery
                      ? 'Tente buscar com outros termos.'
                      : 'Esta coleção ainda não possui itens.'}
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => router.push('/new-item')}>
                    <Text style={styles.emptyButtonText}>Cadastrar novo item</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </View>
        )}

        {/* TAB 2: COLEÇÕES */}
        {activeTab === 'colecoes' && (
          <ScrollView style={styles.flex1} contentContainerStyle={styles.tabContentScroll}>
            <View style={styles.tabHeader}>
              <Text style={styles.screenTitle}>Coleções</Text>
              <Text style={styles.screenSubtitle}>Visão geral das categorias do acervo</Text>
            </View>

            {/* Livros Card */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setSelectedCollection('Livros');
                setActiveTab('acervo');
              }}
              style={styles.collectionCard}>
              <View style={[styles.collectionIconBox, { backgroundColor: Palette.livros }]}>
                <Feather name="book-open" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.collectionInfo}>
                <Text style={styles.collectionTitle}>Livros</Text>
                <Text style={styles.collectionDesc}>
                  Biblioteca pessoal, romances, técnicos e acadêmicos.
                </Text>
                <View style={styles.statPillsRow}>
                  <View style={styles.statPill}>
                    <Text style={styles.statPillLabel}>Total:</Text>
                    <Text style={styles.statPillVal}>{stats.livros.total}</Text>
                  </View>
                  <View style={[styles.statPill, { backgroundColor: Palette.successBg }]}>
                    <Text style={[styles.statPillLabel, { color: Palette.successText }]}>Na estante:</Text>
                    <Text style={[styles.statPillVal, { color: Palette.successText }]}>{stats.livros.naEstante}</Text>
                  </View>
                  {stats.livros.emprestados > 0 && (
                    <View style={[styles.statPill, { backgroundColor: Palette.warningBg }]}>
                      <Text style={[styles.statPillLabel, { color: Palette.warningText }]}>Emprestados:</Text>
                      <Text style={[styles.statPillVal, { color: Palette.warningText }]}>{stats.livros.emprestados}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {/* Laboratório Card */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setSelectedCollection('Laboratório');
                setActiveTab('acervo');
              }}
              style={styles.collectionCard}>
              <View style={[styles.collectionIconBox, { backgroundColor: Palette.laboratorio }]}>
                <Feather name="cpu" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.collectionInfo}>
                <Text style={styles.collectionTitle}>Laboratório</Text>
                <Text style={styles.collectionDesc}>
                  Equipamentos, instrumentos de medição e maquinário.
                </Text>
                <View style={styles.statPillsRow}>
                  <View style={styles.statPill}>
                    <Text style={styles.statPillLabel}>Total:</Text>
                    <Text style={styles.statPillVal}>{stats.lab.total}</Text>
                  </View>
                  <View style={[styles.statPill, { backgroundColor: Palette.successBg }]}>
                    <Text style={[styles.statPillLabel, { color: Palette.successText }]}>Disponíveis:</Text>
                    <Text style={[styles.statPillVal, { color: Palette.successText }]}>{stats.lab.disponivel}</Text>
                  </View>
                  <View style={[styles.statPill, { backgroundColor: Palette.warningBg }]}>
                    <Text style={[styles.statPillLabel, { color: Palette.warningText }]}>Emprestados:</Text>
                    <Text style={[styles.statPillVal, { color: Palette.warningText }]}>{stats.lab.emprestado}</Text>
                  </View>
                  {stats.lab.manutencao > 0 && (
                    <View style={[styles.statPill, { backgroundColor: Palette.dangerBg }]}>
                      <Text style={[styles.statPillLabel, { color: Palette.dangerText }]}>Manutenção:</Text>
                      <Text style={[styles.statPillVal, { color: Palette.dangerText }]}>{stats.lab.manutencao}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {/* Estoque Card */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setSelectedCollection('Estoque');
                setActiveTab('acervo');
              }}
              style={styles.collectionCard}>
              <View style={[styles.collectionIconBox, { backgroundColor: Palette.estoque }]}>
                <Feather name="box" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.collectionInfo}>
                <Text style={styles.collectionTitle}>Estoque</Text>
                <Text style={styles.collectionDesc}>
                  Consumíveis, embalagens, fitas e insumos gerais.
                </Text>
                <View style={styles.statPillsRow}>
                  <View style={styles.statPill}>
                    <Text style={styles.statPillLabel}>Itens:</Text>
                    <Text style={styles.statPillVal}>{stats.estoque.total}</Text>
                  </View>
                  <View style={[styles.statPill, { backgroundColor: Palette.successBg }]}>
                    <Text style={[styles.statPillLabel, { color: Palette.successText }]}>Unidades:</Text>
                    <Text style={[styles.statPillVal, { color: Palette.successText }]}>{stats.estoque.totalUnidades}</Text>
                  </View>
                  {stats.estoque.baixoEstoque > 0 && (
                    <View style={[styles.statPill, { backgroundColor: Palette.warningBg }]}>
                      <Text style={[styles.statPillLabel, { color: Palette.warningText }]}>Atenção / Baixo:</Text>
                      <Text style={[styles.statPillVal, { color: Palette.warningText }]}>{stats.estoque.baixoEstoque}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* TAB 3: HISTÓRICO */}
        {activeTab === 'historico' && (
          <View style={styles.flex1}>
            <View style={styles.tabHeader}>
              <Text style={styles.screenTitle}>Histórico</Text>
              <Text style={styles.screenSubtitle}>Linha do tempo de movimentações e cadastros</Text>
            </View>

            <FlatList
              data={allHistory}
              keyExtractor={(item) => item.eventId}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push(`/item/${item.itemId}`)}
                  style={styles.historyRow}>
                  <View
                    style={[
                      styles.historyDot,
                      { backgroundColor: item.color || Palette.primary },
                    ]}
                  />
                  <View style={styles.historyContent}>
                    <View style={styles.historyTopLine}>
                      <Text style={styles.historyTitle}>{item.title}</Text>
                      <Text style={styles.historyDate}>{item.date}</Text>
                    </View>
                    <Text style={styles.historyItemName}>{item.itemTitle} · {item.itemCollection}</Text>
                    <Text style={styles.historyDesc}>{item.description}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* TAB 4: AJUSTES */}
        {activeTab === 'ajustes' && (
          <ScrollView style={styles.flex1} contentContainerStyle={styles.tabContentScroll}>
            <View style={styles.tabHeader}>
              <Text style={styles.screenTitle}>Ajustes</Text>
              <Text style={styles.screenSubtitle}>Configurações e guia do sistema</Text>
            </View>

            {/* Workflow Guide Card */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/guide')}
              style={styles.guideCard}>
              <View style={styles.guideCardHeader}>
                <View style={styles.guideNumberBadge}>
                  <Feather name="compass" size={18} color="#FFFFFF" />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.guideCardTitle}>Fluxo: do objeto ao acervo</Text>
                  <Text style={styles.guideCardSubtitle}>
                    Cinco passos, o mesmo caminho para livros, equipamentos e estoque.
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color={Palette.subtitle} />
              </View>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Operações Rápidas</Text>

              <TouchableOpacity
                style={styles.settingsRow}
                onPress={() => router.push('/scan')}>
                <View style={[styles.settingsIconBox, { backgroundColor: Palette.primaryLight }]}>
                  <MaterialCommunityIcons name="camera" size={20} color={Palette.primary} />
                </View>
                <Text style={styles.settingsRowText}>Abrir scanner de câmera</Text>
                <Feather name="chevron-right" size={18} color={Palette.muted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingsRow}
                onPress={() => router.push('/new-item')}>
                <View style={[styles.settingsIconBox, { backgroundColor: '#EBF3FE' }]}>
                  <Feather name="plus-circle" size={20} color="#208AEF" />
                </View>
                <Text style={styles.settingsRowText}>Cadastrar item manualmente</Text>
                <Feather name="chevron-right" size={18} color={Palette.muted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingsRow}
              onPress={() => Alert.alert(
                'Restaurar catálogo',
                'Isso substituirá todos os itens salvos pelos itens de demonstração. Esta ação não pode ser desfeita.',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Restaurar',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await resetToDefaultItems();
                        Alert.alert('Catálogo restaurado', 'Os itens de demonstração foram restaurados.');
                      } catch {
                        Alert.alert('Falha ao salvar', 'Não foi possível restaurar o catálogo. Tente novamente.');
                      }
                    },
                  },
                ],
              )}>
                <View style={[styles.settingsIconBox, { backgroundColor: Palette.warningBg }]}>
                  <Feather name="refresh-cw" size={20} color={Palette.warningText} />
                </View>
                <Text style={styles.settingsRowText}>Restaurar itens do protótipo HTML</Text>
                <Feather name="chevron-right" size={18} color={Palette.muted} />
              </TouchableOpacity>
            </View>

            {/* App Info Box */}
            <View style={styles.aboutBox}>
              <Text style={styles.aboutAppName}>ScanStock</Text>
              <Text style={styles.aboutAppDesc}>
                Acervo — catálogo por câmera. Projetado para identificação veloz e controle de acervos, bibliotecas, laboratórios e almoxarifados.
              </Text>
              <Text style={styles.aboutVersion}>Versão 1.0.0 · Expo 58 · React Native</Text>
            </View>
          </ScrollView>
        )}

        {/* Custom Bottom Bar */}
        <CustomBottomBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onScanPress={() => router.push('/scan')}
        />
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
  flex1: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerAddButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Palette.darkText,
  },
  screenSubtitle: {
    fontSize: 14,
    color: Palette.subtitle,
    marginTop: 2,
  },
  searchBar: {
    height: 48,
    borderRadius: 14,
    backgroundColor: Palette.lightSurface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
    marginTop: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Palette.darkText,
    paddingVertical: 0,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 14,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  chipSelected: {
    backgroundColor: Palette.darkText,
  },
  chipUnselected: {
    backgroundColor: Palette.lightSurface,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  chipTextUnselected: {
    color: Palette.darkText,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  emptyContainer: {
    paddingVertical: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Palette.darkText,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Palette.subtitle,
    textAlign: 'center',
    maxWidth: 260,
  },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Palette.primary,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  tabHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  tabContentScroll: {
    paddingBottom: 32,
  },
  collectionCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Palette.lightSurface,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  collectionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionInfo: {
    flex: 1,
  },
  collectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.darkText,
  },
  collectionDesc: {
    fontSize: 13,
    color: Palette.subtitle,
    marginTop: 4,
    lineHeight: 18,
  },
  statPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  statPill: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statPillLabel: {
    fontSize: 12,
    color: Palette.subtitle,
  },
  statPillVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.darkText,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  historyContent: {
    flex: 1,
  },
  historyTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.darkText,
  },
  historyDate: {
    fontSize: 12,
    color: Palette.subtitle,
  },
  historyItemName: {
    fontSize: 13,
    fontWeight: '500',
    color: Palette.primary,
    marginTop: 2,
  },
  historyDesc: {
    fontSize: 13,
    color: Palette.subtitle,
    marginTop: 2,
  },
  guideCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Palette.noticeBg,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F8E2C0',
  },
  guideCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guideNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.darkText,
  },
  guideCardSubtitle: {
    fontSize: 13,
    color: Palette.subtitle,
    marginTop: 2,
    lineHeight: 17,
  },
  settingsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: Palette.lightSurface,
    borderRadius: 18,
    padding: 16,
    gap: 4,
  },
  settingsSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.subtitle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  settingsIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsRowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Palette.darkText,
  },
  aboutBox: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Palette.border,
    alignItems: 'center',
    gap: 6,
  },
  aboutAppName: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.darkText,
  },
  aboutAppDesc: {
    fontSize: 13,
    color: Palette.subtitle,
    textAlign: 'center',
    lineHeight: 18,
  },
  aboutVersion: {
    fontSize: 12,
    color: Palette.muted,
    marginTop: 4,
  },
});
