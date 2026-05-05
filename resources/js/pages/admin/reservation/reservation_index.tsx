import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Eye, Edit, Plus, X, Bed, Users, DollarSign } from 'lucide-react';
import ReservationModal from '@/components/reservation-modals/reservation_modal';

type Reservation = {
    id: number;
    guest_id: number;
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
            hotel_location_id: number;
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
    hotel_location_id: number;
    status: string;
    hotel_location?: HotelLocation;
};

type HotelLocation = {
    id: number;
    name: string;
    area: string;
    rooms: Room[];
};

type Availability = {
    room_id: number;
    available: boolean;
    blocked_dates: string[];
};

type Props = {
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

export default function ReservationIndex({
    reservations = { data: [], links: [] },
    filters = {},
    hotelLocations = [],
    rooms = [],
    availability = [],
}: Props) {
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState(filters.search || '');
    const [from, setFrom] = useState(filters.from || '');
    const [to, setTo] = useState(filters.to || '');
    const [status, setStatus] = useState(filters.status || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState<'create' | 'edit' | 'show'>('create');
    const [selectedReservation, setSelectedReservation] =
        useState<Reservation | null>(null);
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

    const handleModalSubmit = (data: any) => {
        if (mode === 'create') {
            router.post('/reservations', data, {
                onSuccess: () => setIsModalOpen(false),
                onError: (errors) => console.error(errors),
            });
        } else if (mode === 'edit' && selectedReservation) {
            router.put(`/reservations/${selectedReservation.id}`, data, {
                onSuccess: () => setIsModalOpen(false),
                onError: (errors) => console.error(errors),
            });
        }
    };

    const openCreateModal = () => {
        setMode('create');
        setSelectedReservation(null);
        setIsModalOpen(true);
    };

    // Open modal for edit
    const openEditModal = (reservation: Reservation) => {
        setMode('edit');
        setSelectedReservation(reservation);
        setIsModalOpen(true);
    };

    // Open modal for show
    const openShowModal = (reservation: Reservation) => {
        setMode('show');
        setSelectedReservation(reservation);
        setIsModalOpen(true);
    };

    // Initialize form for create mode
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
        }
    }, [mode, isModalOpen]);

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

        if (
            !selectedLocation ||
            !selectedRooms.length ||
            !startDate ||
            !endDate
        ) {
            alert('Please fill in all required fields');
            return;
        }

        const reservationData = {
            hotel_location_id: selectedLocation,
            room_ids: selectedRooms,
            booking_type: bookingType,
            start_at: startDate,
            end_at: endDate,
            adults,
            children,
            requires_medical: requiresMedical,
            note,
        };

        if (mode === 'create') {
            router.post('/reservations', reservationData, {
                onSuccess: () => setIsModalOpen(false),
                onError: (errors) => console.error(errors),
            });
        } else if (mode === 'edit' && selectedReservation) {
            router.put(
                `/reservations/${selectedReservation.id}`,
                reservationData,
                {
                    onSuccess: () => setIsModalOpen(false),
                    onError: (errors) => console.error(errors),
                },
            );
        }
    };

    // Open modal for edit

    // Open modal for show

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                '/reservations',
                { search, from, to, status },
                { preserveState: true, replace: true },
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [search, from, to, status]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'checked_in':
                return 'bg-green-100 text-green-800';
            case 'checked_out':
                return 'bg-gray-100 text-gray-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <>
            <Head title="Reservations" />

            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Reservations</h1>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                    >
                        <Plus className="mr-2" size={16} />
                        New Reservation
                    </button>
                </div>

                {/* 🔍 FILTERS */}
                <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                    <input
                        type="text"
                        placeholder="Search guest / room / status..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="rounded border px-3 py-2"
                    />

                    <input
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="rounded border px-3 py-2"
                    />

                    <input
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="rounded border px-3 py-2"
                    />

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded border px-3 py-2"
                    >
                        <option value="">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="checked_in">Checked In</option>
                        <option value="checked_out">Checked Out</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* 📊 TABLE */}
                <div className="overflow-x-auto rounded bg-white shadow">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">#</th>
                                <th className="p-3 text-left">Guest</th>
                                <th className="p-3 text-left">Rooms</th>
                                <th className="p-3 text-left">Booking</th>
                                <th className="p-3 text-left">Dates</th>
                                <th className="p-3 text-left">Amount</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {reservations.data.map((res, i) => (
                                <tr key={res.id} className="border-t">
                                    <td className="p-3">{i + 1}</td>

                                    <td className="p-3">
                                        <div className="font-medium">
                                            {res.guest.first_name}{' '}
                                            {res.guest.last_name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {res.guest.phone}
                                        </div>
                                    </td>

                                    <td className="p-3">
                                        {res.rooms.map((r, idx) => (
                                            <div key={idx}>
                                                {r.room.room_number} (
                                                {r.room.hotel_location?.name})
                                            </div>
                                        ))}
                                    </td>

                                    <td className="p-3 capitalize">
                                        {res.booking_type}
                                    </td>

                                    <td className="p-3">
                                        <div>{res.start_at}</div>
                                        <div className="text-xs text-gray-500">
                                            → {res.end_at}
                                        </div>
                                    </td>

                                    <td className="p-3">
                                        ${' '}
                                        {parseFloat(res.total_amount).toFixed(
                                            2,
                                        )}
                                    </td>

                                    <td className="p-3">
                                        <span
                                            className={`rounded px-2 py-1 text-xs ${getStatusColor(res.status)}`}
                                        >
                                            {res.status}
                                        </span>
                                    </td>

                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => openShowModal(res)}
                                            className="mr-2 text-indigo-600 hover:text-indigo-800"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={() => openEditModal(res)}
                                            className="text-indigo-600 hover:text-indigo-800"
                                        >
                                            <Edit size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* 🔁 PAGINATION */}
                    <div className="flex gap-1 p-4">
                        {reservations.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() =>
                                    link.url && router.visit(link.url)
                                }
                                className={`rounded border px-3 py-1 ${
                                    link.active
                                        ? 'bg-indigo-600 text-white'
                                        : ''
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>

                {/* Reservation Modal */}
                {isModalOpen && (
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
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    {/* Hotel Location */}
                                    <div className="mb-4">
                                        <label className="mb-1 block text-sm font-medium">
                                            Hotel Location{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            value={selectedLocation || ''}
                                            onChange={(e) =>
                                                setSelectedLocation(
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="w-full rounded border px-3 py-2"
                                            disabled={mode === 'show'}
                                        >
                                            <option value="">
                                                Select Location
                                            </option>
                                            {hotelLocations.map((location) => (
                                                <option
                                                    key={location.id}
                                                    value={location.id}
                                                >
                                                    {location.name} -{' '}
                                                    {location.area}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Room Selection */}
                                    {selectedLocation && (
                                        <div className="mb-4">
                                            <label className="mb-1 block text-sm font-medium">
                                                Select Rooms{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                {filteredRooms.map((room) => (
                                                    <div
                                                        key={room.id}
                                                        className={`rounded border p-3 ${
                                                            selectedRooms.includes(
                                                                room.id,
                                                            )
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
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    if (
                                                                        e.target
                                                                            .checked
                                                                    ) {
                                                                        setSelectedRooms(
                                                                            [
                                                                                ...selectedRooms,
                                                                                room.id,
                                                                            ],
                                                                        );
                                                                        setAdults(
                                                                            (
                                                                                prev,
                                                                            ) => ({
                                                                                ...prev,
                                                                                [room.id]: 1,
                                                                            }),
                                                                        );
                                                                        setChildren(
                                                                            (
                                                                                prev,
                                                                            ) => ({
                                                                                ...prev,
                                                                                [room.id]: 0,
                                                                            }),
                                                                        );
                                                                    } else {
                                                                        setSelectedRooms(
                                                                            selectedRooms.filter(
                                                                                (
                                                                                    id,
                                                                                ) =>
                                                                                    id !==
                                                                                    room.id,
                                                                            ),
                                                                        );
                                                                        setAdults(
                                                                            (
                                                                                prev,
                                                                            ) => {
                                                                                const newAdults =
                                                                                    {
                                                                                        ...prev,
                                                                                    };
                                                                                delete newAdults[
                                                                                    room
                                                                                        .id
                                                                                ];
                                                                                return newAdults;
                                                                            },
                                                                        );
                                                                        setChildren(
                                                                            (
                                                                                prev,
                                                                            ) => {
                                                                                const newChildren =
                                                                                    {
                                                                                        ...prev,
                                                                                    };
                                                                                delete newChildren[
                                                                                    room
                                                                                        .id
                                                                                ];
                                                                                return newChildren;
                                                                            },
                                                                        );
                                                                    }
                                                                }}
                                                                disabled={
                                                                    mode ===
                                                                        'show' ||
                                                                    !isRoomAvailable(
                                                                        room.id,
                                                                    )
                                                                }
                                                            />
                                                            <label
                                                                htmlFor={`room-${room.id}`}
                                                                className="ml-2 cursor-pointer"
                                                            >
                                                                <Bed className="mr-1 inline" />
                                                                {
                                                                    room.room_number
                                                                }{' '}
                                                                - {room.name}
                                                                {!isRoomAvailable(
                                                                    room.id,
                                                                ) && (
                                                                    <span className="ml-2 text-red-500">
                                                                        Not
                                                                        Available
                                                                    </span>
                                                                )}
                                                            </label>
                                                        </div>

                                                        {selectedRooms.includes(
                                                            room.id,
                                                        ) && (
                                                            <div className="mt-2 ml-6">
                                                                <div className="mb-1 flex items-center">
                                                                    <Users
                                                                        className="mr-1"
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                    <label className="text-sm">
                                                                        Adults:
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        value={
                                                                            adults[
                                                                                room
                                                                                    .id
                                                                            ] ||
                                                                            1
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setAdults(
                                                                                (
                                                                                    prev,
                                                                                ) => ({
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
                                                                        className="ml-2 w-16 rounded border px-2 py-1 text-sm"
                                                                        disabled={
                                                                            mode ===
                                                                            'show'
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <Users
                                                                        className="mr-1"
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                    <label className="text-sm">
                                                                        Children:
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={
                                                                            children[
                                                                                room
                                                                                    .id
                                                                            ] ||
                                                                            0
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setChildren(
                                                                                (
                                                                                    prev,
                                                                                ) => ({
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
                                                                        className="ml-2 w-16 rounded border px-2 py-1 text-sm"
                                                                        disabled={
                                                                            mode ===
                                                                            'show'
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
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <div className="flex space-x-4">
                                            {(
                                                [
                                                    'hourly',
                                                    'daily',
                                                    'weekly',
                                                ] as const
                                            ).map((type) => (
                                                <label
                                                    key={type}
                                                    className="flex items-center"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="booking_type"
                                                        value={type}
                                                        checked={
                                                            bookingType === type
                                                        }
                                                        onChange={() =>
                                                            setBookingType(type)
                                                        }
                                                        className="mr-2"
                                                        disabled={
                                                            mode === 'show'
                                                        }
                                                    />
                                                    {type
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        type.slice(1)}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium">
                                                Start Date{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
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
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={endDate}
                                                onChange={(e) =>
                                                    setEndDate(e.target.value)
                                                }
                                                className="w-full rounded border px-3 py-2"
                                                disabled={mode === 'show'}
                                            />
                                        </div>
                                    </div>

                                    {/* Medical Requirement */}
                                    <div className="mb-4">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={requiresMedical}
                                                onChange={(e) =>
                                                    setRequiresMedical(
                                                        e.target.checked,
                                                    )
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
                                            onChange={(e) =>
                                                setNote(e.target.value)
                                            }
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
                                        <div className="flex items-center text-lg font-semibold">
                                            <DollarSign className="mr-1" />
                                            {totalAmount.toFixed(2)}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsModalOpen(false)
                                            }
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
                )}
            </div>
            <ReservationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={mode}
                reservation={selectedReservation}
                hotelLocations={hotelLocations}
                rooms={rooms}
                availability={availability}
                onSubmit={handleModalSubmit}
            />
        </>
    );
}
