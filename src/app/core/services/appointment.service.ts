import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config';
import { 
  AppointmentDto, 
  CreateAppointmentRequest, 
  BookingResponse, 
  WalkInRequest, 
  RescheduleRequest 
} from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private http = inject(HttpClient);

  /**
   * Retrieves a list of appointments, optionally filtered by date, doctor, or status.
   * @param date Optional target date (YYYY-MM-DD)
   * @param doctorId Optional doctor UUID
   * @param status Optional appointment status
   */
  getCalendar(date?: string, doctorId?: string, status?: string): Observable<AppointmentDto[]> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }
    if (doctorId) {
      params = params.set('doctorId', doctorId);
    }
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<AppointmentDto[]>(`${API_BASE_URL}/appointments`, { params });
  }

  /**
   * Retrieves full details for a specific appointment.
   * @param id Appointment ID
   */
  getById(id: number): Observable<AppointmentDto> {
    return this.http.get<AppointmentDto>(`${API_BASE_URL}/appointments/${id}`);
  }

  /**
   * Cancels an appointment.
   * @param id Appointment ID
   */
  cancel(id: number): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/appointments/${id}/cancel`, {});
  }

  /**
   * Schedules a walk-in booking directly from the receptionist desk.
   * Supports selecting an existing patient or dynamically creating a new patient record.
   * @param request Walk-in details
   */
  walkIn(request: WalkInRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${API_BASE_URL}/appointments/walk-in`, request);
  }

  /**
   * Reschedules an appointment to a new date and time.
   * @param id Appointment ID
   * @param request Target date and time slot
   */
  reschedule(id: number, request: RescheduleRequest): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/appointments/${id}/reschedule`, request);
  }

  /**
   * Checks in a patient when they arrive at the clinic desk, transitioning status to Arrived.
   * @param id Appointment ID
   */
  checkIn(id: number): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/appointments/${id}/arrived`, {});
  }

  /**
   * Marks an appointment as a No-Show if the patient fails to show up.
   * @param id Appointment ID
   */
  markNoShow(id: number): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/appointments/${id}/no-show`, {});
  }

  /**
   * Records cash payment and completes checkout at the clinic desk.
   * @param id Appointment ID
   */
  markCashPaid(id: number): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/appointments/${id}/cash-paid`, {});
  }

  /**
   * Completes the appointment, typically after the doctor finishes the consultation.
   * @param id Appointment ID
   */
  complete(id: number): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/appointments/${id}/complete`, {});
  }
}
