import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Waves,
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
  RefreshCw
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { InvoiceDialog } from '@/components/pool/InvoiceDialog';
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
import { usePoolService } from '@/services/poolService';
import { format } from 'date-fns';

export default function ViewPoolBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const poolService = usePoolService();
  const [showInvoice, setShowInvoice] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBooking();
    }
  }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      console.log('Fetching booking with ID:', id);
      const response = await poolService.getBookingById(id!);
      console.log('Booking response:', response);

      if (response.success) {
        setBooking(response.booking);
      } else {
        toast.error(response.message || 'Failed to load booking');
        navigate('/pool/bookings');
      }
    } catch (error: any) {
      console.error('Error fetching booking:', error);
      toast.error(error.message || 'Failed to load booking');
      navigate('/pool/bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBooking();
  };

  const handleDelete = async () => {
    try {
      const response = await poolService.deleteBooking(id!);
      if (response.success) {
        toast.success('Booking deleted successfully');
        navigate('/pool/bookings');
      } else {
        toast.error(response.message || 'Failed to delete booking');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete booking');
    }
  };

  const handleMarkPaid = async () => {
    try {
      const response = await poolService.updatePaymentStatus(id!, 'paid');
      if (response.success) {
        toast.success('Payment status updated to Paid');
        fetchBooking();
      } else {
        toast.error(response.message || 'Failed to update status');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleMarkCancelled = async () => {
    try {
      const response = await poolService.updatePaymentStatus(id!, 'cancelled');
      if (response.success) {
        toast.success('Booking cancelled');
        fetchBooking();
      } else {
        toast.error(response.message || 'Failed to cancel booking');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  const formatTimeSlot = (timeSlot: string) => {
    const timeMap: Record<string, string> = {
      '06:00-09:00': '06:00 AM - 09:00 AM',
      '09:00-12:00': '09:00 AM - 12:00 PM',
      '12:00-15:00': '12:00 PM - 03:00 PM',
      '15:00-18:00': '03:00 PM - 06:00 PM',
      '18:00-21:00': '06:00 PM - 09:00 PM',
    };
    return timeMap[timeSlot] || timeSlot;
  };

  const getPassTypeDisplay = (passType: string) => {
    const typeMap: Record<string, string> = {
      'hourly': 'Hourly Pass',
      'daily': 'Daily Pass',
      'family': 'Family Pass'
    };
    return typeMap[passType] || passType;
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
        <div className="text-center">
          <p className="text-muted-foreground">Booking not found</p>
          <Button onClick={() => navigate('/pool/bookings')} className="mt-4">
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
              <div className="h-10 w-10 rounded-xl gradient-pool flex items-center justify-center">
                <Waves className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Booking {booking.bookingNumber}</h1>
                <p className="text-muted-foreground">
                  Created on {format(new Date(booking.createdAt), 'PPP')}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setShowInvoice(true)}>
            <Printer className="h-4 w-4 mr-2" />
            Invoice
          </Button>
          {booking.paymentStatus !== 'cancelled' && (
            <>
              <Button variant="outline" onClick={() => navigate(`/pool/bookings/${id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this booking? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
                    <p className="font-medium">{booking.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{booking.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{booking.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Booking Info */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Booking Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-pool-light flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-pool" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{format(new Date(booking.date), 'PPP')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-pool-light flex items-center justify-center">
                    <Clock className="h-5 w-5 text-pool" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time Slot</p>
                    <p className="font-medium">{formatTimeSlot(booking.timeSlot)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-pool-light flex items-center justify-center">
                    <Waves className="h-5 w-5 text-pool" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pass Type</p>
                    <p className="font-medium">{getPassTypeDisplay(booking.passType)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-pool-light flex items-center justify-center">
                    <Users className="h-5 w-5 text-pool" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Persons</p>
                    <p className="font-medium">{booking.persons}</p>
                  </div>
                </div>
              </div>
            </div>

            {booking.notes && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Notes</h4>
                  <p className="text-sm bg-muted p-3 rounded-lg">{booking.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-pool" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={booking.paymentStatus} />
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{getPassTypeDisplay(booking.passType)}</span>
                <span>${(booking.amount / booking.persons).toFixed(2)} × {booking.persons}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${booking.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>$0.00</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-pool">${booking.amount.toFixed(2)}</span>
            </div>

            <div className="space-y-2">
              {booking.paymentStatus === 'pending' && (
                <Button className="w-full gradient-pool border-0" onClick={handleMarkPaid}>
                  Mark as Paid
                </Button>
              )}
              {booking.paymentStatus === 'paid' && (
                <Button className="w-full" variant="outline" onClick={handleMarkCancelled}>
                  Cancel Booking
                </Button>
              )}
              {booking.paymentStatus === 'cancelled' && (
                <Button className="w-full" variant="outline" disabled>
                  Booking Cancelled
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Dialog */}
      {booking && (
        <InvoiceDialog
          open={showInvoice}
          onClose={() => setShowInvoice(false)}
          booking={{
            id: booking.bookingNumber,
            customerName: booking.customerName,
            email: booking.email,
            phone: booking.phone,
            date: format(new Date(booking.date), 'PPP'),
            timeSlot: formatTimeSlot(booking.timeSlot),
            passType: getPassTypeDisplay(booking.passType),
            persons: booking.persons,
            amount: booking.amount,
            paymentStatus: booking.paymentStatus,
          }}
        />
      )}
    </div>
  );
}