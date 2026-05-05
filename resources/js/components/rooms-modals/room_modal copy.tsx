import rooms from '@/routes/rooms';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
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
import { HotelFloor, HotelLocation, RoomType } from '@/types';

type Room = {
    id: number;
    hotel_location_id: number;
    hotel_floor_id: number;
    room_type_id: number;
    room_number: string;
    name: string | null;
    base_price: number;
    status: 'available' | 'occupied' | 'maintenance';
    is_active: boolean;
    note: string | null;
    images: string[];
    hotel_location: {
        id: number;
        name: string;
    };
    hotel_floor: {
        id: number;
        floor_number: string;
        name: string;
        hotel_location_id: number;
    };
    room_type: {
        id: number;
        name: string;
        base_price: number;
    };
};

type FormData = {
    id: number;
    hotel_location_id: number;
    hotel_floor_id: number;
    room_type_id: number;
    room_number: string;
    name: string;
    base_price: number;
    status: 'available' | 'occupied' | 'maintenance';
    is_active: boolean;
    note: string;
    images: string[] | [];
    _method?: string;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    room?: Room | null;
    hotelLocations?: HotelLocation[];
    hotelFloors?: HotelFloor[];
    roomTypes?: RoomType[];
    mode: 'view' | 'edit' | 'create';
};

