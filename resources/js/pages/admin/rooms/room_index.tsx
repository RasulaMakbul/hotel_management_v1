import { Head, useForm } from '@inertiajs/react';
import { BreadcrumbItem, HotelFloor, HotelLocation, RoomType } from '@/types';
import { Eye, PenBoxIcon, Plus, Trash2Icon } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import rooms from '@/routes/rooms';
import RoomModal from '@/components/rooms-modals/room_modal';

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
    };
    hotel_location_id: number;
    hotel_floor_id: number;
    room_type_id: number;
    note?: string;
};

type PaginatedRooms = {
    data: Room[];
    links: any[];
};

interface RoomIndexProps {
    rooms: PaginatedRooms;
    hotelLocations: HotelLocation[];
    hotelFloors: HotelFloor[];
    roomTypes: RoomType[];

    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
        roles: string[];
        permissions: string[];
    };
    filters: {
        search?: string;
    };
}

export default function RoomIndex(props: RoomIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Rooms', href: rooms.index() },
    ];

    // const { rooms: roomsData = { data: [], links: [] }, auth, filters } = props;
    const {
        rooms: roomsData = { data: [], links: [] },
        auth,
        filters,
        hotelLocations = [],
        hotelFloors = [],
        roomTypes = [],
    } = props;

    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>(
        'view',
    );
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                rooms.index(),
                { search: searchTerm },
                {
                    preserveState: true,
                    replace: true,
                },
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const { delete: destroy, patch } = useForm({});

    const openModal = (
        room: Room | null = null,
        mode: 'view' | 'edit' | 'create' = 'view',
    ) => {
        setModalMode(mode);
        setSelectedRoom(room);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRoom(null);
    };

    const handleDelete = (roomId: number) => {
        if (confirm('Are you sure you want to delete this room?')) {
            destroy(rooms.destroy(roomId).url, {
                onSuccess: () => {
                    alert('Room deleted successfully.');
                },
                onError: () => {
                    alert('Failed to delete room.');
                },
            });
        }
    };

    const toggleStatus = (room: Room) => {
        const action =
            room.status === 'available' ? 'occupy' : 'make available';

        if (confirm(`Are you sure you want to ${action} this room?`)) {
            patch(rooms.toggleStatus(room.id).url, {
                preserveScroll: true,
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 text-green-700 hover:bg-green-200';
            case 'occupied':
                return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
            case 'maintenance':
                return 'bg-red-100 text-red-700 hover:bg-red-200';
            default:
                return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
        }
    };

    return (
        <>
            <Head title="Rooms" auth={auth} />
            <div className="container mx-auto p-4">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold">Rooms</h2>
                    <p className="text-gray-600">
                        Manage all rooms in your hotel. You can view, edit,
                        update status, and delete rooms from this page. Use the
                        search bar to quickly find specific rooms by room number
                        or name.
                    </p>
                </div>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search Rooms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 sm:w-80"
                    />
                    {/* Create Button */}
                    <button
                        onClick={() => openModal(null, 'create')}
                        className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                    >
                        <Plus size={16} />
                        Create Room
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                SL
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Room
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {roomsData.data.map((room, index) => (
                            <tr key={room.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {index + 1}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">
                                        <div className="font-medium">
                                            {room.room_number}
                                        </div>
                                        <div className="text-gray-500">
                                            {room.name || 'Unnamed Room'}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">
                                        {room.hotel_location.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Floor {room.hotel_floor.floor_number}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">
                                        {room.room_type.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">
                                        {room.base_price.toLocaleString(
                                            'en-US',
                                            {
                                                style: 'currency',
                                                currency: 'BDT',
                                            },
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => toggleStatus(room)}
                                        className={`rounded px-3 py-1 text-sm font-medium transition ${getStatusColor(room.status)}`}
                                    >
                                        {room.status.charAt(0).toUpperCase() +
                                            room.status.slice(1)}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                    <button
                                        onClick={() => openModal(room, 'view')}
                                        className="mr-3 text-green-600 hover:text-green-900"
                                        title="View"
                                    >
                                        <Eye />
                                    </button>
                                    <button
                                        onClick={() => openModal(room, 'edit')}
                                        className="mr-3 text-blue-600 hover:text-blue-900"
                                        title="Edit"
                                    >
                                        <PenBoxIcon />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(room.id)}
                                        className="text-red-600 hover:text-red-900"
                                        title="Delete"
                                    >
                                        <Trash2Icon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-4 flex justify-center">
                    {roomsData.links.map((link, index) => (
                        <button
                            key={index}
                            disabled={!link.url}
                            onClick={() => link.url && router.visit(link.url)}
                            className={`mx-1 rounded border px-3 py-1 ${
                                link.active ? 'bg-indigo-600 text-white' : ''
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>

            <RoomModal
                isOpen={isModalOpen}
                onClose={closeModal}
                room={selectedRoom}
                mode={modalMode}
                hotelLocations={hotelLocations}
                hotelFloors={hotelFloors}
                roomTypes={roomTypes}
            />
        </>
    );
}

RoomIndex.layout = {
    breadcrumbs: [
        {
            title: 'Rooms',
            href: rooms.index(),
        },
    ],
};
