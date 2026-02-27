import { useState, useEffect } from 'react';
import { useRestaurantService, type MenuItem } from '@/services/restaurantService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { RestaurantCategoryManager } from '@/pages/restaurant/RestaurantCategoryManager';
import {
    Utensils,
    Settings as SettingsIcon,
    Save,
    RefreshCw,
    DollarSign,
    Percent,
    Package,
    AlertCircle,
    FolderTree
} from 'lucide-react';

export default function RestaurantSettings() {
    const restaurantService = useRestaurantService();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [taxRate, setTaxRate] = useState(5);
    const [serviceCharge, setServiceCharge] = useState(10);
    const [enableInventory, setEnableInventory] = useState(false);
    const [autoPrintReceipt, setAutoPrintReceipt] = useState(true);
    const [defaultOrderType, setDefaultOrderType] = useState('dine_in');
    const [lowStockAlert, setLowStockAlert] = useState(5);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await restaurantService.getMenuItems({ limit: 100 });

            if (response.success) {
                setMenuItems(response.menuItems || []);
            }

            // Load settings from localStorage or API
            const savedSettings = localStorage.getItem('restaurantSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                setTaxRate(settings.taxRate || 5);
                setServiceCharge(settings.serviceCharge || 10);
                setEnableInventory(settings.enableInventory || false);
                setAutoPrintReceipt(settings.autoPrintReceipt !== false);
                setDefaultOrderType(settings.defaultOrderType || 'dine_in');
                setLowStockAlert(settings.lowStockAlert || 5);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        try {
            setSaving(true);

            const settings = {
                taxRate,
                serviceCharge,
                enableInventory,
                autoPrintReceipt,
                defaultOrderType,
                lowStockAlert
            };

            localStorage.setItem('restaurantSettings', JSON.stringify(settings));

            toast.success('Settings saved successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const initializeDefaults = async () => {
        try {
            setLoading(true);

            // First initialize categories
            await restaurantService.initializeCategories();

            // Then initialize menu items
            await restaurantService.initializeMenuItems();

            // Refresh data
            await fetchSettings();

            toast.success('Default settings and menu items initialized');
        } catch (error: any) {
            toast.error(error.message || 'Failed to initialize defaults');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading settings...</p>
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
                            <SettingsIcon className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold">Restaurant Settings</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">Configure restaurant and bar settings</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={initializeDefaults} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Restore Defaults
                    </Button>
                    <Button onClick={saveSettings} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
                        <Save className="h-4 w-4 mr-2" />
                        Save Settings
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="tax">Tax & Charges</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="printing">Printing</TabsTrigger>
                </TabsList>

                {/* General Settings Tab */}
                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">General Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="defaultOrderType">Default Order Type</Label>
                                    <select
                                        id="defaultOrderType"
                                        value={defaultOrderType}
                                        onChange={(e) => setDefaultOrderType(e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                    >
                                        <option value="dine_in">Dine In</option>
                                        <option value="takeaway">Takeaway</option>
                                        <option value="delivery">Delivery</option>
                                    </select>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-medium mb-2">Menu Statistics</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-orange-50 rounded-lg">
                                        <p className="text-sm text-orange-600">Total Items</p>
                                        <p className="text-2xl font-bold text-orange-700">{menuItems.length}</p>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <p className="text-sm text-green-600">Active Items</p>
                                        <p className="text-2xl font-bold text-green-700">
                                            {menuItems.filter(i => i.isActive).length}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-600">Categories</p>
                                        <p className="text-2xl font-bold text-blue-700">
                                            {new Set(menuItems.map(i => i.category)).size}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Categories Tab - NEW */}
                <TabsContent value="categories" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FolderTree className="h-5 w-5 text-orange-500" />
                                Category Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RestaurantCategoryManager />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tax & Charges Tab */}
                <TabsContent value="tax" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-orange-500" />
                                Tax & Service Charges
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="taxRate"
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            value={taxRate}
                                            onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                                        />
                                        <Percent className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Default tax percentage applied to all items
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="serviceCharge">Service Charge (%)</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="serviceCharge"
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            value={serviceCharge}
                                            onChange={(e) => setServiceCharge(parseFloat(e.target.value))}
                                        />
                                        <Percent className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Optional service charge for dine-in orders
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Inventory Tab */}
                <TabsContent value="inventory" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Package className="h-5 w-5 text-orange-500" />
                                Inventory Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="enableInventory">Enable Inventory Tracking</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Track stock levels for menu items
                                    </p>
                                </div>
                                <Switch
                                    id="enableInventory"
                                    checked={enableInventory}
                                    onCheckedChange={setEnableInventory}
                                />
                            </div>

                            {enableInventory && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="lowStockAlert">Low Stock Alert Threshold</Label>
                                        <Input
                                            id="lowStockAlert"
                                            type="number"
                                            min="1"
                                            value={lowStockAlert}
                                            onChange={(e) => setLowStockAlert(parseInt(e.target.value))}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Alert when stock falls below this number
                                        </p>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h3 className="font-medium mb-2">Low Stock Items</h3>
                                        {menuItems.filter(i => i.trackInventory && i.stockQuantity <= lowStockAlert).length > 0 ? (
                                            <div className="space-y-2">
                                                {menuItems
                                                    .filter(i => i.trackInventory && i.stockQuantity <= lowStockAlert)
                                                    .map(item => (
                                                        <div key={item._id} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                                                            <div className="flex items-center gap-2">
                                                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                                                <span className="font-medium">{item.name}</span>
                                                            </div>
                                                            <span className="text-sm text-yellow-600">
                                                                Stock: {item.stockQuantity} {item.unit}
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No low stock items</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Printing Tab */}
                <TabsContent value="printing" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Printing Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="autoPrintReceipt">Auto-print Receipt</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically print receipt after order completion
                                    </p>
                                </div>
                                <Switch
                                    id="autoPrintReceipt"
                                    checked={autoPrintReceipt}
                                    onCheckedChange={setAutoPrintReceipt}
                                />
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-medium mb-2">Printer Configuration</h3>
                                <p className="text-sm text-muted-foreground">
                                    Receipts are formatted for 80mm thermal printers
                                </p>
                                <div className="mt-2 p-4 bg-muted rounded-lg">
                                    <p className="text-xs font-mono">
                                        Sample Receipt Format:<br />
                                        --------------------------------<br />
                                        RESTAURANT & BAR<br />
                                        Fine Dining Experience<br />
                                        --------------------------------<br />
                                        Item Name    x1   $10.00<br />
                                        --------------------------------<br />
                                        Total:            $10.00<br />
                                        --------------------------------<br />
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}