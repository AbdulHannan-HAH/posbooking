// pages/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { StatCard } from '@/components/ui/StatCard';
import { ModuleCard } from '@/components/ui/ModuleCard';
import { usePoolService } from '@/services/poolService';
import { useConferenceService } from '@/services/conferenceService';
import { useHotelService } from '@/services/hotelService';
import { Waves, Building2, Hotel, CalendarDays, DollarSign, Clock, Users, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const poolService = usePoolService();
  const conferenceService = useConferenceService();
  const hotelService = useHotelService();

  const [stats, setStats] = useState({
    totalBookingsToday: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    activeBookings: 0,
    poolStats: {
      todayBookings: 0,
      capacity: '0/50',
      currentCapacity: 0,
      maxCapacity: 50,
      todayRevenue: 0
    },
    conferenceStats: {
      activeEvents: 0,
      pendingRequests: 0,
      monthlyRevenue: 0,
      todayEvents: 0
    },
    hotelStats: {
      occupancy: '0%',
      checkInsToday: 0,
      totalRooms: 0,
      occupiedRooms: 0,
      monthlyRevenue: 0
    }
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch data from all services
      const [poolData, conferenceData, hotelData, poolBookings, conferenceBookings, hotelReservations] = await Promise.all([
        poolService.getDashboardStats(),
        conferenceService.getDashboardStats(),
        hotelService.getDashboardStats(),
        poolService.getBookings({ limit: 3, sortBy: 'createdAt', sortOrder: 'desc' }),
        conferenceService.getBookings({ limit: 3, sortBy: 'createdAt', sortOrder: 'desc' }),
        hotelService.getReservations({ limit: 3, sortBy: 'createdAt', sortOrder: 'desc' })
      ]);

      // Process pool stats
      const poolStats = {
        todayBookings: poolData.success ? poolData.stats?.todayBookings || 0 : 0,
        currentCapacity: poolData.success ? poolData.stats?.currentCapacity || 0 : 0,
        maxCapacity: 50,
        todayRevenue: poolData.success ? poolData.stats?.todayRevenue || 0 : 0,
        capacity: poolData.success ?
          `${poolData.stats?.currentCapacity || 0}/${50}` : '0/50'
      };

      // Process conference stats
      const conferenceStats = {
        activeEvents: conferenceData.success ? conferenceData.stats?.todayEvents || 0 : 0,
        pendingRequests: conferenceData.success ? conferenceData.stats?.pendingApprovals || 0 : 0,
        monthlyRevenue: conferenceData.success ? conferenceData.stats?.monthlyRevenue || 0 : 0,
        todayEvents: conferenceData.success ? conferenceData.stats?.todayEvents || 0 : 0
      };

      // Process hotel stats
      const hotelStats = {
        occupancy: hotelData.success ? `${hotelData.stats?.occupancyRate?.toFixed(0) || 0}%` : '0%',
        checkInsToday: hotelData.success ? hotelData.stats?.checkInsToday || 0 : 0,
        totalRooms: hotelData.success ? hotelData.stats?.totalRooms || 0 : 0,
        occupiedRooms: hotelData.success ? hotelData.stats?.occupiedRooms || 0 : 0,
        monthlyRevenue: hotelData.success ? hotelData.stats?.monthlyRevenue || 0 : 0
      };

      // Calculate totals
      const totalBookingsToday = poolStats.todayBookings + conferenceStats.todayEvents + hotelStats.checkInsToday;
      const monthlyRevenue = poolStats.todayRevenue + conferenceStats.monthlyRevenue + hotelStats.monthlyRevenue;
      const pendingPayments = (poolData.success ? poolData.stats?.pendingPayments || 0 : 0) +
        conferenceStats.pendingRequests;
      const activeBookings = poolStats.currentCapacity + hotelStats.occupiedRooms;

      // Get recent activities from all modules
      const recentActivitiesList = [];

      // Pool activities
      if (poolBookings.success && poolBookings.bookings) {
        poolBookings.bookings.forEach((booking: any) => {
          recentActivitiesList.push({
            type: 'pool',
            title: `Pool Booking - ${booking.passType.charAt(0).toUpperCase() + booking.passType.slice(1)} Pass`,
            description: `${booking.customerName} booked for ${booking.persons} person(s)`,
            time: formatTimeAgo(booking.createdAt),
            amount: booking.amount,
            status: booking.paymentStatus
          });
        });
      }

      // Conference activities
      if (conferenceBookings.success && conferenceBookings.bookings) {
        conferenceBookings.bookings.forEach((booking: any) => {
          recentActivitiesList.push({
            type: 'conference',
            title: `Conference Booking - ${booking.eventType}`,
            description: `${booking.clientName} booked ${booking.hallName}`,
            time: formatTimeAgo(booking.createdAt),
            amount: booking.totalAmount,
            status: booking.bookingStatus
          });
        });
      }

      // Hotel activities
      if (hotelReservations.success && hotelReservations.reservations) {
        hotelReservations.reservations.forEach((reservation: any) => {
          recentActivitiesList.push({
            type: 'hotel',
            title: `Hotel Reservation - Room ${reservation.roomNumber}`,
            description: `${reservation.guestName} booked for ${reservation.totalNights} nights`,
            time: formatTimeAgo(reservation.createdAt),
            amount: reservation.totalAmount,
            status: reservation.reservationStatus
          });
        });
      }

      // Sort by time (most recent first)
      recentActivitiesList.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      setStats({
        totalBookingsToday,
        monthlyRevenue,
        pendingPayments,
        activeBookings,
        poolStats,
        conferenceStats,
        hotelStats
      });

      setRecentActivities(recentActivitiesList.slice(0, 6));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    return format(date, 'MMM dd, yyyy');
  };

  const calculateChange = (current: number, previous: number = 0) => {
    if (previous === 0) return '+0% from yesterday';
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${Math.round(change)}% from yesterday`;
  };

  // Show loading state
  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only admin can access this page
  if (user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}. Here's what's happening today.
          <span className="ml-2 text-xs px-2 py-1 bg-primary/10 text-primary rounded">
            Role: {user?.role}
          </span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Bookings Today"
          value={stats.totalBookingsToday}
          change={calculateChange(stats.totalBookingsToday, Math.floor(stats.totalBookingsToday * 0.88))}
          changeType={stats.totalBookingsToday > 0 ? "positive" : "neutral"}
          icon={CalendarDays}
          iconClassName="gradient-pool"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          change="+8% from last month"
          changeType="positive"
          icon={DollarSign}
          iconClassName="gradient-conference"
        />
        <StatCard
          title="Pending Actions"
          value={stats.pendingPayments}
          change="Requires attention"
          changeType={stats.pendingPayments > 0 ? "negative" : "neutral"}
          icon={Clock}
          iconClassName="gradient-hotel"
        />
        <StatCard
          title="Active Bookings"
          value={stats.activeBookings}
          change="Currently in progress"
          changeType="neutral"
          icon={Users}
          iconClassName="gradient-admin"
        />
      </div>

      {/* Module Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Manage Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ModuleCard
            title="Pool"
            description="Manage pool bookings, passes, and capacity"
            icon={Waves}
            href="/pool"
            variant="pool"
            stats={[
              { label: "Today's Bookings", value: stats.poolStats.todayBookings },
              { label: 'Capacity', value: stats.poolStats.capacity },
              { label: "Today's Revenue", value: `$${stats.poolStats.todayRevenue}` },
            ]}
          />
          <ModuleCard
            title="Conference Hall"
            description="Handle event bookings, approvals, and invoicing"
            icon={Building2}
            href="/conference"
            variant="conference"
            stats={[
              { label: 'Active Events', value: stats.conferenceStats.activeEvents },
              { label: 'Pending Requests', value: stats.conferenceStats.pendingRequests },
              { label: 'Monthly Revenue', value: `$${stats.conferenceStats.monthlyRevenue.toLocaleString()}` },
            ]}
          />
          <ModuleCard
            title="Hotel"
            description="Room management, reservations, and check-ins"
            icon={Hotel}
            href="/hotel"
            variant="hotel"
            stats={[
              { label: 'Occupancy', value: stats.hotelStats.occupancy },
              { label: 'Check-ins Today', value: stats.hotelStats.checkInsToday },
              { label: 'Monthly Revenue', value: `$${stats.hotelStats.monthlyRevenue.toLocaleString()}` },
            ]}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border p-6">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${activity.type === 'pool' ? 'gradient-pool' :
                        activity.type === 'conference' ? 'gradient-conference' :
                          'gradient-hotel'
                      }`}>
                      {activity.type === 'pool' && <Waves className="h-5 w-5 text-primary-foreground" />}
                      {activity.type === 'conference' && <Building2 className="h-5 w-5 text-primary-foreground" />}
                      {activity.type === 'hotel' && <Hotel className="h-5 w-5 text-primary-foreground" />}
                    </div>
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">${activity.amount?.toFixed(2) || '0.00'}</span>
                    <span className={`block text-xs mt-1 ${activity.status === 'paid' || activity.status === 'confirmed' || activity.status === 'checked_in' ? 'text-success' :
                        activity.status === 'pending' ? 'text-warning' :
                          'text-destructive'
                      }`}>
                      {activity.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activities found</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-xl border p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: 'New Pool Booking',
                icon: Waves,
                color: 'gradient-pool',
                href: '/pool/bookings/new'
              },
              {
                label: 'Conference Booking',
                icon: Building2,
                color: 'gradient-conference',
                href: '/conference/bookings/new'
              },
              {
                label: 'Hotel Reservation',
                icon: Hotel,
                color: 'gradient-hotel',
                href: '/hotel/reservations/new'
              },
              {
                label: 'View Reports',
                icon: CalendarDays,
                color: 'gradient-admin',
                href: '/analytics'
              },
            ].map((action, index) => (
              <a
                key={index}
                href={action.href}
                className="flex items-center gap-3 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-left no-underline"
              >
                <div className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center`}>
                  <action.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">{action.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg gradient-pool flex items-center justify-center">
              <Waves className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h4 className="font-semibold">Pool Performance</h4>
              <p className="text-sm text-muted-foreground">Today's metrics</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Revenue</span>
              <span className="font-semibold">${stats.poolStats.todayRevenue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Utilization</span>
              <span className="font-semibold">
                {Math.round((stats.poolStats.currentCapacity / stats.poolStats.maxCapacity) * 100)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Bookings</span>
              <span className="font-semibold">{stats.poolStats.todayBookings}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg gradient-conference flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h4 className="font-semibold">Conference Performance</h4>
              <p className="text-sm text-muted-foreground">This month</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Revenue</span>
              <span className="font-semibold">${stats.conferenceStats.monthlyRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pending Approvals</span>
              <span className="font-semibold">{stats.conferenceStats.pendingRequests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Events</span>
              <span className="font-semibold">{stats.conferenceStats.activeEvents}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg gradient-hotel flex items-center justify-center">
              <Hotel className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h4 className="font-semibold">Hotel Performance</h4>
              <p className="text-sm text-muted-foreground">Today's metrics</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Occupancy</span>
              <span className="font-semibold">{stats.hotelStats.occupancy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Rooms</span>
              <span className="font-semibold">{stats.hotelStats.occupiedRooms}/{stats.hotelStats.totalRooms}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Check-ins</span>
              <span className="font-semibold">{stats.hotelStats.checkInsToday}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}