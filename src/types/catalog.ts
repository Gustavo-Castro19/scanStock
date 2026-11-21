export type CollectionType = 'Livros' | 'Laboratório' | 'Estoque';

export type ItemStatus = 'Disponível' | 'Emprestado' | 'Manutenção' | 'Na estante' | 'Estoque regular' | 'Estoque baixo';

export interface HistoryEvent {
  id: string;
  type: 'created' | 'loan' | 'returned' | 'moved' | 'updated' | 'maintenance';
  title: string;
  description: string;
  date: string;
  responsible?: string;
  color?: string;
}

export interface CatalogItem {
  id: string;
  title: string;
  subtitle: string;
  collection: CollectionType;
  location: string;
  code: string;
  quantity: number;
  status: ItemStatus;
  statusBadge: string;
  statusType: 'success' | 'warning' | 'danger' | 'neutral';
  avatarColor: string;
  photos?: string[];
  borrowedTo?: {
    responsible: string;
    expectedReturnDate: string;
    borrowDate: string;
  };
  createdAt: string;
  history: HistoryEvent[];
  notes?: string;
}
