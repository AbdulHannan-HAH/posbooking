import { useState, useEffect } from 'react';
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
  BarChart3,
  Loader2,
  Percent
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
import { usePoolService } from '@/services/poolService';
import { toast } from 'sonner';

export default function PoolReports() {
  const poolService = usePoolService();
  const [dateRange, setDateRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [passTypeData, setPassTypeData] = useState<any[]>([]);
  const [timeSlotData, setTimeSlotData] = useState<any[]>([]);

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate, dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        groupBy: dateRange
      };

      const response = await poolService.getReports(params);

      if (response.success) {
        // Process revenue data
        const processedRevenueData = response.revenueData?.map((item: any) => {
          let label = '';
          switch (dateRange) {
            case 'daily':
              label = format(new Date(item._id), 'EEE');
              break;
            case 'weekly':
              label = `Week ${item._id}`;
              break;
            case 'monthly':
              label = format(new Date(item._id), 'MMM');
              break;
          }
          return {
            label,
            revenue: item.revenue,
            bookings: item.bookings,
            visitors: item.visitors,
            discounts: item.totalDiscounts || 0,
            subtotal: item.subtotal || item.revenue
          };
        }) || [];

        // Process pass type data
        const processedPassTypeData = response.passTypeData?.map((item: any) => {
          const typeMap: Record<string, string> = {
            'daily': 'Daily Pass',
            'family': 'Family Pass',
            'hourly': 'Others Pass' // Changed from 'Hourly Pass' to 'Others Pass'
          };
          const colors = [
            'hsl(var(--pool))',
            'hsl(var(--conference))',
            'hsl(var(--hotel))'
          ];
          const index = Object.keys(typeMap).indexOf(item._id);

          return {
            name: typeMap[item._id] || item._id,
            value: item.count,
            revenue: item.revenue,
            discounts: item.discounts || 0,
            subtotal: item.subtotal || item.revenue,
            color: colors[index] || 'hsl(var(--muted-foreground))'
          };
        }) || [];

        // Process time slot data
        const processedTimeSlotData = response.timeSlotData?.map((item: any) => {
          const timeMap: Record<string, string> = {
            '06:00-09:00': '06:00-09:00',
            '09:00-12:00': '09:00-12:00',
            '12:00-15:00': '12:00-15:00',
            '15:00-18:00': '15:00-18:00',
            '18:00-21:00': '18:00-21:00',
          };

          return {
            slot: timeMap[item._id] || item._id,
            visitors: item.visitors,
            revenue: item.revenue,
            bookings: item.bookings,
            discounts: item.discounts || 0
          };
        }).sort((a: any, b: any) => a.slot.localeCompare(b.slot)) || [];

        setRevenueData(processedRevenueData);
        setPassTypeData(processedPassTypeData);
        setTimeSlotData(processedTimeSlotData);
      } else {
        toast.error(response.message || 'Failed to load reports');
      }
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = 'Date,Bookings,Visitors,Subtotal,Discounts,Revenue\n' +
      revenueData.map(d => `${d.label},${d.bookings},${d.visitors},${d.subtotal},${d.discounts},${d.revenue}`).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pool-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalBookings = revenueData.reduce((sum, d) => sum + d.bookings, 0);
  const totalVisitors = revenueData.reduce((sum, d) => sum + d.visitors, 0);
  const totalDiscounts = revenueData.reduce((sum, d) => sum + (d.discounts || 0), 0);
  const avgRevenuePerBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;

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
          <Button variant="outline" onClick={handleExportCSV} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF} disabled={loading}>
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading reports...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Revenue"
              value={`$${totalRevenue.toLocaleString()}`}
              change={`${revenueData.length > 1 ? 'After discounts' : 'Current period'}`}
              changeType="positive"
              icon={DollarSign}
              iconClassName="gradient-pool"
            />
            <StatCard
              title="Total Bookings"
              value={totalBookings}
              change={`${revenueData.length > 1 ? 'From period' : 'Current period'}`}
              changeType="positive"
              icon={Waves}
              iconClassName="gradient-conference"
            />
            <StatCard
              title="Total Visitors"
              value={totalVisitors}
              change={`${revenueData.length > 1 ? 'From period' : 'Current period'}`}
              changeType="positive"
              icon={Users}
              iconClassName="gradient-hotel"
            />
            <StatCard
              title="Total Discounts"
              value={`$${totalDiscounts.toLocaleString()}`}
              change="Discounts given"
              changeType="neutral"
              icon={Percent}
              iconClassName="bg-warning/20"
            />
            <StatCard
              title="Avg. Revenue/Booking"
              value={`$${avgRevenuePerBooking.toFixed(2)}`}
              change="After discounts"
              changeType="neutral"
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
                  {revenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="label" className="text-xs" />
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
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No data available for selected period
                    </div>
                  )}
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
                  {revenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="label" className="text-xs" />
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
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No data available for selected period
                    </div>
                  )}
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
                  {passTypeData.length > 0 ? (
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
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {passTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => [
                            value,
                            `${props.payload.name}: $${props.payload.revenue} (Discounts: $${props.payload.discounts})`
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No pass type data available
                    </div>
                  )}
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
                  {timeSlotData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timeSlotData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" className="text-xs" />
                        <YAxis dataKey="slot" type="category" className="text-xs" width={80} />
                        <Tooltip
                          formatter={(value, name, props) => {
                            if (name === 'visitors') {
                              return [value, 'Visitors'];
                            }
                            return value;
                          }}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="visitors" fill="hsl(var(--pool))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No time slot data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detailed Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Period</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Bookings</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Visitors</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Subtotal</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Discounts</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Revenue</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Avg/Booking</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueData.map((row, index) => (
                        <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{row.label}</td>
                          <td className="py-3 px-4">{row.bookings}</td>
                          <td className="py-3 px-4">{row.visitors}</td>
                          <td className="py-3 px-4">${(row.subtotal || row.revenue).toLocaleString()}</td>
                          <td className="py-3 px-4">${(row.discounts || 0).toLocaleString()}</td>
                          <td className="py-3 px-4 font-medium">${row.revenue.toLocaleString()}</td>
                          <td className="py-3 px-4">${(row.revenue / row.bookings).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="border-t font-bold">
                        <td className="py-3 px-4">Total</td>
                        <td className="py-3 px-4">{totalBookings}</td>
                        <td className="py-3 px-4">{totalVisitors}</td>
                        <td className="py-3 px-4">${(totalRevenue + totalDiscounts).toLocaleString()}</td>
                        <td className="py-3 px-4 text-pool">-${totalDiscounts.toLocaleString()}</td>
                        <td className="py-3 px-4 text-pool">${totalRevenue.toLocaleString()}</td>
                        <td className="py-3 px-4">${avgRevenuePerBooking.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No data available for selected period
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}