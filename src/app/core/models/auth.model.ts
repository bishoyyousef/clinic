export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  displayName: string;
  email: string;
  phone: string;
  password: string;
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Patient' | 'Doctor' | 'Receptionist' | 'Admin';
  isActive: boolean;
  avatarUrl?: string | null;
}

export interface AuthResponse {
  token: string;
  user: UserDto;
}

export interface UpdateProfileRequest {
  displayName: string;
  phone: string;
  avatarUrl?: string | null;
}

export interface ChangePasswordRequest {
  current: string;
  new: string;
}
