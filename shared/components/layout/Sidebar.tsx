"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Users,
  Settings,
  Home,
  Clock,
  BarChart3,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    role: 'customer' | 'barber' | 'admin';
  } | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ user, collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const isBarberOrAdmin = user?.role === 'barber' || user?.role === 'admin';
  const userInitials = user 
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : '';

  const navigationItems = [
    { 
      label: 'Ana Sayfa', 
      href: '/', 
      icon: Home,
      show: true 
    },
    { 
      label: 'Randevularım', 
      href: '/appointments', 
      icon: Clock,
      show: true 
    },
    { 
      label: 'Takvim', 
      href: '/barber/calendar', 
      icon: Calendar,
      show: isBarberOrAdmin 
    },
    { 
      label: 'Randevular', 
      href: '/barber/appointments', 
      icon: Clock,
      show: isBarberOrAdmin 
    },
    { 
      label: 'Personel', 
      href: '/barber/staff', 
      icon: Users,
      show: user?.role === 'admin' 
    },
    { 
      label: 'Raporlar', 
      href: '/barber/reports', 
      icon: BarChart3,
      show: user?.role === 'admin' 
    },
    { 
      label: 'Ayarlar', 
      href: '/settings', 
      icon: Settings,
      show: isBarberOrAdmin 
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className={cn(
      'flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Berber</span>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="text-sm font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {`${user.firstName} ${user.lastName}`}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant={user.role === 'admin' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {user.role === 'admin' ? 'Yönetici' : 
                     user.role === 'barber' ? 'Berber' : 'Müşteri'}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems
            .filter(item => item.show)
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {!collapsed && (
          <div className="text-xs text-gray-500 text-center">
            <p>Berber Randevu Sistemi</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        )}
      </div>
    </div>
  );
}