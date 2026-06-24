import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config';
import { 
  StaffDto, 
  CreateDoctorRequest, 
  CreateReceptionistRequest, 
  UpdateStaffRequest, 
  SetActiveRequest, 
  CreatedStaffResponse 
} from '../models/admin.model';
import { ReportsDto } from '../models/reports.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);

  /**
   * Retrieves the complete list of registered clinic staff members (doctors and receptionists).
   */
  getStaff(): Observable<StaffDto[]> {
    return this.http.get<StaffDto[]>(`${API_BASE_URL}/admin/staff`);
  }

  /**
   * Registers a new doctor, creating their profile and generating temporary login credentials.
   * @param request Doctor registration details
   */
  addDoctor(request: CreateDoctorRequest): Observable<CreatedStaffResponse> {
    return this.http.post<CreatedStaffResponse>(`${API_BASE_URL}/admin/doctors`, request);
  }

  /**
   * Registers a new receptionist, creating their profile and generating temporary login credentials.
   * @param request Receptionist registration details
   */
  addReceptionist(request: CreateReceptionistRequest): Observable<CreatedStaffResponse> {
    return this.http.post<CreatedStaffResponse>(`${API_BASE_URL}/admin/receptionists`, request);
  }

  /**
   * Updates an existing staff member's profile details.
   * @param id Staff UUID
   * @param request Updated staff parameters
   */
  updateStaff(id: string, request: UpdateStaffRequest): Observable<StaffDto> {
    return this.http.put<StaffDto>(`${API_BASE_URL}/admin/staff/${id}`, request);
  }

  /**
   * Activates or deactivates a staff member's account to control access permissions.
   * @param id Staff UUID
   * @param request Activation state details
   */
  setActive(id: string, request: SetActiveRequest): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/admin/staff/${id}/active`, request);
  }

  /**
   * Retrieves aggregated clinical, financial, and operational analytical report metrics.
   */
  getReports(): Observable<ReportsDto> {
    return this.http.get<ReportsDto>(`${API_BASE_URL}/admin/reports`);
  }
}
