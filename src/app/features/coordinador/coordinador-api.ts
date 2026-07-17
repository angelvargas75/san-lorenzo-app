import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpResponse } from '@angular/common/http';

// ===== Dashboard =====
export interface CoordinatorDashboardResponse {
  totalStudents: number;
  activeTeachers: number;
  attendanceTodayPercentage: number;
  gradesCompliancePercentage: number;
}

// ===== Usuarios =====
export interface UserListItem {
  id: number;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface UserDetail extends UserListItem {
  teacherId: number | null;
  studentId: number | null;
}

export interface CreateUserRequest {
  email: string;
  fullName: string;
  password: string;
  role: string;
  teacherId?: number | null;
  studentId?: number | null;
}

export interface UpdateUserRequest {
  fullName: string;
  isActive?: boolean;
}

// ===== Académico =====
export interface AdminCourse {
  id: number;
  name: string;
  gradeLevel: string;
  section: string;
  teacherId: number;
  teacherName: string;
  color: string;
}

export interface SaveCourseRequest {
  name: string;
  gradeLevel: string;
  section: string;
  teacherId: number;
  color: string;
}

export interface TeacherOption {
  id: number;
  fullName: string;
}

export interface GradeSection {
  gradeLevel: string;
  section: string;
}

// ===== Horarios =====
export interface AdminScheduleSlot {
  id: number;
  courseId: number;
  courseName: string;
  gradeLevel: string;
  section: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  icon: string;
}

export interface SaveScheduleSlotRequest {
  courseId: number;
  startTime: string;   // formato "HH:mm"
  endTime: string;
  dayOfWeek: number;   // 0-6
  icon: string;
}

// ===== Reportes =====
export interface ReportListItem {
  id: number;
  gradeLevel: string;
  term: string;
  teacherName: string;
  generatedAt: string;
}

export interface GenerateReportRequest {
  gradeLevel: string;
  term: string;
  teacherId?: number | null;
}

// ===== Comunicados =====
export interface BroadcastResponse {
  id: number;
  subject: string;
  body: string;
  audience: string;
  gradeLevel: string | null;
  scheduledFor: string;
  createdAt: string;
}

export interface CreateBroadcastRequest {
  subject: string;
  body: string;
  audience: string;
  gradeLevel?: string | null;
  scheduledFor: string;
}

// ===== Conducta =====
export interface BehaviorReportResponse {
  id: number;
  studentId: number;
  studentName: string;
  date: string;
  description: string;
}

export interface CreateBehaviorReportRequest {
  studentId: number;
  date: string;
  description: string;
}

// ===== Configuración =====
export interface SettingsResponse {
  schoolName: string;
  academicYear: number;
  currentTerm: string;
  unjustifiedAbsenceThreshold: number;
  latenessToleranceMinutes: number;
}

export interface UpdateSettingsRequest {
  schoolName: string;
  academicYear: number;
  currentTerm: string;
  unjustifiedAbsenceThreshold: number;
  latenessToleranceMinutes: number;
}

// ===== Perfil =====
export interface CoordinatorProfileResponse {
  userId: number;
  fullName: string;
  email: string;
  emailNotifications: boolean;
  appNotifications: boolean;
}

export interface UpdateCoordinatorProfileRequest {
  fullName: string;
  email: string;
  emailNotifications?: boolean;
  appNotifications?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CoordinadorApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/coordinador`;

  // Dashboard
  getDashboard(): Observable<CoordinatorDashboardResponse> {
    return this.http.get<CoordinatorDashboardResponse>(`${this.base}/inicio`);
  }

  // Usuarios
  getUsuarios(search?: string): Observable<UserListItem[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<UserListItem[]>(`${this.base}/usuarios`, { params });
  }

  getUsuario(id: number): Observable<UserDetail> {
    return this.http.get<UserDetail>(`${this.base}/usuarios/${id}`);
  }

  crearUsuario(body: CreateUserRequest): Observable<UserDetail> {
    return this.http.post<UserDetail>(`${this.base}/usuarios`, body);
  }

  actualizarUsuario(id: number, body: UpdateUserRequest): Observable<UserDetail> {
    return this.http.put<UserDetail>(`${this.base}/usuarios/${id}`, body);
  }

  // Académico - Cursos
  getCursos(): Observable<AdminCourse[]> {
    return this.http.get<AdminCourse[]>(`${this.base}/cursos`);
  }

  getCurso(id: number): Observable<AdminCourse> {
    return this.http.get<AdminCourse>(`${this.base}/cursos/${id}`);
  }

  crearCurso(body: SaveCourseRequest): Observable<AdminCourse> {
    return this.http.post<AdminCourse>(`${this.base}/cursos`, body);
  }

  actualizarCurso(id: number, body: SaveCourseRequest): Observable<AdminCourse> {
    return this.http.put<AdminCourse>(`${this.base}/cursos/${id}`, body);
  }

  eliminarCurso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/cursos/${id}`);
  }

  getDocentesOptions(): Observable<TeacherOption[]> {
    return this.http.get<TeacherOption[]>(`${this.base}/docentes`);
  }

  getGradosSecciones(): Observable<GradeSection[]> {
    return this.http.get<GradeSection[]>(`${this.base}/grados-secciones`);
  }

  // Horarios
  getHorarios(): Observable<AdminScheduleSlot[]> {
    return this.http.get<AdminScheduleSlot[]>(`${this.base}/horarios`);
  }

  crearHorario(body: SaveScheduleSlotRequest): Observable<AdminScheduleSlot> {
    return this.http.post<AdminScheduleSlot>(`${this.base}/horarios`, body);
  }

  eliminarHorario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/horarios/${id}`);
  }

  // Reportes
  getReportes(): Observable<ReportListItem[]> {
    return this.http.get<ReportListItem[]>(`${this.base}/reportes`);
  }

  generarReporte(body: GenerateReportRequest): Observable<ReportListItem> {
    return this.http.post<ReportListItem>(`${this.base}/reportes`, body);
  }

  descargarReporte(id: number): Observable<HttpResponse<Blob>> {
  return this.http.get(`${this.base}/reportes/${id}/descargar`, {
    responseType: 'blob',
    observe: 'response',
  });
}

  // Comunicados
  getComunicados(): Observable<BroadcastResponse[]> {
    return this.http.get<BroadcastResponse[]>(`${this.base}/comunicados`);
  }

  crearComunicado(body: CreateBroadcastRequest): Observable<BroadcastResponse> {
    return this.http.post<BroadcastResponse>(`${this.base}/comunicados`, body);
  }

  // Conducta
  getConducta(): Observable<BehaviorReportResponse[]> {
    return this.http.get<BehaviorReportResponse[]>(`${this.base}/conducta`);
  }

  crearReporteConducta(body: CreateBehaviorReportRequest): Observable<BehaviorReportResponse> {
    return this.http.post<BehaviorReportResponse>(`${this.base}/conducta`, body);
  }

  // Configuración
  getConfiguracion(): Observable<SettingsResponse> {
    return this.http.get<SettingsResponse>(`${this.base}/configuracion`);
  }

  actualizarConfiguracion(body: UpdateSettingsRequest): Observable<SettingsResponse> {
    return this.http.put<SettingsResponse>(`${this.base}/configuracion`, body);
  }

  // Perfil
  getPerfil(): Observable<CoordinatorProfileResponse> {
    return this.http.get<CoordinatorProfileResponse>(`${this.base}/perfil`);
  }

  actualizarPerfil(body: UpdateCoordinatorProfileRequest): Observable<CoordinatorProfileResponse> {
    return this.http.put<CoordinatorProfileResponse>(`${this.base}/perfil`, body);
  }
}