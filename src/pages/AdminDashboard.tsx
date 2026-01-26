import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { StatCard } from '@/components/ui/StatCard';
import { ModuleCard } from '@/components/ui/ModuleCard';
import { Waves, Building2, Hotel, CalendarDays, DollarSign, Clock, Users } from 'lucide-react';

// Mock data for analytics
const analyticsData = {
  totalBookingsToday: 47,
  monthlyRevenue: 125420,
  pendingPayments: 12,
  activeBookings: 23,
};

const moduleStats = {
  pool: {
    todayBookings: 28,
    capacity: '42/50',
  },
  conference: {
    activeEvents: 3,
    pendingRequests: 5,
  },
  hotel: {
    occupancy: '85%',
    checkInsToday: 12,
  },
};

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();

  console.log('🏠 AdminDashboard - Loading:', isLoading);
  console.log('🏠 AdminDashboard - User:', user);
  console.log('🏠 AdminDashboard - User Role:', user?.role);

  // Show loading state
  if (isLoading) {
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
    console.log('🔒 No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // REMOVED all redirect logic - ProtectedRoute handles role checking

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
          value={analyticsData.totalBookingsToday}
          change="+12% from yesterday"
          changeType="positive"
          icon={CalendarDays}
          iconClassName="gradient-pool"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${analyticsData.monthlyRevenue.toLocaleString()}`}
          change="+8% from last month"
          changeType="positive"
          icon={DollarSign}
          iconClassName="gradient-conference"
        />
        <StatCard
          title="Pending Payments"
          value={analyticsData.pendingPayments}
          change="Requires attention"
          changeType="negative"
          icon={Clock}
          iconClassName="gradient-hotel"
        />
        <StatCard
          title="Active Bookings"
          value={analyticsData.activeBookings}
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
              { label: "Today's Bookings", value: moduleStats.pool.todayBookings },
              { label: 'Capacity', value: moduleStats.pool.capacity },
            ]}
          />
          <ModuleCard
            title="Conference Hall"
            description="Handle event bookings, approvals, and invoicing"
            icon={Building2}
            href="/conference"
            variant="conference"
            stats={[
              { label: 'Active Events', value: moduleStats.conference.activeEvents },
              { label: 'Pending Requests', value: moduleStats.conference.pendingRequests },
            ]}
          />
          <ModuleCard
            title="Hotel"
            description="Room management, reservations, and check-ins"
            icon={Hotel}
            href="/hotel"
            variant="hotel"
            stats={[
              { label: 'Occupancy', value: moduleStats.hotel.occupancy },
              { label: 'Check-ins Today', value: moduleStats.hotel.checkInsToday },
            ]}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border p-6">
          <h3 className="font-semibold mb-4">Recent Bookings</h3>
          <div className="space-y-4">
            {[
              { name: 'John Smith', type: 'Pool - Daily Pass', time: '10 mins ago', status: 'paid' },
              { name: 'Sarah Johnson', type: 'Conference Hall A', time: '25 mins ago', status: 'pending' },
              { name: 'Mike Wilson', type: 'Hotel - Suite 302', time: '1 hour ago', status: 'paid' },
              { name: 'Emma Davis', type: 'Pool - Hourly', time: '2 hours ago', status: 'paid' },
            ].map((booking, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{booking.name}</p>
                  <p className="text-sm text-muted-foreground">{booking.type}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${booking.status === 'paid'
                      ? 'bg-success-light text-success'
                      : 'bg-pending-light text-pending'
                      }`}
                  >
                    {booking.status}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">{booking.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'New Pool Booking', icon: Waves, color: 'gradient-pool' },
              { label: 'Conference Request', icon: Building2, color: 'gradient-conference' },
              { label: 'Hotel Check-in', icon: Hotel, color: 'gradient-hotel' },
              { label: 'View Reports', icon: CalendarDays, color: 'gradient-admin' },
            ].map((action, index) => (
              <button
                key={index}
                className="flex items-center gap-3 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-left"
              >
                <div className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center`}>
                  <action.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}