// pages/hotel/HotelReports.tsx - UPDATED WITH REAL-TIME DATA
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
    Hotel,
    DollarSign,
    Users,
    TrendingUp,
    CalendarIcon,
    Download,
    FileText,
    BarChart3,
    Loader2,
    BedDouble,
    RefreshCw,
    CreditCard,
    Eye,
    TrendingDown,
    Clock,
    Home
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
    PieChart,
    Pie,
    Cell,
    Legend,
    AreaChart,
    Area,
} from 'recharts';
import { useHotelService } from '@/services/hotelService';
import { toast } from 'sonner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Helper function to generate date labels
const getDateLabel = (dateStr: string, range: 'daily' | 'weekly' | 'monthly') => {
    try {
        const date = new Date(dateStr);
        switch (range) {
            case 'daily':
                return format(date, 'dd MMM');
            case 'weekly':
                return `Week ${format(date, 'w')}`;
            case 'monthly':
                return format(date, 'MMM yyyy');
            default:
                return dateStr;
        }
    } catch {
        return dateStr;
    }
};

export default function HotelReports() {
    const hotelService = useHotelService();
    const [dateRange, setDateRange] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
    const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [loading, setLoading] = useState(false);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [roomTypeData, setRoomTypeData] = useState<any[]>([]);
    const [paymentData, setPaymentData] = useState<any[]>([]);
    const [occupancyData, setOccupancyData] = useState<any[]>([]);
    const [dashboardStats, setDashboardStats] = useState({
        totalRevenue: 0,
        totalReservations: 0,
        totalNights: 0,
        avgRevenuePerReservation: 0,
        occupancyRate: 0
    });
    const [performanceMetrics, setPerformanceMetrics] = useState({
        totalRooms: 0,
        occupiedRooms: 0,
        availableRooms: 0,
        todayCheckIns: 0,
        todayCheckOuts: 0,
        todayRevenue: 0,
        monthlyRevenue: 0,
        monthlyReservations: 0,
        monthlyNights: 0
    });

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

            console.log('Fetching REAL-TIME reports with params:', params);

            // Fetch detailed reports
            const reportsResponse = await hotelService.getReports(params);

            if (reportsResponse.success) {
                console.log('Real-time Reports API Response:', reportsResponse);

                // Process revenue data
                const processedRevenueData = reportsResponse.revenueData?.map((item: any) => {
                    return {
                        name: getDateLabel(item._id, dateRange),
                        date: item._id,
                        revenue: item.revenue || 0,
                        reservations: item.reservations || 0,
                        nights: item.nights || 0,
                        avgRevenue: item.avgRevenue || (item.revenue / (item.reservations || 1)),
                        // Add status breakdown for tooltip
                        confirmed: item.confirmed || 0,
                        checkedIn: item.checkedIn || 0,
                        checkedOut: item.checkedOut || 0
                    };
                }) || [];

                // Process room type data
                const processedRoomTypeData = reportsResponse.roomTypeData?.map((item: any, index: number) => ({
                    name: item._id || 'Unknown',
                    value: item.revenue || 0,
                    reservations: item.reservations || 0,
                    nights: item.nights || 0,
                    fill: COLORS[index % COLORS.length]
                })) || [];

                // Process payment data with real breakdown
                const processedPaymentData = reportsResponse.paymentData?.map((item: any, index: number) => ({
                    name: item._id?.toUpperCase() || 'UNKNOWN',
                    value: item.count || 0,
                    amount: item.totalAmount || 0,
                    fill: COLORS[index % COLORS.length],
                    confirmed: item.confirmed || 0,
                    checkedIn: item.checkedIn || 0,
                    checkedOut: item.checkedOut || 0,
                    percentage: item.percentage || 0
                })) || [];

                // Process occupancy data
                const processedOccupancyData = reportsResponse.occupancyData?.map((item: any) => ({
                    name: format(new Date(item._id), 'dd MMM'),
                    reservations: item.reservations || 0,
                    revenue: item.revenue || 0,
                    occupancy: item.roomsBookedCount || 0
                })) || [];

                // Use summary data from backend for more accuracy
                const summary = reportsResponse.summary?.totals || {};
                const performance = reportsResponse.summary?.currentPerformance || {};

                setRevenueData(processedRevenueData);
                setRoomTypeData(processedRoomTypeData);
                setPaymentData(processedPaymentData);
                setOccupancyData(processedOccupancyData);

                // Set dashboard stats from real data
                setDashboardStats({
                    totalRevenue: summary.revenue || 0,
                    totalReservations: summary.reservations || 0,
                    totalNights: summary.nights || 0,
                    avgRevenuePerReservation: summary.avgRevenuePerReservation || 0,
                    occupancyRate: summary.occupancyRate || 0
                });

                // Store performance metrics for real-time display
                setPerformanceMetrics({
                    totalRooms: performance.totalRooms || 0,
                    occupiedRooms: performance.occupiedRooms || 0,
                    availableRooms: performance.availableRooms || 0,
                    todayCheckIns: performance.todayCheckIns || 0,
                    todayCheckOuts: performance.todayCheckOuts || 0,
                    todayRevenue: performance.todayRevenue || 0,
                    monthlyRevenue: performance.monthlyRevenue || 0,
                    monthlyReservations: performance.monthlyReservations || 0,
                    monthlyNights: performance.monthlyNights || 0
                });

                toast.success(`Real-time reports loaded (${processedRevenueData.length} periods)`);
            } else {
                toast.error(reportsResponse.message || 'Failed to load real-time reports');
            }
        } catch (error: any) {
            console.error('Error fetching real-time reports:', error);
            toast.error('Failed to load reports from server');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        const csvContent = 'Period,Reservations,Nights,Revenue,Avg/Reservation,Confirmed,Checked In,Checked Out\n' +
            revenueData.map(d => `${d.name},${d.reservations},${d.nights},${d.revenue},${d.avgRevenue?.toFixed(2) || '0.00'},${d.confirmed},${d.checkedIn},${d.checkedOut}`).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hotel-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast.success('Report exported successfully');
    };

    const handlePrint = () => {
        window.print();
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border rounded-lg shadow-lg">
                    <p className="font-bold text-sm mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {entry.name.includes('Revenue') || entry.name.includes('Amount') ? '$' : ''}
                            {entry.value.toLocaleString()}
                            {entry.name.includes('Revenue') || entry.name.includes('Amount') ? '' : ''}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const RevenueTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0]?.payload;
            return (
                <div className="bg-white p-4 border rounded-lg shadow-lg">
                    <p className="font-bold text-sm mb-2">{label}</p>
                    <p className="text-sm" style={{ color: '#8884d8' }}>
                        Revenue: ${data?.revenue?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-gray-600">
                        Reservations: {data?.reservations || 0}
                    </p>
                    <p className="text-sm text-gray-600">
                        Nights: {data?.nights || 0}
                    </p>
                    <p className="text-sm text-gray-600">
                        Avg/Res: ${(data?.avgRevenue || 0).toFixed(2)}
                    </p>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Status Breakdown:</p>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="text-center">
                                <p className="text-xs font-medium">Confirmed</p>
                                <p className="text-xs text-green-600">{data?.confirmed || 0}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-medium">Checked In</p>
                                <p className="text-xs text-blue-600">{data?.checkedIn || 0}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-medium">Checked Out</p>
                                <p className="text-xs text-amber-600">{data?.checkedOut || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl gradient-hotel flex items-center justify-center">
                            <BarChart3 className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <h1 className="text-3xl font-bold">Hotel Analytics Dashboard</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">Real-time hotel performance insights and revenue reports</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchReports} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="outline" onClick={handleExportCSV} disabled={loading || revenueData.length === 0}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button variant="outline" onClick={handlePrint} disabled={loading}>
                        <FileText className="h-4 w-4 mr-2" />
                        Print
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

            {/* Real-time Performance Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Real-time Performance</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Current hotel performance metrics
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                            <p className="text-2xl font-bold text-hotel">{dashboardStats.occupancyRate.toFixed(1)}%</p>
                            <p className="text-sm text-muted-foreground mt-1">Occupancy Rate</p>
                            <div className="flex items-center justify-center gap-1 mt-1">
                                <Home className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                    {performanceMetrics.occupiedRooms}/{performanceMetrics.totalRooms} rooms
                                </span>
                            </div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                            <p className="text-2xl font-bold text-green-600">
                                ${(dashboardStats.totalRevenue / (dashboardStats.totalNights || 1)).toFixed(0)}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">Avg Revenue/Night</p>
                            <div className="flex items-center justify-center gap-1 mt-1">
                                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                    {dashboardStats.totalNights} nights
                                </span>
                            </div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                            <p className="text-2xl font-bold text-blue-600">{dashboardStats.totalReservations}</p>
                            <p className="text-sm text-muted-foreground mt-1">Total Bookings</p>
                            <div className="flex items-center justify-center gap-1 mt-1">
                                <Users className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                    This period
                                </span>
                            </div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                            <p className="text-2xl font-bold text-amber-600">{performanceMetrics.todayCheckIns}</p>
                            <p className="text-sm text-muted-foreground mt-1">Today's Check-ins</p>
                            <div className="flex items-center justify-center gap-1 mt-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                    {performanceMetrics.todayCheckOuts} check-outs
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Data freshness indicator */}
                    <div className="mt-4 text-center text-xs text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span>Live data • Last updated: {new Date().toLocaleTimeString()}</span>
                        </div>
                        <p className="mt-1">
                            Showing {revenueData.length} periods • {dashboardStats.totalReservations} reservations
                        </p>
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        <p className="mt-4 text-muted-foreground">Loading real-time reports...</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Stats Grid - Using Real Data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Revenue"
                            value={`$${dashboardStats.totalRevenue.toLocaleString()}`}
                            change={`${dateRange} period`}
                            changeType={dashboardStats.totalRevenue > 0 ? "positive" : "neutral"}
                            icon={DollarSign}
                            iconClassName="gradient-hotel"
                        />
                        <StatCard
                            title="Total Reservations"
                            value={dashboardStats.totalReservations}
                            change={`${dateRange} period`}
                            changeType={dashboardStats.totalReservations > 0 ? "positive" : "neutral"}
                            icon={Hotel}
                            iconClassName="gradient-pool"
                        />
                        <StatCard
                            title="Total Nights"
                            value={dashboardStats.totalNights}
                            change={`${dateRange} period`}
                            changeType={dashboardStats.totalNights > 0 ? "positive" : "neutral"}
                            icon={BedDouble}
                            iconClassName="gradient-conference"
                        />
                        <StatCard
                            title="Avg. Revenue/Res"
                            value={`$${dashboardStats.avgRevenuePerReservation.toFixed(0)}`}
                            change="Average per reservation"
                            changeType="neutral"
                            icon={TrendingUp}
                            iconClassName="bg-success/20"
                        />
                    </div>

                    {/* Charts Grid - Showing Real Data */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue Trend Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Revenue Trend</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {format(startDate, 'PP')} to {format(endDate, 'PP')}
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    {revenueData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={revenueData}>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis dataKey="name" className="text-xs" />
                                                <YAxis className="text-xs" />
                                                <Tooltip content={<RevenueTooltip />} />
                                                <Area
                                                    type="monotone"
                                                    dataKey="revenue"
                                                    stroke="#8884d8"
                                                    fill="#8884d8"
                                                    fillOpacity={0.3}
                                                    strokeWidth={2}
                                                    name="Revenue"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                                            <BarChart3 className="h-12 w-12 mb-4" />
                                            <p className="text-center">No revenue data available for selected period</p>
                                            <p className="text-sm mt-2">Try selecting a different date range</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Room Type Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Revenue by Room Type</CardTitle>
                                <p className="text-sm text-muted-foreground">Distribution of revenue across room types</p>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    {roomTypeData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={roomTypeData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {roomTypeData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value, name, props) => [
                                                        `$${Number(value).toLocaleString()}`,
                                                        `${props.payload.name}: ${props.payload.reservations} reservations, ${props.payload.nights} nights`
                                                    ]}
                                                />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                                            <Hotel className="h-12 w-12 mb-4" />
                                            <p>No room type data available</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reservations Trend */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Reservations Trend</CardTitle>
                                <p className="text-sm text-muted-foreground">Number of reservations over time</p>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    {revenueData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={revenueData}>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis dataKey="name" className="text-xs" />
                                                <YAxis className="text-xs" />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar
                                                    dataKey="reservations"
                                                    fill="#82ca9d"
                                                    radius={[4, 4, 0, 0]}
                                                    name="Reservations"
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                                            <Users className="h-12 w-12 mb-4" />
                                            <p>No reservations data available</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Status Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Payment Status</CardTitle>
                                <p className="text-sm text-muted-foreground">Distribution of payment statuses</p>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    {paymentData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={paymentData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {paymentData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value, name, props) => [
                                                        value,
                                                        `${props.payload.name}: $${Number(props.payload.amount).toLocaleString()}`
                                                    ]}
                                                />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                                            <CreditCard className="h-12 w-12 mb-4" />
                                            <p>No payment data available</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Summary Table - Real Data */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Detailed Summary</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Showing data from {format(startDate, 'PP')} to {format(endDate, 'PP')}
                            </p>
                        </CardHeader>
                        <CardContent>
                            {revenueData.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Period</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reservations</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nights</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Revenue</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Avg/Reservation</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {revenueData.map((row, index) => (
                                                <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                                                    <td className="py-3 px-4 font-medium">{row.name}</td>
                                                    <td className="py-3 px-4">{row.reservations}</td>
                                                    <td className="py-3 px-4">{row.nights}</td>
                                                    <td className="py-3 px-4 font-medium">${row.revenue.toLocaleString()}</td>
                                                    <td className="py-3 px-4">${(row.avgRevenue || 0).toFixed(2)}</td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex gap-1">
                                                            <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800" title="Confirmed">
                                                                C:{row.confirmed || 0}
                                                            </span>
                                                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800" title="Checked In">
                                                                I:{row.checkedIn || 0}
                                                            </span>
                                                            <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800" title="Checked Out">
                                                                O:{row.checkedOut || 0}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="border-t font-bold bg-muted/50">
                                                <td className="py-3 px-4">Total</td>
                                                <td className="py-3 px-4">{dashboardStats.totalReservations}</td>
                                                <td className="py-3 px-4">{dashboardStats.totalNights}</td>
                                                <td className="py-3 px-4 text-hotel">${dashboardStats.totalRevenue.toLocaleString()}</td>
                                                <td className="py-3 px-4">${dashboardStats.avgRevenuePerReservation.toFixed(2)}</td>
                                                <td className="py-3 px-4"></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                                    <p>No data available for selected period</p>
                                    <div className="mt-4 space-y-2">
                                        <p className="text-sm">Try:</p>
                                        <ul className="text-sm list-disc list-inside space-y-1">
                                            <li>Selecting a different date range</li>
                                            <li>Making sure you have reservations in the system</li>
                                            <li>Checking if reservations are marked as "checked_out"</li>
                                            <li>Verifying payments are marked as "paid" or "partial"</li>
                                        </ul>
                                    </div>
                                    <Button variant="outline" onClick={fetchReports} className="mt-4">
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Refresh Data
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Data Source Info */}
                    <div className="text-center text-sm text-muted-foreground">
                        <p>📊 Data Source: Real reservations from your hotel database</p>
                        <p className="text-xs mt-1">
                            Showing {revenueData.length} data points • Last updated: {new Date().toLocaleTimeString()} •
                            Total Rooms: {performanceMetrics.totalRooms} •
                            Occupied: {performanceMetrics.occupiedRooms} •
                            Available: {performanceMetrics.availableRooms}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}