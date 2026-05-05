import rooms_types from '@/routes/rooms_types';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';

type RoomType = {
    id: number;
    name: string;
    base_price: number;
    description: string;
    image: string | null;
    is_active: boolean;
    capacity: string;
};

type RoomTypeModalProps = {
    isOpen: boolean;
    onClose: () => void;
    roomType?: RoomType | null;
    mode: 'view' | 'edit' | 'create';
};

type FormData = {
    id: number;
    name: string;
    base_price: number;
    description: string;
    image: File | null;
    imagePreview: string | null;
    is_active: boolean;
    capacity: string;
};

export default function RoomTypeModal({
    isOpen,
    onClose,
    roomType,
    mode,
}: RoomTypeModalProps) {
    const { data, setData, post, put, processing, reset } = useForm<FormData>({
        id: roomType?.id || 0,
        name: roomType?.name || '',
        base_price: roomType?.base_price || 0,
        description: roomType?.description || '',
        image: null,
        imagePreview: roomType?.image ? `/storage/${roomType.image}` : null,
        is_active: roomType?.is_active || false,
        capacity: roomType?.capacity || '',
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setData('imagePreview', event.target.result as string);
                    setData('image', file);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('image', null);
        setData('imagePreview', null);
    };
    useEffect(() => {
        if (roomType && mode !== 'create') {
            setData({
                id: roomType.id,
                name: roomType.name,
                base_price: roomType.base_price,
                description: roomType.description,
                image: null,
                imagePreview: roomType.image
                    ? `/storage/${roomType.image}`
                    : null,
                is_active: roomType.is_active,
                capacity: roomType.capacity,
            });
        }

        if (mode === 'create') {
            reset();
        }
    }, [roomType, mode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('base_price', data.base_price.toString());
        formData.append('description', data.description);
        formData.append('is_active', data.is_active.toString());
        formData.append('capacity', data.capacity);
        if (data.image) {
            formData.append('image', data.image);
        }

        if (mode === 'create') {
            post(rooms_types.store().url, {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else if (mode === 'edit' && roomType) {
            put(rooms_types.update(roomType.id).url, {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    const handleInputChange = (
        field: keyof FormData,
        value: string | number | boolean | File | null,
    ) => {
        setData(field, value);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'view'
                            ? 'View Room Type'
                            : mode === 'edit'
                              ? 'Edit Room Type'
                              : 'Create Room Type'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Preview / Banner */}
                    {(mode === 'view' || data.imagePreview) && (
                        <Card>
                            <CardContent className="p-0">
                                {mode === 'view' && data.imagePreview ? (
                                    <div className="relative h-16 w-16">
                                        <img
                                            src={data.imagePreview}
                                            alt="Room Type"
                                            className="h-16 w-16 rounded"
                                        />
                                    </div>
                                ) : (
                                    <div className="relative">
                                        {data.imagePreview ? (
                                            <>
                                                <img
                                                    src={data.imagePreview}
                                                    alt="Preview"
                                                    className="h-16 w-16 rounded"
                                                />
                                                {mode !== 'view' && (
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        className="absolute top-2 right-2"
                                                        onClick={removeImage}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex h-48 w-full items-center justify-center bg-gray-100">
                                                <span className="text-gray-500">
                                                    No image selected
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Image Upload (Only in Edit/Create modes) */}
                    {mode !== 'view' && (
                        <div>
                            <Label htmlFor="image">Upload Image</Label>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={processing}
                            />
                        </div>
                    )}

                    {/* Other Fields */}
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) =>
                                handleInputChange('name', e.target.value)
                            }
                            disabled={mode === 'view'}
                        />
                    </div>

                    <div>
                        <Label htmlFor="base_price">Base Price</Label>
                        <Input
                            id="base_price"
                            type="number"
                            value={data.base_price}
                            onChange={(e) =>
                                handleInputChange(
                                    'base_price',
                                    Number(e.target.value),
                                )
                            }
                            disabled={mode === 'view'}
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                handleInputChange('description', e.target.value)
                            }
                            disabled={mode === 'view'}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Capacity */}
                        <div>
                            <Label htmlFor="capacity">Capacity</Label>
                            <select
                                id="capacity"
                                value={data.capacity}
                                onChange={(e) =>
                                    handleInputChange(
                                        'capacity',
                                        e.target.value,
                                    )
                                }
                                disabled={mode === 'view'}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                            >
                                <option value="">Select capacity</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                    <option key={num} value={num}>
                                        {num} Person{num > 1 ? 's' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Is Active */}
                        <div className="flex flex-col justify-end">
                            <Label htmlFor="is_active" className="mb-2">
                                Status
                            </Label>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) =>
                                        handleInputChange(
                                            'is_active',
                                            Boolean(checked),
                                        )
                                    }
                                    disabled={mode === 'view'}
                                />
                                <span className="text-sm text-gray-700">
                                    {data.is_active ? 'Active' : 'Hidden'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        {mode !== 'view' && (
                            <Button type="submit" disabled={processing}>
                                {processing
                                    ? 'Saving...'
                                    : mode === 'edit'
                                      ? 'Update'
                                      : 'Create'}
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
