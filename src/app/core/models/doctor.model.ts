import { ServiceDto } from './service.model';

export interface DoctorListItemDto {
  id: string;
  displayName: string;
  specialization: string;
  photoUrl?: string;
  bio?: string;
  services: ServiceDto[];
  rating: number;
  reviewCount: number;
  yearsExperience: number;
}

export interface DoctorListItemDtoPagedResult {
  items: DoctorListItemDto[];
  page: number;
  pageSize: number;
  total: number;
}

export interface DoctorDetailsDto extends DoctorListItemDto {
  nearestAvailableDates: string[];
}

export interface SlotsResponse {
  date: string;
  slots: string[];
}

export interface AvailabilityWindowDto {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

export interface BlockedDateDto {
  date: string; // "YYYY-MM-DD"
  reason?: string;
}

export interface BlockDateRequest {
  date: string; // "YYYY-MM-DD"
}
