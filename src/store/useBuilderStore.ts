import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  BuildSelections,
  ProductCategory,
  PublicHardwarePart,
  SelectedBuildItem,
  PrebuiltPackage,
} from '../lib/types';
import { getItemPart } from '../lib/compatibility';

export const DEFAULT_ASSEMBLY_FEE = 150000;

const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const MULTI_ITEM_CATEGORIES: ReadonlyArray<ProductCategory> = [
  'ram',
  'ssd',
  'hdd',
  'peripheral',
  'monitor',
];

export interface BuilderPrebuiltInput {
  id: string;
  name: string;
  baseParts: Partial<Record<ProductCategory, { partId: string; quantity: number }>>;
  assemblyFee?: number;
}

export interface EncodedBuildPayload {
  v: number;
  name?: string;
  prebuiltId?: string;
  fee?: number;
  parts: {
    c: ProductCategory;
    id: string;
    q: number;
  }[];
}

export function encodeBuildPayload(payload: EncodedBuildPayload): string {
  const json = JSON.stringify(payload);
  if (typeof window !== 'undefined') {
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window
      .btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  return Buffer.from(json, 'utf-8').toString('base64url');
}

export function decodeBuildPayload(str: string): EncodedBuildPayload {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  if (typeof window !== 'undefined') {
    const binary = window.atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as EncodedBuildPayload;
  }
  const json = Buffer.from(padded, 'base64').toString('utf-8');
  return JSON.parse(json) as EncodedBuildPayload;
}

export interface BuilderState {
  selections: BuildSelections;
  activePrebuilt: BuilderPrebuiltInput | null;
  customBuildName: string;
  assemblyFee: number;
  strictFilterEnabled: boolean;
  /** Alias eksplisit untuk filter kompatibilitas ketat (kontrak Fase 2). */
  strictCompatibilityFilter: boolean;

  /**
   * Total harga rakitan hasil estimasi server.
   * Satu-satunya angka harga yang boleh hidup di client.
   */
  publicTotalPrice: number;

  // Actions
  selectPart: (category: ProductCategory, part: PublicHardwarePart, quantity?: number) => void;
  addPart: (category: ProductCategory, part: PublicHardwarePart, quantity?: number) => void; // alias
  removePart: (category: ProductCategory, index?: number) => void;
  updateQuantity: (category: ProductCategory, index: number, qty: number) => void;
  clearCategory: (category: ProductCategory) => void;
  clearAll: () => void;

  loadPrebuilt: (
    pkg: BuilderPrebuiltInput,
    partsMap: Record<string, PublicHardwarePart>,
    totalPrice?: number
  ) => void;
  loadPrebuiltPackage: (
    pkg: PrebuiltPackage,
    partsMap: Record<string, PublicHardwarePart>,
    totalPrice?: number
  ) => void;
  loadTemplate: (
    template: BuilderPrebuiltInput,
    partsMap: Record<string, PublicHardwarePart>,
    totalPrice?: number
  ) => void; // alias

  setCustomBuildName: (name: string) => void;
  setAssemblyFee: (fee: number) => void;
  setPublicTotalPrice: (total: number) => void;
  toggleStrictFilter: () => void;
  setStrictCompatibilityFilter: (enabled: boolean) => void;

  // Computations
  getAllSelectedItems: () => SelectedBuildItem[];
  getTotalWattage: () => number;
  getItemCount: () => number;
  getBundleTotal: () => number;

  exportToEncodedString: () => string;
  importFromEncodedString: (
    code: string,
    partsMap: Record<string, PublicHardwarePart>
  ) => boolean;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      selections: {},
      activePrebuilt: null,
      customBuildName: 'Custom PC Rig KSS',
      assemblyFee: DEFAULT_ASSEMBLY_FEE,
      strictFilterEnabled: true,
      strictCompatibilityFilter: true,
      publicTotalPrice: 0,

      selectPart: (category: ProductCategory, part: PublicHardwarePart, quantity = 1) => {
        const safeQty = Math.max(1, Math.round(quantity));
        const isMulti = MULTI_ITEM_CATEGORIES.includes(category);

        set((state) => {
          const currentList = state.selections[category] || [];

          if (!isMulti) {
            // Penggantian slot tunggal (CPU, Mobo, VGA, PSU, Case, Cooler)
            return {
              selections: {
                ...state.selections,
                [category]: [{ part, product: part, quantity: safeQty }],
              },
            };
          }

          // Kategori multi-item (RAM, SSD, HDD, Peripheral, Monitor)
          const existingIdx = currentList.findIndex(
            (item) => getItemPart(item)?.id === part.id
          );

          if (existingIdx >= 0) {
            const updated = [...currentList];
            updated[existingIdx] = {
              part,
              product: part,
              quantity: safeQty,
            };
            return {
              selections: {
                ...state.selections,
                [category]: updated,
              },
            };
          }

          return {
            selections: {
              ...state.selections,
              [category]: [...currentList, { part, product: part, quantity: safeQty }],
            },
          };
        });
      },

      addPart: (category, part, quantity = 1) => {
        get().selectPart(category, part, quantity);
      },

      removePart: (category: ProductCategory, index = 0) => {
        set((state) => {
          const currentList = state.selections[category];
          if (!currentList || currentList.length === 0) return state;

          const updated = currentList.filter((_, idx) => idx !== index);
          const newSelections = { ...state.selections };

          if (updated.length === 0) {
            delete newSelections[category];
          } else {
            newSelections[category] = updated;
          }

          return { selections: newSelections };
        });
      },

      updateQuantity: (category: ProductCategory, index: number, qty: number) => {
        const safeQty = Math.max(1, Math.round(qty));
        set((state) => {
          const currentList = state.selections[category];
          if (!currentList || !currentList[index]) return state;

          const updated = [...currentList];
          const currentItem = updated[index];
          const part = getItemPart(currentItem)!;
          updated[index] = { part, product: part, quantity: safeQty };

          return {
            selections: {
              ...state.selections,
              [category]: updated,
            },
          };
        });
      },

      clearCategory: (category: ProductCategory) => {
        set((state) => {
          const newSelections = { ...state.selections };
          delete newSelections[category];
          return { selections: newSelections };
        });
      },

      clearAll: () => {
        set({
          selections: {},
          activePrebuilt: null,
          customBuildName: 'Custom PC Rig KSS',
          assemblyFee: DEFAULT_ASSEMBLY_FEE,
          publicTotalPrice: 0,
        });
      },

      loadPrebuilt: (
        pkg: BuilderPrebuiltInput,
        partsMap: Record<string, PublicHardwarePart>,
        totalPrice = 0
      ) => {
        const newSelections: BuildSelections = {};

        for (const [cat, item] of Object.entries(pkg.baseParts)) {
          if (!item) continue;
          const category = cat as ProductCategory;
          const part = partsMap[item.partId];
          if (part) {
            newSelections[category] = [
              {
                part,
                product: part,
                quantity: item.quantity,
              },
            ];
          }
        }

        set({
          selections: newSelections,
          activePrebuilt: {
            id: pkg.id,
            name: pkg.name,
            baseParts: pkg.baseParts,
            assemblyFee: pkg.assemblyFee,
          },
          customBuildName: pkg.name,
          assemblyFee: pkg.assemblyFee || DEFAULT_ASSEMBLY_FEE,
          publicTotalPrice: Math.max(0, totalPrice),
        });
      },

      loadTemplate: (template, partsMap, totalPrice) => {
        get().loadPrebuilt(template, partsMap, totalPrice);
      },

      loadPrebuiltPackage: (pkg, partsMap, totalPrice) => {
        const baseParts: BuilderPrebuiltInput['baseParts'] = {};
        for (const item of pkg.parts) {
          baseParts[item.category] = { partId: item.partId, quantity: item.quantity };
        }

        const template: BuilderPrebuiltInput = {
          id: pkg.id,
          name: pkg.name,
          baseParts,
          assemblyFee: pkg.assemblyFee,
        };

        get().loadPrebuilt(
          template,
          partsMap,
          pkg.customTotalOverride ?? totalPrice ?? 0
        );
      },

      setCustomBuildName: (name: string) => {
        set({ customBuildName: name.trim() || 'Custom PC Rig KSS' });
      },

      setAssemblyFee: (fee: number) => {
        set({ assemblyFee: Math.max(0, fee) });
      },

      setPublicTotalPrice: (total: number) => {
        set({ publicTotalPrice: Math.max(0, Math.round(total)) });
      },

      toggleStrictFilter: () => {
        set((state) => {
          const next = !state.strictFilterEnabled;
          return {
            strictFilterEnabled: next,
            strictCompatibilityFilter: next,
          };
        });
      },

      setStrictCompatibilityFilter: (enabled: boolean) => {
        set({ strictFilterEnabled: enabled, strictCompatibilityFilter: enabled });
      },

      getBundleTotal: () => get().publicTotalPrice,

      getAllSelectedItems: () => {
        const state = get();
        const result: SelectedBuildItem[] = [];
        for (const cat of Object.keys(state.selections) as ProductCategory[]) {
          const items = state.selections[cat] || [];
          for (const item of items) {
            result.push(item);
          }
        }
        return result;
      },

      getTotalWattage: () => {
        const items = get().getAllSelectedItems();
        let total = items.reduce((sum, item) => {
          const part = getItemPart(item);
          const watt = part?.wattage || 0;
          return sum + watt * item.quantity;
        }, 0);
        if (total > 0 && !get().selections.motherboard) {
          total += 30; // mobo baseline
        }
        return total;
      },

      getItemCount: () => {
        return get().getAllSelectedItems().reduce((sum, item) => sum + item.quantity, 0);
      },

      exportToEncodedString: () => {
        const state = get();
        const parts: EncodedBuildPayload['parts'] = [];

        for (const cat of Object.keys(state.selections) as ProductCategory[]) {
          const items = state.selections[cat] || [];
          for (const item of items) {
            const part = getItemPart(item);
            if (part) {
              parts.push({
                c: cat,
                id: part.id,
                q: item.quantity,
              });
            }
          }
        }

        const payload: EncodedBuildPayload = {
          v: 2,
          name: state.customBuildName,
          prebuiltId: state.activePrebuilt?.id,
          fee: state.assemblyFee,
          parts,
        };

        return encodeBuildPayload(payload);
      },

      importFromEncodedString: (
        code: string,
        partsMap: Record<string, PublicHardwarePart>
      ) => {
        try {
          const payload = decodeBuildPayload(code);
          if (!payload || !payload.parts || !Array.isArray(payload.parts)) {
            return false;
          }

          const newSelections: BuildSelections = {};
          for (const entry of payload.parts) {
            const part = partsMap[entry.id];
            if (part && entry.c) {
              const currentList = newSelections[entry.c] || [];
              newSelections[entry.c] = [
                ...currentList,
                { part, product: part, quantity: entry.q || 1 },
              ];
            }
          }

          set({
            selections: newSelections,
            customBuildName: payload.name || 'Custom PC Rig KSS',
            assemblyFee: payload.fee !== undefined ? payload.fee : DEFAULT_ASSEMBLY_FEE,
            publicTotalPrice: 0,
          });

          return true;
        } catch (err) {
          console.error('Failed to import build code:', err);
          return false;
        }
      },
    }),
    {
      name: 'kss-builder-storage',
      version: 3,
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : memoryStorage
      ),
      // Data lama menyimpan objek part lengkap (termasuk harga modal).
      // Versi baru membuang selections agar tidak ada harga lama yang ikut hidrasi.
      migrate: () => ({
        selections: {},
        activePrebuilt: null,
        customBuildName: 'Custom PC Rig KSS',
        assemblyFee: DEFAULT_ASSEMBLY_FEE,
        strictFilterEnabled: true,
        strictCompatibilityFilter: true,
        publicTotalPrice: 0,
      }),
      partialize: (state) => ({
        selections: state.selections,
        activePrebuilt: state.activePrebuilt,
        customBuildName: state.customBuildName,
        assemblyFee: state.assemblyFee,
        strictFilterEnabled: state.strictFilterEnabled,
        strictCompatibilityFilter: state.strictCompatibilityFilter,
        publicTotalPrice: state.publicTotalPrice,
      }),
    }
  )
);
