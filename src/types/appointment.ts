export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'rescheduled';

export interface Appointment {
  id: string;
  patient_name: string;
  phone_number: string;
  appointment_time: string;
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CallState {
  isActive: boolean;
  status: 'idle' | 'dialing' | 'connected' | 'ended';
  duration: number;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AppointmentUpdate {
  status?: AppointmentStatus;
  appointment_time?: string;
  notes?: string;
}
