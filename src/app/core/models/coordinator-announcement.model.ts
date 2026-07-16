export type CoordinatorAnnouncementStatus =
  | 'Draft'
  | 'Scheduled'
  | 'Sent'
  | 'Cancelled';

export type CreateCoordinatorAnnouncementStatus =
  | 'Draft'
  | 'Scheduled'
  | 'Sent';

export type CoordinatorRecipientType =
  | 'All'
  | 'Role'
  | 'GradeSection';

export type CoordinatorTargetRole =
  | 'Student'
  | 'Teacher'
  | 'Coordinator';

export interface CoordinatorAnnouncementRecipientRequest {
  targetType: CoordinatorRecipientType;
  targetRole: CoordinatorTargetRole | null;
  gradeLevel: string | null;
  section: string | null;
}

export interface CreateCoordinatorAnnouncementRequest {
  title: string;
  content: string;
  scheduledAt: string | null;
  status: CreateCoordinatorAnnouncementStatus;
  recipients: CoordinatorAnnouncementRecipientRequest[];
}

export interface UpdateCoordinatorAnnouncementRequest {
  title: string;
  content: string;
  scheduledAt: string | null;
  status: CoordinatorAnnouncementStatus;
  recipients: CoordinatorAnnouncementRecipientRequest[];
}

export interface CoordinatorAnnouncementRecipient {
  id: number;
  targetType: CoordinatorRecipientType;
  targetRole: CoordinatorTargetRole | null;
  gradeLevel: string | null;
  section: string | null;
}

export interface CoordinatorAnnouncement {
  id: number;
  title: string;
  content: string;
  scheduledAt: string | null;
  sentAt: string | null;
  status: CoordinatorAnnouncementStatus;
  createdAt: string;
  updatedAt: string;
  recipients: CoordinatorAnnouncementRecipient[];
}