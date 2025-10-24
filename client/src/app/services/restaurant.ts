import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Restaurant } from '../models/Restaurant';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private apiUrl = `${environment.backendUrl}/restaurants`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  getRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(this.apiUrl);
  }

  getNearbyRestaurants(lng: number, lat: number, maxDistance: number): Observable<Restaurant[]> {
    let params = new HttpParams();
    params = params.append('lng', lng.toString());
    params = params.append('lat', lat.toString());
    params = params.append('maxDistance', maxDistance.toString());

    return this.http.get<Restaurant[]>(`${this.apiUrl}/nearby`, { params });
  }

  searchRestaurants(term: string): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.apiUrl}/search?q=${term}`);
  }

  getRestaurant(id: string): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.apiUrl}/${id}`);
  }

  createRestaurant(restaurant: any): Observable<Restaurant> {
    const headers = new HttpHeaders({
      ...this.authService.getAuthHeaders(),
      'Content-Type': 'application/json'
    });
    return this.http.post<Restaurant>(this.apiUrl, restaurant, { headers });
  }

  updateRestaurant(id: string, restaurant: any): Observable<Restaurant> {
    const headers = new HttpHeaders({
      ...this.authService.getAuthHeaders(),
      'Content-Type': 'application/json'
    });
    return this.http.put<Restaurant>(`${this.apiUrl}/${id}`, restaurant, { headers });
  }

  deleteRestaurant(id: string): Observable<any> {
    const headers = new HttpHeaders(this.authService.getAuthHeaders());
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }

  addReview(id: string, review: any): Observable<any> {
    const headers = new HttpHeaders(this.authService.getAuthHeaders());
    return this.http.post(`${this.apiUrl}/${id}/reviews`, review, { headers });
  }

  uploadImages(images: File[]): Observable<{ msg: string, files: string[] }> {
    const formData = new FormData();
    images.forEach(image => {
      formData.append('images', image);
    });
    const headers = new HttpHeaders(this.authService.getAuthHeaders());
    return this.http.post<{ msg: string, files: string[] }>(`${this.apiUrl}/upload`, formData, { headers });
  }
}
