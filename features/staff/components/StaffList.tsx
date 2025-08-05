"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Users,
  X
} from 'lucide-react';
import { StaffListProps, StaffFilters, Staff } from '../types/staff.types';
import { StaffCard } from './StaffCard';

export function StaffList({ 
  staff, 
  loading = false, 
  filters = {}, 
  onFiltersChange 
}: StaffListProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFiltersChange?.({ ...filters, search: value || undefined });
  };

  const handleRoleFilter = (role: string) => {
    const newRole = role === 'all' ? undefined : role as Staff['role'];
    onFiltersChange?.({ ...filters, role: newRole });
  };

  const handleStatusFilter = (status: string) => {
    const newStatus = status === 'all' ? undefined : status === 'active';
    onFiltersChange?.({ ...filters, isActive: newStatus });
  };

  const clearFilters = () => {
    setSearchTerm('');
    onFiltersChange?.({});
  };

  const hasActiveFilters = filters.role || filters.isActive !== undefined || filters.search;

  const getStaffStats = () => {
    const total = staff.length;
    const active = staff.filter(s => s.isActive).length;
    const barbers = staff.filter(s => s.role === 'barber').length;
    const admins = staff.filter(s => s.role === 'admin').length;

    return { total, active, barbers, admins };
  };

  const stats = getStaffStats();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Personel Yönetimi</h2>
          <p className="text-gray-600">
            Toplam {stats.total} personel ({stats.active} aktif)
          </p>
        </div>
        
        <Button className="sm:w-auto">
          <UserPlus className="h-4 w-4 mr-2" />
          Yeni Personel Ekle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Toplam</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-green-600 rounded-full" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aktif</p>
                <p className="text-xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Berber</p>
                <p className="text-xl font-bold">{stats.barbers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm text-gray-600">Yönetici</p>
                <p className="text-xl font-bold">{stats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Personel Listesi</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtrele
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 px-1 min-w-0">
                  1
                </Badge>
              )}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Personel ara (ad, soyad, email)..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Rol
                </label>
                <Select
                  value={filters.role || 'all'}
                  onValueChange={handleRoleFilter}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Roller</SelectItem>
                    <SelectItem value="barber">Berber</SelectItem>
                    <SelectItem value="admin">Yönetici</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Durum
                </label>
                <Select
                  value={
                    filters.isActive === undefined 
                      ? 'all' 
                      : filters.isActive 
                        ? 'active' 
                        : 'inactive'
                  }
                  onValueChange={handleStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Pasif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="whitespace-nowrap"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Temizle
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staff Grid */}
      {staff.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Personel bulunamadı
            </h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters 
                ? 'Arama kriterlerinize uygun personel bulunamadı. Filtreleri değiştirmeyi deneyin.'
                : 'Henüz personel eklenmemiş. İlk personeli eklemek için yukarıdaki butonu kullanın.'
              }
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Filtreleri Temizle
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => (  
            <StaffCard
              key={member.id}
              staff={member}
            />
          ))}
        </div>
      )}
    </div>
  );
}