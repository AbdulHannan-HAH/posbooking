import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
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
import { Hotel, ArrowLeft, CalendarIcon, Users, CreditCard, BedDouble, Plus, Minus } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useHotelService, type HotelService } from '@/services/hotelService';
import { InvoiceDialog } from '@/components/hotel/InvoiceDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const reservationSchema = z.object({
    guestName: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    checkIn: z.date({ required_error: 'Please select check-in date' }),
    checkOut: z.date({ required_error: 'Please select check-out date' }),
    roomType: z.string({ required_error: 'Please select a room type' }),
    roomNumber: z.string({ required_error: 'Please select a room' }),
    adults: z.coerce.number().min(1, 'At least 1 adult required').max(4, 'Maximum 4 adults'),
    children: z.coerce.number().min(0).max(3),
    paymentStatus: z.enum(['paid', 'pending', 'partial']),
    specialRequests: z.string().optional(),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

interface SelectedService {
    service: HotelService;
    quantity: number;
}

export default function NewHotelReservation() {
    const navigate = useNavigate();
    const hotelService = useHotelService();

    const [showInvoice, setShowInvoice] = useState(false);
    const [reservationData, setReservationData] = useState<any>(null);
    const [roomTypes, setRoomTypes] = useState<any[]>([]);
    const [availableRooms, setAvailableRooms] = useState<any[]>([]);
    const [hotelServices, setHotelServices] = useState<HotelService[]>([]);
    const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);


    const [manualRoomSelection, setManualRoomSelection] = useState(false); // ✅ New flag
    // const [manualRoomSelection, setManualRoomSelection] = useState(false);
    // const selectedRoomNumber = form.watch('roomNumber');

    const form = useForm<ReservationFormData>({
        resolver: zodResolver(reservationSchema),
        defaultValues: {
            guestName: '',
            email: '',
            phone: '',
            checkIn: new Date(),
            checkOut: addDays(new Date(), 1),
            adults: 1,
            children: 0,
            paymentStatus: 'pending',
            specialRequests: '',
        },
    });

    const selectedRoomType = roomTypes.find(r => r._id === form.watch('roomType'));
    const checkInDate = form.watch('checkIn');
    const checkOutDate = form.watch('checkOut');
    const selectedRoomNumber = form.watch('roomNumber');
    const nights = checkInDate && checkOutDate
        ? Math.max(1, differenceInDays(checkOutDate, checkInDate))
        : 1;

    useEffect(() => {
        fetchData();
    }, []);

    const handleRoomSelection = (roomNumber: string) => {
        setManualRoomSelection(true); // user clicked
        form.setValue('roomNumber', roomNumber, { shouldValidate: true });
    };

    const fetchAvailableRooms = useCallback(async () => {
        if (!checkInDate || !checkOutDate || !selectedRoomType) return;

        try {
            const response = await hotelService.getAvailableRooms(
                format(checkInDate, 'yyyy-MM-dd'),
                format(checkOutDate, 'yyyy-MM-dd'),
                selectedRoomType.name
            );

            if (response.success) {
                const rooms = response.rooms || [];
                setAvailableRooms(rooms);

                // Auto-select the first room only if user didn't select manually
                if (!manualRoomSelection && (!selectedRoomNumber || selectedRoomNumber === '')) {
                    if (rooms.length > 0) {
                        const firstRoom = rooms[0].roomNumber;
                        form.setValue('roomNumber', firstRoom, { shouldValidate: true });
                    }
                }
            } else {
                setAvailableRooms([]);
                if (!manualRoomSelection && (!selectedRoomNumber || selectedRoomNumber === '')) {
                    form.setValue('roomNumber', '', { shouldValidate: true });
                }
            }
        } catch (error) {
            console.error('Error fetching available rooms:', error);
            setAvailableRooms([]);
            if (!manualRoomSelection && (!selectedRoomNumber || selectedRoomNumber === '')) {
                form.setValue('roomNumber', '', { shouldValidate: true });
            }
        }
    }, [checkInDate, checkOutDate, selectedRoomType, hotelService, manualRoomSelection, selectedRoomNumber]);


    // useEffect only triggers when checkIn, checkOut, or roomType change
    useEffect(() => {
        fetchAvailableRooms();
        // Reset manual selection whenever room type or dates change
        setManualRoomSelection(false);
    }, [checkInDate, checkOutDate, selectedRoomType, fetchAvailableRooms]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [roomTypesResponse, servicesResponse] = await Promise.all([
                hotelService.getRoomTypes(),
                hotelService.getServices()
            ]);

            if (roomTypesResponse.success && roomTypesResponse.roomTypes) {
                setRoomTypes(roomTypesResponse.roomTypes);
                if (roomTypesResponse.roomTypes.length > 0) {
                    form.setValue('roomType', roomTypesResponse.roomTypes[0]._id);
                }
            }

            if (servicesResponse.success && servicesResponse.services) {
                setHotelServices(servicesResponse.services);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleRoomTypeChange = (roomTypeId: string) => {
        form.setValue('roomType', roomTypeId);
        form.setValue('roomNumber', '');
        setManualRoomSelection(false); // reset manual selection
    };

    // const handleRoomSelection = (roomNumber: string) => {
    //     form.setValue('roomNumber', roomNumber);
    //     setManualRoomSelection(true); // ✅ Mark manual selection
    // };

    // Services functions remain same
    const handleServiceSelection = useCallback((service: HotelService) => {
        setSelectedServices(prev => {
            const existing = prev.find(s => s.service._id === service._id);
            if (existing) {
                return prev.filter(s => s.service._id !== service._id);
            } else {
                return [...prev, { service, quantity: 1 }];
            }
        });
    }, []);

    const updateServiceQuantity = useCallback((serviceId: string, quantity: number) => {
        if (quantity < 1) return;
        setSelectedServices(prev =>
            prev.map(item =>
                item.service._id === serviceId
                    ? { ...item, quantity }
                    : item
            )
        );
    }, []);

    const removeService = useCallback((serviceId: string) => {
        setSelectedServices(prev => prev.filter(item => item.service._id !== serviceId));
    }, []);

    // Calculation functions remain same
    const calculateRoomTotal = () => selectedRoomType ? selectedRoomType.basePrice * nights : 0;
    const calculateServicesTotal = () => selectedServices.reduce((sum, item) => sum + item.service.price * item.quantity, 0);
    const calculateTotal = () => {
        const roomTotal = calculateRoomTotal();
        const servicesTotal = calculateServicesTotal();
        const subtotal = roomTotal + servicesTotal;
        return { roomTotal, servicesTotal, subtotal, tax: 0, total: subtotal };
    };

    const onSubmit = async (data: ReservationFormData) => {
        if (submitting) return;
        if (!data.roomNumber) {
            toast.error('Please select a room');
            return;
        }

        try {
            setSubmitting(true);
            const totals = calculateTotal();
            const extraCharges = selectedServices.map(item => ({
                service: item.service.name,
                amount: item.service.price,
                quantity: item.quantity
            }));

            const reservationPayload = {
                guestName: data.guestName,
                email: data.email || '',
                phone: data.phone,
                checkIn: format(data.checkIn, 'yyyy-MM-dd'),
                checkOut: format(data.checkOut, 'yyyy-MM-dd'),
                roomType: selectedRoomType?.name || '',
                roomNumber: data.roomNumber,
                adults: data.adults,
                children: data.children,
                paymentStatus: data.paymentStatus,
                specialRequests: data.specialRequests || '',
                totalAmount: totals.total,
                extraCharges,
            };

            const response = await hotelService.createReservation(reservationPayload);

            if (response.success) {
                setReservationData(response.reservation);
                setShowInvoice(true);
                toast.success('Reservation created successfully!');

                form.reset({
                    guestName: '',
                    email: '',
                    phone: '',
                    checkIn: new Date(),
                    checkOut: addDays(new Date(), 1),
                    adults: 1,
                    children: 0,
                    paymentStatus: 'pending',
                    specialRequests: '',
                    roomType: roomTypes[0]?._id || '',
                    roomNumber: '',
                });
                setSelectedServices([]);
                setManualRoomSelection(false);
            } else {
                toast.error(response.message || 'Failed to create reservation');
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to create reservation');
        } finally {
            setSubmitting(false);
        }
    };

    const handleInvoiceClose = () => {
        setShowInvoice(false);
        navigate('/hotel/reservations');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading reservation form...</p>
                </div>
            </div>
        );
    }

    const totals = calculateTotal();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl gradient-hotel flex items-center justify-center">
                            <Hotel className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <h1 className="text-3xl font-bold">New Hotel Reservation</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">Create a new hotel reservation</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Guest Details */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Users className="h-5 w-5 text-hotel" />
                                    Guest Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="guestName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name *</FormLabel>
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
                                                <FormLabel>Email (Optional)</FormLabel>
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
                                            <FormLabel>Phone Number *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+1 234 567 8900" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="adults"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Adults *</FormLabel>
                                                <div className="flex items-center gap-4">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => field.onChange(Math.max(1, (field.value || 1) - 1))}
                                                        disabled={field.value <= 1}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <span className="text-2xl font-bold w-12 text-center">{field.value}</span>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => field.onChange(Math.min(4, (field.value || 1) + 1))}
                                                        disabled={field.value >= 4}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="children"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Children</FormLabel>
                                                <div className="flex items-center gap-4">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => field.onChange(Math.max(0, (field.value || 0) - 1))}
                                                        disabled={field.value <= 0}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <span className="text-2xl font-bold w-12 text-center">{field.value}</span>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => field.onChange(Math.min(3, (field.value || 0) + 1))}
                                                        disabled={field.value >= 3}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="specialRequests"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Special Requests (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Any special requirements..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Reservation Summary */}
                        <Card className="lg:row-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-hotel" />
                                    Reservation Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Check-in</span>
                                        <span className="font-medium">
                                            {checkInDate ? format(checkInDate, 'PPP') : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Check-out</span>
                                        <span className="font-medium">
                                            {checkOutDate ? format(checkOutDate, 'PPP') : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Nights</span>
                                        <span className="font-medium">{nights}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Room Type</span>
                                        <span className="font-medium">{selectedRoomType?.name || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Room Rate</span>
                                        <span className="font-medium">${selectedRoomType?.basePrice || 0}/night</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Selected Room</span>
                                        <span className="font-medium text-hotel">
                                            {selectedRoomNumber ? `Room ${selectedRoomNumber}` : 'Not selected'}
                                        </span>
                                    </div>
                                </div>

                                {/* Services Summary */}
                                {selectedServices.length > 0 && (
                                    <div className="border-t pt-4 space-y-2">
                                        <p className="text-sm font-medium">Additional Services:</p>
                                        {selectedServices.map((item, index) => (
                                            <div key={index} className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    {item.service.name} × {item.quantity}
                                                </span>
                                                <span>${(item.service.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Room Total</span>
                                        <span>${totals.roomTotal.toFixed(2)}</span>
                                    </div>
                                    {selectedServices.length > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Services Total</span>
                                            <span>${totals.servicesTotal.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>${totals.subtotal.toFixed(2)}</span>
                                    </div>
                                    {/* Tax removed as per requirement */}
                                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                                        <span>Total</span>
                                        <span className="text-hotel">${totals.total.toFixed(2)}</span>
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
                                                    <SelectItem value="partial">Partial</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full gradient-hotel border-0"
                                    disabled={submitting || !form.formState.isValid || availableRooms.length === 0 || !selectedRoomNumber}
                                >
                                    {submitting ? 'Creating...' : 'Create Reservation'}
                                </Button>

                                {availableRooms.length === 0 && checkInDate && checkOutDate && selectedRoomType && (
                                    <p className="text-sm text-red-500 text-center">
                                        No rooms available for selected dates and room type
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Dates Selection */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5 text-hotel" />
                                    Dates
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="checkIn"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Check-in Date *</FormLabel>
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
                                        name="checkOut"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Check-out Date *</FormLabel>
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
                                                            disabled={(date) => date <= (checkInDate || new Date())}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Room Type Selection */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BedDouble className="h-5 w-5 text-hotel" />
                                    Room Type Selection
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="roomType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Room Type *</FormLabel>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {roomTypes.map((roomType) => (
                                                    <div
                                                        key={roomType._id}
                                                        className={cn(
                                                            'p-4 rounded-lg border-2 cursor-pointer transition-all text-center',
                                                            field.value === roomType._id
                                                                ? 'border-hotel bg-hotel-light'
                                                                : 'border-border hover:border-hotel/50'
                                                        )}
                                                        onClick={() => handleRoomTypeChange(roomType._id)}
                                                    >
                                                        <p className="font-semibold">{roomType.name}</p>
                                                        <p className="text-2xl font-bold text-hotel mt-1">${roomType.basePrice}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">/night</p>
                                                        <p className="text-xs text-muted-foreground mt-1">Max {roomType.maxOccupancy} guests</p>
                                                        <div className="mt-2">
                                                            <Badge variant="outline" className="text-xs">
                                                                {roomType.amenities?.slice(0, 2).join(', ')}
                                                            </Badge>
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

                        {/* Room Selection - FIXED */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BedDouble className="h-5 w-5 text-hotel" />
                                    Select Room *
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="roomNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">Select Room</FormLabel>
                                            <FormControl>
                                                <div className="space-y-3">
                                                    {availableRooms.length > 0 ? (
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                                            {availableRooms.map((room) => (
                                                                <div
                                                                    key={room._id}
                                                                    className={cn(
                                                                        'p-4 rounded-lg border-2 cursor-pointer transition-all text-center',
                                                                        field.value === room.roomNumber
                                                                            ? 'border-hotel bg-hotel-light'
                                                                            : 'border-border hover:border-hotel/50'
                                                                    )}
                                                                    onClick={() => {
                                                                        handleRoomSelection(room.roomNumber);
                                                                        console.log('Selected room:', room.roomNumber);
                                                                    }}
                                                                >
                                                                    <p className="font-semibold">Room {room.roomNumber}</p>
                                                                    <p className="text-xs text-muted-foreground mt-1">Floor {room.floor}</p>
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        ${room.price}/night
                                                                    </p>
                                                                    <div className="mt-2">
                                                                        <Badge
                                                                            variant={field.value === room.roomNumber ? "default" : "secondary"}
                                                                            className="text-xs"
                                                                        >
                                                                            {field.value === room.roomNumber ? 'Selected' : 'Available'}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : checkInDate && checkOutDate && selectedRoomType ? (
                                                        <p className="text-sm text-red-500">
                                                            No rooms available for selected dates and room type
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground">
                                                            Select dates and room type to see available rooms
                                                        </p>
                                                    )}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {selectedRoomNumber && (
                                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-sm text-green-800 font-medium">
                                            ✅ Selected: <span className="font-bold">Room {selectedRoomNumber}</span>
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">
                                            Click on any available room to change selection
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Additional Services */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-hotel" />
                                    Additional Services (Optional)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {hotelServices.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {hotelServices.map((service) => {
                                                const selectedItem = selectedServices.find(s => s.service._id === service._id);
                                                const isSelected = !!selectedItem;

                                                return (
                                                    <div
                                                        key={service._id}
                                                        className={cn(
                                                            'p-4 rounded-lg border-2 transition-all',
                                                            isSelected
                                                                ? 'border-hotel bg-hotel-light'
                                                                : 'border-border'
                                                        )}
                                                    >
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div>
                                                                <p className="font-semibold">{service.name}</p>
                                                                <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <Badge variant="outline" className="text-xs capitalize">
                                                                        {service.category}
                                                                    </Badge>
                                                                    <span className="text-sm font-medium">${service.price}</span>
                                                                </div>
                                                            </div>
                                                            <Checkbox
                                                                checked={isSelected}
                                                                onCheckedChange={() => handleServiceSelection(service)}
                                                            />
                                                        </div>

                                                        {isSelected && selectedItem && (
                                                            <div className="mt-3 flex items-center gap-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => updateServiceQuantity(service._id, selectedItem.quantity - 1)}
                                                                    disabled={selectedItem.quantity <= 1}
                                                                >
                                                                    <Minus className="h-3 w-3" />
                                                                </Button>
                                                                <span className="w-8 text-center">{selectedItem.quantity}</span>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => updateServiceQuantity(service._id, selectedItem.quantity + 1)}
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeService(service._id)}
                                                                    className="ml-auto"
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No services available. Add services in Hotel Settings.
                                        </p>
                                    )}

                                    {selectedServices.length > 0 && (
                                        <div className="border-t pt-4">
                                            <h4 className="font-medium mb-2">Selected Services:</h4>
                                            <div className="space-y-2">
                                                {selectedServices.map((item, index) => (
                                                    <div key={index} className="flex justify-between text-sm">
                                                        <span>
                                                            {item.service.name} × {item.quantity}
                                                        </span>
                                                        <span className="font-medium">
                                                            ${(item.service.price * item.quantity).toFixed(2)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </Form>

            {/* Invoice Dialog */}
            {reservationData && (
                <InvoiceDialog
                    open={showInvoice}
                    onClose={handleInvoiceClose}
                    reservation={{
                        id: reservationData.reservationNumber,
                        guestName: reservationData.guestName,
                        email: reservationData.email,
                        phone: reservationData.phone,
                        checkIn: format(new Date(reservationData.checkIn), 'PPP'),
                        checkOut: format(new Date(reservationData.checkOut), 'PPP'),
                        roomNumber: reservationData.roomNumber,
                        roomType: reservationData.roomType,
                        adults: reservationData.adults,
                        children: reservationData.children,
                        nights: reservationData.totalNights,
                        roomRate: selectedRoomType?.basePrice || 0,
                        totalAmount: reservationData.totalAmount,
                        paymentStatus: reservationData.paymentStatus,
                    }}
                    services={selectedServices.map(item => ({
                        name: item.service.name,
                        price: item.service.price,
                        quantity: item.quantity,
                        total: item.service.price * item.quantity
                    }))}
                />
            )}
        </div>
    );
}