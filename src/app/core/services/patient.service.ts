import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config';
import { PatientDto, NewPatientInput, PatientHistoryItemDto } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private http = inject(HttpClient);

  /**
   * Searches for patients by name or phone number.
   * @param query Optional search keyword
   */
  search(query?: string): Observable<PatientDto[]> {
    let params = new HttpParams();
    if (query) {
      params = params.set('query', query);
    }
    return this.http.get<PatientDto[]>(`${API_BASE_URL}/patients`, { params });
  }

  /**
   * Creates a new patient record in the clinic database.
   * @param patient Patient details to register
   */
  create(patient: NewPatientInput): Observable<PatientDto> {
    return this.http.post<PatientDto>(`${API_BASE_URL}/patients`, patient);
  }

  /**
   * Retrieves the comprehensive clinical appointment and visit history for a specific patient.
   * @param id Patient ID
   */
  getHistory(id: number): Observable<PatientHistoryItemDto[]> {
    return this.http.get<PatientHistoryItemDto[]>(`${API_BASE_URL}/patients/${id}/history`);
  }
}
