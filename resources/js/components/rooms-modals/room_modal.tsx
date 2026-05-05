import { Head, useForm } from '@inertiajs/react';
import { Eye, PenBoxIcon, Plus, Trash2Icon } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import rooms from '@/routes/rooms';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { error } from 'console';

type Room = {
    id: number;
    room_number: string;
    name: string | null;
    base_price: number;
    status: 'available' | 'occupied' | 'maintenance';
    is_active: boolean;
    images: string[];
    hotel_location: {
        id: number;
        name: string;
    };
    hotel_floor: {
        id: number;
        floor_number: string;
        hotel_location_id: number;
    };
    room_type: {
        id: number;
        name: string;
        base_price: number;
    };
    hotel_location_id: number | '';
    hotel_floor_id: number | '';
    room_type_id: number | '';
    note?: string;
};

type HotelFloor = {
    id: number;
    hotel_location_id: number;
    floor_number: number;
    name: string;
};

type HotelLocation = {
    id: number;
    name: string;
};

type RoomType = {
    id: number;
    name: string;
    base_price: number;
};

type RoomModalProps = {
    isOpen: boolean;
    onClose: () => void;
    room?: Room | null;
    mode: 'view' | 'edit' | 'create';
    hotelLocations: HotelLocation[];
    hotelFloors: HotelFloor[];
    roomTypes: RoomType[];
};

