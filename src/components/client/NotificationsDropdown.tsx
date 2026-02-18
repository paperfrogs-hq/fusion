// Notifications Dropdown
// Shows user notifications in the header

import { useState, useEffect } from 'react';
import { Bell, Check, X, ChevronRight, Inbox, Clock, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ScrollArea } from '../ui/scroll-area';
import { getCurrentUser, getCurrentOrganization } from '../../lib/client-auth';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const user = getCurrentUser();
  const org = getCurrentOrganization();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user || !org) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/.netlify/functions/get-notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            organizationId: org.id,
          }),
        });

        const data = await response.json();
        
        if (response.ok && data.notifications) {
          setNotifications(data.notifications);
        } else {
          // Use default notifications if API doesn't exist yet
          setNotifications([
            {
              id: '1',
              type: 'info',
              title: 'Welcome to Fusion!',
              message: 'Get started by creating your first API key.',
              read: false,
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      } catch (error) {
        console.error('Fetch notifications error:', error);
        // Use default notifications if error
        setNotifications([
          {
            id: '1',
            type: 'info',
            title: 'Welcome to Fusion!',
            message: 'Get started by creating your first API key.',
            read: false,
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchNotifications();
    }
  }, [user, org, open]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    
    // Call API to mark as read (fire and forget)
    try {
      await fetch('/.netlify/functions/mark-notification-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
    } catch (error) {
      console.error('Mark read error:', error);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    
    try {
      await fetch('/.netlify/functions/mark-all-notifications-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });
    } catch (error) {
      console.error('Mark all read error:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 border-border bg-card/95">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-primary hover:text-primary/80 h-auto p-0"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary"></div>
              <p className="text-sm mt-2">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Inbox className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`cursor-pointer border-b border-border px-3 py-3 hover:bg-secondary/70 ${
                  !notification.read ? 'bg-secondary/60' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`truncate text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></span>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
