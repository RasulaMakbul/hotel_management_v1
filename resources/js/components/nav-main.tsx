import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    // ✅ Auto-open if any child is active
    useEffect(() => {
        const newOpenState: Record<string, boolean> = {};

        items.forEach((item) => {
            if (item.children) {
                const hasActiveChild = item.children.some((child) =>
                    isCurrentUrl(child.href),
                );

                newOpenState[item.title] = hasActiveChild;
            }
        });

        setOpenGroups(newOpenState);
    }, [items]);

    const toggleGroup = (title: string) => {
        setOpenGroups((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>

            <SidebarMenu>
                {items.map((item) => {
                    const isGroup = !!item.children;
                    const isOpen = openGroups[item.title];

                    return (
                        <div key={item.title}>
                            <SidebarMenuItem>
                                {isGroup ? (
                                    // ✅ GROUP BUTTON (NO LINK)
                                    <SidebarMenuButton
                                        onClick={() => toggleGroup(item.title)}
                                        tooltip={{ children: item.title }}
                                    >
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                ) : (
                                    // ✅ NORMAL LINK
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl(item.href)}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                )}
                            </SidebarMenuItem>

                            {/* ✅ CHILDREN */}
                            {isGroup && isOpen && (
                                <div className="mt-1 ml-6 space-y-1">
                                    {item.children!.map((child) => (
                                        <SidebarMenuItem key={child.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isCurrentUrl(
                                                    child.href,
                                                )}
                                            >
                                                <Link
                                                    href={child.href}
                                                    prefetch
                                                >
                                                    {child.icon && (
                                                        <child.icon />
                                                    )}
                                                    <span>{child.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
