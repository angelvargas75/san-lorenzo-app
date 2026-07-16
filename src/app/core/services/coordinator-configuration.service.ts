import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  InstitutionalConfiguration,
  UpdateInstitutionalConfigurationRequest,
} from '../models/coordinator-configuration.model';

@Injectable({
  providedIn: 'root',
})
export class CoordinatorConfigurationService {
  private readonly endpoint =
    `${environment.apiUrl}/coordinador/configuracion`;

  constructor(private readonly http: HttpClient) {}

  getConfiguration(): Observable<InstitutionalConfiguration> {
    return this.http.get<InstitutionalConfiguration>(
      this.endpoint,
    );
  }

  updateConfiguration(
    request: UpdateInstitutionalConfigurationRequest,
  ): Observable<InstitutionalConfiguration> {
    return this.http.put<InstitutionalConfiguration>(
      this.endpoint,
      request,
    );
  }
}