import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Eye,
    Calendar,
    MapPin,
    Bed,
    Users,
    DollarSign,
    FileText,
    X,
    Edit,
} from 'lucide-react';

type Reservation = {
    id: number;
    status: string;
    booking_type: string;
    start_at: string;
    end_at: string;
    total_amount: string;
    requires_medical: boolean;
    note?: string;

    guest: {
        first_name: string;
        last_name?: string;
        phone: string;
    };

    rooms: {
        room: {
            id: number;
            room_number: string;
            name: string;
            hotel_location?: {
                id: number;
                name: string;
            };
        };
        adults: number;
        children: number;
        price_per_unit: number;
        units: number;
        subtotal: number;
    }[];
};

type Room = {
    id: number;
    room_number: string;
    name: string;
    base_price: number;
    status: string;
    hotel_location_id: number;
    hotel_location?: HotelLocation;
};

type HotelLocation = {
    id: number;
    name: string;
    area: string;
    address: string;
    room: Room[];
};

type Availability = {
    room_id: number;
    available: boolean;
    blocked_dates: string[];
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit' | 'show';
    reservation?: Reservation;
    onSubmit: (data: any) => void;
    reservations: {
        data: Reservation[];
        links: any[];
    };
    filters: {
        search?: string;
        from?: string;
        to?: string;
        status?: string;
    };
    hotelLocations: HotelLocation[];
    rooms: Room[];
    availability: Availability[];
};

