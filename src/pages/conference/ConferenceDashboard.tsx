import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Calendar, DollarSign, Clock, Plus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data
const conferenceStats = {
  activeEvents: 3,
  pendingRequests: 5,
  monthlyRevenue: 45680,
  upcomingBookings: 12,
};

const upcomingEvents = [
  { id: 1, client: 'Tech Corp', event: 'Annual Meeting', hall: 'Hall A', date: '2024-01-16', time: '09:00 - 17:00', capacity: 100, status: 'approved' as const },
  { id: 2, client: 'Wedding Co', event: 'Johnson Wedding', hall: 'Grand Hall', date: '2024-01-18', time: '14:00 - 22:00', capacity: 200, status: 'approved' as const },
  { id: 3, client: 'Startup Inc', event: 'Product Launch', hall: 'Hall B', date: '2024-01-20', time: '10:00 - 14:00', capacity: 50, status: 'pending' as const },
];

const pendingRequests = [
  { id: 1, client: 'Med Association', event: 'Healthcare Summit', date: '2024-01-25', type: 'Seminar' },
  { id: 2, client: 'Local University', event: 'Graduation Ceremony', date: '2024-01-28', type: 'Meeting' },
  { id: 3, client: 'Fashion Week', event: 'Spring Collection', date: '2024-02-02', type: 'Seminar' },
];

export default function ConferenceDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-conference flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">Conference Dashboard</h1>
          </div>
          <p className="text-muted-foreground mt-1">Manage conference hall bookings and events</p>
        </div>
        <Link to="/conference/bookings/new">
          <Button className="gradient-conference border-0">
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Events"
          value={conferenceStats.activeEvents}
          change="Currently in progress"
          changeType="neutral"
          icon={Building2}
          iconClassName="gradient-conference"
        />
        <StatCard
          title="Pending Requests"
          value={conferenceStats.pendingRequests}
          change="Awaiting approval"
          changeType="negative"
          icon={Clock}
          iconClassName="bg-conference-light"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${conferenceStats.monthlyRevenue.toLocaleString()}`}
          change="+15% from last month"
          changeType="positive"
          icon={DollarSign}
          iconClassName="gradient-pool"
        />
        <StatCard
          title="Upcoming Bookings"
          value={conferenceStats.upcomingBookings}
          change="Next 30 days"
          changeType="neutral"
          icon={Calendar}
          iconClassName="gradient-hotel"
        />
      </div>

      {/* Events & Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Upcoming Events</CardTitle>
            <Link to="/conference/bookings">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-4 rounded-lg bg-secondary/50 border">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{event.event}</h4>
                      <p className="text-sm text-muted-foreground">{event.client}</p>
                    </div>
                    <StatusBadge status={event.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Hall</p>
                      <p className="font-medium">{event.hall}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">{event.date}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Capacity</p>
                      <p className="font-medium flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.capacity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div>
                    <h4 className="font-medium">{request.event}</h4>
                    <p className="text-sm text-muted-foreground">{request.client}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">{request.date}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-conference-light text-conference-foreground text-xs font-medium">
                        {request.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs">
                      Decline
                    </Button>
                    <Button size="sm" className="gradient-conference border-0 text-xs">
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hall Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hall Availability Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: 'Hall A', capacity: 100, status: 'occupied', event: 'Tech Corp Meeting' },
              { name: 'Hall B', capacity: 50, status: 'available', event: null },
              { name: 'Grand Hall', capacity: 200, status: 'occupied', event: 'Wedding Reception' },
              { name: 'Meeting Room 1', capacity: 20, status: 'available', event: null },
              { name: 'Meeting Room 2', capacity: 20, status: 'occupied', event: 'Board Meeting' },
            ].map((hall, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border ${
                  hall.status === 'available'
                    ? 'bg-success-light border-success/20'
                    : 'bg-conference-light border-conference/20'
                }`}
              >
                <h4 className="font-medium">{hall.name}</h4>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Users className="h-3 w-3" />
                  {hall.capacity} seats
                </p>
                <StatusBadge 
                  status={hall.status as 'available' | 'occupied'} 
                  className="mt-2"
                />
                {hall.event && (
                  <p className="text-xs text-muted-foreground mt-2 truncate">{hall.event}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
