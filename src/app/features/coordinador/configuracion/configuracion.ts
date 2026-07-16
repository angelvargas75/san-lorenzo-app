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
  UpdateInstitutionalConfigurationRequest,
} from '../../../core/models/coordinator-configuration.model';
import {
  CoordinatorConfigurationService,
} from '../../../core/services/coordinator-configuration.service';
import { PageTitle } from '../../../shared/components/page-title/page-title';

@Component({
  selector: 'app-configuracion',
  imports: [
    PageTitle,
    ReactiveFormsModule,
  ],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.scss',
})
export class Configuracion implements OnInit {
  readonly configurationForm;

  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly configurationService:
      CoordinatorConfigurationService,
  ) {
    this.configurationForm = this.formBuilder.nonNullable.group({
      institutionName: [
        '',
        [
          Validators.required,
          Validators.maxLength(150),
        ],
      ],
      academicYear: [
        new Date().getFullYear(),
        [
          Validators.required,
          Validators.min(2000),
          Validators.max(2100),
        ],
      ],
      academicPeriod: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
        ],
      ],
      attendanceToleranceMinutes: [
        10,
        [
          Validators.required,
          Validators.min(0),
          Validators.max(120),
        ],
      ],
      absenceAlertPercentage: [
        30,
        [
          Validators.required,
          Validators.min(0),
          Validators.max(100),
        ],
      ],
      timeZone: [
        'America/Lima',
        [
          Validators.required,
          Validators.maxLength(100),
        ],
      ],
    });
  }

  ngOnInit(): void {
    this.loadConfiguration();
  }

  loadConfiguration(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.configurationService
      .getConfiguration()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (configuration) => {
          this.configurationForm.patchValue({
            institutionName: configuration.institutionName,
            academicYear: configuration.academicYear,
            academicPeriod: configuration.academicPeriod,
            attendanceToleranceMinutes:
              configuration.attendanceToleranceMinutes,
            absenceAlertPercentage:
              configuration.absenceAlertPercentage,
            timeZone: configuration.timeZone,
          });
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(
            error,
            'No fue posible cargar la configuración institucional.',
          );
        },
      });
  }

  saveConfiguration(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.configurationForm.invalid) {
      this.configurationForm.markAllAsTouched();
      return;
    }

    const request:
      UpdateInstitutionalConfigurationRequest =
      this.configurationForm.getRawValue();

    this.isSaving = true;

    this.configurationService
      .updateConfiguration(request)
      .pipe(
        finalize(() => {
          this.isSaving = false;
        }),
      )
      .subscribe({
        next: (configuration) => {
          this.configurationForm.patchValue({
            institutionName: configuration.institutionName,
            academicYear: configuration.academicYear,
            academicPeriod: configuration.academicPeriod,
            attendanceToleranceMinutes:
              configuration.attendanceToleranceMinutes,
            absenceAlertPercentage:
              configuration.absenceAlertPercentage,
            timeZone: configuration.timeZone,
          });

          this.configurationForm.markAsPristine();
          this.successMessage =
            'La configuración se guardó correctamente.';
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(
            error,
            'No fue posible guardar la configuración.',
          );
        },
      });
  }

  private getErrorMessage(
    error: HttpErrorResponse,
    fallbackMessage: string,
  ): string {
    const problem = error.error as ApiProblem | null;

    return problem?.detail ??
      problem?.title ??
      fallbackMessage;
  }
}