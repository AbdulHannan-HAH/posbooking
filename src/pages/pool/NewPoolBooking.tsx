import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Waves, ArrowLeft, CalendarIcon, Clock, Users, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { InvoiceDialog } from '@/components/pool/InvoiceDialog';

// Time slots configuration
const TIME_SLOTS = [
  { id: '1', label: '06:00 AM - 09:00 AM', value: '06:00-09:00', available: 12 },
  { id: '2', label: '09:00 AM - 12:00 PM', value: '09:00-12:00', available: 8 },
  { id: '3', label: '12:00 PM - 03:00 PM', value: '12:00-15:00', available: 15 },
  { id: '4', label: '03:00 PM - 06:00 PM', value: '03:00-18:00', available: 20 },
  { id: '5', label: '06:00 PM - 09:00 PM', value: '18:00-21:00', available: 25 },
];

const PASS_TYPES = [
  { id: 'hourly', label: 'Hourly Pass', price: 15, description: 'Per person per hour' },
  { id: 'daily', label: 'Daily Pass', price: 25, description: 'Full day access per person' },
  { id: 'family', label: 'Family Pass', price: 60, description: 'Up to 4 family members' },
];

const MAX_CAPACITY = 50;

const bookingSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  date: z.date({ required_error: 'Please select a date' }),
  timeSlot: z.string({ required_error: 'Please select a time slot' }),
  passType: z.string({ required_error: 'Please select a pass type' }),
  persons: z.number().min(1, 'At least 1 person required').max(10, 'Maximum 10 persons per booking'),
  paymentStatus: z.enum(['paid', 'pending']),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function NewPoolBooking() {
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [bookingData, setBookingData] = useState<BookingFormData | null>(null);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: '',
      email: '',
      phone: '',
      passType: '',
      persons: 1,
      paymentStatus: 'pending',
    },
  });

  const selectedPassType = PASS_TYPES.find(p => p.id === form.watch('passType'));
  const personsCount = form.watch('persons') || 1;
  
  const calculateTotal = () => {
    if (!selectedPassType) return 0;
    if (selectedPassType.id === 'family') {
      return selectedPassType.price;
    }
    return selectedPassType.price * personsCount;
  };

  const onSubmit = (data: BookingFormData) => {
    // Check capacity
    const slot = TIME_SLOTS.find(s => s.value === data.timeSlot);
    if (slot && slot.available < data.persons) {
      toast.error(`Only ${slot.available} spots available in this slot`);
      return;
    }

    // In production, this would call the API
    console.log('Booking submitted:', data);
    
    setBookingData(data);
    setShowInvoice(true);
    toast.success('Booking created successfully!');
  };

  const handleInvoiceClose = () => {
    setShowInvoice(false);
    navigate('/pool/bookings');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-pool flex items-center justify-center">
              <Waves className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">New Pool Booking</h1>
          </div>
          <p className="text-muted-foreground mt-1">Create a new pool booking</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-pool" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 234 567 8900" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Booking Summary */}
            <Card className="lg:row-span-3">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-pool" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">
                      {form.watch('date') ? format(form.watch('date'), 'PPP') : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Slot</span>
                    <span className="font-medium">
                      {TIME_SLOTS.find(s => s.value === form.watch('timeSlot'))?.label || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pass Type</span>
                    <span className="font-medium">{selectedPassType?.label || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Persons</span>
                    <span className="font-medium">{personsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price per unit</span>
                    <span className="font-medium">${selectedPassType?.price || 0}</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-pool">${calculateTotal()}</span>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="paymentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full gradient-pool border-0">
                  Create Booking
                </Button>
              </CardContent>
            </Card>

            {/* Date & Time Selection */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-pool" />
                  Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Select Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeSlot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Time Slot</FormLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {TIME_SLOTS.map((slot) => (
                          <div
                            key={slot.id}
                            className={cn(
                              'p-4 rounded-lg border-2 cursor-pointer transition-all',
                              field.value === slot.value
                                ? 'border-pool bg-pool-light'
                                : 'border-border hover:border-pool/50',
                              slot.available === 0 && 'opacity-50 cursor-not-allowed'
                            )}
                            onClick={() => {
                              if (slot.available > 0) {
                                field.onChange(slot.value);
                                setSelectedSlot(slot.value);
                              }
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-pool" />
                              <span className="font-medium">{slot.label}</span>
                            </div>
                            <p className={cn(
                              'text-sm mt-1',
                              slot.available <= 5 ? 'text-warning' : 'text-muted-foreground'
                            )}>
                              {slot.available} spots available
                            </p>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pass Type & Persons */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Waves className="h-5 w-5 text-pool" />
                  Pass Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="passType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pass Type</FormLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {PASS_TYPES.map((pass) => (
                          <div
                            key={pass.id}
                            className={cn(
                              'p-4 rounded-lg border-2 cursor-pointer transition-all text-center',
                              field.value === pass.id
                                ? 'border-pool bg-pool-light'
                                : 'border-border hover:border-pool/50'
                            )}
                            onClick={() => field.onChange(pass.id)}
                          >
                            <p className="font-semibold">{pass.label}</p>
                            <p className="text-2xl font-bold text-pool mt-1">${pass.price}</p>
                            <p className="text-xs text-muted-foreground mt-1">{pass.description}</p>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="persons"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Persons</FormLabel>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => field.onChange(Math.max(1, (field.value || 1) - 1))}
                          disabled={field.value <= 1}
                        >
                          -
                        </Button>
                        <span className="text-2xl font-bold w-12 text-center">{field.value}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => field.onChange(Math.min(10, (field.value || 1) + 1))}
                          disabled={field.value >= 10}
                        >
                          +
                        </Button>
                        <span className="text-sm text-muted-foreground ml-2">
                          (Max 10 per booking)
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Pool Capacity</p>
                    <p className="text-xs text-muted-foreground">
                      Current: 42/{MAX_CAPACITY} | Available: {MAX_CAPACITY - 42} spots
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>

      {/* Invoice Dialog */}
      {bookingData && (
        <InvoiceDialog
          open={showInvoice}
          onClose={handleInvoiceClose}
          booking={{
            id: `PB-${Date.now()}`,
            customerName: bookingData.customerName,
            email: bookingData.email,
            phone: bookingData.phone,
            date: format(bookingData.date, 'PPP'),
            timeSlot: TIME_SLOTS.find(s => s.value === bookingData.timeSlot)?.label || '',
            passType: PASS_TYPES.find(p => p.id === bookingData.passType)?.label || '',
            persons: bookingData.persons,
            amount: calculateTotal(),
            paymentStatus: bookingData.paymentStatus,
          }}
        />
      )}
    </div>
  );
}
