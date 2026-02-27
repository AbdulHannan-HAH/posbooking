import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurantService } from '@/services/restaurantService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import {
    Utensils,
    Plus,
    Search,
    Filter,
    Eye,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle,
    XCircle,
    Coffee,
    Beer,
    Wine
} from 'lucide-react';
import { format } from 'date-fns';

export default function RestaurantSales() {
    const navigate = useNavigate();
    const restaurantService = useRestaurantService();

    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [orderTypeFilter, setOrderTypeFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalSales, setTotalSales] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchSales();
    }, [currentPage, statusFilter, paymentFilter, orderTypeFilter, searchTerm]);

    const fetchSales = async () => {
        try {
            setLoading(true);
            const params: any = {
                page: currentPage,
                limit: itemsPerPage,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            };

            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }

            if (paymentFilter !== 'all') {
                params.paymentStatus = paymentFilter;
            }

            if (orderTypeFilter !== 'all') {
                params.orderType = orderTypeFilter;
            }

            if (searchTerm) {
                params.search = searchTerm;
            }

            const response = await restaurantService.getSales(params);

            if (response.success) {
                setSales(response.sales || []);
                setTotalPages(response.totalPages || 1);
                setTotalSales(response.total || 0);
            } else {
                toast.error(response.message || 'Failed to fetch orders');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'preparing':
                return 'bg-blue-100 text-blue-800';
            case 'ready':
                return 'bg-green-100 text-green-800';
            case 'served':
                return 'bg-purple-100 text-purple-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-3 w-3" />;
            case 'preparing':
                return <Loader2 className="h-3 w-3 animate-spin" />;
            case 'ready':
                return <CheckCircle className="h-3 w-3" />;
            case 'served':
                return <CheckCircle className="h-3 w-3" />;
            case 'cancelled':
                return <XCircle className="h-3 w-3" />;
            default:
                return null;
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
        } catch {
            return dateString;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center">
                            <Utensils className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold">Restaurant Orders</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">View and manage all restaurant orders</p>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => navigate('/restaurant/sales/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Order
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Order Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="preparing">Preparing</SelectItem>
                                <SelectItem value="ready">Ready</SelectItem>
                                <SelectItem value="served">Served</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Payment Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Payments</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Order Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="dine_in">Dine In</SelectItem>
                                <SelectItem value="takeaway">Takeaway</SelectItem>
                                <SelectItem value="delivery">Delivery</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Orders List</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
                                <p className="mt-4 text-muted-foreground">Loading orders...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Order #</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Customer</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Table</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Items</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Total</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Order Status</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Payment</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Time</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sales.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="py-8 text-center text-muted-foreground">
                                                    No orders found
                                                </td>
                                            </tr>
                                        ) : (
                                            sales.map((sale) => (
                                                <tr key={sale._id} className="border-b last:border-0 hover:bg-muted/50">
                                                    <td className="py-3 px-2 font-medium">{sale.saleNumber}</td>
                                                    <td className="py-3 px-2">
                                                        <div>
                                                            <p className="font-medium">{sale.customerName}</p>
                                                            {sale.customerPhone && (
                                                                <p className="text-xs text-muted-foreground">{sale.customerPhone}</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-2">{sale.tableNumber || '-'}</td>
                                                    <td className="py-3 px-2">{sale.items?.length || 0}</td>
                                                    <td className="py-3 px-2 font-medium">${sale.totalAmount?.toFixed(2)}</td>
                                                    <td className="py-3 px-2">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(sale.orderStatus)}`}>
                                                            {getStatusIcon(sale.orderStatus)}
                                                            {sale.orderStatus}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <StatusBadge status={sale.paymentStatus} />
                                                    </td>
                                                    <td className="py-3 px-2 text-xs text-muted-foreground">
                                                        {formatDate(sale.createdAt)}
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => navigate(`/restaurant/sales/${sale._id}`)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                                    {Math.min(currentPage * itemsPerPage, totalSales)} of{' '}
                                    {totalSales} orders
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="flex items-center px-3 text-sm">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}