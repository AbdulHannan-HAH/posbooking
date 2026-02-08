// pages/hotel/HotelServices.tsx
import { useState, useEffect } from 'react';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Hotel,
    Plus,
    Search,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Coffee,
    Wine,
    Spa,
    Shirt,
    Car,
    Utensils,
    Loader2
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useHotelService, type HotelService } from '@/services/hotelService';

const serviceSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    price: z.number().min(0, 'Price cannot be negative'),
    category: z.enum(['food', 'beverage', 'spa', 'laundry', 'transport', 'other']),
    isAvailable: z.boolean().default(true),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export default function HotelServices() {
    const hotelService = useHotelService();
    const [services, setServices] = useState<HotelService[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<HotelService | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<ServiceFormData>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            category: 'other',
            isAvailable: true,
        },
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await hotelService.getServices();
            if (response.success) {
                setServices(response.services || []);
            } else {
                toast.error(response.message || 'Failed to fetch services');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'food':
                return <Utensils className="h-4 w-4" />;
            case 'beverage':
                return <Wine className="h-4 w-4" />;
            case 'spa':
                return <Spa className="h-4 w-4" />;
            case 'laundry':
                return <Shirt className="h-4 w-4" />;
            case 'transport':
                return <Car className="h-4 w-4" />;
            default:
                return <Coffee className="h-4 w-4" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'food':
                return 'bg-orange-100 text-orange-800';
            case 'beverage':
                return 'bg-blue-100 text-blue-800';
            case 'spa':
                return 'bg-pink-100 text-pink-800';
            case 'laundry':
                return 'bg-cyan-100 text-cyan-800';
            case 'transport':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleSubmit = async (data: ServiceFormData) => {
        try {
            setSubmitting(true);
            let response;

            if (editingService) {
                response = await hotelService.updateService(editingService._id, data);
            } else {
                response = await hotelService.createService(data);
            }

            if (response.success) {
                toast.success(`Service ${editingService ? 'updated' : 'created'} successfully`);
                fetchServices();
                setDialogOpen(false);
                form.reset();
                setEditingService(null);
            } else {
                toast.error(response.message || `Failed to ${editingService ? 'update' : 'create'} service`);
            }
        } catch (error: any) {
            toast.error(error.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (service: HotelService) => {
        setEditingService(service);
        form.reset({
            name: service.name,
            description: service.description,
            price: service.price,
            category: service.category,
            isAvailable: service.isAvailable,
        });
        setDialogOpen(true);
    };

    const handleDelete = async (serviceId: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return;

        try {
            const response = await hotelService.updateService(serviceId, { isAvailable: false });
            if (response.success) {
                toast.success('Service deleted successfully');
                fetchServices();
            } else {
                toast.error(response.message || 'Failed to delete service');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete service');
        }
    };

    const handleInitializeServices = async () => {
        try {
            const response = await hotelService.initializeServices();
            if (response.success) {
                toast.success('Default services initialized');
                fetchServices();
            } else {
                toast.error(response.message || 'Failed to initialize services');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to initialize services');
        }
    };

    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
        return matchesSearch && matchesCategory && service.isAvailable;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl gradient-hotel flex items-center justify-center">
                            <Hotel className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <h1 className="text-3xl font-bold">Hotel Services</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">Manage hotel services and amenities</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleInitializeServices}>
                        Initialize Defaults
                    </Button>
                    <Dialog open={dialogOpen} onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (!open) {
                            form.reset();
                            setEditingService(null);
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="gradient-hotel border-0">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Service
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingService ? 'Edit Service' : 'Add New Service'}
                                </DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Service Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Breakfast Buffet" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Brief description of the service" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Price ($)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="0.00"
                                                            {...field}
                                                            onChange={e => field.onChange(parseFloat(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="category"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Category</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select category" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="food">Food</SelectItem>
                                                            <SelectItem value="beverage">Beverage</SelectItem>
                                                            <SelectItem value="spa">Spa</SelectItem>
                                                            <SelectItem value="laundry">Laundry</SelectItem>
                                                            <SelectItem value="transport">Transport</SelectItem>
                                                            <SelectItem value="other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="isAvailable"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        className="h-4 w-4 rounded"
                                                    />
                                                </FormControl>
                                                <FormLabel className="!mt-0">Available for booking</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="gradient-hotel border-0"
                                        >
                                            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                            {editingService ? 'Update Service' : 'Create Service'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search services..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="food">Food</SelectItem>
                                <SelectItem value="beverage">Beverage</SelectItem>
                                <SelectItem value="spa">Spa</SelectItem>
                                <SelectItem value="laundry">Laundry</SelectItem>
                                <SelectItem value="transport">Transport</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Services Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Available Services</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredServices.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No services found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredServices.map((service) => (
                                            <TableRow key={service._id}>
                                                <TableCell className="font-medium">{service.name}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(service.category)}`}>
                                                        {getCategoryIcon(service.category)}
                                                        {service.category}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {service.description}
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    ${service.price.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    {service.isAvailable ? (
                                                        <span className="inline-flex items-center gap-1 text-success text-sm">
                                                            <CheckCircle className="h-4 w-4" />
                                                            Available
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
                                                            <XCircle className="h-4 w-4" />
                                                            Unavailable
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEdit(service)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-destructive"
                                                            onClick={() => handleDelete(service._id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}