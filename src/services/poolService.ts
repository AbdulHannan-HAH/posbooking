import { useAuth } from '@/contexts/AuthContext';

export const usePoolService = () => {
    const { authFetch } = useAuth();

    const getDashboardStats = async () => {
        try {
            const response = await authFetch('/pool/dashboard');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return {
                success: false,
                message: error.message,
                stats: {
                    todayBookings: 0,
                    todayRevenue: 0,
                    pendingPayments: 0,
                    currentCapacity: 0,
                    maxCapacity: 50,
                    capacityPercentage: 0,
                    recentBookings: [],
                    timeSlotDistribution: []
                }
            };
        }
    };

    const getBookings = async (params = {}) => {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const response = await authFetch(`/pool/bookings?${queryParams}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching bookings:', error);
            return {
                success: false,
                message: error.message,
                bookings: [],
                total: 0,
                totalPages: 0
            };
        }
    };

    const getBookingById = async (id) => {
        try {
            const response = await authFetch(`/pool/bookings/${id}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching booking:', error);
            return { success: false, message: error.message };
        }
    };

    const createBooking = async (bookingData) => {
        try {
            const response = await authFetch('/pool/bookings', {
                method: 'POST',
                body: JSON.stringify(bookingData),
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating booking:', error);
            return { success: false, message: error.message };
        }
    };

    const updateBooking = async (id, bookingData) => {
        try {
            const response = await authFetch(`/pool/bookings/${id}`, {
                method: 'PUT',
                body: JSON.stringify(bookingData),
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating booking:', error);
            return { success: false, message: error.message };
        }
    };

    const deleteBooking = async (id) => {
        try {
            const response = await authFetch(`/pool/bookings/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error deleting booking:', error);
            return { success: false, message: error.message };
        }
    };

    const updatePaymentStatus = async (id, status) => {
        try {
            const response = await authFetch(`/pool/bookings/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify({ paymentStatus: status }),
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating payment status:', error);
            return { success: false, message: error.message };
        }
    };

    const getTicketPrices = async () => {
        try {
            const response = await authFetch('/pool/ticket-prices');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching ticket prices:', error);
            return {
                success: false,
                message: error.message,
                ticketPrices: []
            };
        }
    };

    const updateTicketPrice = async (id, priceData) => {
        try {
            const response = await authFetch(`/pool/ticket-prices/${id}`, {
                method: 'PUT',
                body: JSON.stringify(priceData),
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating ticket price:', error);
            return { success: false, message: error.message };
        }
    };

    const initializeTicketPrices = async () => {
        try {
            const response = await authFetch('/pool/ticket-prices/initialize', {
                method: 'POST',
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error initializing ticket prices:', error);
            return { success: false, message: error.message };
        }
    };

    const getTimeSlots = async () => {
        try {
            const response = await authFetch('/pool/time-slots');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching time slots:', error);
            return {
                success: false,
                message: error.message,
                timeSlots: []
            };
        }
    };

    const updateTimeSlot = async (id, slotData) => {
        try {
            const response = await authFetch(`/pool/time-slots/${id}`, {
                method: 'PUT',
                body: JSON.stringify(slotData),
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating time slot:', error);
            return { success: false, message: error.message };
        }
    };

    const initializeTimeSlots = async () => {
        try {
            const response = await authFetch('/pool/time-slots/initialize', {
                method: 'POST',
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error initializing time slots:', error);
            return { success: false, message: error.message };
        }
    };

    const getReports = async (params = {}) => {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const response = await authFetch(`/pool/reports?${queryParams}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching reports:', error);
            return {
                success: false,
                message: error.message,
                revenueData: [],
                passTypeData: [],
                timeSlotData: []
            };
        }
    };

    return {
        getDashboardStats,
        getBookings,
        getBookingById,
        createBooking,
        updateBooking,
        deleteBooking,
        updatePaymentStatus,
        getTicketPrices,
        updateTicketPrice,
        initializeTicketPrices,
        getTimeSlots,
        updateTimeSlot,
        initializeTimeSlots,
        getReports,
    };
};

export type TicketPrice = {
    _id: string;
    passType: string;
    price: number;
    description: string;
    maxPersons: number;
    isActive: boolean;
    updatedAt: string;
};

export type TimeSlot = {
    _id: string;
    slotId: string;
    label: string;
    value: string;
    startTime: string;
    endTime: string;
    maxCapacity: number;
    currentBookings: number;
    isActive: boolean;
    available: number;
};