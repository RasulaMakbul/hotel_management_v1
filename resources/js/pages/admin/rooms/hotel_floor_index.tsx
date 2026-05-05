import { Head, useForm } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Eye, PenBoxIcon, Plus, Trash2Icon } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import hotel_floors from '@/routes/hotel_floors';
import HotelFloorModal from '@/components/rooms-modals/hotel_floor_modal';

type HotelFloor = {
    id: number;
    hotel_location_id: number;
    name: string;
    floor_number: number;
    purpose: string;
    note: string;
    is_active: boolean;
    hotel_location: HotelLocation;
};

type HotelLocation = {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    phone_number: string;
    email: string;
    description: string | null;
    is_active: boolean;
};

type PaginatedHotelFloors = {
    data: HotelFloor[];
    links: any[];
};

interface HotelFloorIndexProps {
    hotel_floor: PaginatedHotelFloors;
    hotel_locations: HotelLocation[];
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

export default function HotelFloorIndex(props: HotelFloorIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Hotel Floors', href: hotel_floors.index() },
    ];

    const {
        hotel_floor = { data: [], links: [] },
        auth,
        filters,
        hotel_locations = [],
    } = props;

    const [selectedFloor, setSelectedFloor] = useState<HotelFloor | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>(
        'view',
    );

    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                hotel_floors.index(),
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
        floor: HotelFloor | null = null,
        mode: 'view' | 'edit' | 'create' = 'view',
    ) => {
        setModalMode(mode);
        setSelectedFloor(floor);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedFloor(null);
    };

    const handleDelete = (floorId: number) => {
        if (confirm('Are you sure you want to delete this floor?')) {
            destroy(hotel_floors.destroy(floorId).url, {
                onSuccess: () => {
                    alert('Floor deleted successfully.');
                },
                onError: () => {
                    alert('Failed to delete floor.');
                },
            });
        }
    };

    const toggleStatus = (floor: HotelFloor) => {
        const action = floor.is_active ? 'deactivate' : 'activate';

        if (confirm(`Are you sure you want to ${action} this floor?`)) {
            patch(hotel_floors.toggleStatus(floor.id).url, {
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title="Hotel Floors" auth={auth} />

            <div className="container mx-auto p-4">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold">Hotel Floors</h2>
                    <p className="text-gray-600">
                        Manage hotel floors, their purpose (rooms, VIP, hall,
                        etc.) and activation status.
                    </p>
                </div>

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Search Floors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 sm:w-80"
                    />

                    <button
                        onClick={() => openModal(null, 'create')}
                        className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                    >
                        <Plus size={16} />
                        Create Floor
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                SL
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Floor No
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Purpose
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 bg-white">
                        {hotel_floor.data.map((floor, index) => (
                            <tr key={floor.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm">
                                    {index + 1}
                                </td>

                                <td className="px-6 py-4 text-sm">
                                    {floor.name}
                                </td>

                                <td className="px-6 py-4 text-sm">
                                    {floor.floor_number}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    {floor.hotel_location?.name ?? 'N/A'}
                                </td>

                                <td className="px-6 py-4 text-sm">
                                    {floor.purpose}
                                </td>

                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => toggleStatus(floor)}
                                        className={`rounded px-3 py-1 text-sm font-medium transition ${
                                            floor.is_active
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        {floor.is_active
                                            ? 'Active'
                                            : 'Inactive'}
                                    </button>
                                </td>

                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                    <button
                                        onClick={() => openModal(floor, 'view')}
                                        className="mr-3 text-green-600"
                                    >
                                        <Eye />
                                    </button>

                                    <button
                                        onClick={() => openModal(floor, 'edit')}
                                        className="mr-3 text-blue-600"
                                    >
                                        <PenBoxIcon />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(floor.id)}
                                        className="text-red-600"
                                    >
                                        <Trash2Icon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-4 flex justify-center">
                    {hotel_floor.links.map((link, index) => (
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

            <HotelFloorModal
                isOpen={isModalOpen}
                onClose={closeModal}
                hotelFloor={selectedFloor}
                mode={modalMode}
                hotel_locations={hotel_locations}
            />
        </>
    );
}

HotelFloorIndex.layout = {
    breadcrumbs: [
        {
            title: 'Hotel Floors',
            href: hotel_floors.index(),
        },
    ],
};
