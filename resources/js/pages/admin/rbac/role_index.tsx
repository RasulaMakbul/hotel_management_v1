import { useEffect, useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { TrashIcon } from 'lucide-react';

type Permission = {
    id: number;
    name: string;
};

type Role = {
    id: number;
    name: string;
    permissions: Permission[];
};

type Props = {
    roles: Role[];
    permissions: Permission[];
};

export default function RoleIndex({ roles, permissions }: Props) {
    const [name, setName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>(
        [],
    );
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [showPermissions, setShowPermissions] = useState(false);

    const isAllSelected =
        permissions.length > 0 &&
        selectedPermissions.length === permissions.length;

    const handleToggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedPermissions([]);
        } else {
            setSelectedPermissions(permissions.map((p) => p.id));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingRole) {
            router.put(`/roles/${editingRole.id}`, {
                name,
                permissions: selectedPermissions,
            });
        } else {
            router.post('/roles', {
                name,
                permissions: selectedPermissions,
            });
        }

        resetForm();
    };

    const resetForm = () => {
        setName('');
        setSelectedPermissions([]);
        setEditingRole(null);
        setShowPermissions(false);
    };

    const editRole = (role: Role) => {
        setEditingRole(role);
        setName(role.name);
        setSelectedPermissions(role.permissions.map((p) => p.id));
        setShowPermissions(true);
    };

    const deleteRole = (roleId: number) => {
        if (confirm('Are you sure you want to delete this role?')) {
            router.delete(`/roles/${roleId}`);
        }
    };

    const togglePermission = (permissionId: number) => {
        setSelectedPermissions((prev) => {
            if (prev.includes(permissionId)) {
                return prev.filter((id) => id !== permissionId);
            }
            return [...prev, permissionId];
        });
    };

    const toggleGroupPermissions = (groupPermissions: Permission[]) => {
        const groupPermissionIds = groupPermissions.map((p) => p.id);

        setSelectedPermissions((prev) => {
            const allGroupSelected = groupPermissionIds.every((id) =>
                prev.includes(id),
            );

            if (allGroupSelected) {
                return prev.filter((id) => !groupPermissionIds.includes(id));
            } else {
                const toAdd = groupPermissionIds.filter(
                    (id) => !prev.includes(id),
                );
                return [...prev, ...toAdd];
            }
        });
    };

    // Group permissions by category
    const permissionGroups = useMemo(() => {
        const groups: Record<string, Permission[]> = {};

        permissions.forEach((permission) => {
            const groupKey = permission.name.includes('.')
                ? permission.name.split('.')[0]
                : permission.name.split(' ')[1] || 'Other';

            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(permission);
        });

        return Object.keys(groups)
            .sort((a, b) => a.localeCompare(b))
            .map((groupKey) => ({
                name: groupKey === 'Other' ? 'Other' : groupKey,
                permissions: groups[groupKey].sort((a, b) =>
                    a.name.localeCompare(b.name),
                ),
            }));
    }, [permissions]);

    // Show permissions when typing in role name or when editing
    useEffect(() => {
        setShowPermissions(name.length > 0 || editingRole !== null);
    }, [name, editingRole]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="mb-6 text-2xl font-bold">Role Management</h1>

            <form
                onSubmit={handleSubmit}
                className="mb-8 rounded bg-gray-50 p-4"
            >
                <div className="mb-4">
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                        Role Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                        placeholder="Role name"
                        required
                    />
                </div>

                {showPermissions && (
                    <div className="mb-4">
                        <div className="mb-2 flex items-center justify-between">
                            <label className="block text-sm font-bold text-gray-700">
                                Permissions
                            </label>
                            <div className="flex items-center">
                                <span className="mr-2 text-sm text-gray-600">
                                    {selectedPermissions.length} of{' '}
                                    {permissions.length} selected
                                </span>
                                <button
                                    type="button"
                                    onClick={handleToggleSelectAll}
                                    className="rounded bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800 hover:bg-indigo-200"
                                >
                                    {isAllSelected
                                        ? 'Unselect All'
                                        : 'Select All'}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {permissionGroups.map((group) => {
                                const groupIds = group.permissions.map(
                                    (p) => p.id,
                                );
                                const selectedInGroup = groupIds.filter((id) =>
                                    selectedPermissions.includes(id),
                                ).length;
                                const allGroupChecked =
                                    group.permissions.length > 0 &&
                                    selectedInGroup ===
                                        group.permissions.length;

                                return (
                                    <div
                                        key={group.name}
                                        className="rounded border border-gray-200 p-3"
                                    >
                                        <div className="mb-2 flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`group-${group.name}`}
                                                checked={allGroupChecked}
                                                onChange={() =>
                                                    toggleGroupPermissions(
                                                        group.permissions,
                                                    )
                                                }
                                                className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label
                                                htmlFor={`group-${group.name}`}
                                                className="text-sm font-medium text-gray-900"
                                            >
                                                {group.name} Permissions
                                            </label>
                                            <span className="ml-2 text-xs text-gray-500">
                                                ({selectedInGroup}/
                                                {group.permissions.length})
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                                            {group.permissions.map(
                                                (permission) => (
                                                    <div
                                                        key={permission.id}
                                                        className="flex items-center"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            id={`permission-${permission.id}`}
                                                            checked={selectedPermissions.includes(
                                                                permission.id,
                                                            )}
                                                            onChange={() =>
                                                                togglePermission(
                                                                    permission.id,
                                                                )
                                                            }
                                                            className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <label
                                                            htmlFor={`permission-${permission.id}`}
                                                            className="text-sm text-gray-700"
                                                        >
                                                            {permission.name}
                                                        </label>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="flex space-x-2">
                    <button
                        type="submit"
                        className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                    >
                        {editingRole ? 'Update Role' : 'Create Role'}
                    </button>
                    {editingRole && (
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
                            <th className="border-b px-4 py-2">Role Name</th>
                            <th className="border-b px-4 py-2">Permissions</th>
                            <th className="border-b px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((role) => (
                            <tr key={role.id}>
                                <td className="border-b px-4 py-2">
                                    {role.name}
                                </td>
                                <td className="border-b px-4 py-2">
                                    <div className="flex flex-wrap gap-1">
                                        {role.permissions.length > 5 ? (
                                            <>
                                                {role.permissions
                                                    .slice(0, 5)
                                                    .map((p) => (
                                                        <span
                                                            key={p.id}
                                                            className="rounded bg-blue-100 px-2 py-1 text-xs"
                                                        >
                                                            {p.name}
                                                        </span>
                                                    ))}
                                                <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                                                    +
                                                    {role.permissions.length -
                                                        5}{' '}
                                                    more
                                                </span>
                                            </>
                                        ) : (
                                            role.permissions.map((p) => (
                                                <span
                                                    key={p.id}
                                                    className="rounded bg-blue-100 px-2 py-1 text-xs"
                                                >
                                                    {p.name}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </td>
                                <td className="border-b px-4 py-2">
                                    <button
                                        onClick={() => editRole(role)}
                                        className="mr-2 rounded bg-yellow-500 px-2 py-1 font-bold text-white hover:bg-yellow-700"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteRole(role.id)}
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
