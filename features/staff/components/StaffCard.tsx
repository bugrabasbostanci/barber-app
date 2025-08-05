"use client";

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Power, 
  PowerOff,
  Mail,
  Phone,
  User,
  Shield
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StaffCardProps } from '../types/staff.types';
import { StaffService } from '../services/staffService';

export function StaffCard({ 
  staff, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: StaffCardProps) {
  const initials = `${staff.firstName.charAt(0)}${staff.lastName.charAt(0)}`.toUpperCase();
  const fullName = `${staff.firstName} ${staff.lastName}`;
  
  const handleEdit = () => {
    onEdit?.(staff);
  };

  const handleDelete = () => {
    if (window.confirm(`${fullName} isimli personeli silmek istediğinizden emin misiniz?`)) {
      onDelete?.(staff.id);
    }
  };

  const handleToggleStatus = () => {
    const action = staff.isActive ? 'pasif' : 'aktif';
    if (window.confirm(`${fullName} isimli personeli ${action} yapmak istediğinizden emin misiniz?`)) {
      onToggleStatus?.(staff.id, !staff.isActive);
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      !staff.isActive ? 'opacity-60 border-gray-300' : 'border-gray-200'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className={`text-sm font-medium ${
                staff.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {fullName}
                </h4>
                {staff.role === 'admin' && (
                  <Shield className="h-4 w-4 text-purple-600" />
                )}
              </div>
              
              <div className="flex items-center space-x-2 mt-1">
                <Badge 
                  variant={staff.role === 'admin' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {StaffService.getRoleDisplayName(staff.role)}
                </Badge>
                
                <Badge 
                  variant={staff.isActive ? 'default' : 'secondary'}
                  className={`text-xs ${
                    staff.isActive 
                      ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {StaffService.getStatusDisplayName(staff.isActive)}
                </Badge>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleToggleStatus}>
                {staff.isActive ? (
                  <>
                    <PowerOff className="h-4 w-4 mr-2" />
                    Pasif Yap
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4 mr-2" />
                    Aktif Yap
                  </>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{staff.email}</span>
          </div>
          
          {staff.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{staff.phone}</span>
            </div>
          )}
          
          <div className="flex items-center text-xs text-gray-500 pt-2">
            <User className="h-3 w-3 mr-1" />
            <span>
              Kayıt: {new Date(staff.createdAt).toLocaleDateString('tr-TR')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}