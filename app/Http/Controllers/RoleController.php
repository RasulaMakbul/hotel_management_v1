<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')->orderBy('id', 'DESC')->get();
        $permissions = Permission::orderBy('id', 'DESC')->get();

        return Inertia::render('admin/rbac/role_index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|unique:roles,name',
            'permissions' => 'array',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
        ]);

        $role->syncPermissions($validated['permissions'] ?? []);

        return redirect()->back()->with('success', 'Role created successfully.');
    }




    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name,' . $role->id,
            'permissions' => 'array',
            'permissions.*' => 'integer',
        ]);

        $role->update([
            'name' => $validated['name'],
        ]);

        // ✅ Convert IDs → names
        $permissions = Permission::whereIn('id', $validated['permissions'] ?? [])
            ->pluck('name')
            ->toArray();

        $role->syncPermissions($permissions);

        return back()->with('success', 'Role updated successfully.');
    }

    public function destroy(Role $role)
    {
        // Optional safety check (recommended in production)
        if ($role->name === 'super-admin') {
            return redirect()->back()->with('error', 'Cannot delete super admin role.');
        }

        $role->delete();

        return redirect()->back()->with('success', 'Role deleted successfully.');
    }

    public function users()
    {
        return Inertia::render('admin/rbac/user_roles', [
            'users' => User::with('roles')->get(),
            'roles' => Role::orderBy('name')->get(),
        ]);
    }

    public function updateUserRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => 'required|exists:roles,name',
        ]);

        $user->syncRoles([$validated['role']]);

        return back()->with('success', 'Role updated successfully.');
    }
}