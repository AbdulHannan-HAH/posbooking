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
import { Building2, Plus, Search, Filter, ChevronLeft, ChevronRight, Loader2, Calendar, Eye, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConferenceService, type ConferenceBooking } from '@/services/conferenceService';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ConferenceBookings() {
    const conferenceService = useConferenceService();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState<ConferenceBooking[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBookings, setTotalBookings] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchBookings();
    }, [currentPage, statusFilter, bookingStatusFilter, searchTerm]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const params: any = {
                page: currentPage,
                limit: itemsPerPage,
                sortBy: 'startDate',
                sortOrder: 'asc'
            };

            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }

            if (bookingStatusFilter !== 'all') {
                params.bookingStatus = bookingStatusFilter;
            }

            if (searchTerm) {
                params.search = searchTerm;
            }

            const response = await conferenceService.getBookings(params);

            if (response.success) {
                setBookings(response.bookings || []);
                setTotalPages(response.totalPages || 1);
                setTotalBookings(response.total || 0);
            } else {
                toast.error(response.message || 'Failed to fetch bookings');
                setBookings([]);
            }
        } catch (error: any) {
            console.error('Error fetching conference bookings:', error);
            toast.error('Failed to load bookings');
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (bookingId: string, status: string) => {
        try {
            const response = await conferenceService.updateBookingStatus(bookingId, status);
            if (response.success) {
                toast.success('Booking status updated successfully');
                fetchBookings();
            } else {
                toast.error(response.message || 'Failed to update status');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status');
        }
    };

    const handlePaymentUpdate = async (bookingId: string, status: string) => {
        try {
            const response = await conferenceService.updatePaymentStatus(bookingId, status);
            if (response.success) {
                toast.success('Payment status updated successfully');
                fetchBookings();
            } else {
                toast.error(response.message || 'Failed to update payment status');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update payment status');
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'yyyy-MM-dd');
        } catch {
            return dateString;
        }
    };

    const getHallDisplay = (hallType: string) => {
        const hallMap: Record<string, string> = {
            'hall_a': 'Hall A',
            'hall_b': 'Hall B',
            'grand_hall': 'Grand Hall',
            'meeting_room_1': 'Meeting Room 1',
            'meeting_room_2': 'Meeting Room 2'
        };
        return hallMap[hallType] || hallType;
    };

    const getEventTypeDisplay = (eventType: string) => {
        return eventType.charAt(0).toUpperCase() + eventType.slice(1);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl gradient-conference flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <h1 className="text-3xl font-bold">Conference Bookings</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">View and manage all conference hall bookings</p>
                </div>
                <Link to="/conference/bookings/new">
                    <Button className="gradient-conference border-0">
                        <Plus className="h-4 w-4 mr-2" />
                        New Booking
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
                                placeholder="Search by client, event, company, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter}>
                                <SelectTrigger className="w-40">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Booking Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Payment Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Payments</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="partial">Partial</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bookings Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Booking List</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                <p className="mt-4 text-muted-foreground">Loading bookings...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Client/Event</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Dates</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Hall</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Attendees</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Booking Status</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Payment</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="py-8 text-center text-muted-foreground">
                                                    No bookings found
                                                </td>
                                            </tr>
                                        ) : (
                                            bookings.map((booking) => {
                                                const netAmount = (booking.amount || 0) - (booking.discount || 0);
                                                return (
                                                    <tr key={booking._id} className="border-b last:border-0 hover:bg-muted/50">
                                                        <td className="py-3 px-2">
                                                            <div>
                                                                <p className="font-medium">{booking.clientName}</p>
                                                                <p className="text-sm text-muted-foreground">{booking.eventName}</p>
                                                                {booking.company && (
                                                                    <p className="text-xs text-muted-foreground">{booking.company}</p>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-sm">{formatDate(booking.startDate)}</span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">
                                                                {booking.startTime} - {booking.endTime}
                                                            </p>
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-conference-light text-conference-foreground text-xs font-medium">
                                                                {getHallDisplay(booking.hallType)}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-2">{booking.attendees}</td>
                                                        <td className="py-3 px-2">
                                                            <div>
                                                                <p className="font-medium">{formatCurrency(booking.amount)}</p>
                                                                {booking.discount > 0 && (
                                                                    <p className="text-xs text-success flex items-center gap-1">
                                                                        <Percent className="h-3 w-3" />
                                                                        Discount: {formatCurrency(booking.discount)}
                                                                    </p>
                                                                )}
                                                                <p className="text-xs text-muted-foreground">
                                                                    Net: {formatCurrency(netAmount)}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Paid: {formatCurrency(booking.advancePaid)}
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <StatusBadge status={booking.bookingStatus} />
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <StatusBadge status={booking.paymentStatus} />
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <div className="flex gap-2">
                                                                <Link to={`/conference/bookings/${booking._id}`}>
                                                                    <Button size="sm" variant="ghost" className="text-xs">
                                                                        <Eye className="h-3 w-3 mr-1" />
                                                                        View
                                                                    </Button>
                                                                </Link>
                                                                {booking.bookingStatus === 'pending' && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="text-xs"
                                                                        onClick={() => handleStatusUpdate(booking._id, 'approved')}
                                                                    >
                                                                        Approve
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                                    {Math.min(currentPage * itemsPerPage, totalBookings)} of{' '}
                                    {totalBookings} bookings
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
        </div>
    );
}