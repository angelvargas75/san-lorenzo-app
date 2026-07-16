import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CoordinatorReport,
  CoordinatorReportSummary,
  CoordinatorReportType,
  GenerateCoordinatorReportRequest,
} from '../models/coordinator-report.model';

@Injectable({
  providedIn: 'root',
})
export class CoordinatorReportService {
  private readonly endpoint =
    `${environment.apiUrl}/coordinador/reportes`;

  constructor(private readonly http: HttpClient) {}

  getReports(
    reportType?: CoordinatorReportType,
  ): Observable<CoordinatorReportSummary[]> {
    let params = new HttpParams();

    if (reportType) {
      params = params.set(
        'reportType',
        reportType,
      );
    }

    return this.http.get<CoordinatorReportSummary[]>(
      this.endpoint,
      { params },
    );
  }

  getReportById(
    id: number,
  ): Observable<CoordinatorReport> {
    return this.http.get<CoordinatorReport>(
      `${this.endpoint}/${id}`,
    );
  }

  generateReport(
    request: GenerateCoordinatorReportRequest,
  ): Observable<CoordinatorReport> {
    return this.http.post<CoordinatorReport>(
      `${this.endpoint}/generar`,
      request,
    );
  }
}