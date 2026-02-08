// services/hotelService.ts - FIXED
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useHotelService = () => {
    const { authFetch } = useAuth();

    // ✅ Wrap the entire return object in useMemo
    return useMemo(() => ({
        // Dashboard
        getDashboardStats: async () => {
            try {
                const response = await authFetch('/hotel/dashboard');
                const data = await response.json();
                console.log('Dashboard API Response:', data);
                return data;
            } catch (error: any) {
                console.error('Error fetching hotel dashboard stats:', error);
                return {
                    success: false,
                    message: error.message,
                    stats: {
                        totalRooms: 0,
                        occupiedRooms: 0,
                        availableRooms: 0,
                        checkInsToday: 0,
                        checkOutsToday: 0,
                        monthlyRevenue: 0,
                        todayRevenue: 0,
                        pendingPayments: 0,
                        occupancyRate: 0,
                        upcomingCheckIns: [],
                        upcomingCheckOuts: []
                    }
                };
            }
        },

        // Reservations
        getReservations: async (params = {}) => {
            try {
                const queryParams = new URLSearchParams(params).toString();
                const response = await authFetch(`/hotel/reservations?${queryParams}`);
                return await response.json();
            } catch (error: any) {
                console.error('Error fetching reservations:', error);
                return {
                    success: false,
                    message: error.message,
                    reservations: [],
                    total: 0,
                    totalPages: 0
                };
            }
        },

        getReservationById: async (id: string) => {
            try {
                const response = await authFetch(`/hotel/reservations/${id}`);
                return await response.json();
            } catch (error: any) {
                console.error('Error fetching reservation:', error);
                return { success: false, message: error.message };
            }
        },

        createReservation: async (reservationData: any) => {
            try {
                const response = await authFetch('/hotel/reservations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reservationData),
                });
                return await response.json();
            } catch (error: any) {
                console.error('Error creating reservation:', error);
                return { success: false, message: error.message };
            }
        },

        updateReservation: async (id: string, reservationData: any) => {
            try {
                const response = await authFetch(`/hotel/reservations/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reservationData),
                });
                return await response.json();
            } catch (error: any) {
                console.error('Error updating reservation:', error);
                return { success: false, message: error.message };
            }
        },

        deleteReservation: async (id: string) => {
            try {
                const response = await authFetch(`/hotel/reservations/${id}`, {
                    method: 'DELETE',
                });
                return await response.json();
            } catch (error: any) {
                console.error('Error deleting reservation:', error);
                return { success: false, message: error.message };
            }
        },

        updateReservationStatus: async (id: string, status: string) => {
            try {
                const response = await authFetch(`/hotel/reservations/${id}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status }),
                });
                return await response.json();
            } catch (error: any) {
                console.error('Error updating reservation status:', error);
                return { success: false, message: error.message };
            }
        },

        checkIn: async (id: string) => {
            try {
                const response = await authFetch(`/hotel/reservations/${id}/checkin`, {
                    method: 'PUT',
                });
                return await response.json();
            } catch (error: any) {
                console.error('Error checking in:', error);
                return { success: false, message: error.message };
            }
        },

        checkOut: async (id: string) => {
            try {
                const response = await authFetch(`/hotel/reservations/${id}/checkout`, {
                    method: 'PUT',
                });
                return await response.json();
            } catch (error: any) {
                console.error('Error checking out:', error);
                return { success: false, message: error.message };
            }
        },

        // Rooms
        getRooms: async (params = {}) => {
            try {
                const queryParams = new URLSearchParams(params).toString();
                const response = await authFetch(`/hotel/rooms?${queryParams}`);
                const data = await response.json();
                console.log('Rooms API Response:', data);
                return data;
            } catch (error: any) {
                console.error('Error fetching rooms:', error);
                return {
                    success: false,
                    message: error.message,
                    rooms: [],
                    total: 0,
                    totalPages: 0
                };
            }
        },

        getAvailableRooms: async (checkIn: string, checkOut: string, roomType?: string) => {
            try {
                const params: any = { checkIn, checkOut, status: 'available' };
                if (roomType) params.roomType = roomType;

                const queryParams = new URLSearchParams(params).toString();
                const response = await authFetch(`/hotel/rooms?${queryParams}&limit=100`);
                return await response.json();
            } catch (error: any) {
                console.error('Error fetching available rooms:', error);
                return { success: false, message: error.message, rooms: [] };
            }
        },

        createRoom: async (roomData: any) => {
            try {
                const response = await authFetch('/hotel/rooms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(roomData),
                });
                return await response.json();
            } catch (error: any) {
                console.error('Error creating room:', error);
                return { success: false, message: error.message };
            }
        },

        updateRoom: async (id: string, roomData: any) => {
            try {
                const response = await authFetch(`/hotel/rooms/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(roomData),
                });
                return await response.json();
            } catch (error: any) {
                console.error('Error updating room:', error);
                return { success: false, message: error.message };
            }
        },

        updateRoomStatus: async (id: string, status: string) => {
            try {
                const response = await authFetch(`/hotel/rooms/${id}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status }),
                });
                return await response.json();
            } catch (error: any) {
                console.error('Error updating room status:', error);
                return { success: false, message: error.message };
            }
        },

        // Room Types
        getRoomTypes: async () => {
            try {
                const response = await authFetch('/hotel/room-types');
                const data = await response.json();
                console.log('Room Types API Response:', data);
                return data;
            } catch (error: any) {
                console.error('Error fetching room types:', error);
                return {
                    success: false,
                    message: error.message,
                    roomTypes: []
                };
            }
        },

        createRoomType: async (roomTypeData: any) => {
            try {
                const response = await authFetch('/hotel/room-types', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(roomTypeData),
                });
                return await response.json();
            } catch (error: any) {
                console.error('Error creating room type:', error);
                return { success: false, message: error.message };
            }
        },

        updateRoomType: async (id: string, roomTypeData: any) => {
            try {
                const response = await authFetch(`/hotel/room-types/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(roomTypeData),
                });
                return await response.json();
            } catch (error: any) {
                console.error('Error updating room type:', error);
                return { success: false, message: error.message };
            }
        },

        // Services
        getServices: async () => {
            try {
                const response = await authFetch('/hotel/services');
                const data = await response.json();
                console.log('Services API Response:', data);
                return data;
            } catch (error: any) {
                console.error('Error fetching services:', error);
                return {
                    success: false,
                    message: error.message,
                    services: []
                };
            }
        },

        createService: async (serviceData: any) => {
            try {
                const response = await authFetch('/hotel/services', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(serviceData),
                });
                return await response.json();
            } catch (error: any) {
                console.error('Error creating service:', error);
                return { success: false, message: error.message };
            }
        },

        updateService: async (id: string, serviceData: any) => {
            try {
                const response = await authFetch(`/hotel/services/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(serviceData),
                });
                return await response.json();
            } catch (error: any) {
                console.error('Error updating service:', error);
                return { success: false, message: error.message };
            }
        },

        // Reports
        getReports: async (params = {}) => {
            try {
                const queryParams = new URLSearchParams(params).toString();
                const response = await authFetch(`/hotel/reports?${queryParams}`);
                return await response.json();
            } catch (error: any) {
                console.error('Error fetching reports:', error);
                return {
                    success: false,
                    message: error.message,
                    revenueData: [],
                    occupancyData: [],
                    roomTypeData: [],
                    paymentData: []
                };
            }
        },

        // Initialization
        initializeDefaults: async () => {
            try {
                const response = await authFetch('/hotel/initialize-defaults', {
                    method: 'POST',
                });
                return await response.json();
            } catch (error: any) {
                console.error('Error initializing defaults:', error);
                return { success: false, message: error.message };
            }
        },

        initializeRoomTypes: async () => {
            try {
                const response = await authFetch('/hotel/room-types/initialize', {
                    method: 'POST',
                });
                return await response.json();
            } catch (error: any) {
                console.error('Error initializing room types:', error);
                return { success: false, message: error.message };
            }
        },

        initializeServices: async () => {
            try {
                const response = await authFetch('/hotel/services/initialize', {
                    method: 'POST',
                });
                return await response.json();
            } catch (error: any) {
                console.error('Error initializing services:', error);
                return { success: false, message: error.message };
            }
        },

        // Add Service to Reservation
        addServiceToReservation: async (reservationId: string, serviceData: any) => {
            try {
                const response = await authFetch(`/hotel/reservations/${reservationId}/services`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(serviceData),
                });
                return await response.json();
            } catch (error: any) {
                console.error('Error adding service to reservation:', error);
                return { success: false, message: error.message };
            }
        },
    }), [authFetch]); // ✅ Only recreate when authFetch changes
};

// ... rest of your type exports remain the same
export type Room = {
    _id: string;
    roomNumber: string;
    roomType: string;
    floor: number;
    status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
    price: number;
    features: string[];
    lastCleaned: string;
    nextCleaning: string;
    isActive: boolean;
};

export type RoomType = {
    _id: string;
    name: string;
    description: string;
    basePrice: number;
    maxOccupancy: number;
    amenities: string[];
    isActive: boolean;
};

export type HotelService = {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: 'food' | 'beverage' | 'spa' | 'laundry' | 'transport' | 'other';
    isAvailable: boolean;
    updatedAt: string;
};

export type Reservation = {
    _id: string;
    reservationNumber: string;
    guestName: string;
    email: string;
    phone: string;
    checkIn: string;
    checkOut: string;
    roomNumber: string;
    roomType: string;
    adults: number;
    children: number;
    totalNights: number;
    roomRate: number;
    extraCharges: {
        service: string;
        amount: number;
        quantity: number;
    }[];
    subTotal: number;
    tax: number;
    discount: number;
    totalAmount: number;
    paymentStatus: 'paid' | 'pending' | 'partial';
    reservationStatus: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
    specialRequests: string;
    createdBy: {
        _id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
};