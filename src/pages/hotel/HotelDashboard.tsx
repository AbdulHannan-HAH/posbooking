import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hotel, BedDouble, DollarSign, CalendarCheck, Plus, LogIn, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

// Mock data
const hotelStats = {
  totalRooms: 120,
  occupiedRooms: 102,
  checkInsToday: 15,
  checkOutsToday: 12,
  monthlyRevenue: 89450,
};

const recentReservations = [
  { id: 1, guest: 'James Wilson', room: 'Suite 401', roomType: 'Suite', checkIn: '2024-01-15', checkOut: '2024-01-18', status: 'checked_in' as const },
  { id: 2, guest: 'Maria Garcia', room: 'Room 205', roomType: 'Double', checkIn: '2024-01-15', checkOut: '2024-01-17', status: 'checked_in' as const },
  { id: 3, guest: 'Robert Chen', room: 'Room 108', roomType: 'Single', checkIn: '2024-01-16', checkOut: '2024-01-20', status: 'pending' as const },
  { id: 4, guest: 'Sophie Turner', room: 'Suite 502', roomType: 'Suite', checkIn: '2024-01-16', checkOut: '2024-01-19', status: 'pending' as const },
];

const todayActivity = {
  checkIns: [
    { guest: 'Robert Chen', room: '108', time: '14:00' },
    { guest: 'Sophie Turner', room: '502', time: '15:00' },
    { guest: 'David Kim', room: '310', time: '16:00' },
  ],
  checkOuts: [
    { guest: 'Anna Smith', room: '203', time: '10:00' },
    { guest: 'Michael Brown', room: '405', time: '11:00' },
  ],
};

export default function HotelDashboard() {
  const occupancyRate = (hotelStats.occupiedRooms / hotelStats.totalRooms) * 100;

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
          <Button className="gradient-hotel border-0">
            <Plus className="h-4 w-4 mr-2" />
            New Reservation
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Occupancy"
          value={`${occupancyRate.toFixed(0)}%`}
          change={`${hotelStats.occupiedRooms}/${hotelStats.totalRooms} rooms`}
          changeType="neutral"
          icon={BedDouble}
          iconClassName="gradient-hotel"
        />
        <StatCard
          title="Check-ins Today"
          value={hotelStats.checkInsToday}
          change="Expected arrivals"
          changeType="positive"
          icon={LogIn}
          iconClassName="bg-hotel-light"
        />
        <StatCard
          title="Check-outs Today"
          value={hotelStats.checkOutsToday}
          change="Expected departures"
          changeType="neutral"
          icon={LogOut}
          iconClassName="gradient-pool"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${hotelStats.monthlyRevenue.toLocaleString()}`}
          change="+8% from last month"
          changeType="positive"
          icon={DollarSign}
          iconClassName="gradient-conference"
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
                <span className="text-5xl font-bold">{hotelStats.occupiedRooms}</span>
                <span className="text-2xl text-muted-foreground">/{hotelStats.totalRooms}</span>
                <p className="text-sm text-muted-foreground mt-1">Occupied Rooms</p>
              </div>
              <Progress value={occupancyRate} className="h-3" />
              
              <div className="pt-4 space-y-3">
                {[
                  { type: 'Single Rooms', total: 40, occupied: 35, color: 'bg-pool' },
                  { type: 'Double Rooms', total: 50, occupied: 42, color: 'bg-conference' },
                  { type: 'Suites', total: 30, occupied: 25, color: 'bg-hotel' },
                ].map((roomType, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${roomType.color}`} />
                      <span className="text-sm">{roomType.type}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {roomType.occupied}/{roomType.total}
                    </span>
                  </div>
                ))}
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
                  <LogIn className="h-4 w-4 text-success" />
                  Expected Check-ins
                </h4>
                <div className="space-y-2">
                  {todayActivity.checkIns.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-success-light">
                      <div>
                        <p className="text-sm font-medium">{item.guest}</p>
                        <p className="text-xs text-muted-foreground">Room {item.room}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Check-outs */}
              <div>
                <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                  <LogOut className="h-4 w-4 text-warning" />
                  Expected Check-outs
                </h4>
                <div className="space-y-2">
                  {todayActivity.checkOuts.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-warning-light">
                      <div>
                        <p className="text-sm font-medium">{item.guest}</p>
                        <p className="text-xs text-muted-foreground">Room {item.room}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{item.time}</span>
                    </div>
                  ))}
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
            <div className="space-y-3">
              {recentReservations.map((reservation) => (
                <div key={reservation.id} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{reservation.guest}</p>
                      <p className="text-sm text-muted-foreground">{reservation.room}</p>
                    </div>
                    <StatusBadge status={reservation.status} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-hotel-light text-hotel-foreground font-medium">
                      {reservation.roomType}
                    </span>
                    <span>{reservation.checkIn} → {reservation.checkOut}</span>
                  </div>
                </div>
              ))}
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
            {[
              { label: 'Check-in Guest', icon: LogIn, color: 'gradient-hotel' },
              { label: 'Check-out Guest', icon: LogOut, color: 'gradient-pool' },
              { label: 'Room Service', icon: BedDouble, color: 'gradient-conference' },
              { label: 'View Calendar', icon: CalendarCheck, color: 'gradient-admin' },
            ].map((action, index) => (
              <button
                key={index}
                className="flex flex-col items-center gap-3 p-6 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <div className={`h-12 w-12 rounded-xl ${action.color} flex items-center justify-center`}>
                  <action.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
