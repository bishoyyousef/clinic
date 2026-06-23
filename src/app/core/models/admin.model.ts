export interface StaffDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  specialization?: string;
}

export interface CreateDoctorRequest {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  bio?: string;
  photoUrl?: string;
}

export interface CreateReceptionistRequest {
  name: string;
  email: string;
  phone: string;
}

export interface UpdateStaffRequest {
  name: string;
  phone: string;
  specialization?: string;
  bio?: string;
  photoUrl?: string;
}

export interface SetActiveRequest {
  isActive: boolean;
}

export interface CreatedStaffResponse {
  id: string;
  email: string;
  temporaryPassword: string;
}
