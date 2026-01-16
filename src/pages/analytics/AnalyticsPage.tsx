import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { BarChart3, Download, TrendingUp, TrendingDown, Waves, Building2, Hotel } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// Mock data for charts
const monthlyRevenue = [
  { month: 'Jan', pool: 12000, conference: 45000, hotel: 78000 },
  { month: 'Feb', pool: 15000, conference: 52000, hotel: 82000 },
  { month: 'Mar', pool: 18000, conference: 48000, hotel: 91000 },
  { month: 'Apr', pool: 22000, conference: 55000, hotel: 88000 },
  { month: 'May', pool: 28000, conference: 62000, hotel: 95000 },
  { month: 'Jun', pool: 35000, conference: 58000, hotel: 102000 },
];

const dailyBookings = [
  { day: 'Mon', bookings: 45 },
  { day: 'Tue', bookings: 52 },
  { day: 'Wed', bookings: 48 },
  { day: 'Thu', bookings: 61 },
  { day: 'Fri', bookings: 75 },
  { day: 'Sat', bookings: 92 },
  { day: 'Sun', bookings: 68 },
];

const revenueByModule = [
  { name: 'Pool', value: 35000, color: 'hsl(199, 89%, 48%)' },
  { name: 'Conference', value: 58000, color: 'hsl(160, 84%, 39%)' },
  { name: 'Hotel', value: 102000, color: 'hsl(38, 92%, 50%)' },
];

export default function AnalyticsPage() {
  const totalRevenue = revenueByModule.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-admin flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          </div>
          <p className="text-muted-foreground mt-1">View performance metrics and generate reports</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="thisMonth">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Pool Revenue', value: '$35,000', change: '+12%', positive: true, icon: Waves, gradient: 'gradient-pool' },
          { title: 'Conference Revenue', value: '$58,000', change: '+8%', positive: true, icon: Building2, gradient: 'gradient-conference' },
          { title: 'Hotel Revenue', value: '$102,000', change: '-3%', positive: false, icon: Hotel, gradient: 'gradient-hotel' },
        ].map((item, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                  <p className="text-2xl font-bold mt-1">{item.value}</p>
                  <div className={`flex items-center gap-1 mt-1 text-sm ${item.positive ? 'text-success' : 'text-destructive'}`}>
                    {item.positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span>{item.change} from last month</span>
                  </div>
                </div>
                <div className={`h-12 w-12 rounded-xl ${item.gradient} flex items-center justify-center`}>
                  <item.icon className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Module */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Revenue by Module</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                  />
                  <Bar dataKey="pool" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} name="Pool" />
                  <Bar dataKey="conference" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} name="Conference" />
                  <Bar dataKey="hotel" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} name="Hotel" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Bookings Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Bookings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyBookings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="hsl(199, 89%, 48%)" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(199, 89%, 48%)', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: 'hsl(199, 89%, 48%)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByModule}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {revenueByModule.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {revenueByModule.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {((item.value / totalRevenue) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Top Performers This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: 'Pool - Daily Pass', bookings: 245, revenue: 12250 },
                { category: 'Hotel - Suite Rooms', bookings: 89, revenue: 44500 },
                { category: 'Conference - Grand Hall', bookings: 12, revenue: 36000 },
                { category: 'Pool - Hourly Pass', bookings: 180, revenue: 5400 },
                { category: 'Hotel - Double Rooms', bookings: 156, revenue: 31200 },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium">{item.category}</p>
                    <p className="text-sm text-muted-foreground">{item.bookings} bookings</p>
                  </div>
                  <p className="text-lg font-bold">${item.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
