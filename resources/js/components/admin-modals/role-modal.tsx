import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    role?: { id: number; name: string };
    permissions: { id: number; name: string }[];
}

export default function RoleModal({
    isOpen,
    onClose,
    role,
    permissions,
}: RoleModalProps) {
    const [name, setName] = useState(role?.name || '');
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>(
        role?.permissions?.map((p) => p.id) || [],
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (role) {
            router.put(`/roles/${role.id}`, {
                name,
                permissions: selectedPermissions,
            });
        } else {
            router.post('/roles', { name, permissions: selectedPermissions });
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="w-full max-w-md rounded-lg bg-white p-6">
                <h2 className="mb-4 text-xl font-bold">
                    {role ? 'Edit Role' : 'Create Role'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="mb-2 block text-gray-700">
                            Role Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded border px-3 py-2"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="mb-2 block text-gray-700">
                            Permissions
                        </label>
                        <div className="space-y-2">
                            {permissions.map((perm) => (
                                <label
                                    key={perm.id}
                                    className="flex items-center"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedPermissions.includes(
                                            perm.id,
                                        )}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedPermissions([
                                                    ...selectedPermissions,
                                                    perm.id,
                                                ]);
                                            } else {
                                                setSelectedPermissions(
                                                    selectedPermissions.filter(
                                                        (id) => id !== perm.id,
                                                    ),
                                                );
                                            }
                                        }}
                                        className="mr-2"
                                    />
                                    {perm.name}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded bg-blue-500 px-4 py-2 text-white"
                        >
                            {role ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
