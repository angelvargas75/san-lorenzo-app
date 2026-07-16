import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';

import { ApiProblem } from '../../../core/models/auth.model';
import {
  CoordinatorAnnouncement,
  CoordinatorAnnouncementRecipientRequest,
  CoordinatorAnnouncementStatus,
  CoordinatorRecipientType,
  CoordinatorTargetRole,
  CreateCoordinatorAnnouncementRequest,
  CreateCoordinatorAnnouncementStatus,
  UpdateCoordinatorAnnouncementRequest,
} from '../../../core/models/coordinator-announcement.model';
import {
  CoordinatorAnnouncementService,
} from '../../../core/services/coordinator-announcement.service';
import {
  PageTitle,
} from '../../../shared/components/page-title/page-title';

@Component({
  selector: 'app-comunicados',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageTitle,
  ],
  templateUrl: './comunicados.html',
  styleUrl: './comunicados.scss',
})
export class Comunicados implements OnInit {
  readonly announcementForm;

  readonly createStatusOptions:
    CreateCoordinatorAnnouncementStatus[] = [
      'Draft',
      'Scheduled',
      'Sent',
    ];

  readonly updateStatusOptions:
    CoordinatorAnnouncementStatus[] = [
      'Draft',
      'Scheduled',
      'Sent',
      'Cancelled',
    ];

  readonly recipientTypeOptions:
    CoordinatorRecipientType[] = [
      'All',
      'Role',
      'GradeSection',
    ];

  readonly roleOptions: CoordinatorTargetRole[] = [
    'Student',
    'Teacher',
    'Coordinator',
  ];

  announcements: CoordinatorAnnouncement[] = [];

  selectedStatus: CoordinatorAnnouncementStatus | '' = '';
  editingId: number | null = null;
  processingId: number | null = null;

