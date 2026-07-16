import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';

import { ApiProblem, UserRole } from '../../../core/models/auth.model';
import {
  AttendanceCoordinatorReportRow,
  CoordinatorReport,
  CoordinatorReportSummary,
  CoordinatorReportType,
  GenerateCoordinatorReportRequest,
  GradesCoordinatorReportRow,
  UsersCoordinatorReportRow,
} from '../../../core/models/coordinator-report.model';
import {
  CoordinatorReportService,
} from '../../../core/services/coordinator-report.service';
import {
  PageTitle,
} from '../../../shared/components/page-title/page-title';

@Component({
  selector: 'app-reportes',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageTitle,
  ],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class Reportes implements OnInit {
  readonly reportForm = new FormGroup({
    reportType: new FormControl<CoordinatorReportType>(
      'Attendance',
      {
        nonNullable: true,
        validators: [Validators.required],
      },
    ),
    startDate: new FormControl<string>('', {
      nonNullable: true,
    }),
    endDate: new FormControl<string>('', {
      nonNullable: true,
    }),
    courseId: new FormControl<number | null>(
      null,
      [
        Validators.min(1),
      ],
    ),
    term: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.maxLength(50),
      ],
    }),
    gradeLevel: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.maxLength(20),
      ],
    }),
    section: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.maxLength(20),
      ],
    }),
    userRole: new FormControl<UserRole | ''>(
      '',
      {
        nonNullable: true,
      },
    ),
    isActive: new FormControl<
      'true' | 'false' | ''
    >(
      '',
      {
        nonNullable: true,
      },
    ),
  });

  reports: CoordinatorReportSummary[] = [];
  currentReport: CoordinatorReport | null = null;

  selectedReportType:
    CoordinatorReportType | '' = '';

  isGenerating = false;
  isLoadingHistory = false;
  isLoadingDetail = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly reportService:
      CoordinatorReportService,
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  get selectedType(): CoordinatorReportType {
    return this.reportForm.controls.reportType.value;
  }

  get attendanceRows():
    AttendanceCoordinatorReportRow[] {
    if (
      this.currentReport?.reportType !==
      'Attendance'
    ) {
      return [];
    }

    return this.currentReport.result as
      AttendanceCoordinatorReportRow[];
  }

  get gradesRows():
    GradesCoordinatorReportRow[] {
    if (
      this.currentReport?.reportType !==
      'Grades'
    ) {
      return [];
    }

    return this.currentReport.result as
      GradesCoordinatorReportRow[];
  }

  get usersRows():
    UsersCoordinatorReportRow[] {
    if (
      this.currentReport?.reportType !==
      'Users'
    ) {
      return [];
    }

    return this.currentReport.result as
      UsersCoordinatorReportRow[];
  }

  onReportTypeChange(): void {
    const reportType =
      this.reportForm.controls.reportType.value;

    this.reportForm.reset({
      reportType,
      startDate: '',
      endDate: '',
      courseId: null,
      term: '',
      gradeLevel: '',
      section: '',
      userRole: '',
      isActive: '',
    });

    this.errorMessage = '';
    this.successMessage = '';
  }

  onHistoryFilterChange(
    event: Event,
  ): void {
    const element =
      event.target as HTMLSelectElement;

    this.selectedReportType =
      element.value as
        CoordinatorReportType | '';

    this.loadReports();
  }

  loadReports(): void {
    this.isLoadingHistory = true;
    this.errorMessage = '';

    const reportType =
      this.selectedReportType === ''
        ? undefined
        : this.selectedReportType;

    this.reportService
      .getReports(reportType)
      .pipe(
        finalize(() => {
          this.isLoadingHistory = false;
        }),
      )
      .subscribe({
        next: (reports) => {
          this.reports = reports;
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage =
            this.getErrorMessage(
              error,
              'No fue posible cargar el historial de reportes.',
            );
        },
      });
  }

  generateReport(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }

    const formValue =
      this.reportForm.getRawValue();

    if (
      formValue.courseId !== null &&
      (
        !Number.isInteger(formValue.courseId) ||
        formValue.courseId <= 0
      )
    ) {
      this.errorMessage =
        'El identificador del curso debe ser un número entero mayor que cero.';
      return;
    }

    if (
      formValue.reportType ===
        'Attendance' &&
      formValue.startDate &&
      formValue.endDate &&
      formValue.startDate >
        formValue.endDate
    ) {
      this.errorMessage =
        'La fecha inicial no puede ser posterior a la fecha final.';
      return;
    }

    const request =
      this.buildRequest();

    this.isGenerating = true;

    this.reportService
      .generateReport(request)
      .pipe(
        finalize(() => {
          this.isGenerating = false;
        }),
      )
      .subscribe({
        next: (report) => {
          this.currentReport = report;
          this.successMessage =
            'El reporte se generó correctamente.';

          this.loadReports();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage =
            this.getErrorMessage(
              error,
              'No fue posible generar el reporte.',
            );
        },
      });
  }

  viewReport(id: number): void {
    this.isLoadingDetail = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.reportService
      .getReportById(id)
      .pipe(
        finalize(() => {
          this.isLoadingDetail = false;
        }),
      )
      .subscribe({
        next: (report) => {
          this.currentReport = report;
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage =
            this.getErrorMessage(
              error,
              'No fue posible consultar el reporte.',
            );
        },
      });
  }

  closeReport(): void {
    this.currentReport = null;
  }

  reportTypeLabel(
    reportType: CoordinatorReportType,
  ): string {
    const labels:
      Record<CoordinatorReportType, string> = {
        Attendance: 'Asistencia',
        Grades: 'Calificaciones',
        Users: 'Usuarios',
      };

    return labels[reportType];
  }

  roleLabel(role: UserRole): string {
    const labels:
      Record<UserRole, string> = {
        Student: 'Estudiante',
        Teacher: 'Docente',
        Coordinator: 'Coordinador',
      };

    return labels[role];
  }

  private buildRequest():
    GenerateCoordinatorReportRequest {
    const formValue =
      this.reportForm.getRawValue();

    const request:
      GenerateCoordinatorReportRequest = {
        reportType: formValue.reportType,
        startDate: null,
        endDate: null,
        courseId: null,
        term: null,
        gradeLevel: null,
        section: null,
        userRole: null,
        isActive: null,
      };

    if (
      formValue.reportType ===
      'Attendance'
    ) {
      request.startDate =
        formValue.startDate || null;

      request.endDate =
        formValue.endDate || null;

      request.courseId =
        formValue.courseId;

      request.gradeLevel =
        this.normalizeText(
          formValue.gradeLevel,
        );

      request.section =
        this.normalizeText(
          formValue.section,
        );
    }

    if (
      formValue.reportType ===
      'Grades'
    ) {
      request.courseId =
        formValue.courseId;

      request.term =
        this.normalizeText(
          formValue.term,
        );

      request.gradeLevel =
        this.normalizeText(
          formValue.gradeLevel,
        );

      request.section =
        this.normalizeText(
          formValue.section,
        );
    }

    if (
      formValue.reportType ===
      'Users'
    ) {
      request.userRole =
        formValue.userRole || null;

      request.isActive =
        formValue.isActive === ''
          ? null
          : formValue.isActive ===
            'true';
    }

    return request;
  }

  private normalizeText(
    value: string,
  ): string | null {
    const normalized =
      value.trim();

    return normalized || null;
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