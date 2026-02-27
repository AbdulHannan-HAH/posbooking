import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useRestaurantService, type Category } from '@/services/restaurantService';
import {
    Plus,
    Pencil,
    Trash2,
    RefreshCw,
    Coffee,
    Beer,
    Wine,
    Utensils,
    Cake,
    Pizza,
    Salad,
    IceCream,
    Loader2,
    AlertCircle,
    ChevronUp,
    ChevronDown
} from 'lucide-react';

const iconOptions = [
    { value: 'coffee', label: 'Coffee', icon: Coffee },
    { value: 'beer', label: 'Beer', icon: Beer },
    { value: 'wine', label: 'Wine', icon: Wine },
    { value: 'utensils', label: 'Utensils', icon: Utensils },
    { value: 'cake', label: 'Cake', icon: Cake },
    { value: 'pizza', label: 'Pizza', icon: Pizza },
    { value: 'salad', label: 'Salad', icon: Salad },
    { value: 'ice-cream', label: 'Ice Cream', icon: IceCream },
];

export function RestaurantCategoryManager() {
    const restaurantService = useRestaurantService();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        displayName: '',
        icon: 'coffee',
        description: '',
        sortOrder: 0,
        isActive: true
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await restaurantService.getCategories();
            if (response.success) {
                setCategories(response.categories || []);
            } else {
                toast.error(response.message || 'Failed to load categories');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, isActive: checked }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            displayName: '',
            icon: 'coffee',
            description: '',
            sortOrder: 0,
            isActive: true
        });
        setEditingCategory(null);
    };

    const openCreateDialog = () => {
        resetForm();
        setShowDialog(true);
    };

    const openEditDialog = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            displayName: category.displayName,
            icon: category.icon || 'coffee',
            description: category.description || '',
            sortOrder: category.sortOrder || 0,
            isActive: category.isActive
        });
        setShowDialog(true);
    };

    const handleSubmit = async () => {
        // Validate
        if (!formData.name.trim() || !formData.displayName.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setSaving(true);

            if (editingCategory) {
                // Update - only send updatable fields
                const response = await restaurantService.updateCategory(editingCategory._id, {
                    displayName: formData.displayName,
                    icon: formData.icon,
                    description: formData.description,
                    isActive: formData.isActive,
                    sortOrder: formData.sortOrder
                });

                if (response.success) {
                    toast.success('Category updated successfully');
                    setShowDialog(false);
                    resetForm();
                    fetchCategories();
                } else {
                    toast.error(response.message || 'Failed to update category');
                }
            } else {
                // Create
                const response = await restaurantService.createCategory({
                    name: formData.name,
                    displayName: formData.displayName,
                    icon: formData.icon,
                    description: formData.description,
                    sortOrder: formData.sortOrder,
                    isActive: formData.isActive
                });

                if (response.success) {
                    toast.success('Category created successfully');
                    setShowDialog(false);
                    resetForm();
                    fetchCategories();
                } else {
                    toast.error(response.message || 'Failed to create category');
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setDeleting(id);
            const response = await restaurantService.deleteCategory(id);
            if (response.success) {
                toast.success('Category deleted successfully');
                fetchCategories();
            } else {
                toast.error(response.message || 'Failed to delete category');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete category');
        } finally {
            setDeleting(null);
            setShowDeleteConfirm(null);
        }
    };

    const initializeDefaults = async () => {
        try {
            setLoading(true);
            const response = await restaurantService.initializeCategories();
            if (response.success) {
                toast.success('Default categories initialized');
                fetchCategories();
            } else {
                toast.error(response.message || 'Failed to initialize categories');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to initialize categories');
        } finally {
            setLoading(false);
        }
    };

    const moveCategory = async (id: string, direction: 'up' | 'down') => {
        const index = categories.findIndex(c => c._id === id);
        if (index === -1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= categories.length) return;

        const currentCategory = categories[index];
        const otherCategory = categories[newIndex];

        try {
            // Swap sort orders
            await restaurantService.updateCategory(currentCategory._id, {
                sortOrder: otherCategory.sortOrder
            });
            await restaurantService.updateCategory(otherCategory._id, {
                sortOrder: currentCategory.sortOrder
            });

            // Refresh list
            fetchCategories();
            toast.success('Category order updated');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update category order');
        }
    };

    const getIconComponent = (iconName: string) => {
        const icon = iconOptions.find(opt => opt.value === iconName);
        if (icon) {
            const IconComponent = icon.icon;
            return <IconComponent className="h-4 w-4" />;
        }
        return <Coffee className="h-4 w-4" />;
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Manage Categories</h2>
                <div className="flex gap-2">
                    <Button
                        onClick={initializeDefaults}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Initialize Defaults
                    </Button>
                    <Button
                        onClick={openCreateDialog}
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Category
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">Icon</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Display Name</TableHead>
                                <TableHead className="text-center">Items</TableHead>
                                <TableHead className="text-center">Sort Order</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No categories found. Click "Add Category" to create one.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories.map((category, index) => (
                                    <TableRow key={category._id}>
                                        <TableCell>
                                            <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                                {getIconComponent(category.icon)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{category.name}</TableCell>
                                        <TableCell className="font-medium">{category.displayName}</TableCell>
                                        <TableCell className="text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs ${category.itemCount > 0
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {category.itemCount}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="text-sm">{category.sortOrder}</span>
                                                <div className="flex flex-col">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-4 w-4"
                                                        onClick={() => moveCategory(category._id, 'up')}
                                                        disabled={index === 0}
                                                    >
                                                        <ChevronUp className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-4 w-4"
                                                        onClick={() => moveCategory(category._id, 'down')}
                                                        disabled={index === categories.length - 1}
                                                    >
                                                        <ChevronDown className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs ${category.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {category.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => openEditDialog(category)}
                                                    title="Edit category"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                {showDeleteConfirm === category._id ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleDelete(category._id)}
                                                            disabled={deleting === category._id}
                                                            className="h-8"
                                                        >
                                                            {deleting === category._id ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                'Confirm'
                                                            )}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setShowDeleteConfirm(null)}
                                                            className="h-8"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => setShowDeleteConfirm(category._id)}
                                                        disabled={category.itemCount > 0}
                                                        title={category.itemCount > 0
                                                            ? 'Cannot delete category with items'
                                                            : 'Delete category'
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            {category.itemCount > 0 && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Has {category.itemCount} item{category.itemCount !== 1 ? 's' : ''}
                                                </p>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? 'Edit Category' : 'Create New Category'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Category Name (for backend) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., cold_drink, fast_food"
                                disabled={!!editingCategory}
                                className="font-mono"
                            />
                            <p className="text-xs text-muted-foreground">
                                Used internally. Use lowercase with underscores.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="displayName">
                                Display Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="displayName"
                                name="displayName"
                                value={formData.displayName}
                                onChange={handleInputChange}
                                placeholder="e.g., Cold Drinks"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="icon">Icon</Label>
                            <Select
                                value={formData.icon}
                                onValueChange={(value) => handleSelectChange('icon', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an icon" />
                                </SelectTrigger>
                                <SelectContent>
                                    {iconOptions.map((option) => {
                                        const IconComponent = option.icon;
                                        return (
                                            <SelectItem key={option.value} value={option.value}>
                                                <div className="flex items-center gap-2">
                                                    <IconComponent className="h-4 w-4" />
                                                    <span>{option.label}</span>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Brief description of this category"
                                rows={2}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sortOrder">Sort Order</Label>
                                <Input
                                    id="sortOrder"
                                    name="sortOrder"
                                    type="number"
                                    min="0"
                                    value={formData.sortOrder}
                                    onChange={handleNumberChange}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Lower numbers appear first
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-sm">Active</span>
                                    <Switch
                                        checked={formData.isActive}
                                        onCheckedChange={handleSwitchChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {editingCategory && (
                            <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-blue-700">
                                    The internal name cannot be changed after creation. To rename, create a new category and reassign menu items.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    {editingCategory ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                editingCategory ? 'Update Category' : 'Create Category'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}