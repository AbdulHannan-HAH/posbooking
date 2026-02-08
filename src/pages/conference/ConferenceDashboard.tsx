import { useState, useEffect } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Calendar, DollarSign, Clock, Plus, TrendingUp, Users, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { useConferenceService } from '@/services/conferenceService';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ConferenceDashboard() {
  const conferenceService = useConferenceService();
  const [stats, setStats] = useState({
    todayEvents: 0,
    pendingApprovals: 0,
    monthlyRevenue: 0,
    monthlyTotalAmount: 0,
    upcomingEvents: [],
    hallUtilization: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await conferenceService.getDashboardStats();

      if (response.success && response.stats) {
        setStats({
          todayEvents: response.stats.todayEvents || 0,
          pendingApprovals: response.stats.pendingApprovals || 0,
          monthlyRevenue: response.stats.monthlyRevenue || 0,
          monthlyTotalAmount: response.stats.monthlyTotalAmount || 0,
          upcomingEvents: response.stats.upcomingEvents || [],
          hallUtilization: response.stats.hallUtilization || []
        });
      }
    } catch (error: any) {
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

  const getHallDisplay = (hallValue: string) => {
    const hallMap: Record<string, string> = {
      'hall_a': 'Hall A',
      'hall_b': 'Hall B',
      'grand_hall': 'Grand Hall',
      'meeting_room_1': 'Meeting Room 1',
      'meeting_room_2': 'Meeting Room 2'
    };
    return hallMap[hallValue] || hallValue;
  };

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
          title="Today's Events"
          value={stats.todayEvents}
          change="Currently scheduled"
          changeType="neutral"
          icon={Calendar}
          iconClassName="gradient-conference"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          change="Awaiting review"
          changeType="negative"
          icon={Clock}
          iconClassName="bg-conference-light"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          change={`Total: $${stats.monthlyTotalAmount.toLocaleString()}`}
          changeType="positive"
          icon={DollarSign}
          iconClassName="gradient-pool"
        />
        <StatCard
          title="Upcoming Events"
          value={stats.upcomingEvents.length}
          change="Next 7 days"
          changeType="neutral"
          icon={Users}
          iconClassName="gradient-hotel"
        />
      </div>

      {/* Hall Utilization & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hall Utilization */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Hall Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.hallUtilization.map((hall: any) => (
                <div key={hall._id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{getHallDisplay(hall.name)}</span>
                    <span>{hall.bookingCount} bookings ({hall.utilization.toFixed(1)}%)</span>
                  </div>
                  <Progress value={hall.utilization} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.upcomingEvents.map((event: any, index: number) => (
                <div key={index} className="p-3 rounded-lg bg-secondary/50 border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-sm">{event.eventName}</h4>
                      <p className="text-xs text-muted-foreground">{event.clientName}</p>
                    </div>
                    <StatusBadge status={event.bookingStatus} size="sm" />
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(event.startDate), 'MMM dd')}
                    </p>
                    <p className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {getHallDisplay(event.hallType)}
                    </p>
                  </div>
                </div>
              ))}
              {stats.upcomingEvents.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No upcoming events
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}