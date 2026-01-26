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
import { Waves, Plus, Search, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
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
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBookings();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await poolService.getBookings(params);

      if (response.success) {
        setBookings(response.bookings || []);
        setTotalPages(response.totalPages || 1);
        setTotalBookings(response.total || 0);
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
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const response = await poolService.updatePaymentStatus(bookingId, newStatus);
      if (response.success) {
        toast.success('Payment status updated successfully');
        fetchBookings(); // Refresh list
      } else {
        toast.error(response.message || 'Failed to update status');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
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
        <Link to="/pool/bookings/new">
          <Button className="gradient-pool border-0">
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
                placeholder="Search by customer name, email, or phone..."
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
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Customer</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Time Slot</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Pass</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Persons</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
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
                      bookings.map((booking) => (
                        <tr key={booking._id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium">{booking.customerName}</p>
                              <p className="text-sm text-muted-foreground">{booking.email}</p>
                              <p className="text-xs text-muted-foreground">{booking.phone}</p>
                            </div>
                          </td>
                          <td className="py-3 px-2">{formatDate(booking.date)}</td>
                          <td className="py-3 px-2">{formatTimeSlot(booking.timeSlot)}</td>
                          <td className="py-3 px-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-pool-light text-pool-foreground text-xs font-medium capitalize">
                              {booking.passType}
                            </span>
                          </td>
                          <td className="py-3 px-2">{booking.persons}</td>
                          <td className="py-3 px-2 font-medium">${booking.amount.toFixed(2)}</td>
                          <td className="py-3 px-2">
                            <StatusBadge status={booking.paymentStatus} />
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex gap-2">
                              <Link to={`/pool/bookings/${booking._id}`}>
                                <Button size="sm" variant="ghost" className="text-xs">
                                  View
                                </Button>
                              </Link>
                              {booking.paymentStatus === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() => handleStatusUpdate(booking._id, 'paid')}
                                >
                                  Mark Paid
                                </Button>
                              )}
                              {booking.paymentStatus === 'paid' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
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