import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  ActualizarPerfilCoordinador,
  PerfilCoordinador
} from '../models/perfil-coordinador.model';

@Injectable({
  providedIn: 'root'
})
export class PerfilCoordinadorService {
  private readonly apiUrl = `${environment.apiUrl}/coordinadores`;

  constructor(private readonly http: HttpClient) {}

  obtenerPerfil(
    idCoordinador: number
  ): Observable<ApiResponse<PerfilCoordinador>> {
    return this.http.get<ApiResponse<PerfilCoordinador>>(
      `${this.apiUrl}/${idCoordinador}/perfil`
    );
  }

  actualizarPerfil(
    idCoordinador: number,
    perfil: ActualizarPerfilCoordinador
  ): Observable<ApiResponse<PerfilCoordinador>> {
    return this.http.put<ApiResponse<PerfilCoordinador>>(
      `${this.apiUrl}/${idCoordinador}/perfil`,
      perfil
    );
  }
}
