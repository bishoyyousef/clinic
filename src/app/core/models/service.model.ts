export interface ServiceDto {
  id: number;
  name: string;
  durationMinutes: number;
  price: number;
  doctorId?: string;
  doctorName?: string;
}

export interface CreateServiceRequest {
  name: string;
  durationMinutes: number;
  price: number;
  doctorId: string;
}

export interface UpdateServiceRequest {
  name: string;
  durationMinutes: number;
  price: number;
}
