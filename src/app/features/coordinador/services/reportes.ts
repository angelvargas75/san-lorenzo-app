import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  FiltroReporte,
  ReporteDetalle,
  ReporteResumen,
  TipoReporte
} from '../models/reporte.model';

export interface FiltrosHistorialReporte {
  tipoReporte?: TipoReporte;
  periodo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private readonly apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private readonly http: HttpClient) {}

  obtenerReportes(
    filtros: FiltrosHistorialReporte = {}
  ): Observable<ApiResponse<ReporteResumen[]>> {
    let params = new HttpParams();

    if (filtros.tipoReporte) {
      params = params.set(
        'tipoReporte',
        filtros.tipoReporte
      );
    }

    if (filtros.periodo) {
      params = params.set(
        'periodo',
        filtros.periodo
      );
    }

    return this.http.get<ApiResponse<ReporteResumen[]>>(
      this.apiUrl,
      { params }
    );
  }

  generarReporte(
    filtros: FiltroReporte
  ): Observable<ApiResponse<ReporteDetalle>> {
    return this.http.post<ApiResponse<ReporteDetalle>>(
      `${this.apiUrl}/generar`,
      filtros
    );
  }

  obtenerReportePorId(
    idReporte: number
  ): Observable<ApiResponse<ReporteDetalle>> {
    return this.http.get<ApiResponse<ReporteDetalle>>(
      `${this.apiUrl}/${idReporte}`
    );
  }
}
