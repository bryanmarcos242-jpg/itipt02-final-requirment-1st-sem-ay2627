import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonContent, IonSegment, IonSegmentButton, IonLabel, IonCard,
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonList, IonItem, IonTextarea, IonBadge, IonModal
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline, documentText, create, checkmarkCircle } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { ClinicService } from '../../services/clinic.service';
import { Appointment, Consultation } from '../../models/clinic.models';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons,
    IonButton, IonIcon, IonContent, IonSegment, IonSegmentButton, IonLabel,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonList, IonItem, IonTextarea, IonBadge, IonModal
  ],
  template: `
    <ion-header>
      <ion-toolbar color="secondary">
        <ion-title>Doctor Portal</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="auth.logout()">
            <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment [value]="activeTab()" (ionChange)="activeTab.set($any($event.detail.value))">
          <ion-segment-button value="schedule">
            <ion-label>Schedule</ion-label>
          </ion-segment-button>
          <ion-segment-button value="consultations">
            <ion-label>Consultations</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- SCHEDULE TAB -->
      @if (activeTab() === 'schedule') {
        <ion-list>
          @for (a of clinic.appointments(); track a.appointment_id) {
            <ion-card>
              <ion-card-header>
                <ion-badge [color]="a.status === 'Completed' ? 'success' : 'primary'">{{ a.status }}</ion-badge>
                <ion-card-title class="ion-margin-top">{{ a.first_name }} {{ a.last_name }}</ion-card-title>
                <ion-card-subtitle>{{ a.appointment_date | date:'medium' }}</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <p><strong>Reason:</strong> {{ a.reason }}</p>
                <p><strong>Contact:</strong> {{ a.contact_number }}</p>
                @if (a.status !== 'Cancelled' && a.status !== 'Completed') {
                  <ion-button size="small" class="ion-margin-top" (click)="openConsultModalFromAppt(a)">
                    <ion-icon slot="start" name="document-text"></ion-icon>
                    Consult Patient
                  </ion-button>
                }
              </ion-card-content>
            </ion-card>
          }
        </ion-list>
      }

      <!-- CONSULTATION RECORDS TAB -->
      @if (activeTab() === 'consultations') {
        <ion-list>
          @for (c of clinic.consultations(); track c.consultation_id) {
            <ion-card>
              <ion-card-header>
                <ion-card-title>{{ c.first_name }} {{ c.last_name }}</ion-card-title>
                <ion-card-subtitle>{{ c.consultation_date | date:'mediumDate' }} • {{ c.doctor_name }}</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <p><strong>Diagnosis:</strong> {{ c.diagnosis }}</p>
                <p><strong>Prescription:</strong> {{ c.prescription }}</p>
                <p><strong>Notes:</strong> {{ c.notes }}</p>
                <ion-button size="small" fill="outline" class="ion-margin-top" (click)="editConsultation(c)">
                  <ion-icon slot="start" name="create"></ion-icon>
                  Update Record
                </ion-button>
              </ion-card-content>
            </ion-card>
          }
        </ion-list>
      }

      <!-- CONSULTATION FORM MODAL -->
      <ion-modal [isOpen]="isConsultModalOpen()" (didDismiss)="isConsultModalOpen.set(false)">
        <ng-template>
          <ion-header>
            <ion-toolbar>
              <ion-title>{{ editingConsultId() ? 'Update Consultation' : 'New Consultation' }}</ion-title>
              <ion-buttons slot="end">
                <ion-button (click)="isConsultModalOpen.set(false)">Close</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <ion-item>
              <ion-textarea label="Diagnosis" labelPlacement="stacked" rows="3" [(ngModel)]="consultForm.diagnosis"></ion-textarea>
            </ion-item>
            <ion-item>
              <ion-textarea label="Prescription" labelPlacement="stacked" rows="3" [(ngModel)]="consultForm.prescription"></ion-textarea>
            </ion-item>
            <ion-item>
              <ion-textarea label="Clinical Notes" labelPlacement="stacked" rows="3" [(ngModel)]="consultForm.notes"></ion-textarea>
            </ion-item>
            <ion-button expand="block" class="ion-margin-top" (click)="saveConsultation()">
              <ion-icon slot="start" name="checkmark-circle"></ion-icon>
              Save & Complete
            </ion-button>
          </ion-content>
        </ng-template>
      </ion-modal>
    </ion-content>
  `
})
export class DoctorDashboardPage implements OnInit {
  auth = inject(AuthService);
  clinic = inject(ClinicService);

  activeTab = signal<'schedule' | 'consultations'>('schedule');
  isConsultModalOpen = signal(false);
  editingConsultId = signal<number | null>(null);

  consultForm: Consultation = {
    patient_id: 0,
    doctor_id: 0,
    appointment_id: null,
    diagnosis: '',
    prescription: '',
    notes: ''
  };

  constructor() {
    addIcons({ logOutOutline, documentText, create, checkmarkCircle });
  }

  ngOnInit() {
    this.clinic.loadAppointments();
    this.clinic.loadConsultations();
  }

  openConsultModalFromAppt(appt: Appointment) {
    this.editingConsultId.set(null);
    this.consultForm = {
      patient_id: appt.patient_id,
      doctor_id: this.auth.currentUser()?.user_id || 2,
      appointment_id: appt.appointment_id,
      diagnosis: '',
      prescription: '',
      notes: ''
    };
    this.isConsultModalOpen.set(true);
  }

  editConsultation(consult: Consultation) {
    this.editingConsultId.set(consult.consultation_id!);
    this.consultForm = { ...consult };
    this.isConsultModalOpen.set(true);
  }

  saveConsultation() {
    if (this.editingConsultId()) {
      this.clinic.updateConsultation(this.editingConsultId()!, {
        diagnosis: this.consultForm.diagnosis,
        prescription: this.consultForm.prescription,
        notes: this.consultForm.notes
      });
    } else {
      this.clinic.addConsultation(this.consultForm);
    }
    this.isConsultModalOpen.set(false);
  }
}