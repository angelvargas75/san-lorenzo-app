import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  ActualizarComunicado,
  Comunicado,
  EstadoComunicado
} from '../models/comunicado.model';

export interface FiltrosComunicado {
  estado?: EstadoComunicado;
  rol?: string;
  grado?: string;
  seccion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComunicadosService {
  private readonly apiUrl = `${environment.apiUrl}/comunicados`;

  constructor(private readonly http: HttpClient) {}

  obtenerComunicados(
    filtros: FiltrosComunicado = {}
  ): Observable<ApiResponse<Comunicado[]>> {
    let params = new HttpParams();

    if (filtros.estado) {
      params = params.set('estado', filtros.estado);
    }

    if (filtros.rol) {
      params = params.set('rol', filtros.rol);
    }

    if (filtros.grado) {
      params = params.set('grado', filtros.grado);
    }

    if (filtros.seccion) {
      params = params.set('seccion', filtros.seccion);
    }

    return this.http.get<ApiResponse<Comunicado[]>>(
      this.apiUrl,
      { params }
    );
  }

  crearComunicado(
    comunicado: Comunicado
  ): Observable<ApiResponse<Comunicado>> {
    return this.http.post<ApiResponse<Comunicado>>(
      this.apiUrl,
      comunicado
    );
  }

  actualizarComunicado(
    idComunicado: number,
    comunicado: ActualizarComunicado
  ): Observable<ApiResponse<Comunicado>> {
    return this.http.put<ApiResponse<Comunicado>>(
      `${this.apiUrl}/${idComunicado}`,
      comunicado
    );
  }
}
