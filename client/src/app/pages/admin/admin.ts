import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RestaurantService } from '../../services/restaurant';
import { AuthService } from '../../services/auth';
import { Restaurant } from '../../models/Restaurant';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  restaurants: Restaurant[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private restaurantService: RestaurantService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.isLoading = true;
    this.restaurantService.getRestaurants().subscribe({
      next: (restaurants) => {
        this.restaurants = restaurants;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load restaurants';
        this.isLoading = false;
        console.error('Error loading restaurants:', error);
      }
    });
  }

  deleteRestaurant(id: string): void {
    if (confirm('Are you sure you want to delete this restaurant?')) {
      this.restaurantService.deleteRestaurant(id).subscribe({
        next: () => {
          this.loadRestaurants();
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete restaurant';
          console.error('Error deleting restaurant:', error);
        }
      });
    }
  }

  getTotalRestaurants(): number {
    return this.restaurants.length;
  }

  getTotalReviews(): number {
    return this.restaurants.reduce((total, restaurant) => total + restaurant.reviews.length, 0);
  }

  getAverageRating(): number {
    const totalRatings = this.restaurants.reduce((total, restaurant) => {
      const restaurantTotal = restaurant.reviews.reduce((sum, review) => sum + review.rating, 0);
      return total + restaurantTotal;
    }, 0);

    const totalReviews = this.getTotalReviews();
    return totalReviews > 0 ? Math.round((totalRatings / totalReviews) * 10) / 10 : 0;
  }

  getRestaurantRating(restaurant: Restaurant): string {
    if (restaurant.reviews.length === 0) return '0.0';
    const totalRating = restaurant.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / restaurant.reviews.length;
    return averageRating.toFixed(1);
  }
}
