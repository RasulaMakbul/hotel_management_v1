import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrashIcon } from 'lucide-react';

type Permission = {
    id: number;
    name: string;
};

type Props = {
    permissions: Permission[];
};

export default function PermissionIndex({ permissions }: Props) {
    const [name, setName] = useState('');
    const [editingPermission, setEditingPermission] =
        useState<Permission | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingPermission) {
            router.put(`/permissions/${editingPermission.id}`, {
                name,
            });
        } else {
            router.post('/permissions', {
                name,
            });
        }

        resetForm();
    };

    const resetForm = () => {
        setName('');
        setEditingPermission(null);
    };

    const editPermission = (permission: Permission) => {
        setEditingPermission(permission);
        setName(permission.name);
    };

    const deletePermission = (permissionId: number) => {
        if (confirm('Are you sure you want to delete this permission?')) {
            router.delete(`/permissions/${permissionId}`);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="mb-6 text-2xl font-bold">Permission Management</h1>

            <form
                onSubmit={handleSubmit}
                className="mb-8 rounded bg-gray-50 p-4"
            >
                <div className="mb-4">
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                        Permission Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                        placeholder="Permission name"
                        required
                    />
                </div>

                <div className="flex space-x-2">
                    <button
                        type="submit"
                        className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                    >
                        {editingPermission
                            ? 'Update Permission'
                            : 'Create Permission'}
                    </button>
                    {editingPermission && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="focus:shadow-outline rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-700 focus:outline-none"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 bg-white">
                    <thead>
                        <tr>
                            <th className="border-b px-4 py-2">
                                Permission Name
                            </th>
                            <th className="border-b px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {permissions.map((permission) => (
                            <tr key={permission.id}>
                                <td className="border-b px-4 py-2">
                                    {permission.name}
                                </td>
                                <td className="border-b px-4 py-2">
                                    <button
                                        onClick={() =>
                                            editPermission(permission)
                                        }
                                        className="mr-2 rounded bg-yellow-500 px-2 py-1 font-bold text-white hover:bg-yellow-700"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() =>
                                            deletePermission(permission.id)
                                        }
                                        className="rounded bg-red-500 px-2 py-1 font-bold text-white hover:bg-red-700"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
