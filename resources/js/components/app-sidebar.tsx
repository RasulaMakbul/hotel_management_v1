import { Link } from '@inertiajs/react';
import {
    LayoutDashboard,
    Settings2,
    Shield,
    Key,
    User,
    House,
    HousePlus,
    Bed,
    Hotel,
    LampFloor,
    HouseWifi,
    BookIcon,
    PersonStanding,
    Calendar,
} from 'lucide-react';

import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import { dashboard } from '@/routes';
import { useCan } from '@/hooks/use-can';

import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
        permission: 'view dashboard',
    },

    {
        title: 'Administration',
        icon: Settings2,
        permission: ['manage roles', 'manage permissions'],
        children: [
            {
                title: 'Users',
                href: '/users',
                icon: User,
                permission: 'manage roles',
            },
            {
                title: 'Roles',
                href: '/roles',
                icon: Shield,
                permission: 'manage roles',
            },
            {
                title: 'Permissions',
                href: '/permissions',
                icon: Key,
                permission: 'manage permissions',
            },
        ],
    },
    {
        title: 'Rooms',
        icon: House,
        permission: ['manage rooms'],
        children: [
            {
                title: 'Room Types',
                href: '/rooms_types',
                icon: Bed,
                permission: 'view room type',
            },
            {
                title: 'Hotels',
                href: '/hotel_locations',
                icon: Hotel,
                permission: 'view hotel location',
            },
            {
                title: 'Floors',
                href: '/hotel_floors',
                icon: LampFloor,
                permission: 'view hotel floor',
            },
            {
                title: 'Rooms',
                href: '/rooms',
                icon: HouseWifi,
                permission: 'view hotel floor',
            },
        ],
    },
    {
        title: 'Reservation',
        icon: BookIcon,
        permission: ['manage reservation'],
        children: [
            {
                title: 'Guest List',
                href: '/guests',
                icon: PersonStanding,
                permission: 'view guest',
            },
            {
                title: 'Reservations',
                href: '/reservations',
                icon: Calendar,
                permission: 'view reservation',
            },
        ],
    },
];

function filterNavItems(
    items: NavItem[],
    can: (permission: string) => boolean,
): NavItem[] {
    return items
        .map((item) => {
            if ((item as any).disabled) return item;

            let hasPermission = true;

            if (item.permission) {
                if (Array.isArray(item.permission)) {
                    hasPermission = item.permission.some((p: string) => can(p));
                } else {
                    hasPermission = can(item.permission);
                }
            }

            if (!hasPermission) return null;

            if (item.children) {
                const children = filterNavItems(item.children, can);

                if (children.length === 0) return null;

                return {
                    ...item,
                    children,
                    href: undefined,
                };
            }

            return item;
        })
        .filter(Boolean) as NavItem[];
}

export function AppSidebar() {
    const can = useCan();

    const filteredNavItems = filterNavItems(mainNavItems, can);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
