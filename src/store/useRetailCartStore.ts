import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { formatIDR, DEFAULT_WHATSAPP_PHONE } from '../lib/format';
import { PAYMENT_WA_LINE } from '../lib/payment';

/** Produk eceran Toko yang bisa masuk keranjang. */
export interface RetailCartInput {
  id: string;
  slug: string;
  name: string;
  unitPrice: number;
  tokopediaUrl: string;
}

export interface RetailCartItem extends RetailCartInput {
  quantity: number;
}

export interface RetailCartState {
  items: RetailCartItem[];
  isOpen: boolean;

  // Actions
  addItem: (product: RetailCartInput, quantity?: number) => void;
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

      addItem: (product, quantity = 1) => {
        const safeQty = Math.max(1, Math.round(quantity));

        set((state) => {
          const exists = state.items.some((item) => item.id === product.id);
          const items = exists
            ? state.items.map((item) =>
                // Harga diambil dari data terbaru saat produk ditambahkan lagi.
                item.id === product.id ? { ...product, quantity: item.quantity + safeQty } : item
              )
            : [...state.items, { ...product, quantity: safeQty }];
          return { items, isOpen: true };
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
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
        phone = DEFAULT_WHATSAPP_PHONE,
        customerName,
        notes
      ) => {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const items = get().items;
        const total = get().getTotalPrice();

        const lines: string[] = [`*PESANAN TOKO — KSS KOMPUTER*`];

        if (customerName) {
          lines.push(`*Nama pemesan:* ${customerName}`);
        }

        lines.push(`\n*DAFTAR BARANG:*`);
        items.forEach((item, index) => {
          const subtotal = item.unitPrice * item.quantity;
          lines.push(
            `${index + 1}. *${item.name}*\n   ${item.quantity}x @ ${formatIDR(item.unitPrice)} = *${formatIDR(subtotal)}*\n   ${item.tokopediaUrl}`
          );
        });

        lines.push(`\n*TOTAL:* ${formatIDR(total)}`);

        if (notes) {
          lines.push(`\n*Catatan:* ${notes}`);
        }

        lines.push(`\n${PAYMENT_WA_LINE}`);
        lines.push(`Mohon konfirmasi harga terbaru, ketersediaan stok, dan ongkos kirim. Terima kasih!`);

        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
      },
    }),
    {
      name: 'kss-retail-cart-storage-v3',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : memoryStorage
      ),
    }
  )
);

// Keranjang versi lama berisi data contoh, harga komponen, atau harga diskon; hapus dari browser.
if (typeof window !== 'undefined') {
  try {
    window.localStorage.removeItem('kss-retail-cart-storage-v2');
    window.localStorage.removeItem('kss-retail-cart-storage-v1');
    window.localStorage.removeItem('kss-cart-storage');
  } catch {
    /* penyimpanan browser diblokir */
  }
}
