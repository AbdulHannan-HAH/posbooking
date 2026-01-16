import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Waves, Users, DollarSign, Clock, Plus, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

// Mock data
const poolStats = {
  todayBookings: 28,
  currentCapacity: 42,
  maxCapacity: 50,
  dailyRevenue: 1250,
  pendingPayments: 4,
};

const recentBookings = [
  { id: 1, customer: 'John Smith', passType: 'Daily', persons: 2, time: '09:00 AM', status: 'paid' as const },
  { id: 2, customer: 'Sarah Johnson', passType: 'Hourly', persons: 1, time: '10:30 AM', status: 'pending' as const },
  { id: 3, customer: 'Mike Wilson', passType: 'Daily', persons: 4, time: '11:00 AM', status: 'paid' as const },
  { id: 4, customer: 'Emma Davis', passType: 'Hourly', persons: 2, time: '11:30 AM', status: 'paid' as const },
  { id: 5, customer: 'Alex Brown', passType: 'Daily', persons: 3, time: '12:00 PM', status: 'pending' as const },
];

export default function PoolDashboard() {
  const capacityPercentage = (poolStats.currentCapacity / poolStats.maxCapacity) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-pool flex items-center justify-center">
              <Waves className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">Pool Dashboard</h1>
          </div>
          <p className="text-muted-foreground mt-1">Manage pool bookings and capacity</p>
        </div>
        <Link to="/pool/bookings/new">
          <Button className="gradient-pool border-0">
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Bookings"
          value={poolStats.todayBookings}
          change="+5 from yesterday"
          changeType="positive"
          icon={Waves}
          iconClassName="gradient-pool"
        />
        <StatCard
          title="Current Visitors"
          value={poolStats.currentCapacity}
          change={`${poolStats.maxCapacity - poolStats.currentCapacity} spots left`}
          changeType="neutral"
          icon={Users}
          iconClassName="bg-pool-light"
        />
        <StatCard
          title="Daily Revenue"
          value={`$${poolStats.dailyRevenue}`}
          change="+12% from average"
          changeType="positive"
          icon={DollarSign}
          iconClassName="gradient-conference"
        />
        <StatCard
          title="Pending Payments"
          value={poolStats.pendingPayments}
          change="Needs attention"
          changeType="negative"
          icon={Clock}
          iconClassName="gradient-hotel"
        />
      </div>

      {/* Capacity & Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Capacity Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-pool" />
              Pool Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-5xl font-bold">{poolStats.currentCapacity}</span>
                <span className="text-2xl text-muted-foreground">/{poolStats.maxCapacity}</span>
                <p className="text-sm text-muted-foreground mt-1">Current Visitors</p>
              </div>
              <Progress 
                value={capacityPercentage} 
                className="h-3"
              />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Capacity</span>
                <span className={capacityPercentage > 80 ? 'text-destructive font-medium' : 'text-success font-medium'}>
                  {capacityPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Time Slots Today</h4>
                <div className="space-y-2">
                  {[
                    { time: '06:00 - 09:00', visitors: 12 },
                    { time: '09:00 - 12:00', visitors: 35 },
                    { time: '12:00 - 15:00', visitors: 42 },
                    { time: '15:00 - 18:00', visitors: 28 },
                  ].map((slot, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{slot.time}</span>
                      <span className="font-medium">{slot.visitors} visitors</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
            <Link to="/pool/bookings">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Customer</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Pass Type</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Persons</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Time</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-2 font-medium">{booking.customer}</td>
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-pool-light text-pool-foreground text-xs font-medium">
                          {booking.passType}
                        </span>
                      </td>
                      <td className="py-3 px-2">{booking.persons}</td>
                      <td className="py-3 px-2 text-muted-foreground">{booking.time}</td>
                      <td className="py-3 px-2">
                        <StatusBadge status={booking.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
