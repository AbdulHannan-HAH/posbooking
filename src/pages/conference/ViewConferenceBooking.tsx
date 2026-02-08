import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
    Building2,
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
    CheckCircle,
    XCircle,
    DollarSign,
    FileText,
    Briefcase,
    CheckSquare,
    XSquare,
    AlertCircle
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
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
import { useConferenceService } from '@/services/conferenceService';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function ViewConferenceBooking() {
    const { id } = useParams();
    const navigate = useNavigate();
    const conferenceService = useConferenceService();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (id) {
            fetchBooking();
        }
    }, [id]);

    const fetchBooking = async () => {
        try {
            setLoading(true);
            const response = await conferenceService.getBookingById(id!);
            if (response.success) {
                setBooking(response.booking);
            } else {
                toast.error(response.message || 'Failed to load booking');
                navigate('/conference/bookings');
            }
        } catch (error: any) {
            console.error('Error fetching booking:', error);
            toast.error(error.message || 'Failed to load booking');
            navigate('/conference/bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            const response = await conferenceService.deleteBooking(id!);
            if (response.success) {
                toast.success('Booking deleted successfully');
                navigate('/conference/bookings');
            } else {
                toast.error(response.message || 'Failed to delete booking');
            }
        } catch (error: any) {
            console.error('Error deleting booking:', error);
            toast.error(error.message || 'Failed to delete booking');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleApprove = async () => {
        try {
            setIsUpdating(true);
            const response = await conferenceService.updateBookingStatus(id!, 'approved');
            if (response.success) {
                toast.success('Booking approved successfully');
                await fetchBooking();
            } else {
                toast.error(response.message || 'Failed to approve booking');
            }
        } catch (error: any) {
            console.error('Error approving booking:', error);
            toast.error(error.message || 'Failed to approve booking');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleConfirm = async () => {
        try {
            setIsUpdating(true);
            const response = await conferenceService.updateBookingStatus(id!, 'confirmed');
            if (response.success) {
                toast.success('Booking confirmed');
                await fetchBooking();
            } else {
                toast.error(response.message || 'Failed to confirm booking');
            }
        } catch (error: any) {
            console.error('Error confirming booking:', error);
            toast.error(error.message || 'Failed to confirm booking');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancel = async () => {
        try {
            setIsUpdating(true);
            const response = await conferenceService.updateBookingStatus(id!, 'cancelled');
            if (response.success) {
                toast.success('Booking cancelled');
                await fetchBooking();
            } else {
                toast.error(response.message || 'Failed to cancel booking');
            }
        } catch (error: any) {
            console.error('Error cancelling booking:', error);
            toast.error(error.message || 'Failed to cancel booking');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleMarkPaid = async () => {
        try {
            setIsUpdating(true);
            const response = await conferenceService.updatePaymentStatus(id!, 'paid', booking?.amount || 0);
            if (response.success) {
                toast.success('Payment marked as paid');
                await fetchBooking();
            } else {
                toast.error(response.message || 'Failed to update payment');
            }
        } catch (error: any) {
            console.error('Error updating payment:', error);
            toast.error(error.message || 'Failed to update payment');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleMarkPartial = async () => {
        try {
            setIsUpdating(true);
            const response = await conferenceService.updatePaymentStatus(id!, 'partial', booking?.amount ? booking.amount / 2 : 0);
            if (response.success) {
                toast.success('Payment marked as partial');
                await fetchBooking();
            } else {
                toast.error(response.message || 'Failed to update payment');
            }
        } catch (error: any) {
            console.error('Error updating payment:', error);
            toast.error(error.message || 'Failed to update payment');
        } finally {
            setIsUpdating(false);
        }
    };

    const getHallDisplay = (hallType: string) => {
        const hallMap: Record<string, string> = {
            'hall_a': 'Hall A',
            'hall_b': 'Hall B',
            'grand_hall': 'Grand Hall',
            'meeting_room_1': 'Meeting Room 1',
            'meeting_room_2': 'Meeting Room 2'
        };
        return hallMap[hallType] || hallType;
    };

    const getEventTypeDisplay = (eventType: string) => {
        if (!eventType) return 'Unknown';
        return eventType.charAt(0).toUpperCase() + eventType.slice(1);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                    <p className="mt-4 text-muted-foreground">Loading booking details...</p>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
                            <h3 className="mt-4 text-lg font-semibold">Booking Not Found</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                The booking you're looking for doesn't exist or has been deleted.
                            </p>
                            <Button
                                onClick={() => navigate('/conference/bookings')}
                                className="mt-4"
                            >
                                Go Back to Bookings
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const balanceDue = (booking.amount || 0) - (booking.advancePaid || 0);
    const isBalanceDue = balanceDue > 0;

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
                            <div className="h-10 w-10 rounded-xl gradient-conference flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{booking.eventName || 'Untitled Event'}</h1>
                                <p className="text-muted-foreground">
                                    Booking #: {booking.bookingNumber || 'N/A'}
                                    {booking.invoiceNumber && ` • Invoice: ${booking.invoiceNumber}`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                    {booking.bookingStatus !== 'cancelled' && booking.bookingStatus !== 'completed' && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => navigate(`/conference/bookings/${id}/edit`)}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                            {booking.bookingStatus === 'pending' && (
                                <Button
                                    className="gradient-conference border-0"
                                    onClick={handleApprove}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Approve
                                </Button>
                            )}
                            {booking.bookingStatus === 'approved' && (
                                <Button
                                    className="gradient-conference border-0"
                                    onClick={handleConfirm}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Confirm
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Booking Details */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Booking Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Client Info */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Client Information</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Client Name</p>
                                        <p className="font-medium">{booking.clientName || 'Not specified'}</p>
                                    </div>
                                </div>
                                {booking.company && (
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                            <Briefcase className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Company</p>
                                            <p className="font-medium">{booking.company}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{booking.email || 'Not specified'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                        <Phone className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Phone</p>
                                        <p className="font-medium">{booking.phone || 'Not specified'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Event Details */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Event Details</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-conference-light flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-conference" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Dates</p>
                                        <p className="font-medium">
                                            {booking.startDate ? format(new Date(booking.startDate), 'PPP') : 'Not set'} -{' '}
                                            {booking.endDate ? format(new Date(booking.endDate), 'PPP') : 'Not set'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-conference-light flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-conference" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Time</p>
                                        <p className="font-medium">
                                            {booking.startTime || 'Not set'} - {booking.endTime || 'Not set'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-conference-light flex items-center justify-center">
                                        <Building2 className="h-5 w-5 text-conference" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Hall</p>
                                        <p className="font-medium">{getHallDisplay(booking.hallType)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-conference-light flex items-center justify-center">
                                        <Users className="h-5 w-5 text-conference" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Attendees & Type</p>
                                        <p className="font-medium">
                                            {booking.attendees || 0} ({getEventTypeDisplay(booking.eventType)})
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Services */}
                        {(booking.cateringRequired || booking.equipmentRequired || booking.specialRequirements) && (
                            <>
                                <Separator />
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Additional Services</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Catering Service</span>
                                            {booking.cateringRequired ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    <CheckSquare className="h-3 w-3 mr-1" />
                                                    Required
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                                    <XSquare className="h-3 w-3 mr-1" />
                                                    Not Required
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Audio/Video Equipment</span>
                                            {booking.equipmentRequired ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    <CheckSquare className="h-3 w-3 mr-1" />
                                                    Required
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                                    <XSquare className="h-3 w-3 mr-1" />
                                                    Not Required
                                                </Badge>
                                            )}
                                        </div>
                                        {booking.specialRequirements && (
                                            <div className="mt-2">
                                                <p className="text-sm font-medium mb-1">Special Requirements:</p>
                                                <p className="text-sm bg-muted p-3 rounded-lg">{booking.specialRequirements}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {booking.notes && (
                            <>
                                <Separator />
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Internal Notes</h4>
                                    <p className="text-sm bg-muted p-3 rounded-lg">{booking.notes}</p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Payment & Status Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-conference" />
                            Payment & Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Booking Status</span>
                                <StatusBadge status={booking.bookingStatus || 'pending'} />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Payment Status</span>
                                <StatusBadge status={booking.paymentStatus || 'pending'} />
                            </div>
                            {booking.approvedBy && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Approved By</span>
                                    <span className="font-medium">{booking.approvedBy?.name || 'N/A'}</span>
                                </div>
                            )}
                            {booking.approvedAt && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Approved On</span>
                                    <span className="font-medium">
                                        {format(new Date(booking.approvedAt), 'PPP')}
                                    </span>
                                </div>
                            )}
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Amount</span>
                                <span className="font-medium">{formatCurrency(booking.amount || 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Advance Paid</span>
                                <span>{formatCurrency(booking.advancePaid || 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Balance Due</span>
                                <span className={`font-medium ${isBalanceDue ? 'text-destructive' : 'text-success'}`}>
                                    {formatCurrency(balanceDue)}
                                </span>
                            </div>
                        </div>

                        <Separator />

                        <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created On</span>
                                <span>
                                    {booking.createdAt ? format(new Date(booking.createdAt), 'PPP') : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Last Updated</span>
                                <span>
                                    {booking.updatedAt ? format(new Date(booking.updatedAt), 'PPP') : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created By</span>
                                <span>{booking.createdBy?.name || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4">
                            {booking.bookingStatus === 'pending' && (
                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1 gradient-conference border-0"
                                        onClick={handleApprove}
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                        )}
                                        Approve
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" className="flex-1">
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Reject
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Reject Booking</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to reject this booking? This will cancel the booking.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleCancel}
                                                    className="bg-destructive text-destructive-foreground"
                                                >
                                                    Reject Booking
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            )}
                            {booking.bookingStatus === 'approved' && (
                                <Button
                                    className="w-full gradient-conference border-0"
                                    onClick={handleConfirm}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Confirm Booking
                                </Button>
                            )}
                            {booking.bookingStatus === 'confirmed' && (
                                <Button
                                    className="w-full gradient-success border-0"
                                    onClick={() => conferenceService.updateBookingStatus(id!, 'completed')}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Mark as Completed
                                </Button>
                            )}
                            {booking.paymentStatus !== 'paid' && isBalanceDue && (
                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1"
                                        variant="outline"
                                        onClick={handleMarkPartial}
                                        disabled={isUpdating}
                                    >
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Partial Payment
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        variant="default"
                                        onClick={handleMarkPaid}
                                        disabled={isUpdating}
                                    >
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Full Payment
                                    </Button>
                                </div>
                            )}
                            {booking.bookingStatus !== 'cancelled' && booking.bookingStatus !== 'completed' && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full" disabled={isDeleting}>
                                            {isDeleting ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4 mr-2" />
                                            )}
                                            Delete Booking
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete this booking? This action cannot be undone.
                                                {booking.bookingStatus === 'confirmed' && (
                                                    <span className="block mt-2 text-destructive font-medium">
                                                        Warning: This booking is confirmed. Deleting it may cause issues.
                                                    </span>
                                                )}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                className="bg-destructive text-destructive-foreground"
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? 'Deleting...' : 'Delete'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}