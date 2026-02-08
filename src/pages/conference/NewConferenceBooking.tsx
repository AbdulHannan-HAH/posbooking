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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Building2, ArrowLeft, CalendarIcon, Clock, Users, CreditCard, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useConferenceService } from '@/services/conferenceService';

const bookingSchema = z.object({
    eventName: z.string().min(2, 'Event name must be at least 2 characters').max(200),
    clientName: z.string().min(2, 'Client name must be at least 2 characters').max(100),
    company: z.string().optional(),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    hallType: z.string({ required_error: 'Please select a hall' }),
    startDate: z.date({ required_error: 'Please select start date' }),
    endDate: z.date({ required_error: 'Please select end date' }),
    startTime: z.string({ required_error: 'Please select start time' }),
    endTime: z.string({ required_error: 'Please select end time' }),
    eventType: z.string({ required_error: 'Please select event type' }),
    attendees: z.number().min(1, 'At least 1 attendee required').max(500, 'Maximum 500 attendees'),
    cateringRequired: z.boolean().default(false),
    equipmentRequired: z.boolean().default(false),
    specialRequirements: z.string().optional(),
    amount: z.number().min(0, 'Amount must be positive'),
    advancePaid: z.number().min(0, 'Advance must be positive'),
    notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const eventTypes = [
    { value: 'meeting', label: 'Meeting' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'conference', label: 'Conference' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'party', label: 'Party' },
    { value: 'training', label: 'Training' },
    { value: 'exhibition', label: 'Exhibition' },
];

const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00'
];

export default function NewConferenceBooking() {
    const navigate = useNavigate();
    const conferenceService = useConferenceService();
    const [halls, setHalls] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedHall, setSelectedHall] = useState<any>(null);
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
        from: new Date(),
        to: new Date()
    });

    const form = useForm<BookingFormData>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            eventName: '',
            clientName: '',
            company: '',
            email: '',
            phone: '',
            hallType: '',
            startDate: new Date(),
            endDate: new Date(),
            startTime: '09:00',
            endTime: '17:00',
            eventType: 'meeting',
            attendees: 10,
            cateringRequired: false,
            equipmentRequired: false,
            specialRequirements: '',
            amount: 0,
            advancePaid: 0,
            notes: '',
        },
    });

    useEffect(() => {
        fetchHalls();
    }, []);

    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === 'hallType' || name === 'startDate' || name === 'endDate' ||
                name === 'cateringRequired' || name === 'equipmentRequired') {
                calculateAmount();
            }
        });
        return () => subscription.unsubscribe();
    }, [form.watch]);

    const fetchHalls = async () => {
        try {
            const response = await conferenceService.getConferenceHalls();
            if (response.success && response.halls) {
                setHalls(response.halls);
                if (response.halls.length > 0 && !form.getValues().hallType) {
                    const firstHall = response.halls[0];
                    form.setValue('hallType', firstHall.value);
                    setSelectedHall(firstHall);
                    calculateAmount();
                }
            }
        } catch (error: any) {
            console.error('Error fetching halls:', error);
            toast.error('Failed to load conference halls');
        }
    };

    const calculateAmount = () => {
        const hallValue = form.getValues('hallType');
        const startDate = form.getValues('startDate');
        const endDate = form.getValues('endDate');
        const cateringRequired = form.getValues('cateringRequired');
        const equipmentRequired = form.getValues('equipmentRequired');

        if (!hallValue || !startDate || !endDate) {
            form.setValue('amount', 0);
            return;
        }

        const hall = halls.find(h => h.value === hallValue);
        if (!hall) {
            form.setValue('amount', 0);
            return;
        }

        // Calculate days difference
        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const daysCount = Math.max(1, daysDiff);

        // Base amount from hall rental
        let amount = daysCount * hall.dailyRate;

        // Add extra charges
        if (cateringRequired) {
            amount += 500; // Catering base charge
        }

        if (equipmentRequired) {
            amount += 300; // Equipment base charge
        }

        form.setValue('amount', amount);
        setSelectedHall(hall);
    };

    const onSubmit = async (data: BookingFormData) => {
        try {
            setLoading(true);
            console.log('Submitting booking data:', data);

            const bookingData = {
                ...data,
                startDate: format(data.startDate, 'yyyy-MM-dd'),
                endDate: format(data.endDate, 'yyyy-MM-dd'),
            };

            const response = await conferenceService.createBooking(bookingData);

            if (response.success) {
                toast.success('Conference booking created successfully!');
                navigate('/conference/bookings');
            } else {
                toast.error(response.message || 'Failed to create booking');
            }
        } catch (error: any) {
            console.error('Booking creation error:', error);
            toast.error(error.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    const handleDateSelect = (range: any) => {
        if (range?.from && range?.to) {
            setDateRange(range);
            form.setValue('startDate', range.from);
            form.setValue('endDate', range.to);

            // Manually trigger validation for date fields
            form.trigger(['startDate', 'endDate']);

            // Recalculate amount
            setTimeout(() => calculateAmount(), 100);
        }
    };

    const getHallDisplay = (hallValue: string) => {
        const hall = halls.find(h => h.value === hallValue);
        return hall ? hall.name : hallValue;
    };

    const formatHallInfo = (hall: any) => {
        if (!hall) return '';
        return `${hall.name} (Capacity: ${hall.capacity}, Rate: $${hall.dailyRate}/day)`;
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
                        <div className="h-10 w-10 rounded-xl gradient-conference flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <h1 className="text-3xl font-bold">New Conference Booking</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">Create a new conference hall booking</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Client & Event Details */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Users className="h-5 w-5 text-conference" />
                                    Client & Event Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="clientName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Client Name *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Smith" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="company"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Company (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Company Name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="eventName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Event Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Annual General Meeting" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email *</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="john@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+1 234 567 8900" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="eventType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Event Type *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select event type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {eventTypes.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="attendees"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Number of Attendees *</FormLabel>
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
                                                    onClick={() => field.onChange(Math.min(500, (field.value || 1) + 1))}
                                                    disabled={field.value >= 500}
                                                >
                                                    +
                                                </Button>
                                                <span className="text-sm text-muted-foreground ml-2">
                                                    (Max 500 attendees)
                                                </span>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="specialRequirements"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Special Requirements (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Any special setup, equipment, or requirements..."
                                                    className="min-h-[100px]"
                                                    {...field}
                                                />
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
                                    <CreditCard className="h-5 w-5 text-conference" />
                                    Booking Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedHall && (
                                    <div className="p-4 rounded-lg bg-conference-light">
                                        <h4 className="font-semibold mb-2">{selectedHall.name}</h4>
                                        <p className="text-sm text-muted-foreground mb-2">{selectedHall.description}</p>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Capacity</p>
                                                <p className="font-medium">{selectedHall.capacity} people</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Daily Rate</p>
                                                <p className="font-medium">${selectedHall.dailyRate}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Dates</span>
                                        <span className="font-medium">
                                            {form.watch('startDate') ? format(form.watch('startDate'), 'MMM dd, yyyy') : 'Select dates'} -{' '}
                                            {form.watch('endDate') ? format(form.watch('endDate'), 'MMM dd, yyyy') : 'Select dates'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Time</span>
                                        <span className="font-medium">
                                            {form.watch('startTime')} - {form.watch('endTime')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Attendees</span>
                                        <span className="font-medium">{form.watch('attendees')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Hall</span>
                                        <span className="font-medium">
                                            {form.watch('hallType') ? getHallDisplay(form.watch('hallType')) : 'Not selected'}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Hall Rental</span>
                                            <span>${selectedHall ?
                                                selectedHall.dailyRate *
                                                (form.watch('startDate') && form.watch('endDate') ?
                                                    Math.max(1, Math.ceil(
                                                        (form.watch('endDate').getTime() - form.watch('startDate').getTime()) /
                                                        (1000 * 60 * 60 * 24)
                                                    )) : 1)
                                                : 0}
                                            </span>
                                        </div>
                                        {form.watch('cateringRequired') && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Catering</span>
                                                <span>$500.00</span>
                                            </div>
                                        )}
                                        {form.watch('equipmentRequired') && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Equipment</span>
                                                <span>$300.00</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t">
                                        <span>Total Amount</span>
                                        <span className="text-conference">${form.watch('amount').toFixed(2)}</span>
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="advancePaid"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Advance Payment ($)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={field.value}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-2">
                                    <FormField
                                        control={form.control}
                                        name="cateringRequired"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Catering Required</FormLabel>
                                                    <p className="text-xs text-muted-foreground">Add catering service</p>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="equipmentRequired"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Equipment Required</FormLabel>
                                                    <p className="text-xs text-muted-foreground">Add AV equipment</p>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full gradient-conference border-0"
                                    disabled={loading || !form.watch('hallType')}
                                >
                                    {loading ? 'Creating Booking...' : 'Create Booking'}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Date, Time & Hall Selection */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5 text-conference" />
                                    Date, Time & Hall Selection
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Date Range Selection */}
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Select Dates *</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                'w-full pl-3 text-left font-normal',
                                                                !dateRange && 'text-muted-foreground'
                                                            )}
                                                        >
                                                            {dateRange?.from ? (
                                                                dateRange.to ? (
                                                                    <>
                                                                        {format(dateRange.from, 'MMM dd, yyyy')} -{' '}
                                                                        {format(dateRange.to, 'MMM dd, yyyy')}
                                                                    </>
                                                                ) : (
                                                                    format(dateRange.from, 'MMM dd, yyyy')
                                                                )
                                                            ) : (
                                                                'Pick a date range'
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        initialFocus
                                                        mode="range"
                                                        defaultMonth={dateRange?.from}
                                                        selected={dateRange}
                                                        onSelect={handleDateSelect}
                                                        numberOfMonths={2}
                                                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Time Selection */}
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="startTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Time *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <Clock className="h-4 w-4 mr-2" />
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {timeSlots.map((time) => (
                                                            <SelectItem key={time} value={time}>
                                                                {time}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="endTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>End Time *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <Clock className="h-4 w-4 mr-2" />
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {timeSlots.map((time) => (
                                                            <SelectItem key={time} value={time}>
                                                                {time}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Hall Selection */}
                                <FormField
                                    control={form.control}
                                    name="hallType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Select Hall *</FormLabel>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {halls.map((hall) => (
                                                    <div
                                                        key={hall._id}
                                                        className={cn(
                                                            'p-4 rounded-lg border-2 cursor-pointer transition-all',
                                                            field.value === hall.value
                                                                ? 'border-conference bg-conference-light'
                                                                : 'border-border hover:border-conference/50',
                                                            !hall.isActive && 'opacity-50 cursor-not-allowed'
                                                        )}
                                                        onClick={() => {
                                                            if (hall.isActive) {
                                                                field.onChange(hall.value);
                                                                setSelectedHall(hall);
                                                                calculateAmount();
                                                            }
                                                        }}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h4 className="font-medium">{hall.name}</h4>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    Capacity: {hall.capacity}
                                                                </p>
                                                                <p className="text-sm font-medium text-conference mt-1">
                                                                    ${hall.dailyRate}/day
                                                                </p>
                                                            </div>
                                                            {hall.isActive ? (
                                                                field.value === hall.value ? (
                                                                    <Check className="h-5 w-5 text-success" />
                                                                ) : null
                                                            ) : (
                                                                <X className="h-5 w-5 text-destructive" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Additional Information */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg">Additional Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Internal Notes (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Any internal notes or reminders..."
                                                    className="min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </Form>
        </div>
    );
}