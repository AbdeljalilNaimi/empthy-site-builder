export interface Notification {
  id: string;
  userId: string;
  type: 'appointment' | 'message' | 'profile_update' | 'verification_status' | 'blood_emergency';
  title: string;
  body: string;
  data?: any;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface NotificationPreferences {
  appointments: boolean;
  messages: boolean;
  profileUpdates: boolean;
  verificationStatus: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  bloodEmergencies: boolean;
}
