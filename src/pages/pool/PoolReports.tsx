import { useState } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Waves, 
  DollarSign, 
  Users, 
  TrendingUp, 
  CalendarIcon, 
  Download,
  FileText,
  BarChart3
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// Mock data for reports
const dailyRevenueData = [
  { day: 'Mon', revenue: 1200, bookings: 28 },
  { day: 'Tue', revenue: 980, bookings: 22 },
  { day: 'Wed', revenue: 1450, bookings: 35 },
  { day: 'Thu', revenue: 1100, bookings: 26 },
  { day: 'Fri', revenue: 1680, bookings: 42 },
  { day: 'Sat', revenue: 2100, bookings: 55 },
  { day: 'Sun', revenue: 1890, bookings: 48 },
];

const monthlyData = [
  { month: 'Jan', revenue: 28500, bookings: 680 },
  { month: 'Feb', revenue: 31200, bookings: 745 },
  { month: 'Mar', revenue: 35800, bookings: 856 },
  { month: 'Apr', revenue: 42100, bookings: 1002 },
  { month: 'May', revenue: 48500, bookings: 1156 },
  { month: 'Jun', revenue: 55200, bookings: 1320 },
];

const passTypeData = [
  { name: 'Daily Pass', value: 45, color: 'hsl(var(--pool))' },
  { name: 'Hourly Pass', value: 35, color: 'hsl(var(--conference))' },
  { name: 'Family Pass', value: 20, color: 'hsl(var(--hotel))' },
];

const timeSlotData = [
  { slot: '06:00-09:00', visitors: 120, revenue: 1800 },
  { slot: '09:00-12:00', visitors: 280, revenue: 4200 },
  { slot: '12:00-15:00', visitors: 350, revenue: 5250 },
  { slot: '15:00-18:00', visitors: 290, revenue: 4350 },
  { slot: '18:00-21:00', visitors: 180, revenue: 2700 },
];

export default function PoolReports() {
  const [dateRange, setDateRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const handleExportCSV = () => {
    // In production, this would generate and download a CSV file
    const csvContent = 'Date,Bookings,Revenue\n' + 
      dailyRevenueData.map(d => `${d.day},${d.bookings},${d.revenue}`).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pool-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    // In production, this would generate a proper PDF
    window.print();
  };

  const totalRevenue = dailyRevenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalBookings = dailyRevenueData.reduce((sum, d) => sum + d.bookings, 0);
  const avgRevenuePerBooking = totalRevenue / totalBookings;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-pool flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">Pool Reports</h1>
          </div>
          <p className="text-muted-foreground mt-1">View pool usage statistics and revenue reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={dateRange} onValueChange={(v: 'daily' | 'weekly' | 'monthly') => setDateRange(v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(startDate, 'PP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                />
              </PopoverContent>
            </Popover>

            <span className="text-muted-foreground">to</span>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(endDate, 'PP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          change="+18% from last period"
          changeType="positive"
          icon={DollarSign}
          iconClassName="gradient-pool"
        />
        <StatCard
          title="Total Bookings"
          value={totalBookings}
          change="+12% from last period"
          changeType="positive"
          icon={Waves}
          iconClassName="gradient-conference"
        />
        <StatCard
          title="Total Visitors"
          value="1,220"
          change="+8% from last period"
          changeType="positive"
          icon={Users}
          iconClassName="gradient-hotel"
        />
        <StatCard
          title="Avg. Revenue/Booking"
          value={`$${avgRevenuePerBooking.toFixed(2)}`}
          change="+5% from average"
          changeType="positive"
          icon={TrendingUp}
          iconClassName="bg-success/20"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--pool))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Booking Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="hsl(var(--pool))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--pool))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pass Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pass Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={passTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {passTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Time Slot Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Time Slot Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeSlotData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="slot" type="category" className="text-xs" width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="visitors" fill="hsl(var(--pool))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Month</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Bookings</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Revenue</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Avg/Booking</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Growth</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month, index) => {
                  const prevRevenue = index > 0 ? monthlyData[index - 1].revenue : month.revenue;
                  const growth = ((month.revenue - prevRevenue) / prevRevenue * 100).toFixed(1);
                  return (
                    <tr key={month.month} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{month.month}</td>
                      <td className="py-3 px-4">{month.bookings.toLocaleString()}</td>
                      <td className="py-3 px-4 font-medium">${month.revenue.toLocaleString()}</td>
                      <td className="py-3 px-4">${(month.revenue / month.bookings).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                          parseFloat(growth) >= 0 
                            ? 'bg-success/20 text-success' 
                            : 'bg-destructive/20 text-destructive'
                        )}>
                          {parseFloat(growth) >= 0 ? '+' : ''}{growth}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
