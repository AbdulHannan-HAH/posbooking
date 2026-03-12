import { useState, useEffect } from 'react';
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
import { Waves, ArrowLeft, CalendarIcon, Clock, Users, CreditCard, Loader2, Percent } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { InvoiceDialog } from '@/components/pool/InvoiceDialog';
import { usePoolService } from '@/services/poolService';

const bookingSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  date: z.date({ required_error: 'Please select a date' }),
  timeSlot: z.string({ required_error: 'Please select a time slot' }),
  passType: z.string({ required_error: 'Please select a pass type' }),
  persons: z.number().min(1, 'At least 1 person required').max(10, 'Maximum 10 persons per booking'),
  discount: z.number().min(0, 'Discount cannot be negative').max(100000, 'Discount amount too high').optional(),
  paymentStatus: z.enum(['paid', 'pending']),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function NewPoolBooking() {
  const navigate = useNavigate();
  const poolService = usePoolService();
  const [showInvoice, setShowInvoice] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [ticketPrices, setTicketPrices] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: '',
      email: '',
      phone: '',
      persons: 1,
      discount: 0,
      paymentStatus: 'pending',
      notes: '',
    },
  });

  const selectedPassType = ticketPrices.find(p => p.passType === form.watch('passType'));
  const personsCount = form.watch('persons') || 1;
  const discountAmount = form.watch('discount') || 0;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setApiError(null);

      console.log('🔄 Fetching ticket prices and time slots...');

      const [pricesResponse, slotsResponse] = await Promise.all([
        poolService.getTicketPrices(),
        poolService.getTimeSlots()
      ]);

      console.log('📊 Ticket prices response:', pricesResponse);
      console.log('📊 Time slots response:', slotsResponse);

      // Handle ticket prices
      if (pricesResponse.success) {
        if (pricesResponse.ticketPrices && pricesResponse.ticketPrices.length > 0) {
          setTicketPrices(pricesResponse.ticketPrices);
          form.setValue('passType', pricesResponse.ticketPrices[0].passType);
          console.log('✅ Using API ticket prices:', pricesResponse.ticketPrices.length);
        } else {
          setApiError('No ticket prices found in database. Please initialize them.');
          console.warn('⚠️ No ticket prices in response');
        }
      } else {
        setApiError(pricesResponse.message || 'Failed to load ticket prices');
        console.error('❌ Ticket prices error:', pricesResponse.message);
      }

      // Handle time slots
      if (slotsResponse.success) {
        if (slotsResponse.timeSlots && slotsResponse.timeSlots.length > 0) {
          setTimeSlots(slotsResponse.timeSlots);
          form.setValue('timeSlot', slotsResponse.timeSlots[0].value);
          console.log('✅ Using API time slots:', slotsResponse.timeSlots.length);
        } else {
          setApiError(prev => prev ? `${prev}, No time slots found` : 'No time slots found. Please initialize them.');
          console.warn('⚠️ No time slots in response');
        }
      } else {
        setApiError(prev => prev ? `${prev}, ${slotsResponse.message}` : slotsResponse.message);
        console.error('❌ Time slots error:', slotsResponse.message);
      }

    } catch (error: any) {
      console.error('❌ Error fetching data:', error);
      setApiError(error.message || 'Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const getPassTypeDisplay = (passType: string) => {
    const displayMap: Record<string, string> = {
      'daily': 'Daily Pass',
      'family': 'Family Pass',
      'hourly': 'Others Pass'
    };
    return displayMap[passType] || passType;
  };

  const calculateSubtotal = () => {
    if (!selectedPassType) return 0;
    if (selectedPassType.passType === 'family') {
      return selectedPassType.price;
    }
    return selectedPassType.price * personsCount;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = discountAmount || 0;
    return Math.max(0, subtotal - discount);
  };

  const onSubmit = async (data: BookingFormData) => {
    try {
      setSubmitting(true);

      const apiData = {
        customerName: data.customerName,
        email: data.email || '',
        phone: data.phone || '',
        date: format(data.date, 'yyyy-MM-dd'),
        timeSlot: data.timeSlot,
        passType: data.passType,
        persons: data.persons,
        discount: data.discount || 0,
        paymentStatus: data.paymentStatus,
        notes: data.notes || '',
      };

      console.log('📝 Creating booking with data:', apiData);

      const response = await poolService.createBooking(apiData);
      console.log('✅ Create booking response:', response);

      if (response.success) {
        setBookingData(response.booking);
        setShowInvoice(true);
        toast.success('Booking created successfully!');

        // Reset form but keep date and time slot for next booking
        form.reset({
          customerName: '',
          email: '',
          phone: '',
          date: data.date,
          timeSlot: data.timeSlot,
          passType: data.passType,
          persons: 1,
          discount: 0,
          paymentStatus: 'pending',
          notes: '',
        });
      } else {
        toast.error(response.message || 'Failed to create booking');
      }
    } catch (error: any) {
      console.error('❌ Error creating booking:', error);
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInvoiceClose = () => {
    setShowInvoice(false);
    navigate('/pool/bookings');
  };

  const handleRetry = () => {
    fetchData();
  };

  const subtotal = calculateSubtotal();
  const total = calculateTotal();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading booking form...</p>
        </div>
      </div>
    );
  }

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
          {apiError && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded flex items-center gap-2">
              ⚠️ {apiError}
              <Button variant="outline" size="sm" onClick={handleRetry}>
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>

      {ticketPrices.length === 0 || timeSlots.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Unable to load booking form data. Please try again.</p>
            <Button onClick={handleRetry} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
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
                          <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
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
                          <FormLabel>Email <span className="text-muted-foreground text-xs">(Optional)</span></FormLabel>
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
                        <FormLabel>Phone Number <span className="text-muted-foreground text-xs">(Optional)</span></FormLabel>
                        <FormControl>
                          <Input placeholder="+1 234 567 8900" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Any special requirements..." {...field} />
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
                        {timeSlots.find(s => s.value === form.watch('timeSlot'))?.label || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pass Type</span>
                      <span className="font-medium">{selectedPassType ? getPassTypeDisplay(selectedPassType.passType) : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Persons</span>
                      <span className="font-medium">{personsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price per unit</span>
                      <span className="font-medium">${selectedPassType?.price || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">${subtotal}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-pool">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="font-medium">-${discountAmount}</span>
                      </div>
                    )}
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-pool">${total}</span>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Percent className="h-4 w-4" />
                          Discount Amount ($)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Enter discount amount"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Status <span className="text-red-500">*</span></FormLabel>
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

                  <Button type="submit" className="w-full gradient-pool border-0" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Booking'
                    )}
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
                        <FormLabel>Select Date <span className="text-red-500">*</span></FormLabel>
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
                        <FormLabel>Select Time Slot <span className="text-red-500">*</span></FormLabel>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {timeSlots.map((slot) => (
                            <div
                              key={slot._id}
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
                        <FormLabel>Pass Type <span className="text-red-500">*</span></FormLabel>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {ticketPrices.map((pass) => (
                            <div
                              key={pass._id}
                              className={cn(
                                'p-4 rounded-lg border-2 cursor-pointer transition-all text-center',
                                field.value === pass.passType
                                  ? 'border-pool bg-pool-light'
                                  : 'border-border hover:border-pool/50'
                              )}
                              onClick={() => field.onChange(pass.passType)}
                            >
                              <p className="font-semibold">{getPassTypeDisplay(pass.passType)}</p>
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
                        <FormLabel>Number of Persons <span className="text-red-500">*</span></FormLabel>
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
                            onClick={() => field.onChange(Math.min(selectedPassType?.maxPersons || 10, (field.value || 1) + 1))}
                            disabled={field.value >= (selectedPassType?.maxPersons || 10)}
                          >
                            +
                          </Button>
                          <span className="text-sm text-muted-foreground ml-2">
                            (Max {selectedPassType?.maxPersons || 10} per booking)
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
                        Total Capacity: {timeSlots.reduce((sum, slot) => sum + slot.maxCapacity, 0)} |
                        Available: {timeSlots.reduce((sum, slot) => sum + slot.available, 0)} spots
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>
      )}

      {/* Invoice Dialog */}
      {bookingData && (
        <InvoiceDialog
          open={showInvoice}
          onClose={handleInvoiceClose}
          booking={{
            id: bookingData.bookingNumber,
            customerName: bookingData.customerName,
            email: bookingData.email,
            phone: bookingData.phone,
            date: format(new Date(bookingData.date), 'PPP'),
            timeSlot: timeSlots.find(s => s.value === bookingData.timeSlot)?.label || bookingData.timeSlot,
            passType: getPassTypeDisplay(bookingData.passType),
            persons: bookingData.persons,
            subtotal: bookingData.subtotal,
            discount: bookingData.discount,
            amount: bookingData.amount,
            paymentStatus: bookingData.paymentStatus,
          }}
        />
      )}
    </div>
  );
}