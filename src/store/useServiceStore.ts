import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  BuildOrderTracking,
  ServiceBooking,
  ServiceBookingStatus,
  TrackingStage,
} from '../lib/types';
import { MOCK_BUILD_TRACKINGS, MOCK_SERVICE_BOOKINGS } from '../lib/mock-data';

const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export interface ServiceState {
  trackings: BuildOrderTracking[];
  bookings: ServiceBooking[];

  // Tracking Actions
  getTrackingByCode: (code: string) => BuildOrderTracking | undefined;
  updateTrackingStage: (id: string, stage: TrackingStage, notes?: string) => void;

  // Booking Actions
  createBooking: (
    input: Omit<ServiceBooking, 'id' | 'bookingCode' | 'status' | 'createdAt' | 'updatedAt'>
  ) => ServiceBooking;
  updateBookingStatus: (id: string, status: ServiceBookingStatus, adminNotes?: string) => void;
  deleteBooking: (id: string) => void;
  getBookingById: (id: string) => ServiceBooking | undefined;
}

export const useServiceStore = create<ServiceState>()(
  persist(
    (set, get) => ({
      trackings: MOCK_BUILD_TRACKINGS,
      bookings: MOCK_SERVICE_BOOKINGS,

      getTrackingByCode: (code: string) => {
        const clean = code.trim().toUpperCase();
        return get().trackings.find((t) => t.trackingCode.toUpperCase() === clean);
      },

      updateTrackingStage: (id: string, stage: TrackingStage, notes?: string) => {
        set((state) => ({
          trackings: state.trackings.map((t) =>
            t.id === id
              ? {
                  ...t,
                  currentStage: stage,
                  stageHistory: [
                    ...t.stageHistory,
                    { stage, timestamp: new Date().toISOString(), notes },
                  ],
                  updatedAt: new Date().toISOString().split('T')[0],
                }
              : t
          ),
        }));
      },

      createBooking: (input) => {
        const now = new Date();
        const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
        const randomSuffix = Math.floor(100 + Math.random() * 900);
        const bookingCode = `SRV-KSS-${yearMonth}-${randomSuffix}`;
        const id = `bk-${Date.now()}`;
        const dateStr = now.toISOString().split('T')[0];

        const newBooking: ServiceBooking = {
          ...input,
          id,
          bookingCode,
          status: 'pending',
          createdAt: dateStr,
          updatedAt: dateStr,
        };

        set((state) => ({ bookings: [newBooking, ...state.bookings] }));
        return newBooking;
      },

      updateBookingStatus: (id: string, status: ServiceBookingStatus, adminNotes?: string) => {
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === id
              ? {
                  ...b,
                  status,
                  adminNotes: adminNotes ?? b.adminNotes,
                  updatedAt: new Date().toISOString().split('T')[0],
                }
              : b
          ),
        }));
      },

      deleteBooking: (id: string) => {
        set((state) => ({ bookings: state.bookings.filter((b) => b.id !== id) }));
      },

      getBookingById: (id: string) => {
        return get().bookings.find((b) => b.id === id);
      },
    }),
    {
      name: 'kss-service-store-v1',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : memoryStorage
      ),
    }
  )
);
