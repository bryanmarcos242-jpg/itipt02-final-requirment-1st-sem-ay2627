import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonItem, IonInput, IonSelect, IonSelectOption,
  IonButton, IonIcon, IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personAddOutline, arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonInput,
    IonSelect, IonSelectOption, IonButton, IonIcon, IonText
  ],
  template: `
    <ion-content class="ion-padding">
      <div class="register-wrapper">
        <ion-card>
          <ion-card-header class="ion-text-center">
            <ion-icon name="person-add-outline" color="primary" style="font-size: 48px; margin: 0 auto;"></ion-icon>
            <ion-card-title>Create Account</ion-card-title>
            <ion-card-subtitle>Clinic Management System</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <ion-item lines="full">
              <ion-input
                label="Full Name"
                labelPlacement="floating"
                [ngModel]="fullName()"
                (ngModelChange)="fullName.set($event)"
                placeholder="e.g. Dr. Jane Doe">
              </ion-input>
            </ion-item>

            <ion-item lines="full">
              <ion-input
                label="Username"
                labelPlacement="floating"
                [ngModel]="username()"
                (ngModelChange)="username.set($event)"
                placeholder="Choose a username">
              </ion-input>
            </ion-item>

            <ion-item lines="full">
              <ion-input
                type="password"
                label="Password"
                labelPlacement="floating"
                [ngModel]="password()"
                (ngModelChange)="password.set($event)"
                placeholder="Choose a password">
              </ion-input>
            </ion-item>

            <ion-item lines="full" class="ion-margin-bottom">
              <ion-select
                label="Role"
                labelPlacement="floating"
                [ngModel]="role()"
                (ngModelChange)="role.set($event)">
                <ion-select-option value="admin">Admin / Receptionist</ion-select-option>
                <ion-select-option value="doctor">Doctor</ion-select-option>
              </ion-select>
            </ion-item>

            @if (errorMsg()) {
              <ion-text color="danger">
                <p class="ion-text-center">{{ errorMsg() }}</p>
              </ion-text>
            }

            @if (successMsg()) {
              <ion-text color="success">
                <p class="ion-text-center">{{ successMsg() }}</p>
              </ion-text>
            }

            <ion-button expand="block" (click)="onRegister()" class="ion-margin-top">
              Register
            </ion-button>

            <ion-button expand="block" fill="clear" routerLink="/login">
              <ion-icon slot="start" name="arrow-back-outline"></ion-icon>
              Back to Login
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .register-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }
    ion-card {
      width: 100%;
      max-width: 400px;
    }
  `]
})
export class RegisterPage {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:8000/api';

  fullName = signal('');
  username = signal('');
  password = signal('');
  role = signal<'admin' | 'doctor'>('doctor');
  errorMsg = signal('');
  successMsg = signal('');

  constructor() {
    addIcons({ personAddOutline, arrowBackOutline });
  }

  onRegister() {
    this.errorMsg.set('');
    this.successMsg.set('');

    if (!this.fullName() || !this.username() || !this.password()) {
      this.errorMsg.set('Please fill out all fields.');
      return;
    }

    const payload = {
      full_name: this.fullName(),
      username: this.username(),
      password: this.password(),
      role: this.role()
    };

    this.http.post(`${this.apiUrl}/register`, payload).subscribe({
      next: () => {
        this.successMsg.set('Registration successful! Redirecting...');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.detail || 'Registration failed. Username may already exist.');
      }
    });
  }
}