export default function ReservationModal({
    isOpen,
    onClose,
    mode,
    reservation,
    hotelLocations,
    rooms,
    availability,
    onSubmit,
}: Props) {
    const [selectedLocation, setSelectedLocation] = useState<number | null>(
        null,
    );
    const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
    const [bookingType, setBookingType] = useState<
        'hourly' | 'daily' | 'weekly'
    >('daily');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [adults, setAdults] = useState<{ [key: number]: number }>({});
    const [children, setChildren] = useState<{ [key: number]: number }>({});
    const [requiresMedical, setRequiresMedical] = useState(false);
    const [note, setNote] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // NEW STATES
    const [phone, setPhone] = useState('');
    const [guest, setGuest] = useState<any>(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [nid, setNid] = useState('');
    const [passport, setPassport] = useState('');
    const [docType, setDocType] = useState<
        'nid' | 'passport' | 'driving_license'
    >('nid');
    const [frontImage, setFrontImage] = useState<File | null>(null);
    const [backImage, setBackImage] = useState<File | null>(null);

    useEffect(() => {
        if (phone.length < 6) return;

        const delay = setTimeout(() => {
            router.get(
                '/guests/find',
                { phone },
                {
                    preserveState: true,
                    onSuccess: (page: any) => {
                        const found = page.props.guest;
                        if (found) {
                            setGuest(found);
                            setFirstName(found.first_name);
                            setLastName(found.last_name || '');
                        } else {
                            setGuest(null);
                        }
                    },
                },
            );
        }, 500);

        return () => clearTimeout(delay);
    }, [phone]);

    // Initialize form based on mode and reservation
    useEffect(() => {
        if (mode === 'create') {
            setSelectedLocation(null);
            setSelectedRooms([]);
            setBookingType('daily');
            setStartDate('');
            setEndDate('');
            setAdults({});
            setChildren({});
            setRequiresMedical(false);
            setNote('');
            setTotalAmount(0);
        } else if (mode === 'edit' && reservation) {
            setSelectedLocation(
                reservation.rooms[0]?.room.hotel_location?.id || null,
            );
            setSelectedRooms(reservation.rooms.map((r) => r.room.id));
            setBookingType(reservation.booking_type as any);
            setStartDate(reservation.start_at);
            setEndDate(reservation.end_at);

            const adultsMap: { [key: number]: number } = {};
            const childrenMap: { [key: number]: number } = {};
            reservation.rooms.forEach((r) => {
                adultsMap[r.room.id] = r.adults;
                childrenMap[r.room.id] = r.children;
            });
            setAdults(adultsMap);
            setChildren(childrenMap);
            setRequiresMedical(reservation.requires_medical);
            setNote(reservation.note || '');
        }
    }, [mode, reservation]);

    const generateCalendarDays = (year: number, month: number) => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];

        // padding before first day
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push(new Date(year, month, d));
        }

        return days;
    };

    const isBlockedDate = (date: Date) => {
        return selectedRooms.some((roomId) => {
            const roomAvailability = availability.find(
                (a) => a.room_id === roomId,
            );

            if (!roomAvailability) return false;

            return roomAvailability.blocked_dates.some(
                (d) => new Date(d).toDateString() === date.toDateString(),
            );
        });
    };

    const isInSelectedRange = (date: Date) => {
        if (!startDate || !endDate) return false;

        const d = date.getTime();
        return (
            d >= new Date(startDate).getTime() &&
            d <= new Date(endDate).getTime()
        );
    };

    // Filter rooms by selected location
    const filteredRooms = selectedLocation
        ? rooms.filter((room) => room.hotel_location_id === selectedLocation)
        : [];

    // Check room availability
    const isRoomAvailable = (roomId: number) => {
        if (!startDate || !endDate) return true;

        const roomAvailability = availability.find((a) => a.room_id === roomId);
        if (!roomAvailability) return true;

        if (!roomAvailability.available) return false;

        const start = new Date(startDate);
        const end = new Date(endDate);

        return !roomAvailability.blocked_dates.some((date) => {
            const blocked = new Date(date);
            return blocked >= start && blocked <= end;
        });
    };

    // Calculate total amount
    useEffect(() => {
        let total = 0;
        selectedRooms.forEach((roomId) => {
            const room = rooms.find((r) => r.id === roomId);
            if (room) {
                const units = calculateUnits(startDate, endDate, bookingType);
                const adultsCount = adults[roomId] || 1;
                const childrenCount = children[roomId] || 0;
                total +=
                    room.base_price *
                    units *
                    (adultsCount + childrenCount * 0.5);
            }
        });
        setTotalAmount(total);
    }, [
        selectedRooms,
        adults,
        children,
        startDate,
        endDate,
        bookingType,
        rooms,
    ]);

    // Calculate booking units
    const calculateUnits = (start: string, end: string, type: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (type) {
            case 'hourly':
                return diffDays * 24;
            case 'daily':
                return diffDays;
            case 'weekly':
                return Math.ceil(diffDays / 7);
            default:
                return diffDays;
        }
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!phone) {
            alert('Phone is required');
            return;
        }

        const formData = new FormData();

        formData.append('phone', phone);

        if (!guest) {
            formData.append('first_name', firstName);
            formData.append('last_name', lastName);
            formData.append('nid_no', nid);
            formData.append('passport_no', passport);
            formData.append('doc_type', docType);

            if (frontImage) formData.append('front_image', frontImage);
            if (backImage) formData.append('back_image', backImage);
        } else {
            formData.append('guest_id', guest.id);
        }

        formData.append('hotel_location_id', String(selectedLocation));
        formData.append('booking_type', bookingType);
        formData.append('start_at', startDate);
        formData.append('end_at', endDate);
        formData.append('requires_medical', requiresMedical ? '1' : '0');
        formData.append('note', note);

        selectedRooms.forEach((id, i) => {
            formData.append(`rooms[${i}][room_id]`, String(id));
            formData.append(`rooms[${i}][adults]`, String(adults[id] || 1));
            formData.append(`rooms[${i}][children]`, String(children[id] || 0));
        });

        router.post('/reservations', formData);
    };

    if (!isOpen) return null;

    const formatLocal = (date: Date) => {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    return (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white">
                <div className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-bold">
                            {mode === 'create'
                                ? 'Create Reservation'
                                : mode === 'edit'
                                  ? 'Edit Reservation'
                                  : 'Reservation Details'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Guest Info */}
                        <div className="mb-4 rounded border p-4">
                            <h3 className="mb-2 font-semibold">Guest Info</h3>

                            <input
                                type="text"
                                placeholder="Phone (required)"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="mb-2 w-full border px-3 py-2"
                            />

                            {guest ? (
                                <div className="text-sm text-green-600">
                                    Existing Guest: {guest.first_name}{' '}
                                    {guest.last_name}
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        placeholder="First Name"
                                        value={firstName}
                                        onChange={(e) =>
                                            setFirstName(e.target.value)
                                        }
                                        className="mb-2 w-full border px-3 py-2"
                                    />

                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        value={lastName}
                                        onChange={(e) =>
                                            setLastName(e.target.value)
                                        }
                                        className="mb-2 w-full border px-3 py-2"
                                    />

                                    <input
                                        type="text"
                                        placeholder="NID"
                                        value={nid}
                                        onChange={(e) => setNid(e.target.value)}
                                        className="mb-2 w-full border px-3 py-2"
                                    />

                                    <input
                                        type="text"
                                        placeholder="Passport"
                                        value={passport}
                                        onChange={(e) =>
                                            setPassport(e.target.value)
                                        }
                                        className="mb-2 w-full border px-3 py-2"
                                    />

                                    {/* Document */}
                                    <select
                                        value={docType}
                                        onChange={(e) =>
                                            setDocType(e.target.value as any)
                                        }
                                        className="mb-2 w-full border px-3 py-2"
                                    >
                                        <option value="nid">NID</option>
                                        <option value="passport">
                                            Passport
                                        </option>
                                        <option value="driving_license">
                                            Driving License
                                        </option>
                                    </select>

                                    <input
                                        type="file"
                                        onChange={(e) =>
                                            setFrontImage(
                                                e.target.files?.[0] || null,
                                            )
                                        }
                                        className="mb-2"
                                    />

                                    <input
                                        type="file"
                                        onChange={(e) =>
                                            setBackImage(
                                                e.target.files?.[0] || null,
                                            )
                                        }
                                    />
                                </>
                            )}
                        </div>
                        {/* Hotel Location */}
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium">
                                Hotel Location{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedLocation || ''}
                                onChange={(e) =>
                                    setSelectedLocation(Number(e.target.value))
                                }
                                className="w-full rounded border px-3 py-2"
                                disabled={mode === 'show'}
                            >
                                <option value="">Select Location</option>
                                {hotelLocations.map((location) => (
                                    <option
                                        key={location.id}
                                        value={location.id}
                                    >
                                        {location.name} - {location.area}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Room Selection */}
                        {selectedLocation && (
                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium">
                                    Select Rooms{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    {filteredRooms.map((room) => (
                                        <div
                                            key={room.id}
                                            className={`rounded border p-3 ${
                                                selectedRooms.includes(room.id)
                                                    ? 'border-indigo-500 bg-indigo-50'
                                                    : ''
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`room-${room.id}`}
                                                    checked={selectedRooms.includes(
                                                        room.id,
                                                    )}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedRooms([
                                                                ...selectedRooms,
                                                                room.id,
                                                            ]);
                                                            setAdults(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [room.id]: 1,
                                                                }),
                                                            );
                                                            setChildren(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [room.id]: 0,
                                                                }),
                                                            );
                                                        } else {
                                                            setSelectedRooms(
                                                                selectedRooms.filter(
                                                                    (id) =>
                                                                        id !==
                                                                        room.id,
                                                                ),
                                                            );
                                                            setAdults(
                                                                (prev) => {
                                                                    const newAdults =
                                                                        {
                                                                            ...prev,
                                                                        };
                                                                    delete newAdults[
                                                                        room.id
                                                                    ];
                                                                    return newAdults;
                                                                },
                                                            );
                                                            setChildren(
                                                                (prev) => {
                                                                    const newChildren =
                                                                        {
                                                                            ...prev,
                                                                        };
                                                                    delete newChildren[
                                                                        room.id
                                                                    ];
                                                                    return newChildren;
                                                                },
                                                            );
                                                        }
                                                    }}
                                                    disabled={
                                                        mode === 'show' ||
                                                        !isRoomAvailable(
                                                            room.id,
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor={`room-${room.id}`}
                                                    className="ml-2 cursor-pointer"
                                                >
                                                    {room.room_number} -{' '}
                                                    {room.name}
                                                    {!isRoomAvailable(
                                                        room.id,
                                                    ) && (
                                                        <span className="ml-2 text-red-500">
                                                            Not Available
                                                        </span>
                                                    )}
                                                </label>
                                            </div>

                                            {selectedRooms.includes(
                                                room.id,
                                            ) && (
                                                <div className="mt-2 ml-6">
                                                    <div className="mb-1 flex items-center">
                                                        <label className="mr-2 text-sm">
                                                            Adults:
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={
                                                                adults[
                                                                    room.id
                                                                ] || 1
                                                            }
                                                            onChange={(e) =>
                                                                setAdults(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        [room.id]:
                                                                            parseInt(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ) ||
                                                                            1,
                                                                    }),
                                                                )
                                                            }
                                                            className="w-16 rounded border px-2 py-1 text-sm"
                                                            disabled={
                                                                mode === 'show'
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex items-center">
                                                        <label className="mr-2 text-sm">
                                                            Children:
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                children[
                                                                    room.id
                                                                ] || 0
                                                            }
                                                            onChange={(e) =>
                                                                setChildren(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        [room.id]:
                                                                            parseInt(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ) ||
                                                                            0,
                                                                    }),
                                                                )
                                                            }
                                                            className="w-16 rounded border px-2 py-1 text-sm"
                                                            disabled={
                                                                mode === 'show'
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Booking Type */}
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium">
                                Booking Type{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="flex space-x-4">
                                {(['hourly', 'daily', 'weekly'] as const).map(
                                    (type) => (
                                        <label
                                            key={type}
                                            className="flex items-center"
                                        >
                                            <input
                                                type="radio"
                                                name="booking_type"
                                                value={type}
                                                checked={bookingType === type}
                                                onChange={() =>
                                                    setBookingType(type)
                                                }
                                                className="mr-2"
                                                disabled={mode === 'show'}
                                            />
                                            {type.charAt(0).toUpperCase() +
                                                type.slice(1)}
                                        </label>
                                    ),
                                )}
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Start Date{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                    className="w-full rounded border px-3 py-2"
                                    disabled={mode === 'show'}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    End Date{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full rounded border px-3 py-2"
                                    disabled={mode === 'show'}
                                />
                            </div>
                        </div>
                        <div className="mb-6">
                            <h3 className="mb-2 font-semibold">
                                Availability Calendar
                            </h3>

                            {/* Month Controls */}
                            <div className="mb-2 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentMonth(
                                            new Date(
                                                currentMonth.getFullYear(),
                                                currentMonth.getMonth() - 1,
                                                1,
                                            ),
                                        )
                                    }
                                >
                                    ←
                                </button>

                                <span className="font-medium">
                                    {currentMonth.toLocaleString('default', {
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentMonth(
                                            new Date(
                                                currentMonth.getFullYear(),
                                                currentMonth.getMonth() + 1,
                                                1,
                                            ),
                                        )
                                    }
                                >
                                    →
                                </button>
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                                {[
                                    'Sun',
                                    'Mon',
                                    'Tue',
                                    'Wed',
                                    'Thu',
                                    'Fri',
                                    'Sat',
                                ].map((d) => (
                                    <div key={d} className="font-medium">
                                        {d}
                                    </div>
                                ))}

                                {generateCalendarDays(
                                    currentMonth.getFullYear(),
                                    currentMonth.getMonth(),
                                ).map((date, i) => {
                                    if (!date)
                                        return (
                                            <div key={i} className="p-2"></div>
                                        );

                                    const blocked = isBlockedDate(date);
                                    const selected = isInSelectedRange(date);

                                    return (
                                        <div
                                            key={i}
                                            className={`cursor-pointer rounded p-2 ${blocked ? 'bg-red-200 text-red-700' : ''} ${selected ? 'bg-green-200' : ''} ${!blocked && !selected ? 'hover:bg-gray-100' : ''} `}
                                            onClick={() => {
                                                if (mode === 'show') return;
                                                if (blocked) return;

                                                const iso = date
                                                    .toISOString()
                                                    .slice(0, 16);

                                                if (!startDate)
                                                    setStartDate(iso);
                                                else if (!endDate)
                                                    setEndDate(iso);
                                                else {
                                                    setStartDate(iso);
                                                    setEndDate('');
                                                }
                                            }}
                                        >
                                            {date.getDate()}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-2 flex gap-4 text-xs">
                                <span className="text-red-600">■ Blocked</span>
                                <span className="text-green-600">
                                    ■ Selected
                                </span>
                            </div>
                        </div>

                        {/* Medical Requirement */}
                        <div className="mb-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={requiresMedical}
                                    onChange={(e) =>
                                        setRequiresMedical(e.target.checked)
                                    }
                                    className="mr-2"
                                    disabled={mode === 'show'}
                                />
                                Requires Medical Attention
                            </label>
                        </div>

                        {/* Notes */}
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium">
                                Notes
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full rounded border px-3 py-2"
                                rows={3}
                                disabled={mode === 'show'}
                            />
                        </div>

                        {/* Total Amount */}
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium">
                                Total Amount
                            </label>
                            <div className="text-lg font-semibold">
                                ${totalAmount.toFixed(2)}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded border px-4 py-2 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            {mode !== 'show' && (
                                <button
                                    type="submit"
                                    className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                                >
                                    {mode === 'create'
                                        ? 'Create Reservation'
                                        : 'Update Reservation'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
