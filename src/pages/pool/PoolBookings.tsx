import { useState } from 'react';
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
import { Waves, Plus, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock bookings data
const mockBookings = [
  { id: 1, customer: 'John Smith', email: 'john@email.com', date: '2024-01-15', timeSlot: '09:00 - 12:00', passType: 'Daily', persons: 2, amount: 50, status: 'paid' as const },
  { id: 2, customer: 'Sarah Johnson', email: 'sarah@email.com', date: '2024-01-15', timeSlot: '10:00 - 11:00', passType: 'Hourly', persons: 1, amount: 15, status: 'pending' as const },
  { id: 3, customer: 'Mike Wilson', email: 'mike@email.com', date: '2024-01-15', timeSlot: '09:00 - 12:00', passType: 'Daily', persons: 4, amount: 100, status: 'paid' as const },
  { id: 4, customer: 'Emma Davis', email: 'emma@email.com', date: '2024-01-15', timeSlot: '14:00 - 15:00', passType: 'Hourly', persons: 2, amount: 30, status: 'paid' as const },
  { id: 5, customer: 'Alex Brown', email: 'alex@email.com', date: '2024-01-15', timeSlot: '09:00 - 12:00', passType: 'Daily', persons: 3, amount: 75, status: 'pending' as const },
  { id: 6, customer: 'Lisa Chen', email: 'lisa@email.com', date: '2024-01-14', timeSlot: '15:00 - 18:00', passType: 'Daily', persons: 2, amount: 50, status: 'paid' as const },
  { id: 7, customer: 'Tom Harris', email: 'tom@email.com', date: '2024-01-14', timeSlot: '10:00 - 11:00', passType: 'Hourly', persons: 1, amount: 15, status: 'paid' as const },
  { id: 8, customer: 'Amy White', email: 'amy@email.com', date: '2024-01-14', timeSlot: '12:00 - 15:00', passType: 'Daily', persons: 5, amount: 125, status: 'cancelled' as const },
];

export default function PoolBookings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredBookings = mockBookings.filter((booking) => {
    const matchesSearch = booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStatusUpdate = (bookingId: number, newStatus: string) => {
    // In production, this would call the API
    console.log(`Updating booking ${bookingId} to ${newStatus}`);
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
                placeholder="Search by customer name or email..."
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
                {paginatedBookings.map((booking) => (
                  <tr key={booking.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium">{booking.customer}</p>
                        <p className="text-sm text-muted-foreground">{booking.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2">{booking.date}</td>
                    <td className="py-3 px-2">{booking.timeSlot}</td>
                    <td className="py-3 px-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-pool-light text-pool-foreground text-xs font-medium">
                        {booking.passType}
                      </span>
                    </td>
                    <td className="py-3 px-2">{booking.persons}</td>
                    <td className="py-3 px-2 font-medium">${booking.amount}</td>
                    <td className="py-3 px-2">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="py-3 px-2">
                      {booking.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => handleStatusUpdate(booking.id, 'paid')}
                        >
                          Mark Paid
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of{' '}
              {filteredBookings.length} bookings
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
        </CardContent>
      </Card>
    </div>
  );
}
