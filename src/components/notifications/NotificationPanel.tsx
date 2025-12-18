import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, Info, AlertTriangle, AlertCircle, XCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export type NotificationPriority = 'low' | 'normal' | 'high';

export interface Notification {
    id: string;
    title: string;
    description: string;
    platform: string | null;
    read: boolean;
    priority: NotificationPriority;
    link: string | null;
    created_at: string;
}

export function NotificationPanel() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            subscribeToNotifications();
        }
    }, [user]);

    useEffect(() => {
        setUnreadCount(notifications.filter(n => !n.read).length);
    }, [notifications]);

    const fetchNotifications = async () => {
        const { data, error } = await supabase
            .from('notifications' as any)
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (data) {
            setNotifications(data as any as Notification[]);
        }
    };

    const subscribeToNotifications = () => {
        const subscription = supabase
            .channel('public:notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user?.id}` }, payload => {
                setNotifications(prev => [payload.new as any as Notification, ...prev]);
                // Also play a sound or show a toast if we wanted
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    };

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications' as any)
            .update({ read: true })
            .eq('id', id);

        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        }
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length === 0) return;

        const { error } = await supabase
            .from('notifications' as any)
            .update({ read: true })
            .in('id', unreadIds);

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.read) {
            await markAsRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
            setIsOpen(false);
        }
    };

    const getIcon = (notification: Notification) => {
        if (notification.priority === 'high') return <AlertCircle className="h-4 w-4 text-destructive" />;

        // Check title/description for context if no distinct priority or mostly normal
        const text = (notification.title + notification.description).toLowerCase();
        if (text.includes('success') || text.includes('published')) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        if (text.includes('failed') || text.includes('error')) return <XCircle className="h-4 w-4 text-destructive" />;
        if (text.includes('warning') || text.includes('alert')) return <AlertTriangle className="h-4 w-4 text-amber-500" />;

        return <Info className="h-4 w-4 text-primary" />;
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className={cn("h-5 w-5 text-muted-foreground", unreadCount > 0 && "text-foreground")} />
                    {unreadCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-in zoom-in">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0" align="end" forceMount>
                <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/30">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-primary hover:text-primary/80 px-2" onClick={markAllAsRead}>
                            Mark all as read
                            <Check className="ml-1 h-3 w-3" />
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[350px]">
                    {notifications.length > 0 ? (
                        <div className="divide-y divide-border/30">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex gap-3 p-4 hover:bg-secondary/40 transition-colors cursor-pointer relative",
                                        !notification.read && "bg-primary/5 hover:bg-primary/10"
                                    )}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    {!notification.read && (
                                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary" />
                                    )}
                                    <div className={cn(
                                        "mt-0.5 p-2 h-8 w-8 rounded-full flex items-center justify-center shrink-0 border border-border/50 bg-background",
                                        notification.priority === 'high' && "border-destructive/30 bg-destructive/10"
                                    )}>
                                        {getIcon(notification)}
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className={cn("text-sm font-medium leading-none", !notification.read && "font-semibold")}>
                                                {notification.title}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {notification.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[300px] text-center p-6 space-y-3">
                            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                                <Bell className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium">You're all caught up 🎉</p>
                                <p className="text-xs text-muted-foreground">No new notifications right now.</p>
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
