// src/app/services/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'token';
  private userKey = 'user';

  constructor(private http: HttpClient, private router: Router) {}

  // Login
  login(credentials: { email: string; password: string }) {
    return this.http.post<{ token: string; user: any }>(`${this.apiUrl}/login`, credentials);
  }

  // Registracija
  register(data: { name: string; email: string; password: string }) {
    return this.http.post<{ token: string; user: any }>(`${this.apiUrl}/register`, data);
  }

  // Čuvanje tokena
  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  // Uzimanje tokena
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Čuvanje korisnika 
  saveUser(user: any) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Uzimanje korisnika
  getUser(): any {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  // Provjera da li je prijavljen
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Logout
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.router.navigate(['/login']);
  }
}
