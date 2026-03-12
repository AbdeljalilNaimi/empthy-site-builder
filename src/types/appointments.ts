export interface RescheduleEntry {
  from: string;
  to: string;
  by: string;
  at: string;
}

export interface Appointment {
  id: string;
  providerId: string;
  providerName: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientId: string; // Firebase auth user ID - required for Firestore rules
  dateTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  urgency?: 'urgent' | 'routine';
  notes?: string;
  rescheduleHistory?: RescheduleEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  appointmentId?: string;
}

export interface ProviderSchedule {
  providerId: string;
  dayOfWeek: number; // 0-6
  slots: TimeSlot[];
}
