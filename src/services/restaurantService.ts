import { useAuth } from '@/contexts/AuthContext';
import { type UserRole } from '@/contexts/AuthContext';

export const useRestaurantService = () => {
    const { authFetch } = useAuth();

    const getDashboardStats = async () => {
        try {
            const response = await authFetch('/restaurant/dashboard');
            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error('Error fetching dashboard stats:', error);
            return {
                success: false,
                message: error.message,
                stats: {
                    todaySales: 0,
                    todayRevenue: 0,
                    todayItems: 0,
                    pendingPayments: 0,
                    activeOrders: 0,
                    popularItems: [],
                    categoryBreakdown: [],
                    recentSales: [],
                    orderStatusBreakdown: []
                }
            };
        }
    };

    // ==================== CATEGORY METHODS ====================

    const getCategories = async (params = {}) => {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const response = await authFetch(`/restaurant/categories?${queryParams}`);
            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error('Error fetching categories:', error);
            return {
                success: false,
                message: error.message,
                categories: []
            };
        }
    };

    const getCategoryById = async (id: string) => {
        try {
            const response = await authFetch(`/restaurant/categories/${id}`);
            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error('Error fetching category:', error);
            return { success: false, message: error.message };
        }
    };

    const createCategory = async (categoryData: any) => {
        try {
            console.log('Creating category with data:', categoryData);
            const response = await authFetch('/restaurant/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData),
            });
            const data = await response.json();
            console.log('Category creation response:', data);
            return data;
        } catch (error: any) {
            console.error('Error creating category:', error);
            return { success: false, message: error.message };
        }
    };

    const updateCategory = async (id: string, categoryData: any) => {
        try {
            const response = await authFetch(`/restaurant/categories/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData),
            });
            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error('Error updating category:', error);
            return { success: false, message: error.message };
        }
    };

    const deleteCategory = async (id: string) => {
        try {
            const response = await authFetch(`/restaurant/categories/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error('Error deleting category:', error);
            return { success: false, message: error.message };
        }
    };

    const initializeCategories = async () => {
        try {
            const response = await authFetch('/restaurant/categories/initialize', {
                method: 'POST',
            });
            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error('Error initializing categories:', error);
            return { success: false, message: error.message };
        }
    };

    // ==================== MENU ITEM METHODS ====================

    const getMenuItems = async (params = {}) => {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const response = await authFetch(`/restaurant/menu-items?${queryParams}`);
            const data = await response.json();

            // If categories are not in the response, create them from menu items
            if (data.success && (!data.categories || data.categories.length === 0)) {
                // Extract unique categories from menu items
                const uniqueCategories = data.menuItems?.reduce((acc: any[], item: any) => {
                    if (!acc.find(c => c._id === item.category)) {
                        acc.push({
                            _id: item.category,
                            categoryDisplay: item.categoryDisplay,
                            count: data.menuItems.filter((i: any) => i.category === item.category).length
                        });
                    }
                    return acc;
                }, []);

                data.categories = uniqueCategories || [];
            }

            return data;
        } catch (error: any) {
            console.error('Error fetching menu items:', error);
            return {
                success: false,
                message: error.message,
                menuItems: [],
                total: 0,
                categories: []
            };
        }
    };

    const getMenuItemById = async (id: string) => {
        try {
            const response = await authFetch(`/restaurant/menu-items/${id}`);
            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error('Error fetching menu item:', error);
            return { success: false, message: error.message };
        }
    };

    const createMenuItem = async (itemData: any) => {
        try {
            const response = await authFetch('/restaurant/menu-items', {
                method: 'POST',
                body: JSON.stringify(itemData),
            });
            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error('Error creating menu item:', error);
            return { success: false, message: error.message };
        }
    };

    const updateMenuItem = async (id: string, itemData: any) => {
        try {
            const response = await authFetch(`/restaurant/menu-items/${id}`, {
                method: 'PUT',
                body: JSON.stringify(itemData),
            });
            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error('Error updating menu item:', error);
            return { success: false, message: error.message };
        }
    };

    const deleteMenuItem = async (id: string) => {
        try {
            const response = await authFetch(`/restaurant/menu-items/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error('Error deleting menu item:', error);
            return { success: false, message: error.message };
        }
    };

    const initializeMenuItems = async () => {
        try {
            const response = await authFetch('/restaurant/menu-items/initialize', {
                method: 'POST',
            });
            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error('Error initializing menu items:', error);
            return { success: false, message: error.message };
        }
    };

    // ==================== SALES METHODS ====================

    const getSales = async (params = {}) => {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const response = await authFetch(`/restaurant/sales?${queryParams}`);
            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error('Error fetching sales:', error);
            return {
                success: false,
                message: error.message,
                sales: [],
                total: 0,
                totalPages: 0
            };
        }
    };

    const getSaleById = async (id: string) => {
        try {
            const response = await authFetch(`/restaurant/sales/${id}`);
            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error('Error fetching sale:', error);
            return { success: false, message: error.message };
        }
    };

    const createSale = async (saleData: any) => {
        try {
            console.log('Creating sale with data:', saleData);
            const response = await authFetch('/restaurant/sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(saleData),
            });
            const data = await response.json();
            console.log('Sale creation response:', data);
            return data;
        } catch (error: any) {
            console.error('Error creating sale:', error);
            return { success: false, message: error.message };
        }
    };

    const updateSale = async (id: string, saleData: any) => {
        try {
            const response = await authFetch(`/restaurant/sales/${id}`, {
                method: 'PUT',
                body: JSON.stringify(saleData),
            });
            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error('Error updating sale:', error);
            return { success: false, message: error.message };
        }
    };

    const deleteSale = async (id: string) => {
        try {
            const response = await authFetch(`/restaurant/sales/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error('Error deleting sale:', error);
            return { success: false, message: error.message };
        }
    };

    const updatePaymentStatus = async (id: string, paymentStatus: string) => {
        try {
            const response = await authFetch(`/restaurant/sales/${id}/payment-status`, {
                method: 'PUT',
                body: JSON.stringify({ paymentStatus }),
            });
            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error('Error updating payment status:', error);
            return { success: false, message: error.message };
        }
    };

    const updateOrderStatus = async (id: string, orderStatus: string) => {
        try {
            const response = await authFetch(`/restaurant/sales/${id}/order-status`, {
                method: 'PUT',
                body: JSON.stringify({ orderStatus }),
            });
            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error('Error updating order status:', error);
            return { success: false, message: error.message };
        }
    };

    const getReports = async (params = {}) => {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const response = await authFetch(`/restaurant/reports?${queryParams}`);
            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error('Error fetching reports:', error);
            return {
                success: false,
                message: error.message,
                revenueData: [],
                topItems: [],
                categoryPerformance: [],
                hourlyBreakdown: [],
                paymentMethodData: [],
                orderTypeData: []
            };
        }
    };

    return {
        // Dashboard
        getDashboardStats,

        // Categories
        getCategories,
        getCategoryById,
        createCategory,
        updateCategory,
        deleteCategory,
        initializeCategories,

        // Menu Items
        getMenuItems,
        getMenuItemById,
        createMenuItem,
        updateMenuItem,
        deleteMenuItem,
        initializeMenuItems,

        // Sales
        getSales,
        getSaleById,
        createSale,
        updateSale,
        deleteSale,
        updatePaymentStatus,
        updateOrderStatus,

        // Reports
        getReports
    };
};

