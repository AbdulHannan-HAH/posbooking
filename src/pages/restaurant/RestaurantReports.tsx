import { useState, useEffect } from 'react';
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
    Utensils,
    DollarSign,
    TrendingUp,
    CalendarIcon,
    Download,
    FileText,
    BarChart3,
    Loader2,
    Coffee,
    Beer,
    Wine,
    Clock,
    ShoppingBag
} from 'lucide-react';
import { format, subDays } from 'date-fns';
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
import { useRestaurantService } from '@/services/restaurantService';
import { toast } from 'sonner';
import { StatCard } from '@/components/ui/StatCard';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function RestaurantReports() {
    const restaurantService = useRestaurantService();
    const [dateRange, setDateRange] = useState<'day' | 'week' | 'month'>('week');
    const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any>({
        revenueData: [],
        topItems: [],
        categoryPerformance: [],
        hourlyBreakdown: [],
        paymentMethodData: [],
        orderTypeData: []
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

            const response = await restaurantService.getReports(params);

            if (response.success) {
                // Process revenue data
                const processedRevenueData = response.revenueData?.map((item: any) => {
                    let label = '';
                    if (dateRange === 'day') {
                        label = format(new Date(item._id), 'EEE');
                    } else if (dateRange === 'week') {
                        label = `Week ${item._id}`;
                    } else {
                        label = format(new Date(item._id), 'MMM');
                    }
                    return {
                        label,
                        revenue: item.revenue || 0,
                        orders: item.orders || 0,
                        items: item.items || 0
                    };
                }) || [];

                setReportData({
                    revenueData: processedRevenueData,
                    topItems: response.topItems || [],
                    categoryPerformance: response.categoryPerformance || [],
                    hourlyBreakdown: response.hourlyBreakdown || [],
                    paymentMethodData: response.paymentMethodData || [],
                    orderTypeData: response.orderTypeData || []
                });
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
        const csvContent = 'Date,Orders,Items,Revenue\n' +
            reportData.revenueData.map((d: any) =>
                `${d.label},${d.orders},${d.items},${d.revenue}`
            ).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `restaurant-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleExportPDF = () => {
        window.print();
    };

    const totalRevenue = reportData.revenueData.reduce((sum: number, d: any) => sum + (d.revenue || 0), 0);
    const totalOrders = reportData.revenueData.reduce((sum: number, d: any) => sum + (d.orders || 0), 0);
    const totalItems = reportData.revenueData.reduce((sum: number, d: any) => sum + (d.items || 0), 0);
    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;

    const getPaymentMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            cash: 'Cash',
            card: 'Card',
            upi: 'UPI',
            credit: 'Credit',
            other: 'Other'
        };
        return labels[method] || method;
    };

    const getOrderTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            dine_in: 'Dine In',
            takeaway: 'Takeaway',
            delivery: 'Delivery'
        };
        return labels[type] || type;
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'beer': return <Beer className="h-4 w-4" />;
            case 'wine': return <Wine className="h-4 w-4" />;
            default: return <Coffee className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center">
                            <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold">Restaurant Reports</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">Sales analytics and performance metrics</p>
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
                        <Select value={dateRange} onValueChange={(v: 'day' | 'week' | 'month') => setDateRange(v)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="day">Daily</SelectItem>
                                <SelectItem value="week">Weekly</SelectItem>
                                <SelectItem value="month">Monthly</SelectItem>
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
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
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
                            change={`${reportData.revenueData.length} periods`}
                            changeType="positive"
                            icon={DollarSign}
                            iconClassName="bg-orange-500"
                        />
                        <StatCard
                            title="Total Orders"
                            value={totalOrders}
                            change={`${totalItems} items sold`}
                            changeType="positive"
                            icon={ShoppingBag}
                            iconClassName="bg-blue-500"
                        />
                        <StatCard
                            title="Average Order Value"
                            value={`$${avgOrderValue}`}
                            change="Per order average"
                            changeType="neutral"
                            icon={TrendingUp}
                            iconClassName="bg-green-500"
                        />
                        <StatCard
                            title="Items per Order"
                            value={(totalItems / totalOrders).toFixed(1)}
                            change="Average items"
                            changeType="neutral"
                            icon={Utensils}
                            iconClassName="bg-purple-500"
                        />
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue Trend */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-orange-500" />
                                    Revenue Trend
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    {reportData.revenueData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={reportData.revenueData}>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis dataKey="label" className="text-xs" />
                                                <YAxis className="text-xs" />
                                                <Tooltip
                                                    formatter={(value: any) => [`$${value}`, 'Revenue']}
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--card))',
                                                        border: '1px solid hsl(var(--border))',
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                                <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-muted-foreground">
                                            No revenue data available
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Orders Trend */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Orders Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    {reportData.revenueData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={reportData.revenueData}>
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
                                                    dataKey="orders"
                                                    stroke="#f97316"
                                                    strokeWidth={2}
                                                    dot={{ fill: '#f97316' }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-muted-foreground">
                                            No orders data available
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Selling Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Top Selling Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {reportData.topItems.length > 0 ? (
                                    <div className="space-y-4">
                                        {reportData.topItems.map((item: any, index: number) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                                        {getCategoryIcon(item.category)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{item.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Sold: {item.quantity} • ${item.revenue.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium">
                                                        {((item.quantity / reportData.topItems.reduce((a: number, b: any) => a + b.quantity, 0)) * 100).toFixed(1)}%
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No top items data available
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Category Performance */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Category Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {reportData.categoryPerformance.length > 0 ? (
                                    <div className="space-y-4">
                                        {reportData.categoryPerformance.map((cat: any, index: number) => (
                                            <div key={index}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="capitalize">{cat._id?.replace('_', ' ')}</span>
                                                    <span className="font-medium">${cat.revenue.toFixed(2)}</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div
                                                        className="bg-orange-500 h-2 rounded-full"
                                                        style={{
                                                            width: `${(cat.revenue / reportData.categoryPerformance.reduce((a: number, b: any) => a + b.revenue, 0)) * 100}%`
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                    <span>{cat.quantity} items</span>
                                                    <span>{cat.orderCount} orders</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No category data available
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Hourly Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-orange-500" />
                                    Hourly Sales Pattern
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[250px]">
                                    {reportData.hourlyBreakdown.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={reportData.hourlyBreakdown}>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis dataKey="_id" tickFormatter={(hour) => `${hour}:00`} />
                                                <YAxis yAxisId="left" orientation="left" stroke="#f97316" />
                                                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
                                                <Tooltip
                                                    formatter={(value: any, name: any) => {
                                                        if (name === 'orders') return [value, 'Orders'];
                                                        return [`$${value}`, 'Revenue'];
                                                    }}
                                                />
                                                <Bar yAxisId="left" dataKey="revenue" fill="#f97316" />
                                                <Bar yAxisId="right" dataKey="orders" fill="#3b82f6" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-muted-foreground">
                                            No hourly data available
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Methods & Order Types */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Payment & Order Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Payment Methods Pie */}
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">Payment Methods</h4>
                                        <div className="h-[200px]">
                                            {reportData.paymentMethodData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={reportData.paymentMethodData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={40}
                                                            outerRadius={70}
                                                            dataKey="total"
                                                            label={({ _id }) => getPaymentMethodLabel(_id)}
                                                        >
                                                            {reportData.paymentMethodData.map((entry: any, index: number) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            formatter={(value: any) => [`$${value}`, 'Revenue']}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                                    No data
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Types Pie */}
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">Order Types</h4>
                                        <div className="h-[200px]">
                                            {reportData.orderTypeData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={reportData.orderTypeData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={40}
                                                            outerRadius={70}
                                                            dataKey="revenue"
                                                            label={({ _id }) => getOrderTypeLabel(_id)}
                                                        >
                                                            {reportData.orderTypeData.map((entry: any, index: number) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            formatter={(value: any) => [`$${value}`, 'Revenue']}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                                    No data
                                                </div>
                                            )}
                                        </div>
                                    </div>
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
                            {reportData.revenueData.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Period</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Orders</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Items Sold</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Revenue</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Avg Order</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.revenueData.map((row: any, index: number) => (
                                                <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                                                    <td className="py-3 px-4 font-medium">{row.label}</td>
                                                    <td className="py-3 px-4">{row.orders}</td>
                                                    <td className="py-3 px-4">{row.items}</td>
                                                    <td className="py-3 px-4 font-medium text-orange-600">${row.revenue.toFixed(2)}</td>
                                                    <td className="py-3 px-4">${(row.revenue / row.orders).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            <tr className="border-t font-bold">
                                                <td className="py-3 px-4">Total</td>
                                                <td className="py-3 px-4">{totalOrders}</td>
                                                <td className="py-3 px-4">{totalItems}</td>
                                                <td className="py-3 px-4 text-orange-600">${totalRevenue.toFixed(2)}</td>
                                                <td className="py-3 px-4">${avgOrderValue}</td>
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