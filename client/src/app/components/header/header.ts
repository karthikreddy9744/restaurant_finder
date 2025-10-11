import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';

interface UserInfo {
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn$!: Observable<boolean>;
  userInfo$ = new BehaviorSubject<UserInfo | null>(null);
  isAdmin = false;
  isDropdownOpen = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.isLoggedIn$ = this.authService.isLoggedIn();

    // Check if user is logged in and get user info
    this.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.loadUserInfo();
      } else {
        this.userInfo$.next(null);
        this.isAdmin = false;
      }
    });
  }

  private loadUserInfo(): void {
    // In a real app, you'd decode the JWT token or make an API call
    // For now, we'll simulate getting user info from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Simple JWT decode (in production, use a proper JWT library)
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userInfo$.next({
          name: payload.user?.name || 'User',
          email: payload.user?.email || '',
          role: payload.user?.role || 'user'
        });
        this.isAdmin = payload.user?.role === 'admin';
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }

  toggleDropdown(event: Event): void {
    event.preventDefault();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout(): void {
    this.authService.logout();
    this.userInfo$.next(null);
    this.isAdmin = false;
    this.isDropdownOpen = false;
    this.router.navigate(['/login']);
  }
}
