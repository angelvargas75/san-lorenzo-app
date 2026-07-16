export type UserRole = 'Student' | 'Teacher' | 'Coordinator';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CurrentUser {
  id: number;
  email: string;
  role: UserRole;
  fullName: string;
  teacherId?: number | null;
  studentId?: number | null;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: CurrentUser;
}

export interface ApiProblem {
  status?: number;
  title?: string;
  detail?: string;
}
