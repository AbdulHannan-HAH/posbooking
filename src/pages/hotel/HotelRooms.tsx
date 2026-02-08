// HotelRooms.tsx - UPDATED
import { useState, useEffect, useCallback } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

import {
    Hotel,
    BedDouble,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader2,
    CheckCircle,
    Wrench,
    Sparkles,
    XCircle
} from 'lucide-react';

import { useHotelService, type Room } from '@/services/hotelService';
import { toast } from 'sonner';

export default function HotelRooms() {
    const hotelService = useHotelService();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRooms, setTotalRooms] = useState(0);

    const itemsPerPage = 12;



    // Remove the useCallback wrapper entirely
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);

                const params: any = {
                    page: currentPage,
                    limit: itemsPerPage,
                    sortBy: 'roomNumber',
                    sortOrder: 'asc'
                };

                if (statusFilter !== 'all') params.status = statusFilter;
                if (searchTerm) params.search = searchTerm;

                const response = await hotelService.getRooms(params);

                if (response.success) {
                    setRooms(response.rooms || []);
                    setTotalPages(response.totalPages || 1);
                    setTotalRooms(response.total || 0);
                } else {
                    toast.error(response.message || 'Failed to fetch rooms');
                    setRooms([]);
                }
            } catch (error) {
                console.error('Fetch rooms error:', error);
                toast.error('Failed to load rooms');
                setRooms([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [currentPage, statusFilter, searchTerm, hotelService]); // ← All dependencies
    const handleStatusUpdate = async (roomId: string, newStatus: Room['status']) => {
        try {
            const response = await hotelService.updateRoom(roomId, { status: newStatus });
            if (response.success) {
                toast.success(`Room status updated to ${newStatus}`);

                // Option 1: Update room status locally instead of refetching everything
                setRooms(prev => prev.map(r => r._id === roomId ? { ...r, status: newStatus } : r));

                // Option 2: Only refetch if really needed
                // fetchRooms();
            } else {
                toast.error(response.message || 'Failed to update room status');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update room status');
        }
    };

    const getStatusIcon = (status: Room['status']) => {
        switch (status) {
            case 'available':
                return <CheckCircle className="h-4 w-4 text-success" />;
            case 'occupied':
                return <BedDouble className="h-4 w-4 text-warning" />;
            case 'maintenance':
                return <Wrench className="h-4 w-4 text-destructive" />;
            case 'cleaning':
                return <Sparkles className="h-4 w-4 text-blue-500" />;
            default:
                return <BedDouble className="h-4 w-4" />;
        }
    };

    const getStatusActions = (room: Room) => {
        switch (room.status) {
            case 'available':
                return [
                    { label: 'Mark as Occupied', status: 'occupied' as const, variant: 'outline' },
                    { label: 'Maintenance', status: 'maintenance' as const, variant: 'outline' }
                ];
            case 'occupied':
                return [
                    { label: 'Mark as Available', status: 'available' as const, variant: 'default' },
                    { label: 'Cleaning Required', status: 'cleaning' as const, variant: 'outline' }
                ];
            case 'maintenance':
                return [
                    { label: 'Repair Complete', status: 'available' as const, variant: 'default' }
                ];
            case 'cleaning':
                return [
                    { label: 'Cleaning Complete', status: 'available' as const, variant: 'default' },
                    { label: 'Maintenance', status: 'maintenance' as const, variant: 'outline' }
                ];
            default:
                return [];
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return 'N/A';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl gradient-hotel flex items-center justify-center">
                            <Hotel className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <h1 className="text-3xl font-bold">Hotel Rooms</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">
                        View and manage all hotel rooms
                    </p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by room number, floor, or features..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-44">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="occupied">Occupied</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="cleaning">Cleaning</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Rooms */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {rooms.map(room => (
                            <Card key={room._id}>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg">
                                            Room {room.roomNumber}
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(room.status)}
                                            <StatusBadge status={room.status} />
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Floor {room.floor} • {room.roomType}
                                    </p>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span>Rate</span>
                                        <span className="font-semibold">
                                            ${room.price}/night
                                        </span>
                                    </div>

                                    <div className="text-sm">
                                        <p className="text-muted-foreground">Features</p>
                                        <p className="text-xs truncate">
                                            {room.features?.slice(0, 3).join(', ') || 'No features'}
                                        </p>
                                    </div>

                                    <div className="text-sm">
                                        <p className="text-muted-foreground">Last Cleaned</p>
                                        <p>{formatDate(room.lastCleaned)}</p>
                                    </div>

                                    <div className="pt-3 border-t flex gap-2">
                                        {getStatusActions(room).map((action, i) => (
                                            <Button
                                                key={i}
                                                size="sm"
                                                variant={action.variant as any}
                                                className="flex-1 text-xs"
                                                onClick={() =>
                                                    handleStatusUpdate(room._id, action.status)
                                                }
                                            >
                                                {action.label}
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {rooms.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <BedDouble className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No rooms found</p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => hotelService.initializeDefaults()}
                            >
                                Initialize Default Rooms
                            </Button>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-6 border-t">
                            <p className="text-sm text-muted-foreground">
                                Showing {(currentPage - 1) * itemsPerPage + 1} –{' '}
                                {Math.min(currentPage * itemsPerPage, totalRooms)} of{' '}
                                {totalRooms}
                            </p>

                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                <span className="px-3 text-sm flex items-center">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                        setCurrentPage(p => Math.min(totalPages, p + 1))
                                    }
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}