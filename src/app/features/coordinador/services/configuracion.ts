import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ConfiguracionInstitucional } from '../models/configuracion.model';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  private readonly apiUrl = `${environment.apiUrl}/configuracion`;

  constructor(private readonly http: HttpClient) {}

  obtenerConfiguracion(): Observable<
    ApiResponse<ConfiguracionInstitucional>
  > {
    return this.http.get<ApiResponse<ConfiguracionInstitucional>>(
      this.apiUrl
    );
  }

  actualizarConfiguracion(
    configuracion: ConfiguracionInstitucional
  ): Observable<ApiResponse<ConfiguracionInstitucional>> {
    return this.http.put<ApiResponse<ConfiguracionInstitucional>>(
      this.apiUrl,
      configuracion
    );
  }
}
