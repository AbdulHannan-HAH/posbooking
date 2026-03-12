// pages/hotel/ViewHotelReservation.tsx - WITH DISPLAY OF DISCOUNT
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Hotel,
    ArrowLeft,
    User,
    Mail,
    Phone,
    Calendar,
    Clock,
    Users,
    CreditCard,
    Printer,
    Edit,
    Trash2,
    Loader2,
    LogIn,
    LogOut,
    DollarSign,
    AlertCircle
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { InvoiceDialog } from '@/components/hotel/InvoiceDialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useHotelService } from '@/services/hotelService';
import { format } from 'date-fns';

export default function ViewHotelReservation() {
    const { id } = useParams();
    const navigate = useNavigate();
    const hotelService = useHotelService();
    const [showInvoice, setShowInvoice] = useState(false);
    const [reservation, setReservation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [updatingPayment, setUpdatingPayment] = useState(false);

    useEffect(() => {
        if (id) {
            fetchReservation();
        }
    }, [id]);

    const fetchReservation = async () => {
        try {
            setLoading(true);
            const response = await hotelService.getReservationById(id!);
            if (response.success) {
                setReservation(response.reservation);
            } else {
                toast.error(response.message || 'Failed to load reservation');
                navigate('/hotel/reservations');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load reservation');
            navigate('/hotel/reservations');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        try {
            const response = await hotelService.checkIn(id!);
            if (response.success) {
                toast.success('Guest checked in successfully');
                fetchReservation();
            } else {
                toast.error(response.message || 'Failed to check in');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to check in');
        }
    };

    const handleCheckOut = async () => {
        try {
            const response = await hotelService.checkOut(id!);
            if (response.success) {
                toast.success('Guest checked out successfully');
                fetchReservation();
            } else {
                toast.error(response.message || 'Failed to check out');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to check out');
        }
    };

    const handleUpdatePayment = async (paymentStatus: string) => {
        try {
            setUpdatingPayment(true);
            const response = await hotelService.updateReservation(id!, { paymentStatus });
            if (response.success) {
                toast.success('Payment status updated');
                fetchReservation();
            } else {
                toast.error(response.message || 'Failed to update payment');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update payment');
        } finally {
            setUpdatingPayment(false);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await hotelService.deleteReservation(id!);
            if (response.success) {
                toast.success('Reservation deleted successfully');
                navigate('/hotel/reservations');
            } else {
                toast.error(response.message || 'Failed to delete reservation');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete reservation');
        } finally {
            setDeleteDialogOpen(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                    <p className="mt-4 text-muted-foreground">Loading reservation details...</p>
                </div>
            </div>
        );
    }

    if (!reservation) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-muted-foreground">Reservation not found</p>
                    <Button onClick={() => navigate('/hotel/reservations')} className="mt-4">
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
                            <div className="h-10 w-10 rounded-xl gradient-hotel flex items-center justify-center">
                                <Hotel className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Reservation {reservation.reservationNumber}</h1>
                                <p className="text-muted-foreground">
                                    Created on {format(new Date(reservation.createdAt), 'PPP')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowInvoice(true)}>
                        <Printer className="h-4 w-4 mr-2" />
                        Invoice
                    </Button>
                    {reservation.reservationStatus === 'confirmed' && (
                        <>
                            <Button variant="outline" onClick={handleCheckIn}>
                                <LogIn className="h-4 w-4 mr-2" />
                                Check In
                            </Button>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(true)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        </>
                    )}
                    {reservation.reservationStatus === 'checked_in' && (
                        <Button onClick={handleCheckOut} disabled={reservation.paymentStatus !== 'paid'}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Check Out
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Reservation Details */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Reservation Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Guest Info */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Guest Information</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-medium">{reservation.guestName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{reservation.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                        <Phone className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Phone</p>
                                        <p className="font-medium">{reservation.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Stay Info */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Stay Information</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-hotel-light flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-hotel" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Check-in</p>
                                        <p className="font-medium">{format(new Date(reservation.checkIn), 'PPP')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-hotel-light flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-hotel" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Check-out</p>
                                        <p className="font-medium">{format(new Date(reservation.checkOut), 'PPP')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-hotel-light flex items-center justify-center">
                                        <Hotel className="h-5 w-5 text-hotel" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Room</p>
                                        <p className="font-medium">{reservation.roomNumber} ({reservation.roomType})</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-hotel-light flex items-center justify-center">
                                        <Users className="h-5 w-5 text-hotel" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Guests</p>
                                        <p className="font-medium">{reservation.adults} adults, {reservation.children} children</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {reservation.specialRequests && (
                            <>
                                <Separator />
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Special Requests</h4>
                                    <p className="text-sm bg-muted p-3 rounded-lg">{reservation.specialRequests}</p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Payment Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-hotel" />
                            Payment Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <div className="flex items-center gap-2">
                                <StatusBadge status={reservation.reservationStatus} />
                                <StatusBadge status={reservation.paymentStatus} />
                            </div>
                        </div>

                        {/* Payment Status Update */}
                        {(reservation.reservationStatus === 'confirmed' || reservation.reservationStatus === 'checked_in') && (
                            <div className="space-y-2">
                                <Separator />
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Update Payment Status</p>
                                    <Select
                                        value={reservation.paymentStatus}
                                        onValueChange={handleUpdatePayment}
                                        disabled={updatingPayment}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="partial">Partial</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {reservation.paymentStatus !== 'paid' && reservation.reservationStatus === 'checked_in' && (
                                        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                            <div className="flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-amber-800">Payment Required</p>
                                                    <p className="text-xs text-amber-600 mt-1">
                                                        Update payment status to "Paid" to enable checkout.
                                                        Current status: <span className="font-semibold">{reservation.paymentStatus}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <Separator />

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Room {reservation.roomNumber}</span>
                                <span>${reservation.roomRate.toFixed(2)} × {reservation.totalNights} nights</span>
                            </div>
                            {reservation.extraCharges && reservation.extraCharges.length > 0 && (
                                <>
                                    {reservation.extraCharges.map((charge: any, index: number) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{charge.service}</span>
                                            <span>${charge.amount.toFixed(2)} × {charge.quantity}</span>
                                        </div>
                                    ))}
                                </>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${reservation.subTotal.toFixed(2)}</span>
                            </div>
                            {/* Discount line */}
                            {reservation.discount > 0 && (
                                <div className="flex justify-between text-sm text-success">
                                    <span className="text-muted-foreground">Discount</span>
                                    <span>-${reservation.discount.toFixed(2)}</span>
                                </div>
                            )}
                            {/* Tax removed */}
                            {reservation.discount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Discount</span>
                                    <span className="text-success">-${reservation.discount.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        <Separator />

                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="text-hotel">${reservation.totalAmount.toFixed(2)}</span>
                        </div>

                        <div className="space-y-2">
                            {reservation.reservationStatus === 'confirmed' && (
                                <Button className="w-full gradient-hotel border-0" onClick={handleCheckIn}>
                                    <LogIn className="h-4 w-4 mr-2" />
                                    Check In Guest
                                </Button>
                            )}
                            {reservation.reservationStatus === 'checked_in' && (
                                <Button
                                    className="w-full"
                                    variant={reservation.paymentStatus === 'paid' ? 'default' : 'outline'}
                                    onClick={handleCheckOut}
                                    disabled={reservation.paymentStatus !== 'paid'}
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    {reservation.paymentStatus === 'paid' ? 'Check Out Guest' : 'Complete Payment First'}
                                </Button>
                            )}
                            {reservation.reservationStatus === 'checked_out' && (
                                <Button className="w-full" variant="outline" disabled>
                                    <Clock className="h-4 w-4 mr-2" />
                                    Stay Completed
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Invoice Dialog */}
            {reservation && (
                <InvoiceDialog
                    open={showInvoice}
                    onClose={() => setShowInvoice(false)}
                    reservation={{
                        id: reservation.reservationNumber,
                        guestName: reservation.guestName,
                        email: reservation.email,
                        phone: reservation.phone,
                        checkIn: format(new Date(reservation.checkIn), 'PPP'),
                        checkOut: format(new Date(reservation.checkOut), 'PPP'),
                        roomNumber: reservation.roomNumber,
                        roomType: reservation.roomType,
                        adults: reservation.adults,
                        children: reservation.children,
                        nights: reservation.totalNights,
                        roomRate: reservation.roomRate,
                        totalAmount: reservation.totalAmount,
                        paymentStatus: reservation.paymentStatus,
                        discount: reservation.discount || 0, // pass discount
                    }}
                    services={reservation.extraCharges?.map((charge: any) => ({
                        name: charge.service,
                        price: charge.amount,
                        quantity: charge.quantity,
                        total: charge.amount * charge.quantity
                    }))}
                />
            )}

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel this reservation? This action cannot be undone.
                            A cancellation fee may apply.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Cancel Reservation
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}