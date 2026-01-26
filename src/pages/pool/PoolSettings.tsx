import { useState, useEffect } from 'react';
import { usePoolService, type TicketPrice, type TimeSlot } from '@/services/poolService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Waves, DollarSign, Clock, Save } from 'lucide-react';

export default function PoolSettings() {
    const poolService = usePoolService();
    const [ticketPrices, setTicketPrices] = useState<TicketPrice[]>([]);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pricesResponse, slotsResponse] = await Promise.all([
                poolService.getTicketPrices(),
                poolService.getTimeSlots()
            ]);

            if (pricesResponse.success) {
                setTicketPrices(pricesResponse.ticketPrices || []);
            }

            if (slotsResponse.success) {
                setTimeSlots(slotsResponse.timeSlots || []);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load settings');
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePriceChange = (id: string, field: keyof TicketPrice, value: any) => {
        setTicketPrices(prev =>
            prev.map(price =>
                price._id === id ? { ...price, [field]: value } : price
            )
        );
    };

    const handleSlotChange = (id: string, field: keyof TimeSlot, value: any) => {
        setTimeSlots(prev =>
            prev.map(slot =>
                slot._id === id ? { ...slot, [field]: value } : slot
            )
        );
    };

    const saveTicketPrice = async (ticket: TicketPrice) => {
        try {
            setSaving(true);
            await poolService.updateTicketPrice(ticket._id, {
                price: ticket.price,
                description: ticket.description,
                maxPersons: ticket.maxPersons,
                isActive: ticket.isActive
            });
            toast.success('Ticket price updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update ticket price');
        } finally {
            setSaving(false);
        }
    };

    const saveTimeSlot = async (slot: TimeSlot) => {
        try {
            setSaving(true);
            await poolService.updateTimeSlot(slot._id, {
                label: slot.label,
                maxCapacity: slot.maxCapacity,
                isActive: slot.isActive
            });
            toast.success('Time slot updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update time slot');
        } finally {
            setSaving(false);
        }
    };

    const initializeDefaults = async () => {
        try {
            setLoading(true);
            await Promise.all([
                poolService.initializeTicketPrices(),
                poolService.initializeTimeSlots()
            ]);
            await fetchData();
            toast.success('Default settings initialized');
        } catch (error: any) {
            toast.error(error.message || 'Failed to initialize defaults');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl gradient-pool flex items-center justify-center">
                            <Waves className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <h1 className="text-3xl font-bold">Pool Settings</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">Manage ticket prices and time slots</p>
                </div>
                <Button onClick={initializeDefaults} variant="outline">
                    Restore Defaults
                </Button>
            </div>

            {/* Ticket Prices */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-pool" />
                        Ticket Prices
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {ticketPrices.map((ticket) => (
                            <div key={ticket._id} className="border rounded-lg p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold capitalize">{ticket.passType} Pass</h3>
                                        <p className="text-sm text-muted-foreground">{ticket.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={`active-${ticket._id}`}>Active</Label>
                                        <Switch
                                            id={`active-${ticket._id}`}
                                            checked={ticket.isActive}
                                            onCheckedChange={(checked) =>
                                                handlePriceChange(ticket._id, 'isActive', checked)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor={`price-${ticket._id}`}>Price ($)</Label>
                                        <Input
                                            id={`price-${ticket._id}`}
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={ticket.price}
                                            onChange={(e) =>
                                                handlePriceChange(ticket._id, 'price', parseFloat(e.target.value))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor={`maxPersons-${ticket._id}`}>Max Persons</Label>
                                        <Input
                                            id={`maxPersons-${ticket._id}`}
                                            type="number"
                                            min="1"
                                            value={ticket.maxPersons}
                                            onChange={(e) =>
                                                handlePriceChange(ticket._id, 'maxPersons', parseInt(e.target.value))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor={`description-${ticket._id}`}>Description</Label>
                                        <Input
                                            id={`description-${ticket._id}`}
                                            value={ticket.description}
                                            onChange={(e) =>
                                                handlePriceChange(ticket._id, 'description', e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={() => saveTicketPrice(ticket)}
                                    disabled={saving}
                                    className="w-full"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Time Slots */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-pool" />
                        Time Slots
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {timeSlots.map((slot) => (
                            <div key={slot._id} className="border rounded-lg p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold">{slot.label}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {slot.startTime} - {slot.endTime}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={`slot-active-${slot._id}`}>Active</Label>
                                        <Switch
                                            id={`slot-active-${slot._id}`}
                                            checked={slot.isActive}
                                            onCheckedChange={(checked) =>
                                                handleSlotChange(slot._id, 'isActive', checked)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor={`label-${slot._id}`}>Display Label</Label>
                                        <Input
                                            id={`label-${slot._id}`}
                                            value={slot.label}
                                            onChange={(e) =>
                                                handleSlotChange(slot._id, 'label', e.target.value)
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor={`capacity-${slot._id}`}>Max Capacity</Label>
                                        <Input
                                            id={`capacity-${slot._id}`}
                                            type="number"
                                            min="1"
                                            value={slot.maxCapacity}
                                            onChange={(e) =>
                                                handleSlotChange(slot._id, 'maxCapacity', parseInt(e.target.value))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <div className="space-y-2">
                                            <Label>Current Status</Label>
                                            <div className="text-sm">
                                                <p>Bookings: {slot.currentBookings}</p>
                                                <p>Available: {slot.maxCapacity - slot.currentBookings}</p>
                                                <p>Capacity: {slot.maxCapacity}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => saveTimeSlot(slot)}
                                    disabled={saving}
                                    className="w-full"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}