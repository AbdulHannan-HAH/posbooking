import { useState } from 'react';
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
  Trash2
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

// Mock booking data - In production, fetch from API
const mockBooking = {
  id: 'PB-001',
  customerName: 'John Smith',
  email: 'john@example.com',
  phone: '+1 234 567 8900',
  date: 'January 15, 2024',
  timeSlot: '09:00 AM - 12:00 PM',
  passType: 'Daily Pass',
  persons: 2,
  amount: 50,
  paymentStatus: 'paid' as 'paid' | 'pending',
  createdAt: 'January 14, 2024 at 3:45 PM',
  notes: 'Regular customer, prefers morning slots',
};

export default function ViewPoolBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showInvoice, setShowInvoice] = useState(false);

  const handleDelete = () => {
    // In production, this would call the API
    toast.success('Booking deleted successfully');
    navigate('/pool/bookings');
  };

  const handleMarkPaid = () => {
    // In production, this would call the API
    toast.success('Payment status updated to Paid');
  };

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
                <h1 className="text-3xl font-bold">Booking {mockBooking.id}</h1>
                <p className="text-muted-foreground">Created on {mockBooking.createdAt}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowInvoice(true)}>
            <Printer className="h-4 w-4 mr-2" />
            Invoice
          </Button>
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
                    <p className="font-medium">{mockBooking.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{mockBooking.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{mockBooking.phone}</p>
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
                    <p className="font-medium">{mockBooking.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-pool-light flex items-center justify-center">
                    <Clock className="h-5 w-5 text-pool" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time Slot</p>
                    <p className="font-medium">{mockBooking.timeSlot}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-pool-light flex items-center justify-center">
                    <Waves className="h-5 w-5 text-pool" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pass Type</p>
                    <p className="font-medium">{mockBooking.passType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-pool-light flex items-center justify-center">
                    <Users className="h-5 w-5 text-pool" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Persons</p>
                    <p className="font-medium">{mockBooking.persons}</p>
                  </div>
                </div>
              </div>
            </div>

            {mockBooking.notes && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Notes</h4>
                  <p className="text-sm bg-muted p-3 rounded-lg">{mockBooking.notes}</p>
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
              <StatusBadge status={mockBooking.paymentStatus} />
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{mockBooking.passType}</span>
                <span>${mockBooking.amount / mockBooking.persons} × {mockBooking.persons}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${mockBooking.amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>$0.00</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-pool">${mockBooking.amount}</span>
            </div>

            {mockBooking.paymentStatus === 'pending' && (
              <Button className="w-full gradient-pool border-0" onClick={handleMarkPaid}>
                Mark as Paid
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoice Dialog */}
      <InvoiceDialog
        open={showInvoice}
        onClose={() => setShowInvoice(false)}
        booking={{
          id: mockBooking.id,
          customerName: mockBooking.customerName,
          email: mockBooking.email,
          phone: mockBooking.phone,
          date: mockBooking.date,
          timeSlot: mockBooking.timeSlot,
          passType: mockBooking.passType,
          persons: mockBooking.persons,
          amount: mockBooking.amount,
          paymentStatus: mockBooking.paymentStatus,
        }}
      />
    </div>
  );
}
