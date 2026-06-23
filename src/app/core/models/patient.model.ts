import { VisitDto } from './visit.model';

export interface PatientDto {
  id: number;
  name: string;
  phone: string;
  email?: string;
  hasLogin: boolean;
}

export interface NewPatientInput {
  name: string;
  phone: string;
  email?: string;
}

export interface PatientHistoryItemDto {
  appointmentId: number;
  date: string;
  doctorName: string;
  serviceName: string;
  visit?: VisitDto;
}
