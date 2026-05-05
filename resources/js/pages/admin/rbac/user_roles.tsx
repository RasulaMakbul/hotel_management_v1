import { useState } from 'react';
import { router } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Role = {
    id: number;
    name: string;
};

type User = {
    id: number;
    name: string;
    email: string;
    roles: { name: string }[];
};

type Props = {
    users: User[];
    roles: Role[];
};

export default function UserRoles({ users, roles }: Props) {
    const [selectedRoles, setSelectedRoles] = useState<Record<number, string>>(
        {},
    );

    const handleChange = (userId: number, role: string) => {
        setSelectedRoles((prev) => ({
            ...prev,
            [userId]: role,
        }));
    };

    const updateRole = (userId: number) => {
        router.put(`/user_role/${userId}`, {
            role: selectedRoles[userId],
        });
    };

    return (
        <>
            <div className="space-y-4 p-6">
                <h1 className="text-xl font-bold">User Role Management</h1>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Current Role</TableHead>
                            <TableHead>Change Role</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {users.map((user) => {
                            const currentRole =
                                user.roles?.[0]?.name || 'No Role';

                            return (
                                <TableRow key={user.id}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{currentRole}</TableCell>

                                    <TableCell>
                                        <Select
                                            onValueChange={(value) =>
                                                handleChange(user.id, value)
                                            }
                                            defaultValue={
                                                currentRole !== 'No Role'
                                                    ? currentRole
                                                    : undefined
                                            }
                                        >
                                            <SelectTrigger className="w-45">
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {roles.map((role) => (
                                                    <SelectItem
                                                        key={role.id}
                                                        value={role.name}
                                                    >
                                                        {role.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>

                                    <TableCell>
                                        <Button
                                            onClick={() => updateRole(user.id)}
                                            disabled={!selectedRoles[user.id]}
                                        >
                                            Confirm
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
