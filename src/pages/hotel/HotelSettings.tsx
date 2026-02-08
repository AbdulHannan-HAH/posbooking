// pages/hotel/HotelSettings.tsx - UPDATED WITH ROOM MANAGEMENT
import { useState, useEffect } from 'react';
import { useHotelService, type RoomType, type HotelService, type Room } from '@/services/hotelService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Hotel, BedDouble, Coffee, Save, Plus, Trash2, RefreshCw, Wrench, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function HotelSettings() {
    const hotelService = useHotelService();
    const [activeTab, setActiveTab] = useState('room-types');
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [services, setServices] = useState<HotelService[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            console.log('Fetching hotel settings data...');

            const [roomTypesResponse, roomsResponse, servicesResponse] = await Promise.all([
                hotelService.getRoomTypes(),
                hotelService.getRooms({ limit: 100 }),
                hotelService.getServices()
            ]);

            console.log('Responses:', { roomTypesResponse, roomsResponse, servicesResponse });

            if (roomTypesResponse.success) {
                setRoomTypes(roomTypesResponse.roomTypes || []);
            } else {
                toast.error(roomTypesResponse.message || 'Failed to load room types');
            }

            if (roomsResponse.success) {
                setRooms(roomsResponse.rooms || []);
            }

            if (servicesResponse.success) {
                setServices(servicesResponse.services || []);
            } else {
                toast.error(servicesResponse.message || 'Failed to load services');
            }
        } catch (error: any) {
            console.error('Error fetching hotel settings:', error);
            toast.error(error.message || 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleInitializeDefaults = async () => {
        if (!confirm('This will initialize default room types, rooms, and services. Continue?')) {
            return;
        }

        try {
            setSaving(true);
            toast.loading('Initializing default data...');

            const response = await hotelService.initializeDefaults();

            if (response.success) {
                toast.success('Default data initialized successfully');
                await fetchData();
            } else {
                toast.error(response.message || 'Failed to initialize default data');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to initialize default data');
        } finally {
            setSaving(false);
        }
    };

    // Room Types Management
    const handleAddRoomType = () => {
        const newRoomType: RoomType = {
            _id: `new-${Date.now()}`,
            name: 'New Room Type',
            description: 'Description for new room type',
            basePrice: 100,
            maxOccupancy: 2,
            amenities: ['Wi-Fi', 'TV'],
            isActive: true,
        };
        setRoomTypes(prev => [...prev, newRoomType]);
        toast.info('New room type added. Fill in the details and save.');
    };

    const handleRoomTypeChange = (id: string, field: keyof RoomType, value: any) => {
        setRoomTypes(prev =>
            prev.map(roomType =>
                roomType._id === id ? { ...roomType, [field]: value } : roomType
            )
        );
    };

    const saveRoomType = async (roomType: RoomType) => {
        try {
            setSaving(true);
            const isNew = roomType._id.startsWith('new');

            const roomTypeData = {
                name: roomType.name,
                description: roomType.description,
                basePrice: roomType.basePrice,
                maxOccupancy: roomType.maxOccupancy,
                amenities: roomType.amenities,
                isActive: roomType.isActive
            };

            const response = isNew
                ? await hotelService.createRoomType(roomTypeData)
                : await hotelService.updateRoomType(roomType._id, roomTypeData);

            if (response.success) {
                toast.success(isNew ? 'Room type created successfully' : 'Room type updated successfully');
                await fetchData();
            } else {
                toast.error(response.message || 'Failed to save room type');
            }
        } catch (error: any) {
            console.error('Error saving room type:', error);
            toast.error(error.message || 'Failed to save room type');
        } finally {
            setSaving(false);
        }
    };

    const removeNewRoomType = (id: string) => {
        setRoomTypes(prev => prev.filter(rt => rt._id !== id));
        toast.info('New room type removed');
    };

    // Rooms Management
    const handleAddRoom = () => {
        const newRoom: Room = {
            _id: `new-${Date.now()}`,
            roomNumber: '',
            roomType: '',
            floor: 1,
            status: 'available',
            price: 0,
            features: [],
            lastCleaned: new Date().toISOString(),
            nextCleaning: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true
        };
        setRooms(prev => [...prev, newRoom]);
        toast.info('New room added. Fill in the details and save.');
    };

    const handleRoomChange = (id: string, field: keyof Room, value: any) => {
        setRooms(prev =>
            prev.map(room =>
                room._id === id ? { ...room, [field]: value } : room
            )
        );
    };

    const saveRoom = async (room: Room) => {
        try {
            setSaving(true);
            const isNew = room._id.startsWith('new');

            const roomData = {
                roomNumber: room.roomNumber,
                roomType: room.roomType,
                floor: room.floor,
                price: room.price,
                features: room.features,
                status: room.status,
                isActive: room.isActive
            };

            const response = isNew
                ? await hotelService.createRoom(roomData)
                : await hotelService.updateRoom(room._id, roomData);

            if (response.success) {
                toast.success(isNew ? 'Room created successfully' : 'Room updated successfully');
                await fetchData();
            } else {
                toast.error(response.message || 'Failed to save room');
            }
        } catch (error: any) {
            console.error('Error saving room:', error);
            toast.error(error.message || 'Failed to save room');
        } finally {
            setSaving(false);
        }
    };

    const removeNewRoom = (id: string) => {
        setRooms(prev => prev.filter(room => room._id !== id));
        toast.info('New room removed');
    };

    // Services Management
    const handleAddService = () => {
        const newService: HotelService = {
            _id: `new-${Date.now()}`,
            name: 'New Service',
            description: 'Description for new service',
            price: 10,
            category: 'other',
            isAvailable: true,
            updatedAt: new Date().toISOString()
        };
        setServices(prev => [...prev, newService]);
        toast.info('New service added. Fill in the details and save.');
    };

    const handleServiceChange = (id: string, field: keyof HotelService, value: any) => {
        setServices(prev =>
            prev.map(service =>
                service._id === id ? { ...service, [field]: value } : service
            )
        );
    };

    const saveService = async (service: HotelService) => {
        try {
            setSaving(true);
            const isNew = service._id.startsWith('new');

            const serviceData = {
                name: service.name,
                description: service.description,
                price: service.price,
                category: service.category,
                isAvailable: service.isAvailable
            };

            const response = isNew
                ? await hotelService.createService(serviceData)
                : await hotelService.updateService(service._id, serviceData);

            if (response.success) {
                toast.success(isNew ? 'Service created successfully' : 'Service updated successfully');
                await fetchData();
            } else {
                toast.error(response.message || 'Failed to save service');
            }
        } catch (error: any) {
            console.error('Error saving service:', error);
            toast.error(error.message || 'Failed to save service');
        } finally {
            setSaving(false);
        }
    };

    const removeNewService = (id: string) => {
        setServices(prev => prev.filter(s => s._id !== id));
        toast.info('New service removed');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading hotel settings...</p>
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
                        <div className="h-10 w-10 rounded-xl gradient-hotel flex items-center justify-center">
                            <Hotel className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Hotel Settings</h1>
                            <p className="text-muted-foreground mt-1">Manage room types, rooms, and services</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        onClick={handleInitializeDefaults}
                        disabled={saving}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Initialize All
                    </Button>
                    <Button
                        onClick={fetchData}
                        disabled={saving}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="room-types">Room Types</TabsTrigger>
                    <TabsTrigger value="rooms">Rooms</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                </TabsList>

                {/* Room Types Tab */}
                <TabsContent value="room-types" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold">Room Types</h2>
                            <p className="text-sm text-muted-foreground">Manage different types of rooms and their pricing</p>
                        </div>
                        <Button onClick={handleAddRoomType} disabled={saving}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Room Type
                        </Button>
                    </div>

                    {roomTypes.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <BedDouble className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="font-semibold">No Room Types Found</h3>
                                <p className="text-sm text-muted-foreground mt-1 mb-4">
                                    You haven't created any room types yet.
                                </p>
                                <Button onClick={handleInitializeDefaults}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Initialize Defaults
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {roomTypes.map((roomType) => (
                                <Card key={roomType._id}>
                                    <CardContent className="pt-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold">{roomType.name}</h3>
                                                        {roomType._id.startsWith('new') && (
                                                            <Badge variant="outline" className="text-xs">
                                                                New (Unsaved)
                                                            </Badge>
                                                        )}
                                                        {!roomType.isActive && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                Inactive
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{roomType.description}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-sm font-medium text-hotel">
                                                            ${roomType.basePrice}/night
                                                        </span>
                                                        <span className="text-sm text-muted-foreground">•</span>
                                                        <span className="text-sm text-muted-foreground">
                                                            Max {roomType.maxOccupancy} guests
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Label htmlFor={`active-${roomType._id}`} className="text-sm">
                                                        Active
                                                    </Label>
                                                    <Switch
                                                        id={`active-${roomType._id}`}
                                                        checked={roomType.isActive}
                                                        onCheckedChange={(checked) =>
                                                            handleRoomTypeChange(roomType._id, 'isActive', checked)
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor={`name-${roomType._id}`}>Room Type Name</Label>
                                                    <Input
                                                        id={`name-${roomType._id}`}
                                                        value={roomType.name}
                                                        onChange={(e) =>
                                                            handleRoomTypeChange(roomType._id, 'name', e.target.value)
                                                        }
                                                        placeholder="e.g., Deluxe Suite"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`price-${roomType._id}`}>Base Price ($)</Label>
                                                    <Input
                                                        id={`price-${roomType._id}`}
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={roomType.basePrice}
                                                        onChange={(e) =>
                                                            handleRoomTypeChange(roomType._id, 'basePrice', parseFloat(e.target.value) || 0)
                                                        }
                                                        placeholder="e.g., 150"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`maxOccupancy-${roomType._id}`}>Max Occupancy</Label>
                                                    <Input
                                                        id={`maxOccupancy-${roomType._id}`}
                                                        type="number"
                                                        min="1"
                                                        max="10"
                                                        value={roomType.maxOccupancy}
                                                        onChange={(e) =>
                                                            handleRoomTypeChange(roomType._id, 'maxOccupancy', parseInt(e.target.value) || 1)
                                                        }
                                                        placeholder="e.g., 4"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`description-${roomType._id}`}>Description</Label>
                                                    <Input
                                                        id={`description-${roomType._id}`}
                                                        value={roomType.description}
                                                        onChange={(e) =>
                                                            handleRoomTypeChange(roomType._id, 'description', e.target.value)
                                                        }
                                                        placeholder="Description of room type"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor={`amenities-${roomType._id}`}>
                                                    Amenities (comma separated)
                                                </Label>
                                                <Textarea
                                                    id={`amenities-${roomType._id}`}
                                                    value={Array.isArray(roomType.amenities) ? roomType.amenities.join(', ') : ''}
                                                    onChange={(e) => {
                                                        const amenitiesArray = e.target.value
                                                            .split(',')
                                                            .map(item => item.trim())
                                                            .filter(item => item.length > 0);
                                                        handleRoomTypeChange(roomType._id, 'amenities', amenitiesArray);
                                                    }}
                                                    placeholder="Wi-Fi, TV, AC, Mini-bar, Sea View"
                                                    rows={2}
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Separate amenities with commas
                                                </p>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => saveRoomType(roomType)}
                                                    disabled={saving}
                                                    className="flex-1"
                                                >
                                                    <Save className="h-4 w-4 mr-2" />
                                                    {roomType._id.startsWith('new') ? 'Create Room Type' : 'Save Changes'}
                                                </Button>
                                                {roomType._id.startsWith('new') && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => removeNewRoomType(roomType._id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Rooms Tab */}
                <TabsContent value="rooms" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold">Rooms</h2>
                            <p className="text-sm text-muted-foreground">Manage individual rooms and their status</p>
                        </div>
                        <Button onClick={handleAddRoom} disabled={saving}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Room
                        </Button>
                    </div>

                    {rooms.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <BedDouble className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="font-semibold">No Rooms Found</h3>
                                <p className="text-sm text-muted-foreground mt-1 mb-4">
                                    You haven't created any rooms yet.
                                </p>
                                <Button onClick={handleInitializeDefaults}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Initialize Defaults
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rooms.map((room) => (
                                <Card key={room._id}>
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-semibold">Room {room.roomNumber}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        Floor {room.floor}
                                                    </Badge>
                                                    <Badge
                                                        variant={
                                                            room.status === 'available' ? 'default' :
                                                                room.status === 'occupied' ? 'secondary' :
                                                                    room.status === 'maintenance' ? 'destructive' :
                                                                        'outline'
                                                        }
                                                        className="text-xs capitalize"
                                                    >
                                                        {room.status}
                                                    </Badge>
                                                    {room._id.startsWith('new') && (
                                                        <Badge variant="outline" className="text-xs">
                                                            New
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor={`active-${room._id}`} className="text-sm">
                                                    Active
                                                </Label>
                                                <Switch
                                                    id={`active-${room._id}`}
                                                    checked={room.isActive}
                                                    onCheckedChange={(checked) =>
                                                        handleRoomChange(room._id, 'isActive', checked)
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <Label htmlFor={`roomNumber-${room._id}`}>Room Number</Label>
                                                <Input
                                                    id={`roomNumber-${room._id}`}
                                                    value={room.roomNumber}
                                                    onChange={(e) =>
                                                        handleRoomChange(room._id, 'roomNumber', e.target.value)
                                                    }
                                                    placeholder="e.g., 101"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <Label htmlFor={`roomType-${room._id}`}>Room Type</Label>
                                                    <Select
                                                        value={room.roomType}
                                                        onValueChange={(value) =>
                                                            handleRoomChange(room._id, 'roomType', value)
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {roomTypes.map((type) => (
                                                                <SelectItem key={type._id} value={type.name}>
                                                                    {type.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label htmlFor={`floor-${room._id}`}>Floor</Label>
                                                    <Input
                                                        id={`floor-${room._id}`}
                                                        type="number"
                                                        min="1"
                                                        value={room.floor}
                                                        onChange={(e) =>
                                                            handleRoomChange(room._id, 'floor', parseInt(e.target.value) || 1)
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor={`price-${room._id}`}>Price ($/night)</Label>
                                                <Input
                                                    id={`price-${room._id}`}
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={room.price}
                                                    onChange={(e) =>
                                                        handleRoomChange(room._id, 'price', parseFloat(e.target.value) || 0)
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor={`features-${room._id}`}>Features</Label>
                                                <Textarea
                                                    id={`features-${room._id}`}
                                                    value={Array.isArray(room.features) ? room.features.join(', ') : ''}
                                                    onChange={(e) => {
                                                        const featuresArray = e.target.value
                                                            .split(',')
                                                            .map(item => item.trim())
                                                            .filter(item => item.length > 0);
                                                        handleRoomChange(room._id, 'features', featuresArray);
                                                    }}
                                                    placeholder="Wi-Fi, TV, AC, Mini-bar"
                                                    rows={2}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor={`status-${room._id}`}>Status</Label>
                                                <Select
                                                    value={room.status}
                                                    onValueChange={(value: Room['status']) =>
                                                        handleRoomChange(room._id, 'status', value)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="available">Available</SelectItem>
                                                        <SelectItem value="occupied">Occupied</SelectItem>
                                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                                        <SelectItem value="cleaning">Cleaning</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => saveRoom(room)}
                                                disabled={saving}
                                                className="flex-1"
                                            >
                                                <Save className="h-4 w-4 mr-2" />
                                                {room._id.startsWith('new') ? 'Create Room' : 'Save Changes'}
                                            </Button>
                                            {room._id.startsWith('new') && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => removeNewRoom(room._id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Services Tab */}
                <TabsContent value="services" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold">Hotel Services</h2>
                            <p className="text-sm text-muted-foreground">Manage additional services offered by the hotel</p>
                        </div>
                        <Button onClick={handleAddService} disabled={saving}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Service
                        </Button>
                    </div>

                    {services.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <Coffee className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="font-semibold">No Services Found</h3>
                                <p className="text-sm text-muted-foreground mt-1 mb-4">
                                    You haven't created any services yet.
                                </p>
                                <Button onClick={handleInitializeDefaults}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Initialize Defaults
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {services.map((service) => (
                                <Card key={service._id}>
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">{service.name}</h3>
                                                    {service._id.startsWith('new') && (
                                                        <Badge variant="outline" className="text-xs">
                                                            New (Unsaved)
                                                        </Badge>
                                                    )}
                                                    {!service.isAvailable && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Unavailable
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{service.description}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm font-medium text-hotel">
                                                        ${service.price}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">•</span>
                                                    <span className="text-sm text-muted-foreground capitalize">
                                                        {service.category}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor={`available-${service._id}`} className="text-sm">
                                                    Available
                                                </Label>
                                                <Switch
                                                    id={`available-${service._id}`}
                                                    checked={service.isAvailable}
                                                    onCheckedChange={(checked) =>
                                                        handleServiceChange(service._id, 'isAvailable', checked)
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <Label htmlFor={`service-name-${service._id}`}>Service Name</Label>
                                                <Input
                                                    id={`service-name-${service._id}`}
                                                    value={service.name}
                                                    onChange={(e) =>
                                                        handleServiceChange(service._id, 'name', e.target.value)
                                                    }
                                                    placeholder="e.g., Breakfast Buffet"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`service-price-${service._id}`}>Price ($)</Label>
                                                <Input
                                                    id={`service-price-${service._id}`}
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={service.price}
                                                    onChange={(e) =>
                                                        handleServiceChange(service._id, 'price', parseFloat(e.target.value) || 0)
                                                    }
                                                    placeholder="e.g., 15"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`service-category-${service._id}`}>Category</Label>
                                                <Select
                                                    value={service.category}
                                                    onValueChange={(value) =>
                                                        handleServiceChange(service._id, 'category', value)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="food">Food</SelectItem>
                                                        <SelectItem value="beverage">Beverage</SelectItem>
                                                        <SelectItem value="spa">Spa</SelectItem>
                                                        <SelectItem value="laundry">Laundry</SelectItem>
                                                        <SelectItem value="transport">Transport</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor={`service-description-${service._id}`}>Description</Label>
                                                <Input
                                                    id={`service-description-${service._id}`}
                                                    value={service.description}
                                                    onChange={(e) =>
                                                        handleServiceChange(service._id, 'description', e.target.value)
                                                    }
                                                    placeholder="Description of the service"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => saveService(service)}
                                                disabled={saving}
                                                className="flex-1"
                                            >
                                                <Save className="h-4 w-4 mr-2" />
                                                {service._id.startsWith('new') ? 'Create Service' : 'Save Changes'}
                                            </Button>
                                            {service._id.startsWith('new') && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => removeNewService(service._id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}