export default function RoomModal({
    isOpen,
    onClose,
    room,
    hotelLocations,
    hotelFloors,
    roomTypes,
    mode,
}: Props) {
    const { data, setData, post, processing, reset } = useForm<FormData>({
        id: 0,
        hotel_location_id: 0,
        hotel_floor_id: 0,
        room_type_id: 0,
        room_number: '',
        name: '',
        base_price: 0,
        status: 'available',
        is_active: true,
        note: '',
        images: [],
    });

    const [newImages, setNewImages] = useState<File[]>([]);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        setNewImages((prev) => [...prev, ...files]);
        setNewPreviews((prev) => [
            ...prev,
            ...files.map((file) => URL.createObjectURL(file)),
        ]);
    };

    const removeNewImage = (index: number) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
        setNewPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const locationOptions = (hotelLocations || []).map((loc) => ({
        value: loc.id.toString(),
        label: loc.name,
    }));

    const floorOptions = (hotelFloors || [])
        .filter(
            (f) =>
                !data.hotel_location_id ||
                f.hotel_location_id === data.hotel_location_id,
        )
        .map((floor) => ({
            value: floor.id.toString(),
            label: `${floor.name} - Floor ${floor.floor_number}`,
        }));

    const typeOptions = (roomTypes || []).map((type) => ({
        value: type.id.toString(),
        label: type.name,
    }));

    useEffect(() => {
        if (room && mode !== 'create') {
            setData({
                id: room.id,
                hotel_location_id: room.hotel_location_id,
                hotel_floor_id: room.hotel_floor_id,
                room_type_id: room.room_type_id,
                room_number: room.room_number,
                name: room.name || '',
                base_price: room.base_price,
                status: room.status,
                is_active: room.is_active,
                note: room.note || '',
                images: room.images || [],
            });
            setNewImages([]);
            setNewPreviews([]);
        }

        if (mode === 'create') {
            reset();
            setNewImages([]);
            setNewPreviews([]);
        }
    }, [room, mode]);
    console.log('New images to upload:', newImages);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const form = new FormData();

        // Append all form fields except images
        form.append('hotel_location_id', String(data.hotel_location_id));
        form.append('hotel_floor_id', String(data.hotel_floor_id));
        form.append('room_type_id', String(data.room_type_id));
        form.append('room_number', data.room_number);
        form.append('name', data.name || '');
        form.append('base_price', String(data.base_price));
        form.append('status', data.status);
        form.append('is_active', data.is_active ? '1' : '0');
        form.append('note', data.note || '');

        // Append images separately
        newImages.forEach((file, index) => {
            form.append(`images[${index}]`, file);
        });

        const url =
            mode === 'edit' ? rooms.update(data.id).url : rooms.store().url;

        if (mode === 'edit') {
            form.append('_method', 'PUT');
        }

        post(url, {
            data: form,
            forceFormData: true,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onSuccess: () => {
                reset();
                setNewImages([]);
                setNewPreviews([]);
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'view'
                            ? 'View Room'
                            : mode === 'edit'
                              ? 'Edit Room'
                              : 'Create Room'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* EXISTING IMAGES */}
                    {room?.images && room.images.length > 0 && (
                        <Card>
                            <CardContent className="p-2">
                                <h3 className="mb-2 text-sm font-medium">
                                    Existing Images
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {room.images.map((img, index) => (
                                        <div
                                            key={`existing-${index}`}
                                            className="relative"
                                        >
                                            <img
                                                src={`/storage/${img}`}
                                                className="h-24 w-full rounded object-cover"
                                                alt={`Room image ${index + 1}`}
                                            />
                                            {mode !== 'view' && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="destructive"
                                                    className="absolute top-1 right-1"
                                                    onClick={() =>
                                                        removeNewImage(index)
                                                    }
                                                >
                                                    <X size={14} />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* NEW IMAGES */}
                    {mode !== 'view' && newPreviews.length > 0 && (
                        <Card>
                            <CardContent className="p-2">
                                <h3 className="mb-2 text-sm font-medium">
                                    New Images
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {newPreviews.map((preview, index) => (
                                        <div
                                            key={`new-${index}`}
                                            className="relative"
                                        >
                                            <img
                                                src={preview}
                                                className="h-24 w-full rounded object-cover"
                                                alt={`New image ${index + 1}`}
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="destructive"
                                                className="absolute top-1 right-1"
                                                onClick={() =>
                                                    removeNewImage(index)
                                                }
                                            >
                                                <X size={14} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* IMAGE UPLOAD */}
                    {mode !== 'view' && (
                        <div>
                            <Input
                                type="file"
                                multiple
                                onChange={handleImageUpload}
                                className="mb-2"
                            />
                            <p className="text-xs text-gray-500">
                                Upload multiple images. Click on images to
                                remove them.
                            </p>
                        </div>
                    )}

                    {/* BASIC FIELDS */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Room Number <span className="text-red-600">*</span>
                        </label>
                        <Input
                            value={data.room_number}
                            onChange={(e) =>
                                setData('room_number', e.target.value)
                            }
                            placeholder="Room Number"
                            disabled={mode === 'view'}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Room Name{' '}
                            <span className="text-gray-400">(Optional)</span>
                        </label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Room Name"
                            disabled={mode === 'view'}
                        />
                    </div>

                    {/* LOCATION */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Location
                        </label>
                        <select
                            value={data.hotel_location_id.toString()}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                setData('hotel_location_id', value);
                            }}
                            className="w-full rounded border p-2"
                        >
                            <option value="">Select Location</option>
                            {locationOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* FLOOR */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Floor
                        </label>
                        <select
                            value={data.hotel_floor_id.toString()}
                            onChange={(e) =>
                                setData(
                                    'hotel_floor_id',
                                    parseInt(e.target.value),
                                )
                            }
                            className="w-full rounded border p-2"
                        >
                            <option value="">Select Floor</option>
                            {floorOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ROOM TYPE */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Room Type
                        </label>
                        <select
                            value={data.room_type_id.toString()}
                            onChange={(e) =>
                                setData(
                                    'room_type_id',
                                    parseInt(e.target.value),
                                )
                            }
                            className="w-full rounded border p-2"
                        >
                            <option value="">Select Room Type</option>
                            {typeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* BASE PRICE */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Base Price
                        </label>
                        <Input
                            type="number"
                            value={data.base_price}
                            onChange={(e) =>
                                setData(
                                    'base_price',
                                    parseFloat(e.target.value),
                                )
                            }
                            placeholder="Base Price"
                            disabled={mode === 'view'}
                        />
                    </div>

                    {/* STATUS */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Status
                        </label>
                        <select
                            value={data.status}
                            onChange={(e) =>
                                setData('status', e.target.value as any)
                            }
                            disabled={mode === 'view'}
                            className="w-full rounded border p-2"
                        >
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>

                    {/* IS ACTIVE */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) =>
                                setData('is_active', e.target.checked)
                            }
                            disabled={mode === 'view'}
                        />
                        <label className="text-sm">Active</label>
                    </div>

                    {/* NOTES */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Room Special Note{' '}
                            <span className="text-gray-400">(Optional)</span>
                        </label>
                        <Textarea
                            value={data.note}
                            onChange={(e) => setData('note', e.target.value)}
                            placeholder="Notes"
                            disabled={mode === 'view'}
                        />
                    </div>

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
