
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Wrench, BarChart2, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserList } from '@/components/admin/user-list';

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const router = useRouter();

  const handleSaveApiKey = () => {
    toast({ title: 'Success', description: 'API Key saved. (Demo)' });
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem('admin-auth');
    router.push('/admin');
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="font-headline text-xl font-bold">Admin Dashboard</h1>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <main className="container mx-auto grid gap-8 p-4 md:grid-cols-2 lg:grid-cols-3">
        
        <UserList />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="text-primary"/> API Key Management</CardTitle>
            <CardDescription>Set the OpenRouter API key for all AI features.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="apiKey">OpenRouter API Key</Label>
              <Input id="apiKey" type="password" placeholder="sk-or-..." />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveApiKey}>Save Key</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wrench className="text-primary"/> Site Maintenance</CardTitle>
            <CardDescription>Manage site status and post announcements.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
              <Switch id="maintenance-mode" />
            </div>
             <p className="text-center text-sm text-muted-foreground">More features coming soon.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart2 className="text-primary"/> Usage Analytics</CardTitle>
            <CardDescription>View site statistics and trends.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-24">
            <p className="text-muted-foreground">Coming Soon</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
