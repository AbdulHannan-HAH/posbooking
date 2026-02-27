import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { StatCard } from '@/components/ui/StatCard';
import { ModuleCard } from '@/components/ui/ModuleCard';
import { usePoolService } from '@/services/poolService';
import { useConferenceService } from '@/services/conferenceService';
import { useHotelService } from '@/services/hotelService';
import { useRestaurantService } from '@/services/restaurantService';
import {
  Waves, Building2, Hotel, CalendarDays, DollarSign, Clock, Users, Loader2,
  Utensils, Coffee, Beer, Wine, TrendingUp, ShoppingBag
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const poolService = usePoolService();
  const conferenceService = useConferenceService();
  const hotelService = useHotelService();
  const restaurantService = useRestaurantService();

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
    },
    restaurantStats: {
      todayOrders: 0,
      todayRevenue: 0,
      activeOrders: 0,
      pendingPayments: 0,
      popularItems: [],
      categoryBreakdown: [],
      topSellingItems: []
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
      const [
        poolData,
        conferenceData,
        hotelData,
        poolBookings,
        conferenceBookings,
        hotelReservations,
        restaurantData,
        restaurantSales
      ] = await Promise.all([
        poolService.getDashboardStats(),
        conferenceService.getDashboardStats(),
        hotelService.getDashboardStats(),
        poolService.getBookings({ limit: 3, sortBy: 'createdAt', sortOrder: 'desc' }),
        conferenceService.getBookings({ limit: 3, sortBy: 'createdAt', sortOrder: 'desc' }),
        hotelService.getReservations({ limit: 3, sortBy: 'createdAt', sortOrder: 'desc' }),
        restaurantService.getDashboardStats(),
        restaurantService.getSales({ limit: 3, sortBy: 'createdAt', sortOrder: 'desc' })
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

      // Process restaurant stats
      const restaurantStats = {
        todayOrders: restaurantData.success ? restaurantData.stats?.todaySales || 0 : 0,
        todayRevenue: restaurantData.success ? restaurantData.stats?.todayRevenue || 0 : 0,
        activeOrders: restaurantData.success ? restaurantData.stats?.activeOrders || 0 : 0,
        pendingPayments: restaurantData.success ? restaurantData.stats?.pendingPayments || 0 : 0,
        popularItems: restaurantData.success ? restaurantData.stats?.popularItems || [] : [],
        categoryBreakdown: restaurantData.success ? restaurantData.stats?.categoryBreakdown || [] : [],
        topSellingItems: restaurantData.success ? restaurantData.stats?.popularItems?.slice(0, 3) || [] : []
      };

      // Calculate totals
      const totalBookingsToday = poolStats.todayBookings +
        conferenceStats.todayEvents +
        hotelStats.checkInsToday +
        restaurantStats.todayOrders;

      const monthlyRevenue = poolStats.todayRevenue +
        conferenceStats.monthlyRevenue +
        hotelStats.monthlyRevenue +
        restaurantStats.todayRevenue;

      const pendingPayments = (poolData.success ? poolData.stats?.pendingPayments || 0 : 0) +
        conferenceStats.pendingRequests +
        restaurantStats.pendingPayments;

      const activeBookings = poolStats.currentCapacity +
        hotelStats.occupiedRooms +
        restaurantStats.activeOrders;

      // Get recent activities from all modules
      const recentActivitiesList = [];

      // Restaurant activities
      if (restaurantSales.success && restaurantSales.sales) {
        restaurantSales.sales.forEach((sale: any) => {
          recentActivitiesList.push({
            type: 'restaurant',
            title: `Restaurant Order - ${sale.saleNumber}`,
            description: `${sale.customerName} ordered ${sale.items.length} items`,
            time: formatTimeAgo(sale.createdAt),
            amount: sale.totalAmount,
            status: sale.orderStatus,
            paymentStatus: sale.paymentStatus
          });
        });
      }

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
        hotelStats,
        restaurantStats
      });

      setRecentActivities(recentActivitiesList.slice(0, 8));

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

  const getStatusColor = (type: string, status: string) => {
    if (type === 'restaurant') {
      switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'preparing': return 'bg-blue-100 text-blue-800';
        case 'ready': return 'bg-green-100 text-green-800';
        case 'served': return 'bg-purple-100 text-purple-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
    return '';
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
          Welcome back, {user?.name}. Here's what's happening across all modules.
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
          change="Across all modules"
          changeType="positive"
          icon={CalendarDays}
          iconClassName="gradient-pool"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          change="+12% from last month"
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
          title="Active Now"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <ModuleCard
            title="Restaurant & Bar"
            description="Manage orders, menu items, and sales"
            icon={Utensils}
            href="/restaurant"
            variant="restaurant"
            stats={[
              { label: "Today's Orders", value: stats.restaurantStats.todayOrders },
              { label: 'Active Orders', value: stats.restaurantStats.activeOrders },
              { label: "Today's Revenue", value: `$${stats.restaurantStats.todayRevenue.toFixed(2)}` },
            ]}
          />
        </div>
      </div>

      {/* Restaurant Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Utensils className="h-5 w-5 text-orange-500" />
            Restaurant & Bar Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600 mb-1">Today's Orders</p>
              <p className="text-2xl font-bold text-orange-700">{stats.restaurantStats.todayOrders}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 mb-1">Today's Revenue</p>
              <p className="text-2xl font-bold text-green-700">${stats.restaurantStats.todayRevenue.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 mb-1">Active Orders</p>
              <p className="text-2xl font-bold text-blue-700">{stats.restaurantStats.activeOrders}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-600 mb-1">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.restaurantStats.pendingPayments}</p>
            </div>
          </div>

          {/* Top Selling Items */}
          {stats.restaurantStats.topSellingItems.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Top Selling Items Today</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.restaurantStats.topSellingItems.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      {item.category === 'beer' ? <Beer className="h-5 w-5 text-orange-600" /> :
                        item.category === 'wine' ? <Wine className="h-5 w-5 text-orange-600" /> :
                          <Coffee className="h-5 w-5 text-orange-600" />}
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity} • ${item.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start justify-between py-3 border-b last:border-0">
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${activity.type === 'pool' ? 'gradient-pool' :
                          activity.type === 'conference' ? 'gradient-conference' :
                            activity.type === 'hotel' ? 'gradient-hotel' :
                              'bg-orange-500'
                        }`}>
                        {activity.type === 'pool' && <Waves className="h-5 w-5 text-white" />}
                        {activity.type === 'conference' && <Building2 className="h-5 w-5 text-white" />}
                        {activity.type === 'hotel' && <Hotel className="h-5 w-5 text-white" />}
                        {activity.type === 'restaurant' && <Utensils className="h-5 w-5 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                          {activity.type === 'restaurant' && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor('restaurant', activity.status)}`}>
                              {activity.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">${activity.amount?.toFixed(2) || '0.00'}</span>
                      {activity.paymentStatus && (
                        <span className={`block text-xs mt-1 ${activity.paymentStatus === 'paid' ? 'text-green-600' :
                            activity.paymentStatus === 'pending' ? 'text-yellow-600' :
                              'text-red-600'
                          }`}>
                          {activity.paymentStatus}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recent activities found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
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
                  label: 'Restaurant Order',
                  icon: Utensils,
                  color: 'bg-orange-500',
                  href: '/restaurant/sales/new'
                },
                {
                  label: 'Add Menu Item',
                  icon: Coffee,
                  color: 'bg-orange-500',
                  href: '/restaurant/menu-items'
                },
                {
                  label: 'View Reports',
                  icon: TrendingUp,
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
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pool Performance */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg gradient-pool flex items-center justify-center">
              <Waves className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Pool</h4>
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

        {/* Conference Performance */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg gradient-conference flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Conference</h4>
              <p className="text-sm text-muted-foreground">Monthly</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Revenue</span>
              <span className="font-semibold">${stats.conferenceStats.monthlyRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pending</span>
              <span className="font-semibold">{stats.conferenceStats.pendingRequests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Events</span>
              <span className="font-semibold">{stats.conferenceStats.activeEvents}</span>
            </div>
          </div>
        </div>

        {/* Hotel Performance */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg gradient-hotel flex items-center justify-center">
              <Hotel className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Hotel</h4>
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

        {/* Restaurant Performance */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-orange-500 flex items-center justify-center">
              <Utensils className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Restaurant</h4>
              <p className="text-sm text-muted-foreground">Today's metrics</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Revenue</span>
              <span className="font-semibold">${stats.restaurantStats.todayRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Orders</span>
              <span className="font-semibold">{stats.restaurantStats.todayOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active</span>
              <span className="font-semibold">{stats.restaurantStats.activeOrders}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}