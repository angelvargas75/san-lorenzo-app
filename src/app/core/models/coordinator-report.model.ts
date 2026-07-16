import { UserRole } from './auth.model';

export type CoordinatorReportType =
  | 'Attendance'
  | 'Grades'
  | 'Users';

export interface GenerateCoordinatorReportRequest {
  reportType: CoordinatorReportType;
  startDate: string | null;
  endDate: string | null;
  courseId: number | null;
  term: string | null;
  gradeLevel: string | null;
  section: string | null;
  userRole: UserRole | null;
  isActive: boolean | null;
}

export interface CoordinatorReportSummary {
  id: number;
  reportType: CoordinatorReportType;
  generatedByUserId: number;
  generatedAt: string;
}

export interface AttendanceCoordinatorReportRow {
  courseId: number;
  courseName: string;
  gradeLevel: string;
  section: string;
  date: string;
  presentCount: number;
  absentCount: number;
  totalCount: number;
}

export interface GradesCoordinatorReportRow {
  courseId: number;
  courseName: string;
  gradeLevel: string;
  section: string;
  term: string;
  studentCount: number;
  averageGrade: number;
  passedCount: number;
  failedCount: number;
}

export interface UsersCoordinatorReportRow {
  role: UserRole;
  activeCount: number;
  inactiveCount: number;
  totalCount: number;
}

export type CoordinatorReportRow =
  | AttendanceCoordinatorReportRow
  | GradesCoordinatorReportRow
  | UsersCoordinatorReportRow;

export interface CoordinatorReport {
  id: number;
  reportType: CoordinatorReportType;
  filters: Partial<GenerateCoordinatorReportRequest>;
  result: CoordinatorReportRow[];
  generatedByUserId: number;
  generatedAt: string;
}