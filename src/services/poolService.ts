import { useAuth } from '@/contexts/AuthContext';

export const usePoolService = () => {
    const { authFetch } = useAuth();

    const getDashboardStats = async () => {
        try {
            const response = await authFetch('/pool/dashboard');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
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
                    todayDiscounts: 0,
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
            // Clean up params - remove empty values
            const cleanParams = {};
            Object.keys(params).forEach(key => {
                if (params[key] && params[key] !== '' && params[key] !== 'all') {
                    cleanParams[key] = params[key];
                }
            });

            const queryParams = new URLSearchParams(cleanParams).toString();
            const url = `/pool/bookings${queryParams ? `?${queryParams}` : ''}`;

            console.log('Fetching bookings from:', url);
            const response = await authFetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Bookings API response:', data);

            return data;
        } catch (error) {
            console.error('Error fetching bookings:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch bookings',
                bookings: [],
                total: 0,
                totalPages: 0
            };
        }
    };

    const getBookingById = async (id) => {
        try {
            const response = await authFetch(`/pool/bookings/${id}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching booking:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch booking'
            };
        }
    };

    const createBooking = async (bookingData) => {
        try {
            const response = await authFetch('/pool/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating booking:', error);
            return {
                success: false,
                message: error.message || 'Failed to create booking'
            };
        }
    };

    const updateBooking = async (id, bookingData) => {
        try {
            const response = await authFetch(`/pool/bookings/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating booking:', error);
            return {
                success: false,
                message: error.message || 'Failed to update booking'
            };
        }
    };

    const deleteBooking = async (id) => {
        try {
            const response = await authFetch(`/pool/bookings/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error deleting booking:', error);
            return {
                success: false,
                message: error.message || 'Failed to delete booking'
            };
        }
    };

    const updatePaymentStatus = async (id, status) => {
        try {
            const response = await authFetch(`/pool/bookings/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ paymentStatus: status }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating payment status:', error);
            return {
                success: false,
                message: error.message || 'Failed to update payment status'
            };
        }
    };

    const getTicketPrices = async () => {
        try {
            const response = await authFetch('/pool/ticket-prices');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching ticket prices:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch ticket prices',
                ticketPrices: []
            };
        }
    };

    const updateTicketPrice = async (id, priceData) => {
        try {
            const response = await authFetch(`/pool/ticket-prices/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(priceData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating ticket price:', error);
            return {
                success: false,
                message: error.message || 'Failed to update ticket price'
            };
        }
    };

    const initializeTicketPrices = async () => {
        try {
            const response = await authFetch('/pool/ticket-prices/initialize', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error initializing ticket prices:', error);
            return {
                success: false,
                message: error.message || 'Failed to initialize ticket prices'
            };
        }
    };

    const getTimeSlots = async () => {
        try {
            const response = await authFetch('/pool/time-slots');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching time slots:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch time slots',
                timeSlots: []
            };
        }
    };

    const updateTimeSlot = async (id, slotData) => {
        try {
            const response = await authFetch(`/pool/time-slots/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(slotData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating time slot:', error);
            return {
                success: false,
                message: error.message || 'Failed to update time slot'
            };
        }
    };

    const initializeTimeSlots = async () => {
        try {
            const response = await authFetch('/pool/time-slots/initialize', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error initializing time slots:', error);
            return {
                success: false,
                message: error.message || 'Failed to initialize time slots'
            };
        }
    };

    const getReports = async (params = {}) => {
        try {
            // Clean up params - remove empty values
            const cleanParams = {};
            Object.keys(params).forEach(key => {
                if (params[key]) {
                    cleanParams[key] = params[key];
                }
            });

            const queryParams = new URLSearchParams(cleanParams).toString();
            const url = `/pool/reports${queryParams ? `?${queryParams}` : ''}`;

            const response = await authFetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching reports:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch reports',
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

export type Booking = {
    _id: string;
    bookingNumber: string;
    customerName: string;
    email: string;
    phone: string;
    date: string;
    timeSlot: string;
    passType: string;
    persons: number;
    subtotal: number;
    discount: number;
    amount: number;
    paymentStatus: 'paid' | 'pending' | 'cancelled';
    notes?: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: {
        _id: string;
        name: string;
        email: string;
    };
};