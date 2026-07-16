import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ── DTOs (coinciden con la API .NET, camelCase) ──────────────────────────────
export interface CourseSummary {
  id: number;
  name: string;
  gradeLevel: string;
  section: string;
  schedule: string | null;
}

export interface DashboardResponse {
  totalCourses: number;
  totalStudents: number;
  pending: number;
  courses: CourseSummary[];
}

export interface CourseResponse {
  id: number;
  name: string;
  gradeLevel: string;
  section: string;
  color: string;
}

export interface StudentGrade {
  studentId: number;
  name: string;
  score1: number;
  score2: number;
  score3: number;
  score4: number;
  score5: number;
  average: number;
}

export interface GradesResponse {
  course: string;
  gradeLevel: string;
  section: string;
  term: string;
  entries: StudentGrade[];
}

export interface UpdateGradeRequest {
  courseId: number;
  term: string;
  score1: number;
  score2: number;
  score3: number;
  score4: number;
  score5: number;
}

export interface StudentAttendance {
  studentId: number;
  name: string;
  present: boolean;
}

export interface AttendanceResponse {
  courseId: number;
  course: string;
  date: string;
  students: StudentAttendance[];
}

export interface ScheduledClass {
  id: number;
  name: string;
  gradeLevel: string;
  section: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  icon: string;
}

export interface ScheduleResponse {
  teacherId: number;
  classes: ScheduledClass[];
}

export interface ProfileResponse {
  teacherId: number;
  fullName: string;
  email: string;
  position: string;
  subjects: string | null;
  emailNotifications: boolean;
  appNotifications: boolean;
}

@Injectable({ providedIn: 'root' })
export class DocenteApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/docente`;

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.base}/inicio`);
  }

  getCourses(filters?: { section?: string; gradeLevel?: string; name?: string }): Observable<CourseResponse[]> {
    let params = new HttpParams();
    if (filters?.section) params = params.set('section', filters.section);
    if (filters?.gradeLevel) params = params.set('gradeLevel', filters.gradeLevel);
    if (filters?.name) params = params.set('name', filters.name);
    return this.http.get<CourseResponse[]>(`${this.base}/cursos`, { params });
  }

  getGrades(q: { course: string; gradeLevel: string; section: string; term: string }): Observable<GradesResponse> {
    const params = new HttpParams()
      .set('course', q.course)
      .set('gradeLevel', q.gradeLevel)
      .set('section', q.section)
      .set('term', q.term);
    return this.http.get<GradesResponse>(`${this.base}/notas`, { params });
  }

  saveGrade(studentId: number, body: UpdateGradeRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/notas/${studentId}`, body);
  }

  getAttendance(courseId: number, date?: string): Observable<AttendanceResponse> {
    let params = new HttpParams().set('courseId', courseId);
    if (date) params = params.set('date', date);
    return this.http.get<AttendanceResponse>(`${this.base}/asistencia`, { params });
  }

  saveAttendance(body: {
    courseId: number;
    date: string;
    entries: { studentId: number; present: boolean }[];
  }): Observable<void> {
    return this.http.post<void>(`${this.base}/asistencia`, body);
  }

  getSchedule(): Observable<ScheduleResponse> {
    return this.http.get<ScheduleResponse>(`${this.base}/horarios`);
  }

  sendAnnouncement(body: {
    subject: string;
    message: string;
    section?: string | null;
    gradeLevel?: string | null;
    courseId?: number | null;
  }): Observable<unknown> {
    return this.http.post(`${this.base}/comunicaciones`, body);
  }

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.base}/perfil`);
  }

  updateProfile(body: {
    fullName: string;
    email: string;
    subjects?: string | null;
    emailNotifications: boolean;
    appNotifications: boolean;
  }): Observable<ProfileResponse> {
    return this.http.put<ProfileResponse>(`${this.base}/perfil`, body);
  }
}
