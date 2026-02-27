import { useState, useEffect } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, DollarSign, ShoppingBag, Clock, Plus, TrendingUp, Coffee, Beer, Wine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRestaurantService } from '@/services/restaurantService';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

export default function RestaurantDashboard() {
    const restaurantService = useRestaurantService();
    const [stats, setStats] = useState({
        todaySales: 0,
        todayRevenue: 0,
        todayItems: 0,
        pendingPayments: 0,
        activeOrders: 0,
        popularItems: [],
        categoryBreakdown: [],
        recentSales: [],
        orderStatusBreakdown: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await restaurantService.getDashboardStats();

            if (response.success && response.stats) {
                setStats(response.stats);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'preparing': return 'bg-blue-100 text-blue-800';
            case 'ready': return 'bg-green-100 text-green-800';
            case 'served': return 'bg-purple-100 text-purple-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
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

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center">
                            <Utensils className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <h1 className="text-3xl font-bold">Restaurant & Bar</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">Manage orders, sales, and menu items</p>
                </div>
                <Link to="/restaurant/sales/new">
                    <Button className="bg-orange-500 hover:bg-orange-600 border-0">
                        <Plus className="h-4 w-4 mr-2" />
                        New Order
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Today's Orders"
                    value={stats.todaySales}
                    change="Total orders today"
                    changeType="positive"
                    icon={ShoppingBag}
                    iconClassName="bg-orange-500"
                />
                <StatCard
                    title="Today's Revenue"
                    value={`$${stats.todayRevenue.toFixed(2)}`}
                    change="From all sales"
                    changeType="positive"
                    icon={DollarSign}
                    iconClassName="bg-green-500"
                />
                <StatCard
                    title="Active Orders"
                    value={stats.activeOrders}
                    change="Being prepared"
                    changeType="neutral"
                    icon={Clock}
                    iconClassName="bg-blue-500"
                />
                <StatCard
                    title="Pending Payments"
                    value={stats.pendingPayments}
                    change="Awaiting payment"
                    changeType="negative"
                    icon={TrendingUp}
                    iconClassName="bg-red-500"
                />
            </div>

            {/* Popular Items & Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Popular Items */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-orange-500" />
                            Popular Items Today
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.popularItems && stats.popularItems.length > 0 ? (
                            <div className="space-y-4">
                                {stats.popularItems.map((item: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                                {item.category === 'beer' ? <Beer className="h-4 w-4 text-orange-600" /> :
                                                    item.category === 'wine' ? <Wine className="h-4 w-4 text-orange-600" /> :
                                                        <Coffee className="h-4 w-4 text-orange-600" />}
                                            </div>
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <span className="font-medium text-orange-600">${item.revenue.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No sales data available</p>
                        )}
                    </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Category Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
                            <div className="space-y-4">
                                {stats.categoryBreakdown.map((cat: any, index: number) => (
                                    <div key={index}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="capitalize">{cat._id.replace('_', ' ')}</span>
                                            <span className="font-medium">${cat.revenue.toFixed(2)}</span>
                                        </div>
                                        <Progress
                                            value={(cat.revenue / stats.todayRevenue) * 100}
                                            className="h-2 bg-orange-100"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No category data</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Recent Orders</CardTitle>
                    <Link to="/restaurant/sales">
                        <Button variant="outline" size="sm">View All</Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Order #</th>
                                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Customer</th>
                                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Items</th>
                                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Total</th>
                                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Order Status</th>
                                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentSales && stats.recentSales.length > 0 ? (
                                    stats.recentSales.map((sale: any) => (
                                        <tr key={sale._id} className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="py-3 px-2 font-medium">{sale.saleNumber}</td>
                                            <td className="py-3 px-2">{sale.customerName}</td>
                                            <td className="py-3 px-2">{sale.items.length}</td>
                                            <td className="py-3 px-2 font-medium">${sale.totalAmount.toFixed(2)}</td>
                                            <td className="py-3 px-2">
                                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(sale.orderStatus)}`}>
                                                    {sale.orderStatus}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2">
                                                <StatusBadge status={sale.paymentStatus} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                            No recent orders
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}