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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Camera, FileText, X } from 'lucide-react';

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
};

type FormData = {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    date_of_birth: string;
    passport_no: string;
    nid_no: string;
    type: string;
    address: string;
    note: string;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    guest?: Guest | null;
    mode: 'view' | 'edit' | 'create';
};

export default function GuestModal({ isOpen, onClose, guest, mode }: Props) {
    const { data, setData, post, put, processing, reset, errors } =
        useForm<FormData>({
            id: 0,
            first_name: '',
            last_name: '',
            phone: '',
            email: '',
            date_of_birth: '',
            passport_no: '',
            nid_no: '',
            type: 'walk_in',
            address: '',
            note: '',
        });

    useEffect(() => {
        if (guest && mode !== 'create') {
            setData({
                id: guest.id,
                first_name: guest.first_name,
                last_name: guest.last_name || '',
                phone: guest.phone,
                email: guest.email || '',
                date_of_birth: guest.date_of_birth || '',
                passport_no: guest.passport_no || '',
                nid_no: guest.nid_no || '',
                type: guest.type,
                address: guest.address || '',
                note: guest.note || '',
            });
        }

        if (mode === 'create') {
            reset();
        }
    }, [guest, mode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'create') {
            post('/guests', {
                data,
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }

        if (mode === 'edit' && guest) {
            put(`/guests/${guest.id}`, {
                data,
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'view'
                            ? 'View Guest'
                            : mode === 'edit'
                              ? 'Edit Guest'
                              : 'Create Guest'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                            Personal Information
                        </h3>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                First Name{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={data.first_name}
                                onChange={(e) =>
                                    setData('first_name', e.target.value)
                                }
                                placeholder="Enter first name"
                                disabled={mode === 'view'}
                                className={
                                    errors.first_name ? 'border-red-500' : ''
                                }
                            />
                            {errors.first_name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.first_name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Last Name
                            </label>
                            <Input
                                value={data.last_name}
                                onChange={(e) =>
                                    setData('last_name', e.target.value)
                                }
                                placeholder="Enter last name"
                                disabled={mode === 'view'}
                                className={
                                    errors.last_name ? 'border-red-500' : ''
                                }
                            />
                            {errors.last_name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.last_name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Phone Number{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                placeholder="Enter phone number"
                                disabled={mode === 'view'}
                                className={errors.phone ? 'border-red-500' : ''}
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <Input
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                placeholder="Enter email address"
                                type="email"
                                disabled={mode === 'view'}
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Date of Birth
                            </label>
                            <Input
                                value={data.date_of_birth}
                                onChange={(e) =>
                                    setData('date_of_birth', e.target.value)
                                }
                                placeholder="YYYY-MM-DD"
                                type="date"
                                disabled={mode === 'view'}
                                className={
                                    errors.date_of_birth ? 'border-red-500' : ''
                                }
                            />
                            {errors.date_of_birth && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.date_of_birth}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Identity Documents Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                            Identity Documents
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Passport Number
                                </label>
                                <Input
                                    value={data.passport_no}
                                    onChange={(e) =>
                                        setData('passport_no', e.target.value)
                                    }
                                    placeholder="Enter passport number"
                                    disabled={mode === 'view'}
                                    className={
                                        errors.passport_no
                                            ? 'border-red-500'
                                            : ''
                                    }
                                />
                                {errors.passport_no && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.passport_no}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    NID Number
                                </label>
                                <Input
                                    value={data.nid_no}
                                    onChange={(e) =>
                                        setData('nid_no', e.target.value)
                                    }
                                    placeholder="Enter NID number"
                                    disabled={mode === 'view'}
                                    className={
                                        errors.nid_no ? 'border-red-500' : ''
                                    }
                                />
                                {errors.nid_no && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.nid_no}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Guest Type Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Guest Type</h3>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Guest Type{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.type}
                                onChange={(e) =>
                                    setData('type', e.target.value)
                                }
                                disabled={mode === 'view'}
                                className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 ${
                                    errors.type ? 'border-red-500' : ''
                                }`}
                            >
                                <option value="">Select guest type</option>
                                {guestTypeOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.type && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.type}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Additional Information Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                            Additional Information
                        </h3>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Address
                            </label>
                            <Textarea
                                value={data.address}
                                onChange={(e) =>
                                    setData('address', e.target.value)
                                }
                                placeholder="Enter guest address"
                                disabled={mode === 'view'}
                                rows={3}
                                className={
                                    errors.address ? 'border-red-500' : ''
                                }
                            />
                            {errors.address && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.address}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Notes
                            </label>
                            <Textarea
                                value={data.note}
                                onChange={(e) =>
                                    setData('note', e.target.value)
                                }
                                placeholder="Additional notes about the guest"
                                disabled={mode === 'view'}
                                rows={3}
                                className={errors.note ? 'border-red-500' : ''}
                            />
                            {errors.note && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.note}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ACTIONS */}
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
                        <Button type="button" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
