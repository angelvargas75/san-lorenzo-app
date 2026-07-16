export interface CoordinatorProfile {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  managementArea: string;
  emailNotifications: boolean;
  appNotifications: boolean;
  updatedAt: string;
}

export interface UpdateCoordinatorProfileRequest {
  fullName: string;
  email: string;
  phone: string;
  managementArea: string;
  emailNotifications: boolean;
  appNotifications: boolean;
}