import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config';
import { DashboardStatsDto } from '../models/dashboard.model';
import { AppointmentDto } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);

  /**
   * Fetches today's clinic metrics from the dashboard stats endpoint.
   */
  getStats(): Observable<DashboardStatsDto> {
    return this.http.get<DashboardStatsDto>(`${API_BASE_URL}/dashboard/stats`);
  }

  /**
   * Fetches today's appointments for the recent appointments listing.
   */
  getTodayAppointments(): Observable<AppointmentDto[]> {
    // Format the local date as YYYY-MM-DD to request today's schedule
    const todayStr = new Date().toLocaleDateString('sv'); // 'sv' locale outputs YYYY-MM-DD
    const params = new HttpParams().set('date', todayStr);
    return this.http.get<AppointmentDto[]>(`${API_BASE_URL}/appointments`, { params });
  }
}
