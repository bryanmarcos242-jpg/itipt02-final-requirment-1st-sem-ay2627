import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Patient, Appointment, Consultation } from '../models/clinic.models';

@Injectable({ providedIn: 'root' })
export class ClinicService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api';

  // State Signals
  patients = signal<Patient[]>([]);
  appointments = signal<Appointment[]>([]);
  consultations = signal<Consultation[]>([]);

  // Computed Signals for UI Metrics
  activeAppointmentsCount = computed(
    () => this.appointments().filter((a) => a.status === 'Scheduled' || a.status === 'Rescheduled').length
  );
  totalPatientsCount = computed(() => this.patients().length);

  // --- Patients ---
  loadPatients() {
    this.http.get<Patient[]>(`${this.apiUrl}/patients`).subscribe((data) => this.patients.set(data));
  }

  addPatient(patient: Patient) {
    return this.http.post(`${this.apiUrl}/patients`, patient).subscribe(() => this.loadPatients());
  }

  updatePatient(id: number, patient: Patient) {
    return this.http.put(`${this.apiUrl}/patients/${id}`, patient).subscribe(() => this.loadPatients());
  }

  deletePatient(id: number) {
    return this.http.delete(`${this.apiUrl}/patients/${id}`).subscribe(() => {
      this.loadPatients();
      this.loadAppointments();
    });
  }

  // --- Appointments ---
  loadAppointments() {
    this.http.get<Appointment[]>(`${this.apiUrl}/appointments`).subscribe((data) => this.appointments.set(data));
  }

  addAppointment(appt: Appointment) {
    return this.http.post(`${this.apiUrl}/appointments`, appt).subscribe(() => this.loadAppointments());
  }

  updateAppointment(id: number, payload: Partial<Appointment>) {
    return this.http.put(`${this.apiUrl}/appointments/${id}`, payload).subscribe(() => this.loadAppointments());
  }

  deleteAppointment(id: number) {
    return this.http.delete(`${this.apiUrl}/appointments/${id}`).subscribe(() => this.loadAppointments());
  }

  // --- Consultations ---
  loadConsultations() {
    this.http.get<Consultation[]>(`${this.apiUrl}/consultations`).subscribe((data) => this.consultations.set(data));
  }

  addConsultation(consult: Consultation) {
    return this.http.post(`${this.apiUrl}/consultations`, consult).subscribe(() => {
      this.loadConsultations();
      this.loadAppointments();
    });
  }

  updateConsultation(id: number, payload: Partial<Consultation>) {
    return this.http.put(`${this.apiUrl}/consultations/${id}`, payload).subscribe(() => this.loadConsultations());
  }
}