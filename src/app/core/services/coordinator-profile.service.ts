import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CoordinatorProfile,
  UpdateCoordinatorProfileRequest,
} from '../models/coordinator-profile.model';

@Injectable({
  providedIn: 'root',
})
export class CoordinatorProfileService {
  private readonly endpoint =
    `${environment.apiUrl}/coordinador/perfil`;

  constructor(private readonly http: HttpClient) {}

  getProfile(): Observable<CoordinatorProfile> {
    return this.http.get<CoordinatorProfile>(
      this.endpoint,
    );
  }

  updateProfile(
    request: UpdateCoordinatorProfileRequest,
  ): Observable<CoordinatorProfile> {
    return this.http.put<CoordinatorProfile>(
      this.endpoint,
      request,
    );
  }
}