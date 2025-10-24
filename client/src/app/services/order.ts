import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/Order';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.backendUrl}/orders`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  createOrder(order: Order): Observable<Order> {
    const headers = new HttpHeaders(this.authService.getAuthHeaders());
    return this.http.post<Order>(this.apiUrl, order, { headers });
  }

  getOrders(): Observable<Order[]> {
    const headers = new HttpHeaders(this.authService.getAuthHeaders());
    return this.http.get<Order[]>(this.apiUrl, { headers });
  }
}
