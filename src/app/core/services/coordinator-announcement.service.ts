import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CoordinatorAnnouncement,
  CoordinatorAnnouncementStatus,
  CreateCoordinatorAnnouncementRequest,
  UpdateCoordinatorAnnouncementRequest,
} from '../models/coordinator-announcement.model';

@Injectable({
  providedIn: 'root',
})
export class CoordinatorAnnouncementService {
  private readonly endpoint =
    `${environment.apiUrl}/coordinador/comunicados`;

  constructor(private readonly http: HttpClient) {}

  getAnnouncements(
    status?: CoordinatorAnnouncementStatus,
  ): Observable<CoordinatorAnnouncement[]> {
    let params = new HttpParams();

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<CoordinatorAnnouncement[]>(
      this.endpoint,
      { params },
    );
  }

  createAnnouncement(
    request: CreateCoordinatorAnnouncementRequest,
  ): Observable<CoordinatorAnnouncement> {
    return this.http.post<CoordinatorAnnouncement>(
      this.endpoint,
      request,
    );
  }

  updateAnnouncement(
    id: number,
    request: UpdateCoordinatorAnnouncementRequest,
  ): Observable<CoordinatorAnnouncement> {
    return this.http.put<CoordinatorAnnouncement>(
      `${this.endpoint}/${id}`,
      request,
    );
  }
}