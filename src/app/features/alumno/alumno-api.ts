import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CourseGrade {
  courseId: number;
  name: string;
  teacherName: string;
  average: number;
}

export interface DashboardResponse {
  overallAverage: number;
  attendancePercentage: number;
  totalCourses: number;
  courses: CourseGrade[];
}

export interface StudentCourse {
  id: number;
  name: string;
  teacherName: string;
  color: string;
}

export interface GradesResponse {
  gradeLevel: string;
  section: string;
  term: string;
  courses: CourseGrade[];
}

export interface StudentAssignment {
  id: number;
  courseName: string;
  title: string;
  type: string; // "Task" | "Exam"
  startDate: string; // yyyy-MM-dd
  dueDate: string; // yyyy-MM-dd
  status: string; // "pendiente" | "vencida"
}

export interface AttendanceItem {
  date: string; // yyyy-MM-dd
  course: string;
  present: boolean;
}

export interface AttendanceResponse {
  totalAbsences: number;
  history: AttendanceItem[];
}

export interface ScheduledClass {
  id: number;
  name: string;
  gradeLevel: string;
  section: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  dayOfWeek: number; // 0 = Sunday … 6 = Saturday
  icon: string;
}

export interface ScheduleResponse {
  gradeLevel: string;
  section: string;
  classes: ScheduledClass[];
}

export interface ProfileResponse {
  studentId: number;
  fullName: string;
  gradeLevel: string;
  section: string;
  email: string | null;
  phone: string | null;
  emailNotifications: boolean;
  appNotifications: boolean;
}

export interface UpdateProfileRequest {
  email?: string | null;
  phone?: string | null;
  emailNotifications: boolean;
  appNotifications: boolean;
}

@Injectable({ providedIn: 'root' })
export class AlumnoApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/alumno`;

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.base}/inicio`);
  }

  getCourses(): Observable<StudentCourse[]> {
    return this.http.get<StudentCourse[]>(`${this.base}/cursos`);
  }

  getGrades(periodo?: string): Observable<GradesResponse> {
    let params = new HttpParams();
    if (periodo) params = params.set('periodo', periodo);
    return this.http.get<GradesResponse>(`${this.base}/notas`, { params });
  }

  getAssignments(tipo?: string): Observable<StudentAssignment[]> {
    let params = new HttpParams();
    if (tipo) params = params.set('tipo', tipo);
    return this.http.get<StudentAssignment[]>(`${this.base}/tareas`, { params });
  }

  getAttendance(): Observable<AttendanceResponse> {
    return this.http.get<AttendanceResponse>(`${this.base}/asistencia`);
  }

  getSchedule(): Observable<ScheduleResponse> {
    return this.http.get<ScheduleResponse>(`${this.base}/horarios`);
  }

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.base}/perfil`);
  }

  updateProfile(body: UpdateProfileRequest): Observable<ProfileResponse> {
    return this.http.put<ProfileResponse>(`${this.base}/perfil`, body);
  }
}
