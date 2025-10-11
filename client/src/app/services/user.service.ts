import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Address, UserPreferences } from '../models/User';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getCurrentUser(): Observable<User> {
    const headers = new HttpHeaders(this.authService.getAuthHeaders());
    return this.http.get<User>(`${this.apiUrl}/profile`, { headers });
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    const headers = new HttpHeaders(this.authService.getAuthHeaders());
    return this.http.put<User>(`${this.apiUrl}/profile`, userData, { headers });
  }

  addAddress(address: Address): Observable<User> {
    const headers = new HttpHeaders(this.authService.getAuthHeaders());
    return this.http.post<User>(`${this.apiUrl}/addresses`, address, { headers });
  }

  updateAddress(addressId: string, address: Address): Observable<User> {
    const headers = new HttpHeaders(this.authService.getAuthHeaders());
    return this.http.put<User>(`${this.apiUrl}/addresses/${addressId}`, address, { headers });
  }

  deleteAddress(addressId: string): Observable<User> {
    const headers = new HttpHeaders(this.authService.getAuthHeaders());
    return this.http.delete<User>(`${this.apiUrl}/addresses/${addressId}`, { headers });
  }

  setDefaultAddress(addressId: string): Observable<User> {
    const headers = new HttpHeaders(this.authService.getAuthHeaders());
    return this.http.put<User>(`${this.apiUrl}/addresses/${addressId}/default`, {}, { headers });
  }

  updatePreferences(preferences: UserPreferences): Observable<User> {
    const headers = new HttpHeaders(this.authService.getAuthHeaders());
    return this.http.put<User>(`${this.apiUrl}/preferences`, preferences, { headers });
  }
}
