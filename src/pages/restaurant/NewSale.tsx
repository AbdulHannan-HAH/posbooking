import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurantService, type MenuItem } from '@/services/restaurantService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
    Utensils,
    ArrowLeft,
    Plus,
    Minus,
    Trash2,
    ShoppingCart,
    User,
    Phone,
    Mail,
    Hash,
    Coffee,
    Beer,
    Wine,
    Loader2
} from 'lucide-react';
import { RestaurantInvoiceDialog } from '@/components/restaurant/RestaurantInvoiceDialog';

// Default categories for fallback
const DEFAULT_CATEGORIES = [
    { value: 'cold_drink', label: 'Cold Drinks' },
    { value: 'soft_drink', label: 'Soft Drinks' },
    { value: 'beer', label: 'Beer' },
    { value: 'wine', label: 'Wine' },
    { value: 'spirits', label: 'Spirits' },
    { value: 'cocktails', label: 'Cocktails' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'meals', label: 'Meals' },
    { value: 'desserts', label: 'Desserts' }
];

export default function NewSale() {
    const navigate = useNavigate();
    const restaurantService = useRestaurantService();

    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<any[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [orderType, setOrderType] = useState('dine_in');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentStatus, setPaymentStatus] = useState('pending');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showInvoice, setShowInvoice] = useState(false);
    const [createdSale, setCreatedSale] = useState<any>(null);

    useEffect(() => {
        fetchMenuItems();
    }, []);

    useEffect(() => {
        filterItems();
    }, [searchTerm, selectedCategory, menuItems]);

    const fetchMenuItems = async () => {
        try {
            setLoading(true);
            const response = await restaurantService.getMenuItems({
                isActive: 'true',
                limit: 100
            });

            if (response.success) {
                console.log('Menu items response:', response); // Debug log
                setMenuItems(response.menuItems || []);
                setFilteredItems(response.menuItems || []);

                // Process categories from response or create from menu items
                if (response.categories && response.categories.length > 0) {
                    setCategories(response.categories);
                } else {
                    // Create categories from menu items
                    const categoryMap = new Map();

                    response.menuItems?.forEach((item: any) => {
                        if (!categoryMap.has(item.category)) {
                            categoryMap.set(item.category, {
                                _id: item.category,
                                categoryDisplay: item.categoryDisplay || item.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                                count: 1
                            });
                        } else {
                            const cat = categoryMap.get(item.category);
                            cat.count += 1;
                        }
                    });

                    const uniqueCategories = Array.from(categoryMap.values());
                    console.log('Processed categories:', uniqueCategories); // Debug log
                    setCategories(uniqueCategories.length > 0 ? uniqueCategories : DEFAULT_CATEGORIES);
                }
            } else {
                toast.error(response.message || 'Failed to load menu items');
                setCategories(DEFAULT_CATEGORIES);
            }
        } catch (error: any) {
            console.error('Error fetching menu items:', error);
            toast.error(error.message || 'Failed to load menu items');
            setCategories(DEFAULT_CATEGORIES);
        } finally {
            setLoading(false);
        }
    };

    const filterItems = () => {
        let filtered = menuItems.filter(item => item.isActive);

        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }

        setFilteredItems(filtered);
    };

    const addToCart = (item: MenuItem) => {
        const existing = cart.find(c => c.menuItemId === item._id);

        if (existing) {
            setCart(cart.map(c =>
                c.menuItemId === item._id
                    ? { ...c, quantity: c.quantity + 1 }
                    : c
            ));
        } else {
            const itemTotal = item.taxType === 'percentage'
                ? item.price * (1 + item.tax / 100)
                : item.price + item.tax;

            setCart([...cart, {
                menuItemId: item._id,
                name: item.name,
                category: item.category,
                quantity: 1,
                unitPrice: item.price,
                tax: item.tax,
                taxType: item.taxType,
                discount: 0,
                subtotal: item.price,
                total: itemTotal
            }]);
        }
    };

    const updateQuantity = (index: number, delta: number) => {
        const newCart = [...cart];
        const item = newCart[index];
        const newQuantity = item.quantity + delta;

        if (newQuantity <= 0) {
            newCart.splice(index, 1);
        } else {
            item.quantity = newQuantity;
            item.subtotal = item.unitPrice * newQuantity;
            if (item.taxType === 'percentage') {
                item.total = item.subtotal * (1 + item.tax / 100);
            } else {
                item.total = item.subtotal + (item.tax * newQuantity);
            }
        }

        setCart(newCart);
    };

    const removeFromCart = (index: number) => {
        setCart(cart.filter((_, i) => i !== index));
    };

    const calculateTotals = () => {
        const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
        const taxTotal = cart.reduce((sum, item) => sum + (item.total - item.subtotal), 0);
        const total = cart.reduce((sum, item) => sum + item.total, 0);

        return { subtotal, taxTotal, total };
    };

    const handleSubmit = async () => {
        if (cart.length === 0) {
            toast.error('Please add at least one item to the order');
            return;
        }

        try {
            setSaving(true);

            const { subtotal, taxTotal, total } = calculateTotals();

            const saleData = {
                customerName: customerName || 'Guest',
                customerPhone: customerPhone || undefined,
                customerEmail: customerEmail || undefined,
                tableNumber: tableNumber || undefined,
                items: cart.map(item => ({
                    menuItemId: item.menuItemId,
                    quantity: item.quantity,
                    discount: item.discount || 0,
                    notes: item.notes || ''
                })),
                subtotal,
                taxTotal,
                discountTotal: 0,
                totalAmount: total,
                paymentMethod,
                paymentStatus,
                orderType,
                notes
            };

            console.log('Sending sale data:', saleData);

            const response = await restaurantService.createSale(saleData);

            if (response.success) {
                setCreatedSale(response.sale);
                if (paymentStatus === 'confirmed') {
                    setShowInvoice(true);
                }
                toast.success('Order created successfully');

                // Reset form
                setCart([]);
                setCustomerName('');
                setCustomerPhone('');
                setCustomerEmail('');
                setTableNumber('');
                setNotes('');
            } else {
                toast.error(response.message || 'Failed to create order');
                console.error('Sale creation failed:', response);
            }
        } catch (error: any) {
            console.error('Error in handleSubmit:', error);
            toast.error(error.message || 'Failed to create order');
        } finally {
            setSaving(false);
        }
    };

    const getCategoryIcon = (category: string) => {
        const categoryLower = category?.toLowerCase() || '';

        if (categoryLower.includes('beer')) {
            return <Beer className="h-4 w-4" />;
        } else if (categoryLower.includes('wine')) {
            return <Wine className="h-4 w-4" />;
        } else {
            return <Coffee className="h-4 w-4" />;
        }
    };

    const getCategoryDisplayName = (categoryValue: string) => {
        const found = categories.find(c => c._id === categoryValue);
        if (found) return found.categoryDisplay;

        // Fallback formatting
        return categoryValue?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || categoryValue;
    };

    const { subtotal, taxTotal, total } = calculateTotals();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading menu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center">
                            <Utensils className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <h1 className="text-3xl font-bold">New Order</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">Create a new restaurant order</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Menu Items */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Menu Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Search and Filter */}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Search items..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1"
                                />
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat._id} value={cat._id}>
                                                {cat.categoryDisplay || cat._id?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                {cat.count ? `(${cat.count})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Items Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto p-1">
                                {filteredItems.length === 0 ? (
                                    <div className="col-span-full text-center py-8 text-muted-foreground">
                                        No items available
                                    </div>
                                ) : (
                                    filteredItems.map((item) => (
                                        <div
                                            key={item._id}
                                            className="border rounded-lg p-3 cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all"
                                            onClick={() => addToCart(item)}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                                    {getCategoryIcon(item.category)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{item.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.categoryDisplay || getCategoryDisplayName(item.category)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-orange-600">${item.price.toFixed(2)}</span>
                                                {item.isPopular && (
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded">
                                                        Popular
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Order Cart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-orange-500" />
                            Current Order
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Customer Info */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Customer Name"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Phone (optional)"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Email (optional)"
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Table # (optional)"
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Order Type, Payment Method & Status */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-xs">Order Type</Label>
                                <Select value={orderType} onValueChange={setOrderType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="dine_in">Dine In</SelectItem>
                                        <SelectItem value="takeaway">Takeaway</SelectItem>
                                        <SelectItem value="delivery">Delivery</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs">Payment Method</Label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                        <SelectItem value="upi">UPI</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Payment Status Selection */}
                        <div>
                            <Label className="text-xs">Payment Status</Label>
                            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Cart Items */}
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            {cart.length === 0 ? (
                                <p className="text-center text-muted-foreground py-4">
                                    No items added
                                </p>
                            ) : (
                                cart.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2 border-b pb-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                ${item.unitPrice.toFixed(2)} × {item.quantity}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6"
                                                onClick={() => updateQuantity(index, -1)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-6 text-center text-sm">{item.quantity}</span>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6"
                                                onClick={() => updateQuantity(index, 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6 text-destructive"
                                                onClick={() => removeFromCart(index)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Totals */}
                        <div className="space-y-2 border-t pt-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax:</span>
                                <span>${taxTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total:</span>
                                <span className="text-orange-600">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Notes */}
                        <Textarea
                            placeholder="Order notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                        />

                        {/* Submit Button */}
                        <Button
                            className="w-full bg-orange-500 hover:bg-orange-600"
                            onClick={handleSubmit}
                            disabled={saving || cart.length === 0}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Creating Order...
                                </>
                            ) : (
                                'Create Order'
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Invoice Dialog - Only for confirmed orders */}
            {createdSale && createdSale.paymentStatus === 'confirmed' && (
                <RestaurantInvoiceDialog
                    open={showInvoice}
                    onClose={() => {
                        setShowInvoice(false);
                        navigate('/restaurant/sales');
                    }}
                    sale={{
                        id: createdSale._id,
                        saleNumber: createdSale.saleNumber,
                        customerName: createdSale.customerName,
                        customerPhone: createdSale.customerPhone,
                        tableNumber: createdSale.tableNumber,
                        items: createdSale.items.map((item: any) => ({
                            name: item.name,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            total: item.total
                        })),
                        subtotal: createdSale.subtotal,
                        taxTotal: createdSale.taxTotal,
                        discountTotal: createdSale.discountTotal,
                        totalAmount: createdSale.totalAmount,
                        paymentMethod: createdSale.paymentMethod,
                        paymentStatus: createdSale.paymentStatus,
                        orderType: createdSale.orderType,
                        createdAt: createdSale.createdAt,
                        servedBy: createdSale.servedBy?.name
                    }}
                />
            )}
        </div>
    );
}