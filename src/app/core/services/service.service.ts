import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config';
import { ServiceDto, CreateServiceRequest, UpdateServiceRequest } from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private http = inject(HttpClient);

  /**
   * Retrieves all available medical/clinic services offered by the clinic.
   */
  getAll(): Observable<ServiceDto[]> {
    return this.http.get<ServiceDto[]>(`${API_BASE_URL}/services`);
  }

  /**
   * Creates a new clinic service (e.g., Dental Consultation).
   * @param request Service details including the doctor assigned
   */
  create(request: CreateServiceRequest): Observable<ServiceDto> {
    return this.http.post<ServiceDto>(`${API_BASE_URL}/services`, request);
  }

  /**
   * Updates an existing clinic service's details (e.g., duration or price).
   * @param id Service ID
   * @param request Updated service parameters
   */
  update(id: number, request: UpdateServiceRequest): Observable<ServiceDto> {
    return this.http.put<ServiceDto>(`${API_BASE_URL}/services/${id}`, request);
  }

  /**
   * Deletes a clinic service from the registry.
   * @param id Service ID
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/services/${id}`);
  }
}
