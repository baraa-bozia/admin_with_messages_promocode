import { useEffect, useState } from 'react';
import axios from 'axios';

export function useNotifications() {
    const [allNotifications, setAllNotifications] = useState<any[]>([]);
    const [visibleCount, setVisibleCount] = useState(10);
    const [unreadCount, setUnreadCount] = useState(0);

    const READ_KEY = 'readNotifications';
    const STEP = 10;

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (notification: any) => {
        if (notification.isRead) return;
        if (notification.type === 'message') {
            try {
                const token = localStorage.getItem('token');
                await axios.post(
                    `http://localhost:5000/api/messages/read/${notification.id}`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (err) {
                console.error(err);
            }
        }
        const storedRead = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
        const key = `${notification.type}_${notification.id}`;
        if (!storedRead.includes(key)) {
            storedRead.push(key);
            localStorage.setItem(READ_KEY, JSON.stringify(storedRead));
        }
        setAllNotifications(prev =>
            prev.map(n =>
                n.id === notification.id && n.type === notification.type
                    ? { ...n, isRead: true }
                    : n
            )
        );

        setUnreadCount(prev => Math.max(prev - 1, 0));
    };

    const markAllAsRead = () => {
        const storedRead = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
        const allKeys = allNotifications.map(
            n => `${n.type}_${n.id}`
        );
        const merged = Array.from(new Set([...storedRead, ...allKeys]));
        localStorage.setItem(READ_KEY, JSON.stringify(merged));

        setAllNotifications(prev =>
            prev.map(n => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
    };


    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const [ordersRes, messagesRes, lowStockRes, outOfStockRes] =
                await Promise.all([
                    axios.get('http://localhost:5000/api/orders/admin/notifications', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:5000/api/messages/admin/unread', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:5000/api/products/low-stock', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:5000/api/products/out-of-stock', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                ]);
            const stockMap = new Map<string, any>();
            (outOfStockRes.data.data || []).forEach((n: any) => {
                stockMap.set(n.id, n);
            });
            (lowStockRes.data.data || []).forEach((n: any) => {
                if (!stockMap.has(n.id)) {
                    stockMap.set(n.id, n);
                }
            });
            const data = [
                ...(ordersRes.data.data || []),
                ...(messagesRes.data.data || []),
                ...Array.from(stockMap.values()),
            ];
            

            const sortedData = data.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            const storedRead = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
            const dataWithRead = sortedData.map(n => ({
                ...n,
                isRead: storedRead.includes(`${n.type}_${n.id}`)
            }));
            setAllNotifications(dataWithRead);
            setUnreadCount(dataWithRead.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Notifications error:', error);
        }
    };
    const loadMore = () => {
        setVisibleCount(v => v + STEP);
    };
    const resetVisible = () => {
        setVisibleCount(STEP);
    };

    return {
        notifications: allNotifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        loadMore,
        hasMore: visibleCount < allNotifications.length,
        resetVisible,
        visibleCount
    };
}
