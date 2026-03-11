import { useAuth } from '@/contexts/AuthContext';

export interface ConferenceBooking {
    _id: string;
    eventName: string;
    clientName: string;
    company?: string;
    email: string;
    phone: string;
    hallType: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    eventType: string;
    attendees: number;
    cateringRequired: boolean;
    equipmentRequired: boolean;
    specialRequirements?: string;
    amount: number;
    discount: number;  // Added discount field
    discountedAmount: number;  // Added discountedAmount field (amount - discount)
    advancePaid: number;
    paymentStatus: 'pending' | 'partial' | 'paid' | 'cancelled' | 'refunded';
    bookingStatus: 'pending' | 'approved' | 'confirmed' | 'completed' | 'cancelled';
    bookingNumber: string;
    invoiceNumber?: string;
    notes?: string;
    createdBy: any;
    approvedBy?: any;
    approvedAt?: string;
    createdAt: string;
    updatedAt: string;

    // Optional calculated fields (can be added by backend)
    netAmount?: number;
    balanceDue?: number;
}

export interface ConferenceHall {
    _id: string;
    hallId: string;
    name: string;
    value: string;
    capacity: number;
    hourlyRate: number;
    dailyRate: number;
    description: string;
    amenities: Array<{
        name: string;
        included: boolean;
        extraCharge: number;
    }>;
    isActive: boolean;
    currentBookings: number;
    maxDailyBookings: number;
    availableToday?: number;
}

export const useConferenceService = () => {
    const { authFetch } = useAuth();

    // Bookings
    const getBookings = async (params?: any) => {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.keys(params).forEach(key => {
                if (params[key] !== undefined && params[key] !== null) {
                    queryParams.append(key, params[key]);
                }
            });
        }

        const response = await authFetch(`/conference/bookings?${queryParams}`);
        return response.json();
    };

    const getBookingById = async (id: string) => {
        const response = await authFetch(`/conference/bookings/${id}`);
        return response.json();
    };

    const createBooking = async (data: any) => {
        const response = await authFetch('/conference/bookings', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response.json();
    };

    const updateBooking = async (id: string, data: any) => {
        const response = await authFetch(`/conference/bookings/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return response.json();
    };

    const updateBookingStatus = async (id: string, status: string) => {
        const response = await authFetch(`/conference/bookings/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ bookingStatus: status })
        });
        return response.json();
    };

    const updatePaymentStatus = async (id: string, status: string, advancePaid?: number) => {
        const body: any = { paymentStatus: status };
        if (advancePaid !== undefined) {
            body.advancePaid = advancePaid;
        }
        const response = await authFetch(`/conference/bookings/${id}/payment`, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
        return response.json();
    };

    const deleteBooking = async (id: string) => {
        const response = await authFetch(`/conference/bookings/${id}`, {
            method: 'DELETE'
        });
        return response.json();
    };

    // Dashboard
    const getDashboardStats = async () => {
        const response = await authFetch('/conference/dashboard');
        return response.json();
    };

    // Reports
    const getReports = async (params?: any) => {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.keys(params).forEach(key => {
                if (params[key] !== undefined && params[key] !== null) {
                    queryParams.append(key, params[key]);
                }
            });
        }

        const response = await authFetch(`/conference/reports?${queryParams}`);
        return response.json();
    };

    // Halls
    const getConferenceHalls = async () => {
        const response = await authFetch('/conference/halls');
        return response.json();
    };

    const updateConferenceHall = async (id: string, data: any) => {
        const response = await authFetch(`/conference/halls/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return response.json();
    };

    const initializeConferenceHalls = async () => {
        const response = await authFetch('/conference/halls/initialize', {
            method: 'POST'
        });
        return response.json();
    };

    return {
        // Bookings
        getBookings,
        getBookingById,
        createBooking,
        updateBooking,
        updateBookingStatus,
        updatePaymentStatus,
        deleteBooking,

        // Dashboard & Reports
        getDashboardStats,
        getReports,

        // Halls
        getConferenceHalls,
        updateConferenceHall,
        initializeConferenceHalls
    };
};