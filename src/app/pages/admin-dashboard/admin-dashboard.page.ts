import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonContent, IonSegment, IonSegmentButton, IonLabel, IonCard,
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonList, IonItem, IonInput, IonSelect, IonSelectOption, IonBadge, IonModal
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  logOutOutline, personAdd, calendar, trash, create, closeCircle, arrowBackOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { ClinicService } from '../../services/clinic.service';
import { Patient, Appointment } from '../../models/clinic.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonButtons,
    IonButton, IonIcon, IonContent, IonSegment, IonSegmentButton, IonLabel,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonList, IonItem, IonInput, IonSelect, IonSelectOption, IonBadge, IonModal
  ],
  styles: [`
    .back-btn {
      --color: var(--ion-color-primary-contrast, #ffffff);
      --background-hover: rgba(255, 255, 255, 0.12);
      --border-radius: 50%;
      margin-inline-start: 4px;

      ion-icon {
        font-size: 1.35rem;
      }
    }
  `],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-button class="back-btn" routerLink="/login" aria-label="Back to Login">
            <ion-icon slot="icon-only" name="arrow-back-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Receptionist Portal</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="auth.logout()" aria-label="Logout">
            <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment [value]="activeTab()" (ionChange)="activeTab.set($any($event.detail.value))">
          <ion-segment-button value="patients">
            <ion-label>Patients ({{ clinic.totalPatientsCount() }})</ion-label>
          </ion-segment-button>
          <ion-segment-button value="appointments">
            <ion-label>Appointments ({{ clinic.activeAppointmentsCount() }})</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- PATIENTS TAB -->
      @if (activeTab() === 'patients') {
        <ion-button expand="block" (click)="openPatientModal()">
          <ion-icon slot="start" name="person-add"></ion-icon>
          Register New Patient
        </ion-button>

        <ion-list>
          @for (p of clinic.patients(); track p.patient_id) {
            <ion-card>
              <ion-card-header>
                <ion-card-title>{{ p.first_name }} {{ p.last_name }}</ion-card-title>
                <ion-card-subtitle>{{ p.gender }} | DOB: {{ p.date_of_birth }}</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <p><strong>Phone:</strong> {{ p.contact_number }}</p>
                <p><strong>Address:</strong> {{ p.address }}</p>
                <div class="ion-margin-top">
                  <ion-button size="small" fill="outline" (click)="openPatientModal(p)">
                    <ion-icon slot="start" name="create"></ion-icon> Edit
                  </ion-button>
                  <ion-button size="small" color="danger" fill="outline" (click)="clinic.deletePatient(p.patient_id!)">
                    <ion-icon slot="start" name="trash"></ion-icon> Delete
                  </ion-button>
                </div>
              </ion-card-content>
            </ion-card>
          }
        </ion-list>
      }

      <!-- APPOINTMENTS TAB -->
      @if (activeTab() === 'appointments') {
        <ion-button expand="block" (click)="openApptModal()">
          <ion-icon slot="start" name="calendar"></ion-icon>
          Schedule Appointment
        </ion-button>

        <ion-list>
          @for (a of clinic.appointments(); track a.appointment_id) {
            <ion-card>
              <ion-card-header>
                <ion-badge [color]="getStatusColor(a.status)">{{ a.status }}</ion-badge>
                <ion-card-title class="ion-margin-top">{{ a.first_name }} {{ a.last_name }}</ion-card-title>
                <ion-card-subtitle>{{ a.appointment_date | date:'medium' }}</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <p><strong>Reason:</strong> {{ a.reason }}</p>
                <div class="ion-margin-top">
                  <ion-button size="small" fill="outline" (click)="openApptModal(a)">
                    Reschedule
                  </ion-button>
                  @if (a.status !== 'Cancelled' && a.status !== 'Completed') {
                    <ion-button size="small" color="warning" fill="outline" (click)="cancelAppt(a.appointment_id!)">
                      Cancel
                    </ion-button>
                  }
                  <ion-button size="small" color="danger" fill="clear" (click)="clinic.deleteAppointment(a.appointment_id!)">
                    <ion-icon name="trash"></ion-icon>
                  </ion-button>
                </div>
              </ion-card-content>
            </ion-card>
          }
        </ion-list>
      }

      <!-- PATIENT FORM MODAL -->
      <ion-modal [isOpen]="isPatientModalOpen()" (didDismiss)="isPatientModalOpen.set(false)">
        <ng-template>
          <ion-header>
            <ion-toolbar>
              <ion-title>{{ editingPatientId() ? 'Edit Patient' : 'New Patient' }}</ion-title>
              <ion-buttons slot="end">
                <ion-button (click)="isPatientModalOpen.set(false)">Close</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <ion-item>
              <ion-input label="First Name" labelPlacement="stacked" [(ngModel)]="patientForm.first_name"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input label="Last Name" labelPlacement="stacked" [(ngModel)]="patientForm.last_name"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input type="date" label="Date of Birth" labelPlacement="stacked" [(ngModel)]="patientForm.date_of_birth"></ion-input>
            </ion-item>
            <ion-item>
              <ion-select label="Gender" labelPlacement="stacked" [(ngModel)]="patientForm.gender">
                <ion-select-option value="Male">Male</ion-select-option>
                <ion-select-option value="Female">Female</ion-select-option>
                <ion-select-option value="Other">Other</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-input label="Contact Number" labelPlacement="stacked" [(ngModel)]="patientForm.contact_number"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input label="Address" labelPlacement="stacked" [(ngModel)]="patientForm.address"></ion-input>
            </ion-item>
            <ion-button expand="block" class="ion-margin-top" (click)="savePatient()">Save Patient</ion-button>
          </ion-content>
        </ng-template>
      </ion-modal>

      <!-- APPOINTMENT FORM MODAL -->
      <ion-modal [isOpen]="isApptModalOpen()" (didDismiss)="isApptModalOpen.set(false)">
        <ng-template>
          <ion-header>
            <ion-toolbar>
              <ion-title>{{ editingApptId() ? 'Reschedule Appointment' : 'New Appointment' }}</ion-title>
              <ion-buttons slot="end">
                <ion-button (click)="isApptModalOpen.set(false)">Close</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            @if (!editingApptId()) {
              <ion-item>
                <ion-select label="Select Patient" labelPlacement="stacked" [(ngModel)]="apptForm.patient_id">
                  @for (p of clinic.patients(); track p.patient_id) {
                    <ion-select-option [value]="p.patient_id">{{ p.first_name }} {{ p.last_name }}</ion-select-option>
                  }
                </ion-select>
              </ion-item>
            }
            <ion-item>
              <ion-input type="datetime-local" label="Date & Time" labelPlacement="stacked" [(ngModel)]="apptForm.appointment_date"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input label="Reason for Visit" labelPlacement="stacked" [(ngModel)]="apptForm.reason"></ion-input>
            </ion-item>
            <ion-button expand="block" class="ion-margin-top" (click)="saveAppt()">Confirm Schedule</ion-button>
          </ion-content>
        </ng-template>
      </ion-modal>
    </ion-content>
  `
})
export class AdminDashboardPage implements OnInit {
  auth = inject(AuthService);
  clinic = inject(ClinicService);

  activeTab = signal<'patients' | 'appointments'>('patients');
  isPatientModalOpen = signal(false);
  editingPatientId = signal<number | null>(null);

  isApptModalOpen = signal(false);
  editingApptId = signal<number | null>(null);

  patientForm: Patient = { first_name: '', last_name: '', date_of_birth: '', gender: 'Male', contact_number: '', address: '' };
  apptForm: Appointment = { patient_id: 0, appointment_date: '', status: 'Scheduled', reason: '' };

  constructor() {
    addIcons({ logOutOutline, personAdd, calendar, trash, create, closeCircle, arrowBackOutline });
  }

  ngOnInit() {
    this.clinic.loadPatients();
    this.clinic.loadAppointments();
  }

  openPatientModal(patient?: Patient) {
    if (patient) {
      this.editingPatientId.set(patient.patient_id!);
      this.patientForm = { ...patient };
    } else {
      this.editingPatientId.set(null);
      this.patientForm = { first_name: '', last_name: '', date_of_birth: '', gender: 'Male', contact_number: '', address: '' };
    }
    this.isPatientModalOpen.set(true);
  }

  savePatient() {
    if (this.editingPatientId()) {
      this.clinic.updatePatient(this.editingPatientId()!, this.patientForm);
    } else {
      this.clinic.addPatient(this.patientForm);
    }
    this.isPatientModalOpen.set(false);
  }

  openApptModal(appt?: Appointment) {
    if (appt) {
      this.editingApptId.set(appt.appointment_id!);
      this.apptForm = { ...appt };
    } else {
      this.editingApptId.set(null);
      this.apptForm = { patient_id: 0, appointment_date: '', status: 'Scheduled', reason: '' };
    }
    this.isApptModalOpen.set(true);
  }

  saveAppt() {
    if (this.editingApptId()) {
      this.clinic.updateAppointment(this.editingApptId()!, {
        appointment_date: this.apptForm.appointment_date,
        reason: this.apptForm.reason,
        status: 'Rescheduled'
      });
    } else {
      this.clinic.addAppointment(this.apptForm);
    }
    this.isApptModalOpen.set(false);
  }

  cancelAppt(id: number) {
    this.clinic.updateAppointment(id, { status: 'Cancelled' });
  }

  getStatusColor(status: string) {
    switch (status) {
      case 'Completed': return 'success';
      case 'Cancelled': return 'danger';
      case 'Rescheduled': return 'warning';
      default: return 'primary';
    }
  }
}