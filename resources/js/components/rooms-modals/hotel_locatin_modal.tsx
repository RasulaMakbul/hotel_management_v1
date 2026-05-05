import hotel_locations from '@/routes/hotel_locations';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';

type HotelLocation = {
    id: number;
    name: string;
    area: string;
    address: string;
    city: string;
    hotel_type: string;
    contact_number: string;
    email: string;
    contact_person: string;
    image: string | null;
    status: string;
};

type FormData = {
    id: number;
    name: string;
    area: string;
    address: string;
    city: string;
    hotel_type: string;
    contact_number: string;
    email: string;
    contact_person: string;
    image: File | null;
    imagePreview: string | null;
    status: string;
    _method?: string;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    hotel_location?: HotelLocation | null;
    mode: 'view' | 'edit' | 'create';
};

export default function HotelLocationModal({
    isOpen,
    onClose,
    hotel_location,
    mode,
}: Props) {
    const { data, setData, post, put, processing, reset } = useForm<FormData>({
        id: 0,
        name: '',
        area: '',
        address: '',
        city: '',
        hotel_type: '',
        contact_number: '',
        email: '',
        contact_person: '',
        image: null,
        imagePreview: null,
        status: 'inactive',
    });

    useEffect(() => {
        if (hotel_location && mode !== 'create') {
            setData({
                id: hotel_location.id,
                name: hotel_location.name,
                area: hotel_location.area,
                address: hotel_location.address,
                city: hotel_location.city,
                hotel_type: hotel_location.hotel_type,
                contact_number: hotel_location.contact_number,
                email: hotel_location.email || '',
                contact_person: hotel_location.contact_person || '',
                image: null,
                imagePreview: hotel_location.image
                    ? `/storage/${hotel_location.image}`
                    : null,
                status: hotel_location.status,
            });
        }

        if (mode === 'create') {
            reset();
        }
    }, [hotel_location, mode]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setData('imagePreview', event.target?.result as string);
            setData('image', file);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setData('image', null);
        setData('imagePreview', null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'create') {
            post(hotel_locations.store().url, {
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }

        if (mode === 'edit' && hotel_location) {
            setData('_method' as any, 'PUT');
            post(hotel_locations.update(hotel_location.id).url, {
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'view'
                            ? 'View Hotel Location'
                            : mode === 'edit'
                              ? 'Edit Hotel Location'
                              : 'Create Hotel Location'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* IMAGE */}
                    {(mode === 'view' || data.imagePreview) && (
                        <Card>
                            <CardContent className="p-2">
                                {data.imagePreview && (
                                    <div className="relative w-32">
                                        <img
                                            src={data.imagePreview}
                                            className="rounded"
                                        />
                                        {mode !== 'view' && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="destructive"
                                                className="absolute top-1 right-1"
                                                onClick={removeImage}
                                            >
                                                <X size={14} />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {mode !== 'view' && (
                        <Input type="file" onChange={handleImageUpload} />
                    )}

                    {/* BASIC FIELDS */}
                    <Input
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Name"
                        disabled={mode === 'view'}
                    />

                    <Input
                        value={data.area}
                        onChange={(e) => setData('area', e.target.value)}
                        placeholder="Area"
                        disabled={mode === 'view'}
                    />

                    <Input
                        value={data.city}
                        onChange={(e) => setData('city', e.target.value)}
                        placeholder="City"
                        disabled={mode === 'view'}
                    />

                    <Textarea
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        placeholder="Address"
                        disabled={mode === 'view'}
                    />

                    {/* HOTEL TYPE */}
                    <select
                        value={data.hotel_type}
                        onChange={(e) => setData('hotel_type', e.target.value)}
                        disabled={mode === 'view'}
                        className="w-full border p-2"
                    >
                        <option value="">Select Type</option>
                        <option value="resort">Resort</option>
                        <option value="boutique">Boutique</option>
                        <option value="business">Business</option>
                        <option value="luxury">Luxury</option>
                    </select>

                    {/* STATUS */}
                    <select
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                        disabled={mode === 'view'}
                        className="w-full border p-2"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <Input
                        value={data.contact_number}
                        onChange={(e) =>
                            setData('contact_number', e.target.value)
                        }
                        placeholder="Contact Number"
                        disabled={mode === 'view'}
                    />

                    <Input
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="Email"
                        disabled={mode === 'view'}
                    />

                    <Input
                        value={data.contact_person}
                        onChange={(e) =>
                            setData('contact_person', e.target.value)
                        }
                        placeholder="Contact Person"
                        disabled={mode === 'view'}
                    />

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-2">
                        {mode !== 'view' && (
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save'}
                            </Button>
                        )}
                        <Button type="button" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
