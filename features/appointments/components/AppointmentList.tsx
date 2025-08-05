"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { AppointmentCard } from './AppointmentCard';
import { AppointmentListProps } from '../types/appointment.types';

export function AppointmentList({ 
  appointments, 
  loading = false, 
  filters, 
  onFiltersChange 
}: AppointmentListProps) {
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFiltersChange?.({ ...filters, search: value });
  };

  const handleStatusFilter = (status: string) => {
    const newStatus = status === 'all' ? undefined : status as any;
    onFiltersChange?.({ ...filters, status: newStatus });
  };

  const clearFilters = () => {
    setSearchTerm('');
    onFiltersChange?.({});
  };

  const hasActiveFilters = filters?.status || filters?.search || filters?.date || filters?.staffId;

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Müşteri adı, telefon veya not ara..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filters?.status || 'all'} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Durum filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Randevular</SelectItem>
            <SelectItem value="pending">Bekliyor</SelectItem>
            <SelectItem value="confirmed">Onaylandı</SelectItem>
            <SelectItem value="completed">Tamamlandı</SelectItem>
            <SelectItem value="cancelled">İptal</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Temizle
          </Button>
        )}
      </div>

      {/* Results */}
      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">
            {hasActiveFilters ? 'Filtre kriterlerine uygun randevu bulunamadı' : 'Henüz randevu bulunmuyor'}
          </div>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Filtreleri Temizle
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="text-sm text-gray-500 text-center">
        {appointments.length} randevu
        {hasActiveFilters && ' (filtrelenmiş)'}
      </div>
    </div>
  );
}