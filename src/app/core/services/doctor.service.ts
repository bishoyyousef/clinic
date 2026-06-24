import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config';
import { 
  DoctorListItemDto, 
  DoctorDetailsDto, 
  SlotsResponse, 
  AvailabilityWindowDto, 
  BlockedDateDto,
  BlockDateRequest
} from '../models/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private http = inject(HttpClient);

  /**
   * Retrieves a list of all active doctors, optionally filtered by specialization.
   * @param specialization Optional specialization keyword
   */
  getAll(specialization?: string): Observable<DoctorListItemDto[]> {
    let params = new HttpParams();
    if (specialization) {
      params = params.set('specialization', specialization);
    }
    return this.http.get<DoctorListItemDto[]>(`${API_BASE_URL}/doctors`, { params });
  }

  /**
   * Retrieves detailed profile information for a specific doctor.
   * @param id Doctor UUID
   */
  getById(id: string): Observable<DoctorDetailsDto> {
    return this.http.get<DoctorDetailsDto>(`${API_BASE_URL}/doctors/${id}`);
  }

  /**
   * Retrieves the list of available 15-minute time slots for a doctor on a specific date for a specific service.
   * @param id Doctor UUID
   * @param date Target date (YYYY-MM-DD)
   * @param serviceId Target service ID
   */
  getSlots(id: string, date: string, serviceId: number): Observable<SlotsResponse> {
    const params = new HttpParams()
      .set('date', date)
      .set('serviceId', serviceId.toString());
    return this.http.get<SlotsResponse>(`${API_BASE_URL}/doctors/${id}/slots`, { params });
  }

  /**
   * Gets the weekly availability schedule windows configured for a doctor.
   * @param id Doctor UUID
   */
  getAvailability(id: string): Observable<AvailabilityWindowDto[]> {
    return this.http.get<AvailabilityWindowDto[]>(`${API_BASE_URL}/doctors/${id}/availability`);
  }

  /**
   * Overwrites the weekly availability schedule windows configured for a doctor.
   * @param id Doctor UUID
   * @param availability Complete weekly schedule list
   */
  setAvailability(id: string, availability: AvailabilityWindowDto[]): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/doctors/${id}/availability`, availability);
  }

  /**
   * Gets the list of dates blocked from bookings (e.g. holidays, vacations) for a doctor.
   * @param id Doctor UUID
   */
  getBlockedDates(id: string): Observable<BlockedDateDto[]> {
    return this.http.get<BlockedDateDto[]>(`${API_BASE_URL}/doctors/${id}/blocked-dates`);
  }

  /**
   * Blocks a specific date to prevent new bookings (e.g., adding a holiday).
   * @param id Doctor UUID
   * @param request Block date details
   */
  blockDate(id: string, request: BlockDateRequest): Observable<BlockedDateDto> {
    return this.http.post<BlockedDateDto>(`${API_BASE_URL}/doctors/${id}/blocked-dates`, request);
  }

  /**
   * Unblocks a previously blocked date to resume bookings.
   * @param id Doctor UUID
   * @param date Target date (YYYY-MM-DD)
   */
  unblockDate(id: string, date: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/doctors/${id}/blocked-dates/${date}`);
  }
}
