import hotel_floors from '@/routes/hotel_floors';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { HotelLocation } from '@/types';

type HotelFloor = {
    id: number;
    hotel_location_id: number;
    name: string;
    floor_number: number;
    purpose: string;
    note: string;
    is_active: boolean;
};

type HotelFloorModalProps = {
    isOpen: boolean;
    onClose: () => void;
    hotelFloor?: HotelFloor | null;
    hotel_locations: HotelLocation[];
    mode: 'view' | 'edit' | 'create';
};

type FormData = {
    id: number;
    hotel_location_id: number;
    name: string;
    floor_number: number;
    purpose: string;
    note: string;
    is_active: boolean;
};

export default function HotelFloorModal({
    isOpen,
    onClose,
    hotelFloor,
    hotel_locations,
    mode,
}: HotelFloorModalProps) {
    const { data, setData, post, put, processing, reset, errors } =
        useForm<FormData>({
            id: hotelFloor?.id || 0,
            hotel_location_id: hotelFloor?.hotel_location_id || 0,
            name: hotelFloor?.name || '',
            floor_number: hotelFloor?.floor_number || 0,
            purpose: hotelFloor?.purpose || 'rooms',
            note: hotelFloor?.note || '',
            is_active: hotelFloor?.is_active ?? true,
        });

    useEffect(() => {
        if (hotelFloor && mode !== 'create') {
            setData({
                id: hotelFloor.id,
                hotel_location_id: hotelFloor.hotel_location_id,
                name: hotelFloor.name,
                floor_number: hotelFloor.floor_number,
                purpose: hotelFloor.purpose,
                note: hotelFloor.note,
                is_active: hotelFloor.is_active,
            });
        }

        if (mode === 'create') {
            reset();
        }
    }, [hotelFloor, mode]);

    const handleInputChange = (
        field: keyof FormData,
        value: string | number | boolean,
    ) => {
        setData(field, value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'create') {
            post(hotel_floors.store().url, {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }

        if (mode === 'edit' && hotelFloor) {
            put(hotel_floors.update(hotelFloor.id).url, {
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
                            ? 'View Floor'
                            : mode === 'edit'
                              ? 'Edit Floor'
                              : 'Create Floor'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label>Hotel Location</Label>
                        <select
                            value={data.hotel_location_id}
                            onChange={(e) =>
                                handleInputChange(
                                    'hotel_location_id',
                                    Number(e.target.value),
                                )
                            }
                            disabled={mode === 'view'}
                            className="w-full rounded-md border p-2"
                        >
                            <option value="">Select Location</option>
                            {/* You will pass locations from controller */}
                            {hotel_locations.map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.name}
                                </option>
                            ))}
                        </select>
                        {errors.hotel_location_id && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.hotel_location_id}
                            </p>
                        )}
                    </div>
                    {/* Name */}
                    <div>
                        <Label>Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) =>
                                handleInputChange('name', e.target.value)
                            }
                            disabled={mode === 'view'}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Floor Number */}
                    <div>
                        <Label>Floor Number</Label>
                        <Input
                            type="number"
                            value={data.floor_number}
                            onChange={(e) =>
                                handleInputChange(
                                    'floor_number',
                                    Number(e.target.value),
                                )
                            }
                            disabled={mode === 'view'}
                        />
                        {errors.floor_number && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.floor_number}
                            </p>
                        )}
                    </div>

                    {/* Purpose */}
                    <div>
                        <Label>Purpose</Label>
                        <select
                            value={data.purpose}
                            onChange={(e) =>
                                handleInputChange('purpose', e.target.value)
                            }
                            disabled={mode === 'view'}
                            className="w-full rounded-md border p-2"
                        >
                            <option value="rooms">Rooms</option>
                            <option value="vip_rooms">VIP Rooms</option>
                            <option value="suites">Suites</option>
                            <option value="hall">Hall</option>
                            <option value="mixed">Mixed</option>
                        </select>
                        {errors.purpose && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.purpose}
                            </p>
                        )}
                    </div>

                    {/* Note */}
                    <div>
                        <Label>Note</Label>
                        <Textarea
                            value={data.note}
                            onChange={(e) =>
                                handleInputChange('note', e.target.value)
                            }
                            disabled={mode === 'view'}
                        />
                        {errors.note && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.note}
                            </p>
                        )}
                    </div>

                    {/* Active */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            checked={data.is_active}
                            onCheckedChange={(checked) =>
                                handleInputChange('is_active', Boolean(checked))
                            }
                            disabled={mode === 'view'}
                        />
                        <span className="text-sm">
                            {data.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {errors.is_active && (
                            <p className="text-sm text-red-500">
                                {errors.is_active}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
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
