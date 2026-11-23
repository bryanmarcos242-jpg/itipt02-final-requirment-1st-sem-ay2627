export interface User {
  user_id: number;
  username: string;
  role: 'admin' | 'doctor';
  full_name: string;
}

export interface Patient {
  patient_id?: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  contact_number: string;
  address: string;
}

export interface Appointment {
  appointment_id?: number;
  patient_id: number;
  first_name?: string;
  last_name?: string;
  contact_number?: string;
  appointment_date: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  reason: string;
}

export interface Consultation {
  consultation_id?: number;
  patient_id: number;
  doctor_id: number;
  appointment_id?: number | null;
  first_name?: string;
  last_name?: string;
  doctor_name?: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  consultation_date?: string;
}