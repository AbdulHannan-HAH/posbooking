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
import { Waves, Plus, Search, Filter, ChevronLeft, ChevronRight, Loader2, RefreshCw, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePoolService } from '@/services/poolService';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function PoolBookings() {
  const poolService = usePoolService();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBookings();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      // Build params
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (searchTerm && searchTerm.trim() !== '') {
        params.search = searchTerm.trim();
      }

      console.log('Fetching bookings with params:', params);
      const response = await poolService.getBookings(params);
      console.log('Bookings response:', response);

      if (response.success) {
        // Handle response structure
        const bookingsData = response.bookings || [];
        setBookings(bookingsData);

        // Handle pagination data
        setTotalPages(response.totalPages || 1);
        setTotalBookings(response.total || 0);

        if (bookingsData.length === 0) {
          console.log('No bookings found');
        }
      } else {
        toast.error(response.message || 'Failed to fetch bookings');
        setBookings([]);
      }
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const response = await poolService.updatePaymentStatus(bookingId, newStatus);
      if (response.success) {
        toast.success(`Payment status updated to ${newStatus}`);
        fetchBookings(); // Refresh list
      } else {
        toast.error(response.message || 'Failed to update status');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await poolService.deleteBooking(bookingId);
      if (response.success) {
        toast.success('Booking deleted successfully');
        fetchBookings();
      } else {
        toast.error(response.message || 'Failed to delete booking');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete booking');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch {
      return dateString;
    }
  };

  const formatTimeSlot = (timeSlot: string) => {
    const timeMap: Record<string, string> = {
      '06:00-09:00': '06:00 AM - 09:00 AM',
      '09:00-12:00': '09:00 AM - 12:00 PM',
      '12:00-15:00': '12:00 PM - 03:00 PM',
      '15:00-18:00': '03:00 PM - 06:00 PM',
      '18:00-21:00': '06:00 PM - 09:00 PM',
    };
    return timeMap[timeSlot] || timeSlot;
  };

  const getPassTypeDisplay = (passType: string) => {
    const displayMap: Record<string, string> = {
      'daily': 'Daily',
      'family': 'Family',
      'hourly': 'Others'
    };
    return displayMap[passType] || passType;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-pool flex items-center justify-center">
              <Waves className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">Pool Bookings</h1>
          </div>
          <p className="text-muted-foreground mt-1">View and manage all pool bookings</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link to="/pool/bookings/new">
            <Button className="gradient-pool border-0">
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name, email, phone, or booking number..."
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
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Booking List</CardTitle>
          {totalBookings > 0 && (
            <span className="text-sm text-muted-foreground">
              Total: {totalBookings} bookings
            </span>
          )}
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
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Booking #</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Customer</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Time Slot</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Pass</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Persons</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Subtotal</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Discount</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-12 text-center text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <Waves className="h-12 w-12 text-muted-foreground/50" />
                            <p className="text-lg font-medium">No bookings found</p>
                            <p className="text-sm">Try adjusting your filters or create a new booking</p>
                            <Link to="/pool/bookings/new">
                              <Button variant="outline" className="mt-2">
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Booking
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      bookings.map((booking) => (
                        <tr key={booking._id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-2">
                            <span className="font-mono text-sm font-medium">
                              {booking.bookingNumber}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium">{booking.customerName}</p>
                              {booking.email && (
                                <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                                  {booking.email}
                                </p>
                              )}
                              {booking.phone && (
                                <p className="text-xs text-muted-foreground">{booking.phone}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-sm whitespace-nowrap">
                              {formatDate(booking.date)}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-sm whitespace-nowrap">
                              {formatTimeSlot(booking.timeSlot)}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-pool-light text-pool-foreground text-xs font-medium capitalize">
                              {getPassTypeDisplay(booking.passType)}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className="font-medium">{booking.persons}</span>
                          </td>
                          <td className="py-3 px-2">
                            <span className="font-medium">
                              ${booking.subtotal?.toFixed(2) || booking.amount?.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            {booking.discount && booking.discount > 0 ? (
                              <span className="inline-flex items-center gap-1 text-pool">
                                <Percent className="h-3 w-3" />
                                ${booking.discount.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <span className="font-semibold text-pool">
                              ${booking.amount?.toFixed(2) || '0.00'}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <StatusBadge status={booking.paymentStatus} />
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <Link to={`/pool/bookings/${booking._id}`}>
                                <Button size="sm" variant="ghost" className="text-xs">
                                  View
                                </Button>
                              </Link>
                              {booking.paymentStatus === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                                  onClick={() => handleStatusUpdate(booking._id, 'paid')}
                                >
                                  Mark Paid
                                </Button>
                              )}
                              {booking.paymentStatus === 'paid' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                                  onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                >
                                  Cancel
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
              {bookings.length > 0 && (
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
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}