// pages/hotel/HotelDashboard.tsx - UPDATED
import { useState, useEffect } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hotel, BedDouble, DollarSign, CalendarCheck, Plus, LogIn, LogOut, Users, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { useHotelService } from '@/services/hotelService';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function HotelDashboard() {
  const hotelService = useHotelService();
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    checkInsToday: 0,
    checkOutsToday: 0,
    monthlyRevenue: 0,
    todayRevenue: 0,
    pendingPayments: 0,
    occupancyRate: 0,
  });
  const [recentReservations, setRecentReservations] = useState<any[]>([]);
  const [todayActivity, setTodayActivity] = useState({
    checkIns: [],
    checkOuts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');

      const [statsResponse, reservationsResponse] = await Promise.all([
        hotelService.getDashboardStats(),
        hotelService.getReservations({ limit: 5, sortBy: 'checkIn', sortOrder: 'desc' })
      ]);

      console.log('Dashboard stats response:', statsResponse);
      console.log('Reservations response:', reservationsResponse);

      if (statsResponse.success && statsResponse.stats) {
        const statsData = statsResponse.stats;
        console.log('Stats data:', statsData);

        setStats({
          totalRooms: statsData.totalRooms || 0,
          occupiedRooms: statsData.occupiedRooms || 0,
          availableRooms: statsData.availableRooms || 0,
          checkInsToday: statsData.checkInsToday || 0,
          checkOutsToday: statsData.checkOutsToday || 0,
          monthlyRevenue: statsData.monthlyRevenue || 0,
          todayRevenue: statsData.todayRevenue || 0,
          pendingPayments: statsData.pendingPayments || 0,
          occupancyRate: statsData.occupancyRate || 0,
        });

        // Set today's activities
        if (statsData.upcomingCheckIns) {
          const checkIns = Array.isArray(statsData.upcomingCheckIns)
            ? statsData.upcomingCheckIns.map((ci: any) => ({
              guest: ci.guestName,
              room: ci.roomNumber,
              time: format(new Date(ci.checkIn), 'HH:mm')
            }))
            : [];
          setTodayActivity(prev => ({ ...prev, checkIns }));
        }

        if (statsData.upcomingCheckOuts) {
          const checkOuts = Array.isArray(statsData.upcomingCheckOuts)
            ? statsData.upcomingCheckOuts.map((co: any) => ({
              guest: co.guestName,
              room: co.roomNumber,
              time: format(new Date(co.checkOut), 'HH:mm')
            }))
            : [];
          setTodayActivity(prev => ({ ...prev, checkOuts }));
        }
      } else {
        console.error('Failed to load stats:', statsResponse.message);
        toast.error(statsResponse.message || 'Failed to load dashboard stats');
      }

      if (reservationsResponse.success && reservationsResponse.reservations) {
        console.log('Recent reservations:', reservationsResponse.reservations);
        setRecentReservations(reservationsResponse.reservations.slice(0, 5));
      }

    } catch (error: any) {
      console.error('Dashboard error:', error);
      toast.error(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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

  const maintenanceRooms = stats.totalRooms - stats.availableRooms - stats.occupiedRooms;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-hotel flex items-center justify-center">
              <Hotel className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">Hotel Dashboard</h1>
          </div>
          <p className="text-muted-foreground mt-1">Manage rooms, reservations, and check-ins</p>
        </div>
        <Link to="/hotel/reservations/new">
          <Button className="gradient-hotel border-0 hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4 mr-2" />
            New Reservation
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Rooms"
          value={stats.totalRooms}
          change={`${stats.occupiedRooms} occupied, ${stats.availableRooms} available`}
          changeType="neutral"
          icon={BedDouble}
          iconClassName="gradient-hotel"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${stats.occupancyRate.toFixed(1)}%`}
          change={`${stats.occupiedRooms}/${stats.totalRooms} rooms`}
          changeType={stats.occupancyRate > 80 ? "positive" : stats.occupancyRate > 50 ? "neutral" : "negative"}
          icon={Users}
          iconClassName="gradient-conference"
        />
        <StatCard
          title="Today's Revenue"
          value={`$${stats.todayRevenue.toLocaleString()}`}
          change="Today's earnings"
          changeType={stats.todayRevenue > 0 ? "positive" : "neutral"}
          icon={DollarSign}
          iconClassName="bg-success/20"
        />
        <StatCard
          title="Check-ins Today"
          value={stats.checkInsToday}
          change="Expected arrivals"
          changeType="positive"
          icon={LogIn}
          iconClassName="bg-hotel-light"
        />
      </div>

      {/* Room Status & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Room Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center mb-6">
                <span className="text-5xl font-bold">{stats.occupiedRooms}</span>
                <span className="text-2xl text-muted-foreground">/{stats.totalRooms}</span>
                <p className="text-sm text-muted-foreground mt-1">Occupied Rooms</p>
              </div>
              <Progress value={stats.occupancyRate} className="h-3" />

              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-sm">Available</span>
                  </div>
                  <span className="text-sm font-medium">{stats.availableRooms}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <span className="text-sm">Occupied</span>
                  </div>
                  <span className="text-sm font-medium">{stats.occupiedRooms}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-sm">Maintenance</span>
                  </div>
                  <span className="text-sm font-medium">{maintenanceRooms}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Check-ins */}
              <div>
                <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                  <LogIn className="h-4 w-4 text-green-600" />
                  Expected Check-ins ({stats.checkInsToday})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {todayActivity.checkIns.length > 0 ? (
                    todayActivity.checkIns.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-green-50">
                        <div>
                          <p className="text-sm font-medium">{item.guest}</p>
                          <p className="text-xs text-muted-foreground">Room {item.room}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">{item.time}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">No check-ins scheduled</p>
                  )}
                </div>
              </div>

              {/* Check-outs */}
              <div>
                <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                  <LogOut className="h-4 w-4 text-amber-600" />
                  Expected Check-outs ({stats.checkOutsToday})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {todayActivity.checkOuts.length > 0 ? (
                    todayActivity.checkOuts.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-amber-50">
                        <div>
                          <p className="text-sm font-medium">{item.guest}</p>
                          <p className="text-xs text-muted-foreground">Room {item.room}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">{item.time}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">No check-outs scheduled</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reservations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Reservations</CardTitle>
            <Link to="/hotel/reservations">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentReservations.length > 0 ? (
                recentReservations.map((reservation) => (
                  <div key={reservation._id} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{reservation.guestName}</p>
                        <p className="text-sm text-muted-foreground">Room {reservation.roomNumber}</p>
                      </div>
                      <StatusBadge status={reservation.reservationStatus} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-hotel-light text-hotel-foreground font-medium">
                        {reservation.roomType}
                      </span>
                      <span>{format(new Date(reservation.checkIn), 'MMM dd')} → {format(new Date(reservation.checkOut), 'MMM dd')}</span>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-sm font-medium">${reservation.totalAmount?.toFixed(2) || '0.00'}</span>
                      <StatusBadge status={reservation.paymentStatus} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Hotel className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p>No recent reservations</p>
                  <Link to="/hotel/reservations/new">
                    <Button variant="outline" size="sm" className="mt-2">
                      Create First Reservation
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/hotel/reservations/new">
              <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer">
                <div className="h-12 w-12 rounded-xl gradient-hotel flex items-center justify-center">
                  <Plus className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">New Reservation</span>
              </div>
            </Link>
            <Link to="/hotel/rooms">
              <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer">
                <div className="h-12 w-12 rounded-xl gradient-conference flex items-center justify-center">
                  <BedDouble className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">Manage Rooms</span>
              </div>
            </Link>
            <Link to="/hotel/settings">
              <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer">
                <div className="h-12 w-12 rounded-xl gradient-admin flex items-center justify-center">
                  <CalendarCheck className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">Hotel Settings</span>
              </div>
            </Link>
            <Link to="/hotel/reports">
              <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer">
                <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium">View Reports</span>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}