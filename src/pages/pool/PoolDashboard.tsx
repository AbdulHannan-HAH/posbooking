import { useState, useEffect } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Waves, Users, DollarSign, Clock, Plus, TrendingUp, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { usePoolService } from '@/services/poolService';
import { toast } from 'sonner';

export default function PoolDashboard() {
  const poolService = usePoolService();
  const [stats, setStats] = useState({
    todayBookings: 0,
    currentCapacity: 0,
    maxCapacity: 0,
    dailyRevenue: 0,
    todayDiscounts: 0,
    pendingPayments: 0,
    capacityPercentage: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, bookingsResponse] = await Promise.all([
        poolService.getDashboardStats(),
        poolService.getBookings({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })
      ]);

      if (statsResponse.success && statsResponse.stats) {
        const capacityPercentage = statsResponse.stats.currentCapacity > 0
          ? (statsResponse.stats.currentCapacity / 50) * 100
          : 0;

        setStats({
          todayBookings: statsResponse.stats.todayBookings || 0,
          currentCapacity: statsResponse.stats.currentCapacity || 0,
          maxCapacity: 50,
          dailyRevenue: statsResponse.stats.todayRevenue || 0,
          todayDiscounts: statsResponse.stats.todayDiscounts || 0,
          pendingPayments: statsResponse.stats.pendingPayments || 0,
          capacityPercentage,
        });
      }

      if (bookingsResponse.success && bookingsResponse.bookings) {
        setRecentBookings(bookingsResponse.bookings.slice(0, 5));
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getPassTypeDisplay = (passType: string) => {
    const displayMap: Record<string, string> = {
      'daily': 'Daily',
      'family': 'Family',
      'hourly': 'Others'
    };
    return displayMap[passType] || passType;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Today's Bookings"
          value={stats.todayBookings}
          change="+5 from yesterday"
          changeType="positive"
          icon={Waves}
          iconClassName="gradient-pool"
        />
        <StatCard
          title="Current Visitors"
          value={stats.currentCapacity}
          change={`${stats.maxCapacity - stats.currentCapacity} spots left`}
          changeType="neutral"
          icon={Users}
          iconClassName="bg-pool-light"
        />
        <StatCard
          title="Daily Revenue"
          value={`$${stats.dailyRevenue}`}
          change="After discounts"
          changeType="positive"
          icon={DollarSign}
          iconClassName="gradient-conference"
        />
        <StatCard
          title="Today's Discounts"
          value={`$${stats.todayDiscounts}`}
          change="Total discounts given"
          changeType="neutral"
          icon={Percent}
          iconClassName="gradient-hotel"
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
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
                <span className="text-5xl font-bold">{stats.currentCapacity}</span>
                <span className="text-2xl text-muted-foreground">/{stats.maxCapacity}</span>
                <p className="text-sm text-muted-foreground mt-1">Current Visitors</p>
              </div>
              <Progress
                value={stats.capacityPercentage}
                className="h-3"
              />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Capacity</span>
                <span className={stats.capacityPercentage > 80 ? 'text-destructive font-medium' : 'text-success font-medium'}>
                  {stats.capacityPercentage.toFixed(0)}%
                </span>
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
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Discount</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking._id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-2 font-medium">{booking.customerName}</td>
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-pool-light text-pool-foreground text-xs font-medium">
                          {getPassTypeDisplay(booking.passType)}
                        </span>
                      </td>
                      <td className="py-3 px-2">{booking.persons}</td>
                      <td className="py-3 px-2">
                        {booking.discount && booking.discount > 0 ? (
                          <span className="text-pool">${booking.discount}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-2 font-medium">${booking.amount}</td>
                      <td className="py-3 px-2">
                        <StatusBadge status={booking.paymentStatus} />
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