import { Bell, CheckCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const TABS = [
    { key: 'all', label: 'All' },
    { key: 'message', label: 'Messages' },
    { key: 'order', label: 'Orders' },
    { key: 'stock', label: 'Stock' },
];

export default function NotificationBell() {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        loadMore,
        resetVisible,
        visibleCount
    } = useNotifications();
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (open) resetVisible();
    }, [open]);
    useEffect(() => {
        resetVisible();
    }, [activeTab]);

    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'all') return true;
        if (activeTab === 'message') return n.type === 'message';
        if (activeTab === 'order') return n.type === 'order';
        if (activeTab === 'stock')
            return n.type === 'stock-low' || n.type === 'stock-out';
        return true;
    });
    const visibleNotifications = filteredNotifications.slice(0, visibleCount);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
            <DropdownMenuTrigger asChild>
                <button className="relative">
                    <Bell className="h-6 w-6 cursor-pointer text-foreground" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center p-0 text-xs bg-red-600 text-white">
                            {unreadCount}
                        </Badge>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-96 max-h-[500px] overflow-y-auto p-0"
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <span className="text-sm font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                markAllAsRead();
                            }}
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                            <CheckCheck className="h-4 w-4" />
                            Mark all as read
                        </button>
                    )}
                </div>

                <div className="flex border-b border-border">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                'flex-1 text-xs py-2 font-medium transition',
                                activeTab === tab.key
                                    ? 'border-b-2 border-primary text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {filteredNotifications.length === 0 && (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                        No notifications
                    </div>
                )}

                {visibleNotifications.map(n => (
                    <DropdownMenuItem
                        key={`${n.type}_${n.id}`}
                        onSelect={(e) => {
                            e.preventDefault();
                            markAsRead(n);
                        }}
                        className={cn(
                            'flex flex-col items-start gap-1 cursor-pointer px-4 py-3',
                            !n.isRead && 'bg-accent/50'
                        )}
                    >
                        <span className="font-medium">{n.title}</span>
                        <span className="text-xs text-muted-foreground">
                            {n.message}
                        </span>
                    </DropdownMenuItem>
                ))}

                {visibleNotifications.length < filteredNotifications.length && (
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault();
                            loadMore();
                        }}
                        className="justify-center text-sm font-medium text-primary cursor-pointer"
                    >
                        Load more
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
