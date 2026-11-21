import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { CatalogItem, HistoryEvent, ItemStatus } from '@/types/catalog';
import { Palette } from '@/constants/theme';

interface CatalogContextType {
  items: CatalogItem[];
  getItemById: (id: string) => CatalogItem | undefined;
  addItem: (item: Omit<CatalogItem, 'id' | 'createdAt' | 'history'>) => Promise<CatalogItem>;
  updateItem: (id: string, updates: Partial<CatalogItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  registerLoan: (id: string, responsible: string, expectedReturnDate: string) => Promise<void>;
  registerReturn: (id: string, location?: string) => Promise<void>;
  moveItem: (id: string, newLocation: string) => Promise<void>;
  resetToDefaultItems: () => Promise<void>;
}

const STORAGE_KEY = '@scanstock_catalog_items_v1';

const INITIAL_ITEMS: CatalogItem[] = [
  {
    id: 'item-1',
    title: 'Dom Casmurro',
    subtitle: 'Machado de Assis · Romance',
    collection: 'Livros',
    location: 'Estante 2',
    code: 'ISBN 978-85-359-0277-5',
    quantity: 1,
    status: 'Na estante',
    statusBadge: 'Na estante',
    statusType: 'success',
    avatarColor: Palette.livros,
    createdAt: '19/11/2026',
    history: [
      {
        id: 'h-1-1',
        type: 'created',
        title: 'Cadastrado por escaneamento',
        description: 'Reconhecimento ótico de capa',
        date: '19/11/2026, 14:20',
        color: Palette.muted,
      },
    ],
  },
  {
    id: 'item-2',
    title: 'Câmera termográfica',
    subtitle: 'Laboratório · Armário B2',
    collection: 'Laboratório',
    location: 'Armário B2',
    code: 'PAT-004821',
    quantity: 1,
    status: 'Emprestado',
    statusBadge: 'Emprestado',
    statusType: 'warning',
    avatarColor: Palette.laboratorio,
    borrowedTo: {
      responsible: 'Prof. Carlos Silva',
      expectedReturnDate: '28/11/2026',
      borrowDate: '12/11/2026',
    },
    createdAt: '14/10/2026',
    history: [
      {
        id: 'h-2-1',
        type: 'loan',
        title: 'Emprestada',
        description: 'Prof. Carlos Silva',
        date: '12/11/2026',
        responsible: 'Prof. Carlos Silva',
        color: Palette.warningDot,
      },
      {
        id: 'h-2-2',
        type: 'returned',
        title: 'Devolvida ao armário B2',
        description: 'Inspeção de rotina concluída',
        date: '05/11/2026',
        color: Palette.successDot,
      },
      {
        id: 'h-2-3',
        type: 'created',
        title: 'Cadastrada por escaneamento',
        description: 'Etiqueta patrimonial lida com sucesso',
        date: '14/10/2026',
        color: Palette.muted,
      },
    ],
  },
  {
    id: 'item-3',
    title: 'Osciloscópio 100 MHz',
    subtitle: 'Laboratório · Bancada 4',
    collection: 'Laboratório',
    location: 'Bancada 4',
    code: 'PAT-001923',
    quantity: 1,
    status: 'Manutenção',
    statusBadge: 'Manutenção',
    statusType: 'danger',
    avatarColor: Palette.laboratorioAlt,
    createdAt: '02/09/2026',
    history: [
      {
        id: 'h-3-1',
        type: 'maintenance',
        title: 'Enviado para manutenção',
        description: 'Calibração de canais analógicos',
        date: '18/11/2026',
        color: Palette.dangerDot,
      },
      {
        id: 'h-3-2',
        type: 'created',
        title: 'Cadastrado por escaneamento',
        description: 'Código de barras escaneado',
        date: '02/09/2026',
        color: Palette.muted,
      },
    ],
  },
  {
    id: 'item-4',
    title: 'Caixa de envio 30 cm',
    subtitle: 'Estoque · Prateleira A',
    collection: 'Estoque',
    location: 'Prateleira A',
    code: 'EST-CX30',
    quantity: 42,
    status: 'Estoque regular',
    statusBadge: '42 un.',
    statusType: 'success',
    avatarColor: Palette.estoque,
    createdAt: '01/08/2026',
    history: [
      {
        id: 'h-4-1',
        type: 'updated',
        title: 'Entrada de lote +50 un.',
        description: 'Recebimento de fornecedor',
        date: '10/11/2026',
        color: Palette.successDot,
      },
      {
        id: 'h-4-2',
        type: 'created',
        title: 'Cadastrado por escaneamento',
        description: 'Código de barras de embalagem',
        date: '01/08/2026',
        color: Palette.muted,
      },
    ],
  },
  {
    id: 'item-5',
    title: 'Fita adesiva kraft',
    subtitle: 'Estoque · Prateleira C',
    collection: 'Estoque',
    location: 'Prateleira C',
    code: 'EST-FTK',
    quantity: 6,
    status: 'Estoque baixo',
    statusBadge: '6 un. · baixo',
    statusType: 'warning',
    avatarColor: Palette.estoqueAlt,
    createdAt: '15/07/2026',
    history: [
      {
        id: 'h-5-1',
        type: 'updated',
        title: 'Baixa de estoque (4 un.)',
        description: 'Empacotamento de remessa laboratorial',
        date: '15/11/2026',
        color: Palette.warningDot,
      },
      {
        id: 'h-5-2',
        type: 'created',
        title: 'Cadastrado por escaneamento',
        description: 'Código EAN-13 lido',
        date: '15/07/2026',
        color: Palette.muted,
      },
    ],
  },
  {
    id: 'item-6',
    title: 'Grande Sertão: Veredas',
    subtitle: 'João Guimarães Rosa · Épico',
    collection: 'Livros',
    location: 'Estante 1',
    code: 'ISBN 978-85-359-0744-2',
    quantity: 1,
    status: 'Na estante',
    statusBadge: 'Na estante',
    statusType: 'success',
    avatarColor: Palette.livros,
    createdAt: '03/10/2026',
    history: [
      {
        id: 'h-6-1',
        type: 'created',
        title: 'Cadastrado por escaneamento',
        description: 'Reconhecimento ótico de capa',
        date: '03/10/2026',
        color: Palette.muted,
      },
    ],
  },
  {
    id: 'item-7',
    title: 'Multímetro Digital True RMS',
    subtitle: 'Laboratório · Armário B1',
    collection: 'Laboratório',
    location: 'Armário B1',
    code: 'PAT-003310',
    quantity: 3,
    status: 'Disponível',
    statusBadge: 'Disponível',
    statusType: 'success',
    avatarColor: Palette.laboratorio,
    createdAt: '22/09/2026',
    history: [
      {
        id: 'h-7-1',
        type: 'created',
        title: 'Cadastrado por escaneamento',
        description: 'Etiqueta patrimonial',
        date: '22/09/2026',
        color: Palette.muted,
      },
    ],
  },
  {
    id: 'item-8',
    title: 'Placas de Petri Estéreis 90mm',
    subtitle: 'Estoque · Caixa térmica B',
    collection: 'Estoque',
    location: 'Caixa térmica B',
    code: 'EST-PETRI90',
    quantity: 120,
    status: 'Estoque regular',
    statusBadge: '120 un.',
    statusType: 'success',
    avatarColor: Palette.estoque,
    createdAt: '05/11/2026',
    history: [
      {
        id: 'h-8-1',
        type: 'created',
        title: 'Cadastrado por escaneamento',
        description: 'Entrada de lote fornecedor',
        date: '05/11/2026',
        color: Palette.muted,
      },
    ],
  },
];

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CatalogItem[]>(INITIAL_ITEMS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setItems(parsed);
            return;
          }
        }
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ITEMS));
        setItems(INITIAL_ITEMS);
      } catch (e) {
        console.warn('Failed to load items from storage:', e);
        setItems(INITIAL_ITEMS);
      } finally {
        setIsLoading(false);
      }
    };

    void loadItems();
  }, []);

  const persistItems = async (newItems: CatalogItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error('Failed to save catalog to storage:', e);
      throw e;
    }
    setItems(newItems);
  };

  const getItemById = (id: string) => {
    return items.find((item) => item.id === id);
  };

  const addItem = async (itemData: Omit<CatalogItem, 'id' | 'createdAt' | 'history'>): Promise<CatalogItem> => {
    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString('pt-BR')}`;
    const timeFormatted = `${now.toLocaleDateString('pt-BR')}, ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    
    const newItem: CatalogItem = {
      ...itemData,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: dateFormatted,
      history: [
        {
          id: `h-${Date.now()}`,
          type: 'created',
          title: 'Cadastrado por escaneamento',
          description: `Item adicionado à coleção ${itemData.collection}`,
          date: timeFormatted,
          color: Palette.muted,
        },
      ],
    };

    const updated = [newItem, ...items];
    await persistItems(updated);
    return newItem;
  };

  const updateItem = async (id: string, updates: Partial<CatalogItem>) => {
    const now = new Date();
    const timeFormatted = `${now.toLocaleDateString('pt-BR')}, ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const updated = items.map((item) => {
      if (item.id === id) {
        const historyEntry: HistoryEvent = {
          id: `h-${Date.now()}`,
          type: 'updated',
          title: 'Dados atualizados',
          description: 'Informações do item foram modificadas',
          date: timeFormatted,
          color: Palette.primary,
        };
        return {
          ...item,
          ...updates,
          history: [historyEntry, ...item.history],
        };
      }
      return item;
    });

    await persistItems(updated);
  };

  const deleteItem = async (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    await persistItems(updated);
  };

  const registerLoan = async (id: string, responsible: string, expectedReturnDate: string) => {
    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString('pt-BR')}`;
    const timeFormatted = `${now.toLocaleDateString('pt-BR')}, ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const updated = items.map((item) => {
      if (item.id === id) {
        const historyEntry: HistoryEvent = {
          id: `h-${Date.now()}`,
          type: 'loan',
          title: 'Emprestado',
          description: responsible,
          date: timeFormatted,
          responsible,
          color: Palette.warningDot,
        };
        return {
          ...item,
          status: 'Emprestado' as ItemStatus,
          statusBadge: 'Emprestado',
          statusType: 'warning' as const,
          borrowedTo: {
            responsible,
            expectedReturnDate,
            borrowDate: dateFormatted,
          },
          history: [historyEntry, ...item.history],
        };
      }
      return item;
    });

    await persistItems(updated);
  };

  const registerReturn = async (id: string, location?: string) => {
    const now = new Date();
    const timeFormatted = `${now.toLocaleDateString('pt-BR')}, ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const updated = items.map((item) => {
      if (item.id === id) {
        const targetLoc = location || item.location;
        const historyEntry: HistoryEvent = {
          id: `h-${Date.now()}`,
          type: 'returned',
          title: `Devolvido ao ${targetLoc}`,
          description: item.borrowedTo?.responsible ? `Devolvido por ${item.borrowedTo.responsible}` : 'Devolução concluída',
          date: timeFormatted,
          color: Palette.successDot,
        };

        const defaultStatus: ItemStatus = item.collection === 'Livros' ? 'Na estante' : 'Disponível';
        const defaultBadge = item.collection === 'Livros' ? 'Na estante' : (item.collection === 'Estoque' ? `${item.quantity} un.` : 'Disponível');

        return {
          ...item,
          location: targetLoc,
          status: defaultStatus,
          statusBadge: defaultBadge,
          statusType: 'success' as const,
          borrowedTo: undefined,
          history: [historyEntry, ...item.history],
        };
      }
      return item;
    });

    await persistItems(updated);
  };

  const moveItem = async (id: string, newLocation: string) => {
    const now = new Date();
    const timeFormatted = `${now.toLocaleDateString('pt-BR')}, ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const updated = items.map((item) => {
      if (item.id === id) {
        const historyEntry: HistoryEvent = {
          id: `h-${Date.now()}`,
          type: 'moved',
          title: `Movido para ${newLocation}`,
          description: `Local anterior: ${item.location}`,
          date: timeFormatted,
          color: Palette.muted,
        };
        return {
          ...item,
          location: newLocation,
          history: [historyEntry, ...item.history],
        };
      }
      return item;
    });

    await persistItems(updated);
  };

  const resetToDefaultItems = async () => {
    await persistItems(INITIAL_ITEMS);
  };

  return (
    <CatalogContext.Provider
      value={{
        items,
        getItemById,
        addItem,
        updateItem,
        deleteItem,
        registerLoan,
        registerReturn,
        moveItem,
        resetToDefaultItems,
      }}>
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={Palette.primary} />
        </View>
      ) : children}
    </CatalogContext.Provider>
  );
};

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};
