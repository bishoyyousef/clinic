export interface StatusCountDto {
  status: string;
  count: number;
}

export interface RevenueByDayDto {
  date: string;
  revenue: number;
}

export interface RevenueByServiceDto {
  serviceName: string;
  revenue: number;
}

export interface DoctorUtilizationDto {
  doctorName: string;
  appointments: number;
  completedAppointments: number;
}

export interface ReportsDto {
  appointmentsByStatus: StatusCountDto[];
  revenueByDay: RevenueByDayDto[];
  revenueByService: RevenueByServiceDto[];
  noShowRate: number;
  doctorUtilization: DoctorUtilizationDto[];
}
