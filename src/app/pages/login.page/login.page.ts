import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonItem, IonInput, IonButton, IonIcon, IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { medkit, logInOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonInput,
    IonButton, IonIcon, IonText, RouterLink
  ],
  template: `
    <ion-content class="ion-padding">
      <div class="login-wrapper">
        <ion-card>
          <ion-card-header class="ion-text-center">
            <ion-icon name="medkit" color="primary" style="font-size: 48px; margin: 0 auto;"></ion-icon>
            <ion-card-title>ClinicCare Portal</ion-card-title>
            <ion-card-subtitle>Appointment & Patient Records</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <ion-item lines="full">
              <ion-input
                label="Username"
                labelPlacement="floating"
                [ngModel]="username()"
                (ngModelChange)="username.set($event)"
                placeholder="admin1 or doctor1">
              </ion-input>
            </ion-item>

            <ion-item lines="full" class="ion-margin-bottom">
              <ion-input
                type="password"
                label="Password"
                labelPlacement="floating"
                [ngModel]="password()"
                (ngModelChange)="password.set($event)">
              </ion-input>
            </ion-item>

            @if (errorMsg()) {
              <ion-text color="danger">
                <p class="ion-text-center">{{ errorMsg() }}</p>
              </ion-text>
            }

            

            <ion-button expand="block" (click)="onLogin()" class="ion-margin-top">
  <ion-icon slot="start" name="log-in-outline"></ion-icon>
  Sign In
</ion-button>

<ion-button expand="block" fill="clear" routerLink="/register" class="ion-margin-top">
  Don't have an account? Register
</ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .login-wrapper {
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
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  username = signal('');
  password = signal('');
  errorMsg = signal('');

  constructor() {
    addIcons({ medkit, logInOutline });
  }

  onLogin() {
    this.errorMsg.set('');
    
    this.authService.login(this.username(), this.password()).subscribe({
      next: (response: any) => {
        // 3. Handle successful login and route based on user role
        // Adjust property names (e.g. response.role) to match your Python backend response
        if (response.role === 'admin' || response.role === 'receptionist') {
          this.router.navigate(['/admin-dashboard']);
        } else if (response.role === 'doctor') {
          this.router.navigate(['/doctor-dashboard']);
        } else {
          this.router.navigate(['/dashboard']); // Fallback route
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.errorMsg.set('Invalid credentials or server connection error.');
      }
    });
  }
}
