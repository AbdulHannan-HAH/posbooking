// pages/hotel/HotelReservations.tsx
import { useState, useEffect } from 'react';
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
import { Hotel, Plus, Search, Filter, ChevronLeft, ChevronRight, Loader2, Eye, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHotelService } from '@/services/hotelService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function HotelReservations() {
    const hotelService = useHotelService();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [reservations, setReservations] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReservations, setTotalReservations] = useState(0);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<string | null>(null);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchReservations();
    }, [currentPage, statusFilter, searchTerm]);

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const params: any = {
                page: currentPage,
                limit: itemsPerPage,
                sortBy: 'checkIn',
                sortOrder: 'desc'
            };

            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }

            if (searchTerm) {
                params.search = searchTerm;
            }

            const response = await hotelService.getReservations(params);

            if (response.success) {
                setReservations(response.reservations || []);
                setTotalPages(response.totalPages || 1);
                setTotalReservations(response.total || 0);
            } else {
                toast.error(response.message || 'Failed to fetch reservations');
                setReservations([]);
            }
        } catch (error: any) {
            console.error('Error fetching reservations:', error);
            toast.error('Failed to load reservations');
            setReservations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (reservationId: string) => {
        try {
            const response = await hotelService.checkIn(reservationId);
            if (response.success) {
                toast.success('Guest checked in successfully');
                fetchReservations();
            } else {
                toast.error(response.message || 'Failed to check in');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to check in');
        }
    };

    const handleCheckOut = async (reservationId: string) => {
        try {
            const response = await hotelService.checkOut(reservationId);
            if (response.success) {
                toast.success('Guest checked out successfully');
                fetchReservations();
            } else {
                toast.error(response.message || 'Failed to check out');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to check out');
        }
    };

    const handleDelete = async () => {
        if (!selectedReservation) return;

        try {
            const response = await hotelService.deleteReservation(selectedReservation);
            if (response.success) {
                toast.success('Reservation deleted successfully');
                fetchReservations();
            } else {
                toast.error(response.message || 'Failed to delete reservation');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete reservation');
        } finally {
            setDeleteDialogOpen(false);
            setSelectedReservation(null);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch {
            return dateString;
        }
    };

    const calculateNights = (checkIn: string, checkOut: string) => {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
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
                        <h1 className="text-3xl font-bold">Hotel Reservations</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">View and manage all hotel reservations</p>
                </div>
                <Link to="/hotel/reservations/new">
                    <Button className="gradient-hotel border-0">
                        <Plus className="h-4 w-4 mr-2" />
                        New Reservation
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by guest name, room number, or reservation ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="checked_in">Checked In</SelectItem>
                                    <SelectItem value="checked_out">Checked Out</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Reservations Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Reservation List</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                <p className="mt-4 text-muted-foreground">Loading reservations...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Guest</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Room</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Check-in</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Check-out</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Nights</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reservations.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="py-8 text-center text-muted-foreground">
                                                    No reservations found
                                                </td>
                                            </tr>
                                        ) : (
                                            reservations.map((reservation) => (
                                                <tr key={reservation._id} className="border-b last:border-0 hover:bg-muted/50">
                                                    <td className="py-3 px-2">
                                                        <div>
                                                            <p className="font-medium">{reservation.guestName}</p>
                                                            <p className="text-sm text-muted-foreground">{reservation.email}</p>
                                                            <p className="text-xs text-muted-foreground">{reservation.reservationNumber}</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <div>
                                                            <p className="font-medium">{reservation.roomNumber}</p>
                                                            <p className="text-xs text-muted-foreground">{reservation.roomType}</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-2">{formatDate(reservation.checkIn)}</td>
                                                    <td className="py-3 px-2">{formatDate(reservation.checkOut)}</td>
                                                    <td className="py-3 px-2">{calculateNights(reservation.checkIn, reservation.checkOut)}</td>
                                                    <td className="py-3 px-2 font-medium">${reservation.totalAmount?.toFixed(2) || '0.00'}</td>
                                                    <td className="py-3 px-2">
                                                        <StatusBadge status={reservation.reservationStatus} />
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <div className="flex gap-2">
                                                            <Link to={`/hotel/reservations/${reservation._id}`}>
                                                                <Button size="sm" variant="ghost" className="text-xs">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            {reservation.reservationStatus === 'confirmed' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                    onClick={() => handleCheckIn(reservation._id)}
                                                                >
                                                                    Check In
                                                                </Button>
                                                            )}
                                                            {reservation.reservationStatus === 'checked_in' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                    onClick={() => handleCheckOut(reservation._id)}
                                                                >
                                                                    Check Out
                                                                </Button>
                                                            )}
                                                            {reservation.reservationStatus === 'confirmed' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                    onClick={() => {
                                                                        setSelectedReservation(reservation._id);
                                                                        setDeleteDialogOpen(true);
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                                    {Math.min(currentPage * itemsPerPage, totalReservations)} of{' '}
                                    {totalReservations} reservations
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="flex items-center px-3 text-sm">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Reservation</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this reservation? This action cannot be undone.
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
    );
}