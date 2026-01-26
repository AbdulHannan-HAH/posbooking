import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, Search, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function DashboardLayout() {
  const { user, isLoading, logout } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('🔒 DashboardLayout: No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('🏠 DashboardLayout - User:', user);
  console.log('🏠 DashboardLayout - User Role:', user?.role);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'pool_staff':
        return 'Pool Staff';
      case 'conference_staff':
        return 'Conference Staff';
      case 'hotel_staff':
        return 'Hotel Staff';
      default:
        return role.replace('_', ' ');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-primary text-primary-foreground';
      case 'pool_staff':
        return 'bg-pool text-pool-foreground';
      case 'conference_staff':
        return 'bg-conference text-conference-foreground';
      case 'hotel_staff':
        return 'bg-hotel text-hotel-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b bg-card flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings, users, reports..."
                  className="w-64 pl-9 bg-secondary border-0 focus-visible:ring-1"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium flex items-center justify-center text-destructive-foreground">
                  3
                </span>
              </Button>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-accent p-2 rounded-lg transition-colors">
                    <Avatar className="h-8 w-8 border">
                      <AvatarFallback className={`text-xs ${getRoleColor(user.role)}`}>
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getRoleDisplay(user.role)}
                      </p>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <div className="w-full">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${getRoleColor(user.role)}`}>
                        {getRoleDisplay(user.role)}
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Account Preferences
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={logout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-4 lg:p-6 bg-muted/20">
            <div className="max-w-7xl mx-auto">
              {/* Role-based welcome message */}
              <div className="mb-6">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getRoleColor(user.role)}`}>
                  <span className="text-sm font-medium">
                    {getRoleDisplay(user.role)} Dashboard
                  </span>
                </div>
                <p className="text-muted-foreground mt-2">
                  Welcome back, {user.name}. Last login: {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                    : 'First time login'}
                </p>
              </div>

              {/* Outlet for page content */}
              <div className="bg-card rounded-xl border shadow-sm animate-fade-in">
                <Outlet />
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="h-12 border-t bg-card flex items-center justify-between px-4 lg:px-6">
            <div className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Pool Management System v1.0
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>User ID: {user._id.substring(0, 8)}...</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">Session Active</span>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}