export default function RoomModal({
    isOpen,
    onClose,
    room,
    mode,
    hotelLocations,
    hotelFloors,
    roomTypes,
}: RoomModalProps) {
    const { data, setData, post, put, processing, reset, errors } = useForm({
        id: room?.id || 0,
        hotel_location_id: room?.hotel_location_id || '',
        hotel_floor_id: room?.hotel_floor_id || '',
        room_type_id: room?.room_type_id || '',
        room_number: room?.room_number || '',
        name: room?.name || '',
        base_price: room?.base_price || 0,
        status: room?.status || 'available',
        is_active: room?.is_active ?? true,
        note: room?.note || '',
        images: [] as File[],
    });

    const [filteredFloors, setFilteredFloors] = useState<HotelFloor[]>([]);
    const [existingImagePaths, setExistingImagePaths] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isPriceManual, setIsPriceManual] = useState(false);

    useEffect(() => {
        if (data.hotel_location_id) {
            setFilteredFloors(
                hotelFloors.filter(
                    (floor) =>
                        floor.hotel_location_id ===
                        Number(data.hotel_location_id),
                ),
            );
        } else {
            setFilteredFloors([]);
        }
    }, [data.hotel_location_id, hotelFloors]);

    useEffect(() => {
        if (isOpen) {
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
                    images: [],
                });
                setExistingImagePaths(room.images);
                setNewImages([]);
                setPreviews(room.images.map((img) => `/storage/${img}`));
            } else {
                reset();
                setExistingImagePaths([]);
                setNewImages([]);
                setPreviews([]);
            }
        }
    }, [isOpen, room, mode]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter((file) =>
            file.type.startsWith('image/'),
        );

        if (validFiles.length !== files.length) {
            alert('Some files are not valid images');
        }

        setNewImages((prev) => [...prev, ...validFiles]);

        const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
        setPreviews((prev) => [...prev, ...newPreviews]);
    };

    const removeNewImage = (index: number) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));

        setPreviews((prev) => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const removeExistingImage = (index: number) => {
        const path = existingImagePaths[index];
        setExistingImagePaths((prev) => prev.filter((_, i) => i !== index));

        setPreviews((prev) => {
            const newPreviews = prev.filter((p) => p !== `/storage/${path}`);

            prev.forEach((url) => URL.revokeObjectURL(url));
            return newPreviews.map((p) =>
                p.startsWith('blob:')
                    ? p
                    : `/storage/${existingImagePaths.find((ep) => `/storage/${ep}` === p)}` ||
                      p,
            );
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();

        Object.keys(data).forEach((key) => {
            if (key !== 'images') {
                formData.append(key, String(data[key as keyof typeof data]));
            }
        });

        formData.append('existing_images', JSON.stringify(existingImagePaths));

        newImages.forEach((file) => {
            formData.append('images[]', file);
        });

        if (mode === 'edit' && room) {
            router.put(rooms.update(room.id).url, formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: onClose,
            });
        } else {
            router.post(rooms.store().url, formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: onClose,
            });
        }
    };
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-7xl overflow-y-auto">
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
                    <div>
                        <Label>Room Images</Label>

                        <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                            {previews.map((preview, index) => (
                                <div
                                    key={`image-${index}`}
                                    className="relative"
                                >
                                    <img
                                        src={preview}
                                        className="h-24 w-full rounded-lg object-cover"
                                        alt={`Room image ${index + 1}`}
                                    />

                                    {mode === 'edit' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (
                                                    preview.startsWith(
                                                        '/storage/',
                                                    )
                                                ) {
                                                    removeExistingImage(index);
                                                } else {
                                                    removeNewImage(index);
                                                }
                                            }}
                                            className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white"
                                        >
                                            <Trash2Icon size={16} />
                                        </button>
                                    )}
                                    {errors.images && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.images}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {mode !== 'view' && (
                            <label className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:bg-gray-50">
                                <Plus className="text-gray-400" size={24} />
                                <span className="mt-1 text-sm text-gray-600">
                                    Add Image
                                </span>

                                <input
                                    type="file"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </label>
                        )}
                        {errors.images && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.images}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <Label htmlFor="hotel_location_id">
                                Hotel Location
                            </Label>
                            <select
                                id="hotel_location_id"
                                value={data.hotel_location_id}
                                onChange={(e) =>
                                    setData('hotel_location_id', e.target.value)
                                }
                                disabled={mode === 'view'}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                            >
                                <option value="">Select Location</option>
                                {hotelLocations.map((location) => (
                                    <option
                                        key={location.id}
                                        value={location.id}
                                    >
                                        {location.name}
                                    </option>
                                ))}
                            </select>
                            {errors.hotel_location_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.hotel_location_id}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="hotel_floor_id">Floor</Label>
                            <select
                                id="hotel_floor_id"
                                value={data.hotel_floor_id}
                                onChange={(e) =>
                                    setData('hotel_floor_id', e.target.value)
                                }
                                disabled={
                                    mode === 'view' || !data.hotel_location_id
                                }
                                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                            >
                                <option value="">Select Floor</option>
                                {filteredFloors.map((floor) => (
                                    <option key={floor.id} value={floor.id}>
                                        Floor {floor.floor_number}
                                    </option>
                                ))}
                            </select>
                            {errors.hotel_floor_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.hotel_floor_id}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="room_type_id">Room Type</Label>
                            <select
                                id="room_type_id"
                                value={data.room_type_id}
                                onChange={(e) => {
                                    const selectedId = Number(e.target.value);

                                    setData('room_type_id', selectedId);

                                    const selectedType = roomTypes.find(
                                        (type) => type.id === selectedId,
                                    );

                                    if (selectedType) {
                                        setData(
                                            'base_price',
                                            selectedType.base_price,
                                        );
                                    }
                                }}
                                disabled={mode === 'view'}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                            >
                                <option value="">Select Type</option>
                                {roomTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                            {errors.room_type_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.room_type_id}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="room_number">Room Number</Label>
                            <Input
                                id="room_number"
                                value={data.room_number}
                                onChange={(e) =>
                                    setData('room_number', e.target.value)
                                }
                                disabled={mode === 'view'}
                            />
                            {errors.room_number && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.room_number}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="name">Room Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                disabled={mode === 'view'}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="base_price">Base Price (BDT)</Label>
                            <Input
                                id="base_price"
                                type="number"
                                value={data.base_price}
                                onChange={(e) => {
                                    setIsPriceManual(true);
                                    setData(
                                        'base_price',
                                        parseFloat(e.target.value),
                                    );
                                }}
                                disabled={mode === 'view'}
                            />
                        </div>

                        <div>
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) =>
                                    setData('status', e.target.value as any)
                                }
                                disabled={mode === 'view'}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                            >
                                <option value="available">Available</option>
                                <option value="occupied">Occupied</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                            {errors.status && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.status}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center">
                            <Checkbox
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) =>
                                    setData('is_active', Boolean(checked))
                                }
                                disabled={mode === 'view'}
                            />
                            <Label htmlFor="is_active" className="ml-2">
                                Active
                            </Label>
                            {errors.is_active && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.is_active}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="note">Notes</Label>
                        <Textarea
                            id="note"
                            value={data.note}
                            onChange={(e) => setData('note', e.target.value)}
                            disabled={mode === 'view'}
                        />
                        {errors.note && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.note}
                            </p>
                        )}
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
