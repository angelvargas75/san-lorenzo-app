import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface CourseSummary {
  courseId: number;
  name: string;
  teacherName: string;
  average: number;
}

export interface DashboardResponse {
  overallAverage: number;
  attendancePercentage: number;
  totalCourses: number;
  courses: CourseSummary[];
}

@Injectable({ providedIn: 'root' })
export class AlumnoApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/alumno`;

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.base}/inicio`);
  }
}
