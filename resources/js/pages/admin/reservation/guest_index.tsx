import { Head, useForm } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import {
    BadgeCheck,
    Eye,
    FileText,
    Package,
    PenBoxIcon,
    Plus,
    Trash2Icon,
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import guests from '@/routes/guests';
import GuestModal from '@/components/reservation-modals/guest_modal';
import GuestDocumentModal from '@/components/reservation-modals/guest_document_modal';
import { X } from 'lucide-react';

type Guest = {
    id: number;
    first_name: string;
    last_name?: string;
    phone: string;
    email?: string;
    date_of_birth?: string;
    passport_no?: string;
    nid_no?: string;
    type: 'walk_in' | 'corporate' | 'vip' | 'regular' | 'online';
    address?: string;
    note?: string;
    total_visits: number;
    total_spent: string;
    created_at: string;
    updated_at: string;
    guest_document?: {
        id: number;
        type: string;
        document_number?: string;
        front_image?: string;
        back_image?: string;
        status: 'pending' | 'verified' | 'rejected';
        is_ai_verified: boolean;
        expiry_date?: string;
    }[];
};

type PaginatedGuests = {
    data: Guest[];
    links: any[];
};

interface GuestIndexProps {
    guests: PaginatedGuests;
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
    success?: string;
    error?: string;
    warning?: string;
}

export default function GuestIndex(props: GuestIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Guest Management', href: guests.index() },
    ];

    const {
        guests: guestsData = { data: [], links: [] },
        auth,
        filters,
        success,
        error,
        warning,
    } = props;

    const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>(
        'view',
    );

    const [selectedDocument, setSelectedDocument] = useState<any>(null);
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
    const [documentMode, setDocumentMode] = useState<
        'create' | 'edit' | 'show'
    >('create');

    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                guests.index(),
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
        guest: Guest | null = null,
        mode: 'view' | 'edit' | 'create' = 'view',
    ) => {
        setModalMode(mode);
        setSelectedGuest(guest);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedGuest(null);
    };

    const openDocumentModal = (
        guest: Guest,
        document?: any,
        mode: 'create' | 'edit' | 'show' = 'create',
    ) => {
        setSelectedGuest(guest);
        setSelectedDocument(document);
        setDocumentMode(mode);
        setIsDocumentModalOpen(true);
    };

    const closeDocumentModal = () => {
        setIsDocumentModalOpen(false);
        setSelectedDocument(null);
    };

    const handleDelete = (guestId: number) => {
        if (confirm('Are you sure you want to delete this guest?')) {
            destroy(guests.destroy(guestId).url, {
                onSuccess: () => {
                    // Success message will be shown automatically by Laravel
                },
                onError: () => {
                    // Error message will be shown automatically by Laravel
                },
            });
        }
    };

    const guestTypeOptions = [
        { value: 'walk_in', label: 'Walk-in' },
        { value: 'corporate', label: 'Corporate' },
        { value: 'vip', label: 'VIP' },
        { value: 'regular', label: 'Regular' },
        { value: 'online', label: 'Online' },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getDocumentTypeLabel = (type: string) => {
        switch (type) {
            case 'nid':
                return 'NID';
            case 'passport':
                return 'Passport';
            case 'driving_license':
                return 'Driving License';
            default:
                return type;
        }
    };

    return (
        <>
            <Head title="Guest Management" auth={auth} />

            {/* Success Message */}
            {success && (
                <div className="fixed top-4 right-4 z-50 rounded-md bg-green-100 p-4 text-green-700 shadow-md">
                    <div className="flex items-center">
                        <svg
                            className="mr-2 h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span>{success}</span>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="fixed top-4 right-4 z-50 rounded-md bg-red-100 p-4 text-red-700 shadow-md">
                    <div className="flex items-center">
                        <svg
                            className="mr-2 h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Warning Message */}
            {warning && (
                <div className="fixed top-4 right-4 z-50 rounded-md bg-yellow-100 p-4 text-yellow-700 shadow-md">
                    <div className="flex items-center">
                        <svg
                            className="mr-2 h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span>{warning}</span>
                    </div>
                </div>
            )}

            <div className="container mx-auto p-4">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold">Guest Management</h2>
                    <p className="text-gray-600">
                        Manage hotel guests, their personal information, and
                        guest type classification.
                    </p>
                </div>

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Search Guests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 sm:w-80"
                    />

                    <button
                        onClick={() => openModal(null, 'create')}
                        className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                    >
                        <Plus size={16} />
                        Create Guest
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
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Documents
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Stats
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 bg-white">
                        {guestsData.data.map((guest, index) => (
                            <tr key={guest.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm">
                                    {index + 1}
                                </td>

                                <td className="px-6 py-4 text-sm">
                                    <div className="font-medium">
                                        {guest.first_name} {guest.last_name}
                                    </div>
                                    {guest.passport_no && (
                                        <div className="text-sm text-gray-500">
                                            Passport: {guest.passport_no}
                                        </div>
                                    )}
                                </td>

                                <td className="px-6 py-4 text-sm">
                                    <div className="font-medium">
                                        {guest.phone}
                                    </div>
                                    {guest.email && (
                                        <div className="text-sm text-gray-500">
                                            {guest.email}
                                        </div>
                                    )}
                                </td>

                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                                            guest.type === 'vip'
                                                ? 'bg-purple-100 text-purple-800'
                                                : guest.type === 'corporate'
                                                  ? 'bg-blue-100 text-blue-800'
                                                  : guest.type === 'online'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {guest.type.replace('_', ' ')}
                                    </span>
                                </td>

                                <td className="px-6 py-4 text-sm">
                                    {guest.guest_document &&
                                    guest.guest_document.length > 0 ? (
                                        <div className="space-y-1">
                                            {guest.guest_document.map((doc) => (
                                                <div
                                                    key={doc.id}
                                                    className="flex items-center gap-2"
                                                >
                                                    <button
                                                        onClick={() =>
                                                            openDocumentModal(
                                                                guest,
                                                                doc,
                                                                'show',
                                                            )
                                                        }
                                                        className="flex items-center gap-2 rounded p-1 hover:bg-gray-100"
                                                    >
                                                        <FileText size={14} />
                                                        <span className="text-xs font-medium">
                                                            {getDocumentTypeLabel(
                                                                doc.type,
                                                            )}
                                                        </span>
                                                    </button>
                                                    <span
                                                        className={`inline-flex rounded-full px-1 text-xs leading-3 font-semibold ${getStatusBadge(doc.status)}`}
                                                    >
                                                        {doc.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-500">
                                            No documents
                                        </span>
                                    )}
                                </td>

                                <td className="px-6 py-4 text-sm">
                                    <div className="text-gray-900">
                                        Visits: {guest.total_visits}
                                    </div>
                                    <div className="text-gray-500">
                                        Spent:
                                        {parseFloat(
                                            guest.total_spent,
                                        ).toLocaleString('en-US', {
                                            style: 'currency',
                                            currency: 'BDT',
                                        })}
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                    <button
                                        onClick={() => openModal(guest, 'view')}
                                        className="mr-3 text-green-600 hover:text-green-800"
                                    >
                                        <Eye size={16} />
                                    </button>

                                    <button
                                        onClick={() => openModal(guest, 'edit')}
                                        className="mr-3 text-blue-600 hover:text-blue-800"
                                    >
                                        <PenBoxIcon size={16} />
                                    </button>

                                    <button
                                        onClick={() => openDocumentModal(guest)}
                                        className="mr-3 text-purple-600 hover:text-purple-800"
                                    >
                                        <BadgeCheck size={16} />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(guest.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2Icon size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-4 flex justify-center">
                    {guestsData.links.map((link, index) => (
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

            <GuestModal
                isOpen={isModalOpen}
                onClose={closeModal}
                guest={selectedGuest}
                mode={modalMode}
            />

            <GuestDocumentModal
                isOpen={isDocumentModalOpen}
                onClose={closeDocumentModal}
                guest={selectedGuest}
                document={selectedDocument}
                mode={documentMode}
                auth={auth} // Pass auth data
            />
        </>
    );
}

GuestIndex.layout = {
    breadcrumbs: [
        {
            title: 'Guest Management',
            href: guests.index(),
        },
    ],
};
