
import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Package, 
  Star, 
  LogOut,
  Menu
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";

// Mock function - replace with actual auth logic when connected to Supabase
const useAuth = () => {
  // For demo purposes, we'll assume the user is an admin
  return {
    user: { role: 'admin', name: 'Admin User' },
    isAdmin: true,
    isLoading: false,
    logout: () => console.log('Logged out')
  };
};

const AdminLayout = () => {
  const { user, isAdmin, isLoading, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If still loading auth state, show loading
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // If not an admin, redirect to home page
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    { title: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { title: 'Bookings', path: '/admin/bookings', icon: Calendar },
    { title: 'Services', path: '/admin/services', icon: Package },
    { title: 'Reviews', path: '/admin/reviews', icon: Star }
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-center p-2">
              <h2 className="text-xl font-bold text-center">AC Repair Admin</h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.path}
                    tooltip={item.title}
                  >
                    <Link to={item.path}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={logout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1">
          <div className="p-4 sm:p-6 space-y-6">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
