import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRestaurantService } from '@/services/restaurantService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Utensils,
    ArrowLeft,
    User,
    Phone,
    Hash,
    Calendar,
    Clock,
    CreditCard,
    Printer,
    Loader2,
    Coffee,
    Beer,
    Wine,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { RestaurantInvoiceDialog } from '@/components/restaurant/RestaurantInvoiceDialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

export default function ViewSale() {
    const { id } = useParams();
    const navigate = useNavigate();
    const restaurantService = useRestaurantService();

    const [sale, setSale] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showInvoice, setShowInvoice] = useState(false);

    useEffect(() => {
        if (id) {
            fetchSale();
        }
    }, [id]);

    const fetchSale = async () => {
        try {
            setLoading(true);
            const response = await restaurantService.getSaleById(id!);
            if (response.success) {
                setSale(response.sale);
            } else {
                toast.error(response.message || 'Failed to load order');
                navigate('/restaurant/sales');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load order');
            navigate('/restaurant/sales');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePaymentStatus = async (status: string) => {
        try {
            setUpdating(true);
            const response = await restaurantService.updatePaymentStatus(id!, status);
            if (response.success) {
                toast.success(`Payment status updated to ${status}`);
                fetchSale();
            } else {
                toast.error(response.message || 'Failed to update status');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await restaurantService.deleteSale(id!);
            if (response.success) {
                toast.success('Order deleted successfully');
                navigate('/restaurant/sales');
            } else {
                toast.error(response.message || 'Failed to delete order');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete order');
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category?.toLowerCase()) {
            case 'beer':
                return <Beer className="h-4 w-4" />;
            case 'wine':
                return <Wine className="h-4 w-4" />;
            case 'cold_drink':
            case 'soft_drink':
                return <Coffee className="h-4 w-4" />;
            default:
                return <Coffee className="h-4 w-4" />;
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'refunded':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-orange-500" />
                    <p className="mt-4 text-muted-foreground">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!sale) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
                    <p className="mt-4 text-muted-foreground">Order not found</p>
                    <Button onClick={() => navigate('/restaurant/sales')} className="mt-4">
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center">
                                <Utensils className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Order {sale.saleNumber}</h1>
                                <p className="text-muted-foreground">
                                    Created on {format(new Date(sale.createdAt), 'PPP')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Only show invoice button for confirmed/paid orders */}
                    {sale.paymentStatus === 'confirmed' && (
                        <Button variant="outline" onClick={() => setShowInvoice(true)}>
                            <Printer className="h-4 w-4 mr-2" />
                            Invoice
                        </Button>
                    )}
                    {sale.paymentStatus !== 'cancelled' && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel Order
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to cancel this order? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>No, Keep Order</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive">
                                        Yes, Cancel Order
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Details */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Customer Info */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Customer Information</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-medium">{sale.customerName}</p>
                                    </div>
                                </div>
                                {sale.customerPhone && (
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                            <Phone className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Phone</p>
                                            <p className="font-medium">{sale.customerPhone}</p>
                                        </div>
                                    </div>
                                )}
                                {sale.tableNumber && (
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                            <Hash className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Table</p>
                                            <p className="font-medium">{sale.tableNumber}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Order Type</p>
                                        <p className="font-medium capitalize">{sale.orderType?.replace('_', ' ')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Items */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Order Items</h4>
                            <div className="space-y-3">
                                {sale.items?.map((item: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                                {getCategoryIcon(item.category)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    ${item.unitPrice.toFixed(2)} × {item.quantity}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">${item.total.toFixed(2)}</p>
                                            {item.notes && (
                                                <p className="text-xs text-muted-foreground">{item.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {sale.notes && (
                            <>
                                <Separator />
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Notes</h4>
                                    <p className="text-sm bg-muted p-3 rounded-lg">{sale.notes}</p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Payment & Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-orange-500" />
                            Payment Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Payment Summary */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Payment Summary</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${sale.subtotal?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span>${sale.taxTotal?.toFixed(2)}</span>
                                </div>
                                {sale.discountTotal > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Discount</span>
                                        <span>-${sale.discountTotal?.toFixed(2)}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-orange-600">${sale.totalAmount?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Payment Status */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Payment Method</span>
                                <span className="font-medium capitalize">{sale.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Payment Status</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(sale.paymentStatus)}`}>
                                    {sale.paymentStatus === 'confirmed' ? 'Confirmed' : sale.paymentStatus}
                                </span>
                            </div>
                        </div>

                        {/* Update Payment Status */}
                        {sale.paymentStatus === 'pending' && (
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Update Payment Status</p>
                                <Select
                                    onValueChange={handleUpdatePaymentStatus}
                                    disabled={updating}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="confirmed">Confirm Payment</SelectItem>
                                        <SelectItem value="cancelled">Cancel</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {sale.paymentStatus === 'pending' && (
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => handleUpdatePaymentStatus('confirmed')}
                                disabled={updating}
                            >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Confirm Payment
                            </Button>
                        )}

                        {sale.servedBy && (
                            <div className="text-xs text-muted-foreground text-center">
                                Served by: {sale.servedBy?.name || 'Unknown'}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Invoice Dialog - Only shown for confirmed orders */}
            {sale && sale.paymentStatus === 'confirmed' && (
                <RestaurantInvoiceDialog
                    open={showInvoice}
                    onClose={() => setShowInvoice(false)}
                    sale={{
                        id: sale._id,
                        saleNumber: sale.saleNumber,
                        customerName: sale.customerName,
                        customerPhone: sale.customerPhone,
                        tableNumber: sale.tableNumber,
                        items: sale.items.map((item: any) => ({
                            name: item.name,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            total: item.total
                        })),
                        subtotal: sale.subtotal,
                        taxTotal: sale.taxTotal,
                        discountTotal: sale.discountTotal,
                        totalAmount: sale.totalAmount,
                        paymentMethod: sale.paymentMethod,
                        paymentStatus: sale.paymentStatus,
                        orderType: sale.orderType,
                        createdAt: sale.createdAt,
                        servedBy: sale.servedBy?.name
                    }}
                />
            )}
        </div>
    );
}