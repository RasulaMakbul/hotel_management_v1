import { Head, useForm } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import rooms_types from '@/routes/rooms_types';
import { Eye, PenBoxIcon, Plus, Trash2Icon } from 'lucide-react';
import RoomTypeModal from '@/components/rooms-modals/room_type_modal';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type RoomType = {
    id: number;
    name: string;
    base_price: number;
    description: string;
    image: string;
    is_active: boolean;
    capacity: string;
};

type PaginatedRoomTypes = {
    data: RoomType[];
    links: any[];
};

interface RoomTypeIndexProps {
    room_types: PaginatedRoomTypes;
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

export default function RoomTypeIndex(props: RoomTypeIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Room Types', href: rooms_types.index() },
    ];

    const { room_types, auth, filters } = props;

    const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(
        null,
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>(
        'view',
    );
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                rooms_types.index(),
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
        roomType: RoomType | null = null,
        mode: 'view' | 'edit' | 'create' = 'view',
    ) => {
        setModalMode(mode);
        setSelectedRoomType(roomType);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRoomType(null);
    };

    const handleDelete = (roomTypeId: number) => {
        if (confirm('Are you sure you want to delete this room type?')) {
            destroy(rooms_types.destroy(roomTypeId), {
                onSuccess: () => {
                    alert('Room type deleted successfully.');
                },
                onError: () => {
                    alert('Failed to delete room type.');
                },
            });
        }
    };
    const toggleStatus = (roomType: RoomType) => {
        const action = roomType.is_active ? 'hide' : 'activate';

        if (confirm(`Are you sure you want to ${action} this room type?`)) {
            patch(rooms_types.toggleStatus(roomType.id), {
                preserveScroll: true,
            });
        }
    };
    // const filteredRoomTypes = room_types.filter(
    //     (roomType) =>
    //         roomType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //         roomType.base_price.toString().includes(searchTerm) ||
    //         roomType.description
    //             .toLowerCase()
    //             .includes(searchTerm.toLowerCase()) ||
    //         roomType.is_active.toString().includes(searchTerm.toLowerCase()) ||
    //         roomType.capacity.toLowerCase().includes(searchTerm.toLowerCase()),
    // );

    return (
        <>
            <Head title="Room Types" auth={auth} />
            <div className="container mx-auto p-4">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold">Room Types</h2>
                    <p className="text-gray-600">
                        Manage all room types available in the hotel.
                    </p>
                </div>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search room types..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        // className="w-full rounded-md border-gray-300 sm:w-80"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 sm:w-80"
                    />
                    {/* Create Button */}
                    <button
                        onClick={() => openModal(null, 'create')}
                        className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                    >
                        <Plus size={16} />
                        Create Room Type
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
                                Image
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Capacity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Base Price
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
                        {room_types.data.map((roomType, index) => (
                            <tr key={roomType.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {index + 1}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {roomType.image ? (
                                            <img
                                                src={`/storage/${roomType.image}`}
                                                alt={roomType.name}
                                                className="h-16 w-16 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-200 text-gray-500">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">
                                        {roomType.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">
                                        {roomType.capacity}
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">
                                        {roomType.base_price.toLocaleString(
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
                                        onClick={() => toggleStatus(roomType)}
                                        className={`rounded px-3 py-1 text-sm font-medium transition ${
                                            roomType.is_active
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        {roomType.is_active
                                            ? 'Active'
                                            : 'Hidden'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                    <button
                                        onClick={() =>
                                            openModal(roomType, 'view')
                                        }
                                        className="mr-3 text-green-600 hover:text-green-900"
                                        title="View"
                                    >
                                        <Eye />
                                    </button>
                                    <button
                                        onClick={() =>
                                            openModal(roomType, 'edit')
                                        }
                                        className="mr-3 text-blue-600 hover:text-blue-900"
                                        title="Edit"
                                    >
                                        <PenBoxIcon />
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDelete(roomType.id)
                                        }
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
                    {room_types.links.map((link, index) => (
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

            <RoomTypeModal
                isOpen={isModalOpen}
                onClose={closeModal}
                roomType={selectedRoomType} // Fixed prop name to match modal component
                mode={modalMode}
            />
        </>
    );
}

RoomTypeIndex.layout = {
    breadcrumbs: [
        {
            title: 'Room Types',
            href: rooms_types.index(),
        },
    ],
};
