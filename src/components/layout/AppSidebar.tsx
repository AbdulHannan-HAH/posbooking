import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Waves,
  Building2,
  Hotel,
  Users,
  BarChart3,
  LogOut,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  BedDouble,
  CalendarCheck,
  UserPlus,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';

interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
  roles: UserRole[];
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
        roles: ['admin'],
      },
    ],
  },
  {
    label: 'Pool Management',
    items: [
      {
        title: 'Pool Dashboard',
        url: '/pool',
        icon: Waves,
        roles: ['admin', 'pool_staff'],
      },
      {
        title: 'Bookings',
        url: '/pool/bookings',
        icon: CalendarDays,
        roles: ['admin', 'pool_staff'],
      },
      {
        title: 'Reports',
        url: '/pool/reports',
        icon: FileText,
        roles: ['admin', 'pool_staff'],
      },
    ],
  },
  {
    label: 'Conference Hall',
    items: [
      {
        title: 'Conference Dashboard',
        url: '/conference',
        icon: Building2,
        roles: ['admin', 'conference_staff'],
      },
      {
        title: 'Booking Requests',
        url: '/conference/bookings',
        icon: ClipboardList,
        roles: ['admin', 'conference_staff'],
      },
      {
        title: 'Invoices',
        url: '/conference/invoices',
        icon: CreditCard,
        roles: ['admin', 'conference_staff'],
      },
    ],
  },
  {
    label: 'Hotel',
    items: [
      {
        title: 'Hotel Dashboard',
        url: '/hotel',
        icon: Hotel,
        roles: ['admin', 'hotel_staff'],
      },
      {
        title: 'Rooms',
        url: '/hotel/rooms',
        icon: BedDouble,
        roles: ['admin', 'hotel_staff'],
      },
      {
        title: 'Reservations',
        url: '/hotel/reservations',
        icon: CalendarCheck,
        roles: ['admin', 'hotel_staff'],
      },
    ],
  },
  {
    label: 'Administration',
    items: [
      {
        title: 'Users',
        url: '/users',
        icon: Users,
        roles: ['admin'],
      },
      {
        title: 'Analytics',
        url: '/analytics',
        icon: BarChart3,
        roles: ['admin'],
      },
    ],
  },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredGroups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        user ? item.roles.includes(user.role) : false
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl gradient-pool flex items-center justify-center">
            <Waves className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">POOL</h1>
            <p className="text-xs text-sidebar-muted">Management System</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {filteredGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-sidebar-muted text-xs uppercase tracking-wider px-3">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
