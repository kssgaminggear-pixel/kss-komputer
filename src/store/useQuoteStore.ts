import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ConsultationQuote } from '../lib/types';
import { MOCK_CONSULTATION_QUOTES } from '../lib/mock-data';

export interface CreateQuoteInput {
  customerName: string;
  customerWa: string;
  budget: number;
  usageNeed: ConsultationQuote['usageNeed'];
  selectedParts: ConsultationQuote['selectedParts'];
  assemblyFee: number;
  finalBundlePrice: number;
  totalWattage: number;
  recommendedPsuWatt: number;
  notes?: string;
  validUntil: string;
}

export interface QuoteState {
  quotes: ConsultationQuote[];

  // Actions
  createQuote: (input: CreateQuoteInput) => ConsultationQuote;
  updateQuoteStatus: (id: string, status: ConsultationQuote['status']) => void;
  deleteQuote: (id: string) => void;
  getQuoteByCode: (code: string) => ConsultationQuote | undefined;
  getQuoteById: (id: string) => ConsultationQuote | undefined;
}

const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set, get) => ({
      quotes: MOCK_CONSULTATION_QUOTES,

      createQuote: (input: CreateQuoteInput) => {
        const now = new Date();
        const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
        const randomSuffix = Math.floor(100 + Math.random() * 900);
        const quoteCode = `KSS-Q-${yearMonth}-${randomSuffix}`;
        const id = `quote-${Date.now()}`;

        const newQuote: ConsultationQuote = {
          id,
          quoteCode,
          ...input,
          status: 'sent',
          createdAt: now.toISOString().split('T')[0],
        };

        set((state) => ({
          quotes: [newQuote, ...state.quotes],
        }));

        return newQuote;
      },

      updateQuoteStatus: (id: string, status: ConsultationQuote['status']) => {
        set((state) => ({
          quotes: state.quotes.map((q) => (q.id === id ? { ...q, status } : q)),
        }));
      },

      deleteQuote: (id: string) => {
        set((state) => ({
          quotes: state.quotes.filter((q) => q.id !== id),
        }));
      },

      getQuoteByCode: (code: string) => {
        const cleanCode = code.trim().toUpperCase();
        return get().quotes.find((q) => q.quoteCode.toUpperCase() === cleanCode);
      },

      getQuoteById: (id: string) => {
        return get().quotes.find((q) => q.id === id);
      },
    }),
    {
      name: 'kss-consultation-quotes-v1',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : memoryStorage
      ),
    }
  )
);
