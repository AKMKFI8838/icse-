
'use client';

import { useState, useEffect } from 'react';
import { Bell, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { listenForMentions, type ChatMessage } from '@/services/chat-service';
import type { User } from '@/hooks/use-auth';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


export function NotificationBell({ user }: { user: User }) {
  const [notifications, setNotifications] = useState<ChatMessage[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = listenForMentions('general', user.id, (mentions) => {
      setNotifications(mentions);
      if (mentions.length > 0) {
        setHasUnread(true);
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);
  
  const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
      if(open && hasUnread) {
          setHasUnread(false);
      }
  }
  
  const getInitials = (name: string) => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2).toUpperCase();
  };


  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasUnread && (
             <span className="absolute top-1 right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4">
            <h4 className="font-medium text-sm">Notifications</h4>
        </div>
        <div className="border-t">
            {notifications.length > 0 ? (
                <div className="divide-y">
                    {notifications.slice(0, 5).map(notif => (
                        <div key={notif.id} className="p-4 flex items-start gap-3 hover:bg-accent">
                            <Avatar className="h-8 w-8 mt-1">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${notif.user.name}`} alt={notif.user.name} />
                                <AvatarFallback>{getInitials(notif.user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm">
                                    <span className="font-semibold">{notif.user.name}</span> mentioned you.
                                </p>
                                 <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center p-8">No new notifications</p>
            )}
        </div>
         <div className="p-2 border-t text-center">
            <Button variant="link" size="sm" className="w-full">
                View all notifications
            </Button>
         </div>
      </PopoverContent>
    </Popover>
  );
}
