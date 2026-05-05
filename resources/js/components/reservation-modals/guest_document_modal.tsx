import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Upload,
    FileText,
    Trash2,
    AlertCircle,
    X,
    CheckCircle,
    XCircle,
} from 'lucide-react';

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

type Document = {
    id: number;
    guest_id: number;
    type: 'nid' | 'passport' | 'driving_license';
    document_number?: string;
    front_image?: string;
    back_image?: string;
    status: 'pending' | 'verified' | 'rejected';
    is_ai_verified: boolean;
    ai_response?: string;
    expiry_date?: string;
    verified_by?: number;
    verified_at?: string;
};

type FormData = {
    id: number;
    guest_id: number;
    type: string;
    document_number: string;
    front_image: File | null;
    back_image: File | null;
    expiry_date: string;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    guest?: Guest | null;
    document?: Document | null;
    auth?: {
        user: {
            id: number;
            name: string;
            email: string;
        };
        roles: string[];
        permissions: string[];
    };
    mode: 'create' | 'edit' | 'show';
};

export default function GuestDocumentModal({
    isOpen,
    onClose,
    guest,
    document,
    auth,
    mode = 'create',
}: Props) {
    const { data, setData, post, put, processing, reset, errors } =
        useForm<FormData>({
            id: 0,
            guest_id: 0,
            type: 'nid',
            document_number: '',
            front_image: null,
            back_image: null,
            expiry_date: '',
        });

    const [frontImagePreview, setFrontImagePreview] = useState<string | null>(
        null,
    );
    const [backImagePreview, setBackImagePreview] = useState<string | null>(
        null,
    );
    const [uploadError, setUploadError] = useState<string | null>(null);

    useEffect(() => {
        if (guest) {
            if (document) {
                setData({
                    id: document.id,
                    guest_id: guest.id,
                    type: document.type,
                    document_number: document.document_number || '',
                    front_image: null,
                    back_image: null,
                    expiry_date: document.expiry_date || '',
                });
                setFrontImagePreview(
                    document.front_image
                        ? `/storage/${document.front_image}`
                        : null,
                );
                setBackImagePreview(
                    document.back_image
                        ? `/storage/${document.back_image}`
                        : null,
                );
            } else {
                setData({
                    id: 0,
                    guest_id: guest.id,
                    type: 'nid',
                    document_number: '',
                    front_image: null,
                    back_image: null,
                    expiry_date: '',
                });
                setFrontImagePreview(null);
                setBackImagePreview(null);
            }
        }
    }, [document, guest]);

    const handleImageUpload = (
        field: 'front_image' | 'back_image',
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (mode === 'show') return;

        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.match('image.*')) {
                setUploadError('Please select an image file');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                setUploadError('File size must be less than 10MB');
                return;
            }

            setUploadError(null);
            setData(field, file);

            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    if (field === 'front_image') {
                        setFrontImagePreview(e.target.result as string);
                    } else {
                        setBackImagePreview(e.target.result as string);
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (field: 'front_image' | 'back_image') => {
        if (mode === 'show') return;

        setData(field, null);
        if (field === 'front_image') {
            setFrontImagePreview(null);
        } else {
            setBackImagePreview(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setUploadError(null);

        if (!data.type) {
            setUploadError('Please select a document type');
            return;
        }

        if (!document && !data.front_image) {
            setUploadError('Front image is required for new documents');
            return;
        }

        if (document) {
            // For edit mode, create FormData
            const formData = new FormData();

            formData.append('guest_id', data.guest_id.toString());
            formData.append('type', data.type);
            formData.append('document_number', data.document_number);
            formData.append('expiry_date', data.expiry_date);

            // Only add files if they're being updated
            if (data.front_image) {
                formData.append('front_image', data.front_image);
            }

            if (data.back_image) {
                formData.append('back_image', data.back_image);
            }

            put(`/guest-documents/${document.id}`, {
                preserveScroll: true,
                onError: (errors) => {
                    setUploadError(Object.values(errors).join(', '));
                },
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            // For create mode, require front image
            if (!data.front_image) {
                setUploadError('Front image is required');
                return;
            }

            const formData = new FormData();
            formData.append('guest_id', data.guest_id.toString());
            formData.append('type', data.type);
            formData.append('document_number', data.document_number);
            formData.append('expiry_date', data.expiry_date);
            formData.append('front_image', data.front_image);
            formData.append('back_image', data.back_image);

            post('/guest-documents', {
                preserveScroll: true,
                onError: (errors) => {
                    setUploadError(Object.values(errors).join(', '));
                },
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    const handleVerify = (status: 'verified' | 'rejected') => {
        if (!document) return;

        put(`/guest-documents/${document.id}`, {
            status: status,
            verified_by: auth?.user.id || 1,
            verified_at: new Date().toISOString(),
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
            onError: (errors) => {
                setUploadError(Object.values(errors).join(', '));
            },
        });
    };

    const documentTypeOptions = [
        { value: 'nid', label: 'NID' },
        { value: 'passport', label: 'Passport' },
        { value: 'driving_license', label: 'Driving License' },
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

    const isEditable = mode === 'edit' || mode === 'create';
    const isShowMode = mode === 'show';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create'
                            ? 'Upload Document'
                            : mode === 'edit'
                              ? 'Edit Document'
                              : 'Document Details'}{' '}
                        - {guest?.first_name} {guest?.last_name}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error Display */}
                    {uploadError && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="shrink-0">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Upload Error
                                    </h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{uploadError}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Document Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                            Document Information
                        </h3>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Document Type{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.type}
                                onChange={(e) =>
                                    setData('type', e.target.value)
                                }
                                disabled={isShowMode}
                                className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 ${
                                    errors.type ? 'border-red-500' : ''
                                }`}
                            >
                                <option value="">Select document type</option>
                                {documentTypeOptions.map((option) => (
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

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Document Number
                            </label>
                            <Input
                                value={data.document_number}
                                onChange={(e) =>
                                    setData('document_number', e.target.value)
                                }
                                placeholder="Enter document number"
                                disabled={isShowMode}
                                className={
                                    errors.document_number
                                        ? 'border-red-500'
                                        : ''
                                }
                            />
                            {errors.document_number && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.document_number}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Expiry Date
                            </label>
                            <Input
                                value={data.expiry_date}
                                onChange={(e) =>
                                    setData('expiry_date', e.target.value)
                                }
                                type="date"
                                disabled={isShowMode}
                                className={
                                    errors.expiry_date ? 'border-red-500' : ''
                                }
                            />
                            {errors.expiry_date && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.expiry_date}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Document Images */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Document Images</h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Front Image */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Front Image{' '}
                                        <span className="text-red-500">*</span>
                                    </CardTitle>
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    {frontImagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={frontImagePreview}
                                                className="h-48 w-full rounded-md object-cover"
                                                alt="Front document"
                                            />
                                            {!isShowMode && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="destructive"
                                                    className="absolute top-2 right-2"
                                                    onClick={() =>
                                                        removeImage(
                                                            'front_image',
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                                            {!isShowMode && (
                                                <label className="flex cursor-pointer flex-col items-center justify-center">
                                                    <Upload className="mb-2 h-8 w-8 text-gray-500" />
                                                    <p className="text-sm text-gray-500">
                                                        <span className="font-semibold">
                                                            Click to upload
                                                        </span>{' '}
                                                        or drag and drop
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        PNG, JPG, GIF up to 10MB
                                                    </p>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        capture="environment"
                                                        onChange={(e) =>
                                                            handleImageUpload(
                                                                'front_image',
                                                                e,
                                                            )
                                                        }
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Back Image */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Back Image (Optional)
                                    </CardTitle>
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    {backImagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={backImagePreview}
                                                className="h-48 w-full rounded-md object-cover"
                                                alt="Back document"
                                            />
                                            {!isShowMode && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="destructive"
                                                    className="absolute top-2 right-2"
                                                    onClick={() =>
                                                        removeImage(
                                                            'back_image',
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                                            {!isShowMode && (
                                                <label className="flex cursor-pointer flex-col items-center justify-center">
                                                    <Upload className="mb-2 h-8 w-8 text-gray-500" />
                                                    <p className="text-sm text-gray-500">
                                                        <span className="font-semibold">
                                                            Click to upload
                                                        </span>{' '}
                                                        or drag and drop
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        PNG, JPG, GIF up to 10MB
                                                    </p>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        capture="environment"
                                                        onChange={(e) =>
                                                            handleImageUpload(
                                                                'back_image',
                                                                e,
                                                            )
                                                        }
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Document Status (for viewing) */}
                    {document && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                                Document Status
                            </h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        Current Status
                                    </label>
                                    <div className="mt-1">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(document.status)}`}
                                        >
                                            {document.status}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        AI Verified
                                    </label>
                                    <div className="mt-1">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${document.is_ai_verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                                        >
                                            {document.is_ai_verified
                                                ? 'Yes'
                                                : 'No'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {document.ai_response && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        AI Response
                                    </label>
                                    <div className="mt-1 rounded-md bg-gray-50 p-2 text-sm">
                                        {document.ai_response}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Verification Actions (for pending documents in show mode) */}
                    {document &&
                        document.status === 'pending' &&
                        isShowMode && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">
                                    Verify Document
                                </h3>
                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        onClick={() => handleVerify('verified')}
                                        className="flex items-center gap-2"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Verify Document
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => handleVerify('rejected')}
                                        className="flex items-center gap-2"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Reject Document
                                    </Button>
                                </div>
                            </div>
                        )}

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-2">
                        {isEditable && (
                            <Button type="submit" disabled={processing}>
                                {processing
                                    ? mode === 'create'
                                        ? 'Uploading...'
                                        : 'Saving...'
                                    : mode === 'create'
                                      ? 'Upload Document'
                                      : 'Update Document'}
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
