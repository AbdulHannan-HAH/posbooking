// pages/conference/ConferenceReports.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
    Building2,
    DollarSign,
    Users,
    TrendingUp,
    CalendarIcon,
    Download,
    FileText,
    BarChart3,
    Loader2,
    PieChart as PieChartIcon,
    Percent
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
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
import { useConferenceService } from '@/services/conferenceService';
import { toast } from 'sonner';

export default function ConferenceReports() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const conferenceService = useConferenceService();
    const [dateRange, setDateRange] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
    const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
    const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
    const [hallFilter, setHallFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [hallData, setHallData] = useState<any[]>([]);
    const [eventTypeData, setEventTypeData] = useState<any[]>([]);
    const [halls, setHalls] = useState<any[]>([]);

    // Agar staff hai to bookings par redirect kar do
    useEffect(() => {
        if (user?.role === 'conference_staff') {
            navigate('/conference/bookings');
            return;
        }
        fetchHalls();
        fetchReports();
    }, [user, startDate, endDate, dateRange, hallFilter]);

    const fetchHalls = async () => {
        try {
            const response = await conferenceService.getConferenceHalls();
            if (response.success) {
                setHalls(response.halls || []);
            }
        } catch (error) {
            console.error('Error fetching halls:', error);
        }
    };

    const fetchReports = async () => {
        try {
            setLoading(true);
            const params: any = {
                startDate: format(startDate, 'yyyy-MM-dd'),
                endDate: format(endDate, 'yyyy-MM-dd'),
                groupBy: dateRange
            };

            if (hallFilter !== 'all') {
                params.hallType = hallFilter;
            }

            const response = await conferenceService.getReports(params);

            if (response.success) {
                setRevenueData(response.revenueData || []);
                setHallData(response.hallData || []);
                setEventTypeData(response.eventTypeData || []);
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
        const csvContent = 'Period,Bookings,Attendees,Total Amount,Total Discount,Net Amount,Revenue\n' +
            revenueData.map(d =>
                `${d._id},${d.bookings},${d.attendees},${d.totalAmount},${d.totalDiscount || 0},${d.netAmount || d.totalAmount},${d.revenue}`
            ).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conference-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleExportPDF = () => {
        window.print();
    };

    const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
    const totalBookings = revenueData.reduce((sum, d) => sum + d.bookings, 0);
    const totalAttendees = revenueData.reduce((sum, d) => sum + d.attendees, 0);
    const totalAmount = revenueData.reduce((sum, d) => sum + (d.totalAmount || 0), 0);
    const totalDiscount = revenueData.reduce((sum, d) => sum + (d.totalDiscount || 0), 0);
    const totalNetAmount = revenueData.reduce((sum, d) => sum + (d.netAmount || d.totalAmount || 0), 0);
    const avgRevenuePerBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    const avgDiscountPerBooking = totalBookings > 0 ? totalDiscount / totalBookings : 0;
    const discountPercentage = totalAmount > 0 ? (totalDiscount / totalAmount) * 100 : 0;

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl gradient-conference flex items-center justify-center">
                            <BarChart3 className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <h1 className="text-3xl font-bold">Conference Reports</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">View conference hall statistics and revenue reports</p>
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

                        <Select value={hallFilter} onValueChange={setHallFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="All Halls" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Halls</SelectItem>
                                {halls.map((hall) => (
                                    <SelectItem key={hall._id} value={hall.value}>
                                        {hall.name}
                                    </SelectItem>
                                ))}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Revenue"
                            value={`$${totalRevenue.toLocaleString()}`}
                            change={`From ${revenueData.length} periods`}
                            changeType="positive"
                            icon={DollarSign}
                            iconClassName="gradient-conference"
                        />
                        <StatCard
                            title="Total Bookings"
                            value={totalBookings}
                            change={`${revenueData.length > 1 ? 'From period' : 'Current period'}`}
                            changeType="positive"
                            icon={Building2}
                            iconClassName="gradient-pool"
                        />
                        <StatCard
                            title="Total Attendees"
                            value={totalAttendees}
                            change={`${revenueData.length > 1 ? 'From period' : 'Current period'}`}
                            changeType="positive"
                            icon={Users}
                            iconClassName="gradient-hotel"
                        />
                        <StatCard
                            title="Avg. Revenue/Booking"
                            value={`$${avgRevenuePerBooking.toFixed(2)}`}
                            change="Current period average"
                            changeType="neutral"
                            icon={TrendingUp}
                            iconClassName="bg-success/20"
                        />
                    </div>

                    {/* Discount Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Discount Given</p>
                                        <p className="text-2xl font-bold">${totalDiscount.toLocaleString()}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                                        <Percent className="h-6 w-6 text-success" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm text-muted-foreground">
                                        {discountPercentage.toFixed(1)}% of total amount
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Average Discount/Booking</p>
                                        <p className="text-2xl font-bold">${avgDiscountPerBooking.toFixed(2)}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-conference-light flex items-center justify-center">
                                        <TrendingUp className="h-6 w-6 text-conference" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm text-muted-foreground">
                                        Per booking average
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Net Amount</p>
                                        <p className="text-2xl font-bold">${totalNetAmount.toLocaleString()}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <DollarSign className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm text-muted-foreground">
                                        After discounts
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
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
                                                <XAxis dataKey="_id" className="text-xs" />
                                                <YAxis className="text-xs" />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--card))',
                                                        border: '1px solid hsl(var(--border))',
                                                        borderRadius: '8px'
                                                    }}
                                                    formatter={(value, name) => {
                                                        if (name === 'revenue') return [`$${value}`, 'Revenue'];
                                                        if (name === 'totalDiscount') return [`$${value}`, 'Discount'];
                                                        if (name === 'netAmount') return [`$${value}`, 'Net Amount'];
                                                        return [`$${value}`, name];
                                                    }}
                                                />
                                                <Bar dataKey="revenue" fill="hsl(var(--conference))" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="totalDiscount" fill="#FF8042" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="netAmount" fill="#00C49F" radius={[4, 4, 0, 0]} />
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
                                                <XAxis dataKey="_id" className="text-xs" />
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
                                                    stroke="hsl(var(--conference))"
                                                    strokeWidth={2}
                                                    dot={{ fill: 'hsl(var(--conference))' }}
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

                        {/* Hall Utilization */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Hall Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    {hallData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={hallData} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis type="number" className="text-xs" />
                                                <YAxis dataKey="_id" type="category" className="text-xs" width={100} />
                                                <Tooltip
                                                    formatter={(value, name, props) => {
                                                        if (name === 'bookings') return [value, 'Bookings'];
                                                        if (name === 'revenue') return [`$${value}`, 'Revenue'];
                                                        if (name === 'totalDiscount') return [`$${value}`, 'Discount'];
                                                        if (name === 'netAmount') return [`$${value}`, 'Net Amount'];
                                                        return value;
                                                    }}
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--card))',
                                                        border: '1px solid hsl(var(--border))',
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                                <Bar dataKey="bookings" fill="hsl(var(--conference))" radius={[0, 4, 4, 0]} />
                                                <Bar dataKey="totalDiscount" fill="#FF8042" radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-muted-foreground">
                                            No hall data available
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Event Type Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Event Type Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    {eventTypeData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={eventTypeData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="count"
                                                    label={({ _id, count }) => `${_id}: ${count}`}
                                                >
                                                    {eventTypeData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value, name, props) => [
                                                        value,
                                                        `${props.payload._id}: $${props.payload.netAmount}`
                                                    ]}
                                                />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-muted-foreground">
                                            No event type data available
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Summary */}
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
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Attendees</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total Amount</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Discount</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Net Amount</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Revenue</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Avg/Booking</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {revenueData.map((row, index) => {
                                                const netAmount = row.netAmount || row.totalAmount;
                                                const discount = row.totalDiscount || 0;
                                                return (
                                                    <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                                                        <td className="py-3 px-4 font-medium">{row._id}</td>
                                                        <td className="py-3 px-4">{row.bookings}</td>
                                                        <td className="py-3 px-4">{row.attendees}</td>
                                                        <td className="py-3 px-4">${(row.totalAmount || 0).toLocaleString()}</td>
                                                        <td className="py-3 px-4 text-success">${discount.toLocaleString()}</td>
                                                        <td className="py-3 px-4 font-medium">${netAmount.toLocaleString()}</td>
                                                        <td className="py-3 px-4 text-conference">${row.revenue.toLocaleString()}</td>
                                                        <td className="py-3 px-4">${(row.revenue / row.bookings).toFixed(2)}</td>
                                                    </tr>
                                                );
                                            })}
                                            <tr className="border-t font-bold">
                                                <td className="py-3 px-4">Total</td>
                                                <td className="py-3 px-4">{totalBookings}</td>
                                                <td className="py-3 px-4">{totalAttendees}</td>
                                                <td className="py-3 px-4">${totalAmount.toLocaleString()}</td>
                                                <td className="py-3 px-4 text-success">${totalDiscount.toLocaleString()}</td>
                                                <td className="py-3 px-4">${totalNetAmount.toLocaleString()}</td>
                                                <td className="py-3 px-4 text-conference">${totalRevenue.toLocaleString()}</td>
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