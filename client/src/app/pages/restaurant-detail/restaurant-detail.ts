import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, switchMap, takeUntil, map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../../services/cart';
import { CartComponent } from '../../components/cart/cart';
import { RestaurantService } from '../../services/restaurant';
import { Restaurant, MenuItem } from '../../models/Restaurant';
import { MapComponent } from '../../components/map/map';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [CommonModule, CartComponent, MapComponent],
  templateUrl: './restaurant-detail.html',
  styleUrls: ['./restaurant-detail.css']
})
export class RestaurantDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  restaurant!: Restaurant;
  isLoading = true;
  error: string | null = null;
  cart$!: Observable<CartItem[]>;

  @ViewChild(MapComponent) mapComponent!: MapComponent;

  constructor(
    private route: ActivatedRoute,
    private restaurantService: RestaurantService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.error = null;
    this.cart$ = this.cartService.cart$;

    this.route.paramMap.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        const id = params.get('id');
        return this.restaurantService.getRestaurant(id!).pipe(
          catchError(err => {
            console.error('Error fetching restaurant:', err);
            this.error = 'Could not load restaurant details. Please try again later.';
            this.isLoading = false;
            return [];
          })
        );
      })
    ).subscribe(restaurant => {
      this.restaurant = restaurant;
      this.isLoading = false;
      this.error = null;
      this.updateMap();
    });
  }

  ngAfterViewInit(): void {
    this.updateMap();
  }

  updateMap() {
    if (this.restaurant && this.restaurant.location && this.mapComponent) {
      this.mapComponent.addMarker(this.restaurant.location.coordinates[1], this.restaurant.location.coordinates[0], this.restaurant.name, false);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addToCart(item: MenuItem) {
    this.cartService.addToCart(item, this.restaurant);
  }

  isInCart(item: MenuItem): Observable<boolean> {
    return this.cart$.pipe(
      map(cartItems => cartItems.some(cartItem => cartItem._id === item._id))
    );
  }

  getItemCountInCart(item: MenuItem): Observable<number> {
    return this.cart$.pipe(
      map(cartItems => cartItems.filter(cartItem => cartItem._id === item._id).length)
    );
  }
}
