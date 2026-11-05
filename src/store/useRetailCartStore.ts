import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { HardwarePart, AccessoryItem } from '../lib/types';
import { formatIDR, DEFAULT_WHATSAPP_PHONE, TOKOPEDIA_OFFICIAL_STORE_URL } from '../lib/format';

export interface RetailCartItem {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  unitPrice: number;
  originalPrice?: number;
  quantity: number;
  warrantyYears?: number;
  isAccessory?: boolean;
}

export interface RetailCartState {
  items: RetailCartItem[];
  isOpen: boolean;

  // Actions
  addItem: (product: HardwarePart | AccessoryItem, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computations
  getTotalPrice: () => number;
  getTotalItemsCount: () => number;

  // Checkout Link Generator
  generateWhatsAppCheckoutUrl: (phone?: string, customerName?: string, notes?: string) => string;
}

const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useRetailCartStore = create<RetailCartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: HardwarePart | AccessoryItem, quantity = 1) => {
        const safeQty = Math.max(1, Math.round(quantity));
        const unitPrice =
          'retailPrice' in product && product.retailPrice
            ? product.retailPrice
            : 'sellPrice' in product
            ? product.sellPrice
            : 0;

        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.id === product.id);

          if (existingIndex >= 0) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + safeQty,
            };
            return { items: updatedItems, isOpen: true };
          }

          const newItem: RetailCartItem = {
            id: product.id,
            sku: product.sku,
            name: product.name,
            brand: product.brand,
            category: product.category,
            unitPrice,
            originalPrice: product.originalPrice,
            quantity: safeQty,
            warrantyYears: product.warrantyYears,
            isAccessory: !('wattage' in product),
          };

          return { items: [...state.items, newItem], isOpen: true };
        });
      },

      removeItem: (itemId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId: string, quantity: number) => {
        const safeQty = Math.round(quantity);
        set((state) => {
          if (safeQty <= 0) {
            return { items: state.items.filter((item) => item.id !== itemId) };
          }
          return {
            items: state.items.map((item) =>
              item.id === itemId ? { ...item, quantity: safeQty } : item
            ),
          };
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      },

      getTotalItemsCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      generateWhatsAppCheckoutUrl: (
        phone: string = DEFAULT_WHATSAPP_PHONE,
        customerName?: string,
        notes?: string
      ) => {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const items = get().items;
        const total = get().getTotalPrice();

        const lines: string[] = [
          `*PESANAN BELANJA ECERAN & AKSESORIS — KSS KOMPUTER*`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        ];

        if (customerName) {
          lines.push(`*Nama Pemesan:* ${customerName}`);
        }

        lines.push(`\n*DAFTAR BARANG:*`);
        items.forEach((item, index) => {
          const subtotal = item.unitPrice * item.quantity;
          lines.push(
            `${index + 1}. *${item.name}* (${item.sku})\n   ${item.quantity}x @ ${formatIDR(
              item.unitPrice
            )} = *${formatIDR(subtotal)}*`
          );
        });

        lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        lines.push(`*TOTAL BELANJA:* ${formatIDR(total)}`);
        lines.push(`*Garansi:* Resmi Distributor Indonesia`);

        if (notes) {
          lines.push(`\n*Catatan:* ${notes}`);
        }

        lines.push(
          `\nMohon konfirmasi ketersediaan stok fisik dan info ongkos kirim / no rekening pembayaran. Terima kasih!`
        );

        const message = lines.join('\n');
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      },
    }),
    {
      name: 'kss-retail-cart-storage-v1',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : memoryStorage
      ),
    }
  )
);
