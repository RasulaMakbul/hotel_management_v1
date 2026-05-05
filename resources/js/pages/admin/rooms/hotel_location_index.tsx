import { Head, useForm } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Eye, PenBoxIcon, Plus, Trash2Icon } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import hotel_locations from '@/routes/hotel_locations';
import HotelLocationModal from '@/components/rooms-modals/hotel_locatin_modal';

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
    image: string;
    status: string;
};

type PaginatedHotelLocations = {
    data: HotelLocation[];
    links: any[];
};

interface HotelLocationIndexProps {
    hotel_location: PaginatedHotelLocations;
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

export default function HotelLocationIndex(props: HotelLocationIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Hotel Location', href: hotel_locations.index() },
    ];

    const { hotel_location = { data: [], links: [] }, auth, filters } = props;

    const [selectedHotelLocation, setSelectedHotelLocation] =
        useState<HotelLocation | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>(
        'view',
    );
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                hotel_locations.index(),
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
        hotelLocation: HotelLocation | null = null,
        mode: 'view' | 'edit' | 'create' = 'view',
    ) => {
        setModalMode(mode);
        setSelectedHotelLocation(hotelLocation);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedHotelLocation(null);
    };

    const handleDelete = (hotelLocationId: number) => {
        if (confirm('Are you sure you want to delete this Hotel?')) {
            destroy(hotel_locations.destroy(hotelLocationId).url, {
                onSuccess: () => {
                    alert('Hotel deleted successfully.');
                },
                onError: () => {
                    alert('Failed to delete Hotel.');
                },
            });
        }
    };
    const toggleStatus = (hotel_location: HotelLocation) => {
        const action = hotel_location.status ? 'hide' : 'activate';

        if (confirm(`Are you sure you want to ${action} this hotel?`)) {
            patch(hotel_locations.toggleStatus(hotel_location.id).url, {
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title="Hotel Location" auth={auth} />
            <div className="container mx-auto p-4">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold">Hotel Location</h2>
                    <p className="text-gray-600">
                        Manage all hotels you own. You can view, edit,
                        hide/unhide, and delete hotels from this page. Use the
                        search bar to quickly find specific hotels by name or
                        location.
                        <br />
                        <span className="text-sm text-red-500">
                            Current modal only shows create edit and view for
                            hotel location. We will add room type and room
                            management in future updates.
                        </span>
                    </p>
                </div>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search Hotels..."
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
                        Create Hotel
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
                                Hotel Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Address
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Contact
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
                        {hotel_location.data.map((hotel, index) => (
                            <tr key={hotel.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {index + 1}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {hotel.image ? (
                                            <img
                                                src={`/storage/${hotel.image}`}
                                                alt={hotel.name}
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
                                        {hotel.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">
                                        {hotel.hotel_type}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">
                                        {hotel.address}, {hotel.city}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">
                                        {hotel.contact_person},{' '}
                                        {hotel.contact_number}
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => toggleStatus(hotel)}
                                        className={`rounded px-3 py-1 text-sm font-medium transition ${
                                            hotel.status
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        {hotel.status ? 'Active' : 'Hidden'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                    <button
                                        onClick={() => openModal(hotel, 'view')}
                                        className="mr-3 text-green-600 hover:text-green-900"
                                        title="View"
                                    >
                                        <Eye />
                                    </button>
                                    <button
                                        onClick={() => openModal(hotel, 'edit')}
                                        className="mr-3 text-blue-600 hover:text-blue-900"
                                        title="Edit"
                                    >
                                        <PenBoxIcon />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(hotel.id)}
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
                    {hotel_location.links.map((link, index) => (
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

            <HotelLocationModal
                isOpen={isModalOpen}
                onClose={closeModal}
                hotel_location={selectedHotelLocation} // Fixed prop name to match modal component
                mode={modalMode}
            />
        </>
    );
}

HotelLocationIndex.layout = {
    breadcrumbs: [
        {
            title: 'Hotels',
            href: hotel_locations.index(),
        },
    ],
};