  isLoading = false;
  isSaving = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly announcementService:
      CoordinatorAnnouncementService,
  ) {
    this.announcementForm = this.formBuilder.nonNullable.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(200),
        ],
      ],
      content: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
        ],
      ],
      status: [
        'Draft' as CoordinatorAnnouncementStatus,
        Validators.required,
      ],
      scheduledAt: [''],
      targetType: [
        'All' as CoordinatorRecipientType,
        Validators.required,
      ],
      targetRole: [
        'Student' as CoordinatorTargetRole,
      ],
      gradeLevel: [''],
      section: [''],
    });
  }

  get availableStatuses():
    CoordinatorAnnouncementStatus[] {
    return this.editingId === null
      ? this.createStatusOptions
      : this.updateStatusOptions;
  }

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const status =
      this.selectedStatus === ''
        ? undefined
        : this.selectedStatus;

    this.announcementService
      .getAnnouncements(status)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (announcements) => {
          this.announcements = announcements;
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(
            error,
            'No fue posible cargar los comunicados.',
          );
        },
      });
  }

  onStatusFilterChange(event: Event): void {
    const element = event.target as HTMLSelectElement;

    this.selectedStatus =
      element.value as CoordinatorAnnouncementStatus | '';

    this.loadAnnouncements();
  }

  onRecipientTypeChange(): void {
    const targetType =
      this.announcementForm.controls.targetType.value;

    if (targetType === 'All') {
      this.announcementForm.patchValue({
        targetRole: 'Student',
        gradeLevel: '',
        section: '',
      });
    }

    if (targetType === 'Role') {
      this.announcementForm.patchValue({
        gradeLevel: '',
        section: '',
      });
    }

    if (targetType === 'GradeSection') {
      this.announcementForm.patchValue({
        targetRole: 'Student',
      });
    }
  }

  saveAnnouncement(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.announcementForm.invalid) {
      this.announcementForm.markAllAsTouched();
      return;
    }

    const formValue =
      this.announcementForm.getRawValue();

    const recipient = this.buildRecipient();

    if (!recipient) {
      return;
    }

    const scheduledAt =
      this.toIsoDate(formValue.scheduledAt);

    if (
      formValue.status === 'Scheduled' &&
      !scheduledAt
    ) {
      this.errorMessage =
        'Seleccione la fecha y hora de programación.';
      return;
    }

    const normalizedScheduledAt =
      formValue.status === 'Scheduled'
        ? scheduledAt
        : null;

    this.isSaving = true;

    if (this.editingId === null) {
      if (formValue.status === 'Cancelled') {
        this.isSaving = false;
        this.errorMessage =
          'Un comunicado nuevo no puede crearse como cancelado.';
        return;
      }

      const request:
        CreateCoordinatorAnnouncementRequest = {
          title: formValue.title.trim(),
          content: formValue.content.trim(),
          scheduledAt: normalizedScheduledAt,
          status:
            formValue.status as
              CreateCoordinatorAnnouncementStatus,
          recipients: [recipient],
        };

      this.announcementService
        .createAnnouncement(request)
        .pipe(
          finalize(() => {
            this.isSaving = false;
          }),
        )
        .subscribe({
          next: () => {
            this.successMessage =
              'El comunicado se creó correctamente.';

            this.resetForm(false);
            this.loadAnnouncements();
          },
          error: (error: HttpErrorResponse) => {
            this.errorMessage = this.getErrorMessage(
              error,
              'No fue posible crear el comunicado.',
            );
          },
        });

      return;
    }

    const request:
      UpdateCoordinatorAnnouncementRequest = {
        title: formValue.title.trim(),
        content: formValue.content.trim(),
        scheduledAt: normalizedScheduledAt,
        status: formValue.status,
        recipients: [recipient],
      };

    this.announcementService
      .updateAnnouncement(
        this.editingId,
        request,
      )
      .pipe(
        finalize(() => {
          this.isSaving = false;
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage =
            'El comunicado se actualizó correctamente.';

          this.resetForm(false);
          this.loadAnnouncements();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(
            error,
            'No fue posible actualizar el comunicado.',
          );
        },
      });
  }

  editAnnouncement(
    announcement: CoordinatorAnnouncement,
  ): void {
    const recipient =
      announcement.recipients[0];

    this.editingId = announcement.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.announcementForm.patchValue({
      title: announcement.title,
      content: announcement.content,
      status: announcement.status,
      scheduledAt:
        this.toLocalDateTimeInput(
          announcement.scheduledAt,
        ),
      targetType:
        recipient?.targetType ?? 'All',
      targetRole:
        recipient?.targetRole ?? 'Student',
      gradeLevel:
        recipient?.gradeLevel ?? '',
      section:
        recipient?.section ?? '',
    });

    this.announcementForm.markAsPristine();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  cancelAnnouncement(
    announcement: CoordinatorAnnouncement,
  ): void {
    if (announcement.status === 'Cancelled') {
      return;
    }

    const confirmed = window.confirm(
      `¿Desea cancelar el comunicado "${announcement.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    const request:
      UpdateCoordinatorAnnouncementRequest = {
        title: announcement.title,
        content: announcement.content,
        scheduledAt: announcement.scheduledAt,
        status: 'Cancelled',
        recipients:
          announcement.recipients.map(
            (recipient) => ({
              targetType: recipient.targetType,
              targetRole: recipient.targetRole,
              gradeLevel: recipient.gradeLevel,
              section: recipient.section,
            }),
          ),
      };

    this.processingId = announcement.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.announcementService
      .updateAnnouncement(
        announcement.id,
        request,
      )
      .pipe(
        finalize(() => {
          this.processingId = null;
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage =
            'El comunicado fue cancelado.';

          this.loadAnnouncements();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(
            error,
            'No fue posible cancelar el comunicado.',
          );
        },
      });
  }

  resetForm(clearMessages = true): void {
    this.editingId = null;

    this.announcementForm.reset({
      title: '',
      content: '',
      status: 'Draft',
      scheduledAt: '',
      targetType: 'All',
      targetRole: 'Student',
      gradeLevel: '',
      section: '',
    });

    this.announcementForm.markAsPristine();
    this.announcementForm.markAsUntouched();

    if (clearMessages) {
      this.errorMessage = '';
      this.successMessage = '';
    }
  }

  statusLabel(
    status: CoordinatorAnnouncementStatus,
  ): string {
    const labels:
      Record<CoordinatorAnnouncementStatus, string> = {
        Draft: 'Borrador',
        Scheduled: 'Programado',
        Sent: 'Enviado',
        Cancelled: 'Cancelado',
      };

    return labels[status];
  }

  recipientLabel(
    announcement: CoordinatorAnnouncement,
  ): string {
    const recipient =
      announcement.recipients[0];

    if (!recipient) {
      return 'Sin destinatarios';
    }

    if (recipient.targetType === 'All') {
      return 'Todos';
    }

    if (recipient.targetType === 'Role') {
      const roleLabels:
        Record<CoordinatorTargetRole, string> = {
          Student: 'Estudiantes',
          Teacher: 'Docentes',
          Coordinator: 'Coordinadores',
        };

      return recipient.targetRole
        ? roleLabels[recipient.targetRole]
        : 'Rol no definido';
    }

    return `${recipient.gradeLevel ?? ''} - ${
      recipient.section ?? ''
    }`.trim();
  }

  private buildRecipient():
    CoordinatorAnnouncementRecipientRequest | null {
    const formValue =
      this.announcementForm.getRawValue();

    if (formValue.targetType === 'All') {
      return {
        targetType: 'All',
        targetRole: null,
        gradeLevel: null,
        section: null,
      };
    }

    if (formValue.targetType === 'Role') {
      if (!formValue.targetRole) {
        this.errorMessage =
          'Seleccione el rol destinatario.';
        return null;
      }

      return {
        targetType: 'Role',
        targetRole: formValue.targetRole,
        gradeLevel: null,
        section: null,
      };
    }

    const gradeLevel =
      formValue.gradeLevel.trim();

    const section =
      formValue.section.trim();

    if (!gradeLevel || !section) {
      this.errorMessage =
        'Ingrese el grado y la sección destinatarios.';
      return null;
    }

    return {
      targetType: 'GradeSection',
      targetRole: null,
      gradeLevel,
      section,
    };
  }

  private toIsoDate(
    value: string,
  ): string | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString();
  }

  private toLocalDateTimeInput(
    value: string | null,
  ): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const timezoneOffset =
      date.getTimezoneOffset() * 60_000;

    return new Date(
      date.getTime() - timezoneOffset,
    )
      .toISOString()
      .slice(0, 16);
  }

  private getErrorMessage(
    error: HttpErrorResponse,
    fallbackMessage: string,
  ): string {
    const problem =
      error.error as ApiProblem | null;

    return problem?.detail ??
      problem?.title ??
      fallbackMessage;
  }
}