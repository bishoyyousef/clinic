import { PaymentDto, PaymentInitDto } from './payment.model';
import { VisitDto } from './visit.model';
import { NewPatientInput } from './patient.model';

export type AppointmentStatus =
  | 'PendingPayment'
  | 'Confirmed'
  | 'Arrived'
  | 'Completed'
  | 'NoShow'
  | 'Cancelled';

export type AppointmentMode = 'Online' | 'InClinic';

export type PaymentMethod = 'Online' | 'Cash';

export interface AppointmentDto {
  id: number;
  doctorId: string;
  doctorName: string;
  patientId: number;
  patientName: string;
  serviceId: number;
  serviceName: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  status: AppointmentStatus;
  mode: AppointmentMode;
  meetingLink?: string;
  payment?: PaymentDto;
  visit?: VisitDto;
  createdAt: string;
}

export interface CreateAppointmentRequest {
  doctorId: string;
  serviceId: number;
  date: string;
  startTime: string;
  mode: AppointmentMode;
  paymentMethod: PaymentMethod;
}

export interface BookingResponse {
  appointment: AppointmentDto;
  payment?: PaymentInitDto;
}

export interface WalkInRequest {
  patientId?: number;
  newPatient?: NewPatientInput;
  doctorId: string;
  serviceId: number;
  date: string;
  startTime: string;
  mode?: string;
}

export interface RescheduleRequest {
  date: string;
  startTime: string;
}
