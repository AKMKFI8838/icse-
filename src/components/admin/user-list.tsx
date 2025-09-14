'use client';

import { useEffect, useState } from 'react';
import { getAllUsers, type UserData } from '@/services/admin-services';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';

export function UserList() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const userList = await getAllUsers();
        setUsers(userList.sort((a, b) => new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime()));
      } catch (err) {
        setError('Failed to fetch users. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  const formatLoginTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short'});
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="text-primary" /> Registered Users
        </CardTitle>
        <CardDescription>A list of all users who have logged into the app.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead className="text-right">Last Login</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-8 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-40 ml-auto" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && error && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-destructive">{error}</TableCell>
                </TableRow>
              )}
              {!isLoading && users.length === 0 && !error &&(
                 <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">No users found.</TableCell>
                </TableRow>
              )}
              {!isLoading && users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                         <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} />
                         <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.phone}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatLoginTime(user.lastLogin)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
