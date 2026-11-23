import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { User } from '../models/clinic.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:8000/api';

  // Reactive Signal holding authenticated user state
  currentUser = signal<User | null>(null);

  login(username: string, password: string) {
    return this.http.post<User>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((user) => {
        this.currentUser.set(user);
        if (user.role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/doctor-dashboard']);
        }
      })
    );
  }

  logout() {
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}