import { useState, useEffect } from 'react';
import { useRestaurantService } from '@/services/restaurantService';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
    Utensils,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Coffee,
    Beer,
    Wine,
    Loader2,
    MoreVertical,
    RefreshCw
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Default categories as fallback
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

export default function MenuItems() {
    const restaurantService = useRestaurantService();
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [filteredItems, setFilteredItems] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [initializing, setInitializing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [activeFilter, setActiveFilter] = useState('all');

    // Dialog states
    const [showDialog, setShowDialog] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: 'cold_drink',
        categoryDisplay: 'Cold Drinks',
        price: 0,
        tax: 0,
        taxType: 'percentage',
        description: '',
        unit: 'piece',
        stockQuantity: 0,
        trackInventory: false,
        isActive: true,
        isPopular: false
    });

    useEffect(() => {
        fetchMenuItems();
    }, []);

    useEffect(() => {
        filterItems();
    }, [searchTerm, categoryFilter, activeFilter, menuItems]);

    const fetchMenuItems = async () => {
        try {
            setLoading(true);
            const response = await restaurantService.getMenuItems({ limit: 100 });

            if (response.success) {
                setMenuItems(response.menuItems || []);

                // If categories are returned from API, use them, otherwise use defaults
                if (response.categories && response.categories.length > 0) {
                    setCategories(response.categories);
                } else {
                    // Convert default categories to the format expected by the component
                    const defaultCats = DEFAULT_CATEGORIES.map((cat, index) => ({
                        _id: cat.value,
                        categoryDisplay: cat.label,
                        count: 0
                    }));
                    setCategories(defaultCats);
                }
            } else {
                toast.error(response.message || 'Failed to load menu items');
                // Use default categories as fallback
                const defaultCats = DEFAULT_CATEGORIES.map((cat, index) => ({
                    _id: cat.value,
                    categoryDisplay: cat.label,
                    count: 0
                }));
                setCategories(defaultCats);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load menu items');
            // Use default categories as fallback
            const defaultCats = DEFAULT_CATEGORIES.map((cat, index) => ({
                _id: cat.value,
                categoryDisplay: cat.label,
                count: 0
            }));
            setCategories(defaultCats);
        } finally {
            setLoading(false);
        }
    };

    const initializeDefaultItems = async () => {
        try {
            setInitializing(true);
            const response = await restaurantService.initializeMenuItems();
            if (response.success) {
                toast.success('Default menu items initialized successfully');
                fetchMenuItems();
            } else {
                toast.error(response.message || 'Failed to initialize default items');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to initialize default items');
        } finally {
            setInitializing(false);
        }
    };

    const filterItems = () => {
        let filtered = [...menuItems];

        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(item => item.category === categoryFilter);
        }

        if (activeFilter !== 'all') {
            const isActive = activeFilter === 'active';
            filtered = filtered.filter(item => item.isActive === isActive);
        }

        setFilteredItems(filtered);
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            category: item.category,
            categoryDisplay: item.categoryDisplay,
            price: item.price,
            tax: item.tax || 0,
            taxType: item.taxType || 'percentage',
            description: item.description || '',
            unit: item.unit || 'piece',
            stockQuantity: item.stockQuantity || 0,
            trackInventory: item.trackInventory || false,
            isActive: item.isActive,
            isPopular: item.isPopular || false
        });
        setShowDialog(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await restaurantService.deleteMenuItem(id);
            if (response.success) {
                toast.success('Menu item deleted successfully');
                fetchMenuItems();
            } else {
                toast.error(response.message || 'Failed to delete menu item');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete menu item');
        }
    };

    const handleSubmit = async () => {
        try {
            setSaving(true);

            // Validate
            if (!formData.name || !formData.category || !formData.categoryDisplay || formData.price <= 0) {
                toast.error('Please fill all required fields');
                return;
            }

            let response;
            if (editingItem) {
                response = await restaurantService.updateMenuItem(editingItem._id, formData);
            } else {
                response = await restaurantService.createMenuItem(formData);
            }

            if (response.success) {
                toast.success(editingItem ? 'Menu item updated successfully' : 'Menu item created successfully');
                setShowDialog(false);
                setEditingItem(null);
                setFormData({
                    name: '',
                    category: 'cold_drink',
                    categoryDisplay: 'Cold Drinks',
                    price: 0,
                    tax: 0,
                    taxType: 'percentage',
                    description: '',
                    unit: 'piece',
                    stockQuantity: 0,
                    trackInventory: false,
                    isActive: true,
                    isPopular: false
                });
                fetchMenuItems();
            } else {
                toast.error(response.message || 'Failed to save menu item');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save menu item');
        } finally {
            setSaving(false);
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category?.toLowerCase()) {
            case 'beer': return <Beer className="h-4 w-4" />;
            case 'wine': return <Wine className="h-4 w-4" />;
            case 'cold_drink':
            case 'soft_drink':
                return <Coffee className="h-4 w-4" />;
            default: return <Coffee className="h-4 w-4" />;
        }
    };

    const getCategoryDisplay = (categoryValue: string) => {
        const cat = categories.find(c => c._id === categoryValue);
        return cat?.categoryDisplay || categoryValue.replace('_', ' ');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
                    <p className="mt-4 text-muted-foreground">Loading menu items...</p>
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
                        <h1 className="text-3xl font-bold">Menu Items</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">Manage restaurant and bar menu items</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={initializeDefaultItems}
                        disabled={initializing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${initializing ? 'animate-spin' : ''}`} />
                        Initialize Defaults
                    </Button>
                    <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setShowDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat._id} value={cat._id}>
                                        {cat.categoryDisplay} {cat.count > 0 ? `(${cat.count})` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={activeFilter} onValueChange={setActiveFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No menu items found. Click "Add Item" to create your first menu item.
                    </div>
                ) : (
                    filteredItems.map((item) => (
                        <Card key={item._id} className={!item.isActive ? 'opacity-60' : ''}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                            {getCategoryIcon(item.category)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{item.name}</h3>
                                            <p className="text-xs text-muted-foreground">{item.categoryDisplay}</p>
                                        </div>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(item._id)}
                                                className="text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Price</span>
                                        <span className="font-bold text-orange-600">${item.price.toFixed(2)}</span>
                                    </div>
                                    {item.trackInventory && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Stock</span>
                                            <span className="text-sm">{item.stockQuantity} {item.unit}</span>
                                        </div>
                                    )}
                                    {item.isPopular && (
                                        <div className="inline-flex px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                                            Popular
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Item Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Kingfisher Beer"
                                />
                            </div>
                            <div>
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => {
                                        const cat = categories.find(c => c._id === value);
                                        setFormData({
                                            ...formData,
                                            category: value,
                                            categoryDisplay: cat?.categoryDisplay || getCategoryDisplay(value)
                                        });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat._id} value={cat._id}>
                                                {cat.categoryDisplay}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="price">Price ($) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="unit">Unit</Label>
                                <Select
                                    value={formData.unit}
                                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="piece">Piece</SelectItem>
                                        <SelectItem value="glass">Glass</SelectItem>
                                        <SelectItem value="bottle">Bottle</SelectItem>
                                        <SelectItem value="plate">Plate</SelectItem>
                                        <SelectItem value="bowl">Bowl</SelectItem>
                                        <SelectItem value="ml">ML</SelectItem>
                                        <SelectItem value="ltr">Liter</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="tax">Tax</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="tax"
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={formData.tax}
                                        onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) })}
                                        className="flex-1"
                                    />
                                    <Select
                                        value={formData.taxType}
                                        onValueChange={(value) => setFormData({ ...formData, taxType: value })}
                                    >
                                        <SelectTrigger className="w-24">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">%</SelectItem>
                                            <SelectItem value="fixed">$</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="stock">Stock Quantity</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    min="0"
                                    value={formData.stockQuantity}
                                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Item description..."
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
                                <Label htmlFor="isActive">Active</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="isPopular"
                                    checked={formData.isPopular}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isPopular: checked })}
                                />
                                <Label htmlFor="isPopular">Mark as Popular</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="trackInventory"
                                    checked={formData.trackInventory}
                                    onCheckedChange={(checked) => setFormData({ ...formData, trackInventory: checked })}
                                />
                                <Label htmlFor="trackInventory">Track Inventory</Label>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>
                            Cancel
                        </Button>
                        <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleSubmit} disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                'Save Item'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}