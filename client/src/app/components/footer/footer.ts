import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Observable } from 'rxjs';
import { User } from '../../models/User';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class FooterComponent implements OnInit {
  isLoggedIn$!: Observable<boolean>;
  isAdmin: boolean = false;

  constructor(private authService: AuthService) {}

  currentYear = new Date().getFullYear();

  socialLinks = [
    { name: 'Facebook', icon: '📘', url: '#' },
    { name: 'Twitter', icon: '🐦', url: '#' },
    { name: 'Instagram', icon: '📷', url: '#' },
    { name: 'LinkedIn', icon: '💼', url: '#' }
  ];

  quickLinks = [
    { name: 'About Us', route: '/about' },
    { name: 'Contact', route: '/contact' },
    { name: 'Privacy Policy', route: '/privacy' },
    { name: 'Terms of Service', route: '/terms' }
  ];

  restaurantLinks = [
    { name: 'Browse Restaurants', route: '/restaurants' },
    { name: 'Add Your Restaurant', route: '/restaurants/new' },
    { name: 'Restaurant Owners', route: '/admin' }
  ];

  customerService = [
    { name: 'Help Center', route: '/help' },
    { name: 'Order Support', route: '/support' },
    { name: 'Feedback', route: '/feedback' }
  ];

  ngOnInit(): void {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.authService.getProfile().subscribe((user: User) => this.isAdmin = user.role === 'admin');
      }
    });
  }
}
