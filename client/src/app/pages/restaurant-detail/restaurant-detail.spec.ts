import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RestaurantService } from '../../services/restaurant';
import { CartService } from '../../services/cart';

import { RestaurantDetailComponent } from './restaurant-detail';

describe('RestaurantDetailComponent', () => {
  let component: RestaurantDetailComponent;
  let fixture: ComponentFixture<RestaurantDetailComponent>;

  // Mock services
  const mockRestaurantService = {
    getRestaurant: () => of({ name: 'Mock Restaurant', menu: [], reviews: [] }),
  };
  const mockCartService = {
    addToCart: () => {},
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantDetailComponent],
      // Provide mocks for dependencies
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of(new Map([['id', '1']])) } },
        { provide: RestaurantService, useValue: mockRestaurantService },
        { provide: CartService, useValue: mockCartService },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
