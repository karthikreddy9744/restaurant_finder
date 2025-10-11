
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RestaurantService } from '../../services/restaurant';
import { Restaurant } from '../../models/Restaurant';
import { CommonModule } from '@angular/common';
import { MapComponent } from '../../components/map/map';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MapComponent, FormsModule],
  templateUrl: './restaurant-list.html',
  styleUrls: ['./restaurant-list.css']
})
export class RestaurantListComponent implements OnInit, AfterViewInit {
  restaurants: Restaurant[] = [];
  radius: number = 10000; // 10km default
  lat: number = 0;
  lng: number = 0;
  isLoading: boolean = true;
  errorMessage: string = '';

  @ViewChild(MapComponent) mapComponent!: MapComponent;

  constructor(private restaurantService: RestaurantService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchRestaurants(params['q']);
      } else {
        this.getUserLocation();
      }
    });
  }

  ngAfterViewInit(): void {
    // Wait for map component to be initialized
    setTimeout(() => {
      if (this.mapComponent) {
        this.mapComponent.getUserLocation();
      }
    }, 100);
  }

  searchRestaurants(term: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.restaurantService.searchRestaurants(term).subscribe({
      next: (restaurants) => {
        this.restaurants = restaurants;
        this.isLoading = false;
        this.updateMap();
      },
      error: (error) => {
        console.error('Error searching restaurants:', error);
        this.errorMessage = 'Failed to search restaurants. Please try again.';
        this.isLoading = false;
      }
    });
  }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
          this.loadNearbyRestaurants();
        },
        error => {
          console.error('Geolocation error:', error);
          // Default location if geolocation fails
          this.lat = 28.6139; // Delhi coordinates
          this.lng = 77.2090;
          this.loadNearbyRestaurants();
        }
      );
    } else {
      // Default location if geolocation is not available
      this.lat = 28.6139; // Delhi coordinates
      this.lng = 77.2090;
      this.loadNearbyRestaurants();
    }
  }

  loadNearbyRestaurants() {
    this.isLoading = true;
    this.errorMessage = '';

    this.restaurantService.getNearbyRestaurants(this.lng, this.lat, this.radius).subscribe({
      next: (restaurants) => {
        this.restaurants = restaurants;
        this.isLoading = false;
        console.log('Restaurants loaded:', restaurants);

        // Debug: Check which restaurants have location data
        restaurants.forEach(restaurant => {
          console.log(`Restaurant: ${restaurant.name}, Location:`, restaurant.location);
        });

        // Wait for map to be ready before updating
        setTimeout(() => {
          this.updateMap();
        }, 500);
      },
      error: (error) => {
        console.error('Error loading restaurants:', error);
        this.errorMessage = 'Failed to load restaurants. Please try again.';
        this.isLoading = false;
        // Fallback: try to load all restaurants
        this.loadAllRestaurants();
      }
    });
  }

  loadAllRestaurants() {
    this.restaurantService.getRestaurants().subscribe({
      next: (restaurants) => {
        this.restaurants = restaurants;
        this.isLoading = false;
        console.log('All restaurants loaded:', restaurants);
        // Wait for map to be ready before updating
        setTimeout(() => {
          this.updateMap();
        }, 500);
      },
      error: (error) => {
        console.error('Error loading all restaurants:', error);
        this.errorMessage = 'Unable to load restaurants. Please check your connection.';
        this.isLoading = false;
      }
    });
  }

  updateMap() {
    if (this.mapComponent && this.mapComponent.mapInstance) {
      console.log(`Updating map with ${this.restaurants.length} restaurants. User location: ${this.lat}, ${this.lng}. Radius: ${this.radius}m.`);

      this.mapComponent.clearMarkers();
      this.mapComponent.setMarker(this.lat, this.lng);

      let markersAdded = 0;
      this.restaurants.forEach(restaurant => {
        if (restaurant.location && restaurant.location.coordinates && restaurant.location.coordinates.length === 2) {
          const restaurantLat = restaurant.location.coordinates[1];
          const restaurantLng = restaurant.location.coordinates[0];
          
          const distance = this.calculateDistance(this.lat, this.lng, restaurantLat, restaurantLng);
          
          console.log(`Restaurant: ${restaurant.name}, Coords: [${restaurantLng}, ${restaurantLat}], Distance: ${Math.round(distance)}m`);

          if (distance <= this.radius) {
            this.mapComponent.addMarker(restaurantLat, restaurantLng, restaurant.name, false);
            markersAdded++;
          }
        } else {
          console.log(`Skipping restaurant ${restaurant.name} due to missing or invalid location data.`);
        }
      });

      console.log(`Added ${markersAdded} markers to map within the ${this.radius}m radius.`);

      if (markersAdded === 0 && this.restaurants.length > 0) {
        console.log("No restaurants found within the radius. Displaying all restaurants for debugging purposes.");
        this.restaurants.forEach(restaurant => {
          if (restaurant.location && restaurant.location.coordinates && restaurant.location.coordinates.length === 2) {
            const restaurantLat = restaurant.location.coordinates[1];
            const restaurantLng = restaurant.location.coordinates[0];
            this.mapComponent.addMarker(restaurantLat, restaurantLng, restaurant.name, false);
          }
        });
      }

      setTimeout(() => {
        this.mapComponent.fitToMarkers();
      }, 200);
      
    } else {
      console.log('Map component not ready, retrying in 1 second...');
      setTimeout(() => this.updateMap(), 1000);
    }
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  onRadiusChange() {
    this.loadNearbyRestaurants();
  }

  getAverageRating(restaurant: Restaurant): number {
    if (!restaurant.reviews || restaurant.reviews.length === 0) {
      return 0;
    }
    const sum = restaurant.reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / restaurant.reviews.length) * 10) / 10; // Round to 1 decimal place
  }

  getDistanceInKm(restaurant: Restaurant): number {
    if (!restaurant.location || !restaurant.location.coordinates) {
      return 0;
    }
    const distance = this.calculateDistance(
      this.lat,
      this.lng,
      restaurant.location.coordinates[1],
      restaurant.location.coordinates[0]
    );
    return Math.round(distance / 1000);
  }

  // Test method to add a marker at a known location
  testMapMarkers() {
    if (this.mapComponent && this.mapComponent.mapInstance) {
      console.log('Testing map markers...');
      // Add a test marker at Delhi coordinates
      this.mapComponent.addMarker(28.6139, 77.2090, 'Test Marker - Delhi', false);
      console.log('Test marker added');
    }
  }
}