export type MenuItem = {
    _id: string;
    name: string;
    category: string;
    categoryDisplay: string;
    price: number;
    cost: number;
    tax: number;
    taxType: 'percentage' | 'fixed';
    description: string;
    unit: string;
    stockQuantity: number;
    trackInventory: boolean;
    isActive: boolean;
    isPopular: boolean;
    image: string | null;
    createdAt: string;
    updatedAt: string;
};

export type Category = {
    _id: string;
    name: string;
    displayName: string;
    icon: string;
    description: string;
    isActive: boolean;
    sortOrder: number;
    itemCount: number;
    createdBy?: {
        _id: string;
        name: string;
    };
    updatedBy?: {
        _id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
};

export type Sale = {
    _id: string;
    saleNumber: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    tableNumber?: string;
    items: SaleItem[];
    subtotal: number;
    taxTotal: number;
    discountTotal: number;
    totalAmount: number;
    paymentMethod: 'cash' | 'card' | 'upi' | 'credit' | 'other';
    paymentStatus: 'paid' | 'pending' | 'cancelled' | 'refunded';
    orderStatus: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
    orderType: 'dine_in' | 'takeaway' | 'delivery';
    notes?: string;
    staffNotes?: string;
    servedBy?: any;
    createdBy?: any;
    createdAt: string;
    updatedAt: string;
};

export type SaleItem = {
    menuItemId: string;
    name: string;
    category: string;
    quantity: number;
    unitPrice: number;
    tax: number;
    taxType: string;
    discount: number;
    subtotal: number;
    total: number;
    notes?: string;
};