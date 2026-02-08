import { useState, useEffect } from 'react';
import { useConferenceService, type ConferenceHall } from '@/services/conferenceService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Building2, DollarSign, Users, Save, Plus } from 'lucide-react';

export default function ConferenceSettings() {
    const conferenceService = useConferenceService();
    const [halls, setHalls] = useState<ConferenceHall[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await conferenceService.getConferenceHalls();
            if (response.success) {
                setHalls(response.halls || []);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleHallChange = (id: string, field: keyof ConferenceHall, value: any) => {
        setHalls(prev =>
            prev.map(hall =>
                hall._id === id ? { ...hall, [field]: value } : hall
            )
        );
    };

    const saveHall = async (hall: ConferenceHall) => {
        try {
            setSaving(true);
            await conferenceService.updateConferenceHall(hall._id, {
                name: hall.name,
                capacity: hall.capacity,
                hourlyRate: hall.hourlyRate,
                dailyRate: hall.dailyRate,
                description: hall.description,
                maxDailyBookings: hall.maxDailyBookings,
                isActive: hall.isActive
            });
            toast.success('Conference hall updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update conference hall');
        } finally {
            setSaving(false);
        }
    };

    const initializeDefaults = async () => {
        try {
            setLoading(true);
            await conferenceService.initializeConferenceHalls();
            await fetchData();
            toast.success('Default conference halls initialized');
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
                        <div className="h-10 w-10 rounded-xl gradient-conference flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <h1 className="text-3xl font-bold">Conference Settings</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">Manage conference halls and rates</p>
                </div>
                <Button onClick={initializeDefaults} variant="outline">
                    Restore Defaults
                </Button>
            </div>

            {/* Conference Halls */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-conference" />
                        Conference Halls
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {halls.map((hall) => (
                            <div key={hall._id} className="border rounded-lg p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold">{hall.name}</h3>
                                        <p className="text-sm text-muted-foreground">{hall.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={`active-${hall._id}`}>Active</Label>
                                        <Switch
                                            id={`active-${hall._id}`}
                                            checked={hall.isActive}
                                            onCheckedChange={(checked) =>
                                                handleHallChange(hall._id, 'isActive', checked)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <Label htmlFor={`name-${hall._id}`}>Hall Name</Label>
                                        <Input
                                            id={`name-${hall._id}`}
                                            value={hall.name}
                                            onChange={(e) =>
                                                handleHallChange(hall._id, 'name', e.target.value)
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor={`capacity-${hall._id}`}>Capacity</Label>
                                        <Input
                                            id={`capacity-${hall._id}`}
                                            type="number"
                                            min="1"
                                            value={hall.capacity}
                                            onChange={(e) =>
                                                handleHallChange(hall._id, 'capacity', parseInt(e.target.value))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor={`dailyRate-${hall._id}`}>Daily Rate ($)</Label>
                                        <Input
                                            id={`dailyRate-${hall._id}`}
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={hall.dailyRate}
                                            onChange={(e) =>
                                                handleHallChange(hall._id, 'dailyRate', parseFloat(e.target.value))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor={`maxBookings-${hall._id}`}>Max Daily Bookings</Label>
                                        <Input
                                            id={`maxBookings-${hall._id}`}
                                            type="number"
                                            min="1"
                                            value={hall.maxDailyBookings}
                                            onChange={(e) =>
                                                handleHallChange(hall._id, 'maxDailyBookings', parseInt(e.target.value))
                                            }
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor={`description-${hall._id}`}>Description</Label>
                                    <Input
                                        id={`description-${hall._id}`}
                                        value={hall.description}
                                        onChange={(e) =>
                                            handleHallChange(hall._id, 'description', e.target.value)
                                        }
                                    />
                                </div>

                                <Button
                                    onClick={() => saveHall(hall)}
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