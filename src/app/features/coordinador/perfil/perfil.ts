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
  UpdateCoordinatorProfileRequest,
} from '../../../core/models/coordinator-profile.model';
import {
  CoordinatorProfileService,
} from '../../../core/services/coordinator-profile.service';
import { PageTitle } from '../../../shared/components/page-title/page-title';

@Component({
  selector: 'app-perfil',
  imports: [
    PageTitle,
    ReactiveFormsModule,
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil implements OnInit {
  readonly profileForm;

  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly profileService: CoordinatorProfileService,
  ) {
    this.profileForm = this.formBuilder.nonNullable.group({
      fullName: [
        '',
        [
          Validators.required,
          Validators.maxLength(150),
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(200),
        ],
      ],
      phone: [
        '',
        [
          Validators.maxLength(30),
        ],
      ],
      managementArea: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
        ],
      ],
      emailNotifications: [true],
      appNotifications: [true],
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.profileService
      .getProfile()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (profile) => {
          this.profileForm.patchValue({
            fullName: profile.fullName,
            email: profile.email,
            phone: profile.phone ?? '',
            managementArea: profile.managementArea,
            emailNotifications: profile.emailNotifications,
            appNotifications: profile.appNotifications,
          });

          this.profileForm.markAsPristine();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(
            error,
            'No fue posible cargar el perfil del coordinador.',
          );
        },
      });
  }

  saveProfile(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const formValue = this.profileForm.getRawValue();

    const request: UpdateCoordinatorProfileRequest = {
      fullName: formValue.fullName.trim(),
      email: formValue.email.trim(),
      phone: formValue.phone.trim(),
      managementArea: formValue.managementArea.trim(),
      emailNotifications: formValue.emailNotifications,
      appNotifications: formValue.appNotifications,
    };

    this.isSaving = true;

    this.profileService
      .updateProfile(request)
      .pipe(
        finalize(() => {
          this.isSaving = false;
        }),
      )
      .subscribe({
        next: (profile) => {
          this.profileForm.patchValue({
            fullName: profile.fullName,
            email: profile.email,
            phone: profile.phone ?? '',
            managementArea: profile.managementArea,
            emailNotifications: profile.emailNotifications,
            appNotifications: profile.appNotifications,
          });

          this.profileForm.markAsPristine();
          this.successMessage =
            'El perfil se guardó correctamente.';
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(
            error,
            'No fue posible guardar el perfil.',
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