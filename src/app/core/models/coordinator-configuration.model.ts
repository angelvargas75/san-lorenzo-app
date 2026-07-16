export interface InstitutionalConfiguration {
  id: number;
  institutionName: string;
  academicYear: number;
  academicPeriod: string;
  attendanceToleranceMinutes: number;
  absenceAlertPercentage: number;
  timeZone: string;
  updatedAt: string;
}

export interface UpdateInstitutionalConfigurationRequest {
  institutionName: string;
  academicYear: number;
  academicPeriod: string;
  attendanceToleranceMinutes: number;
  absenceAlertPercentage: number;
  timeZone: string;
}