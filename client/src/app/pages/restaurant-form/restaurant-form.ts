import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RestaurantService } from '../../services/restaurant';
import { Restaurant, MenuItem } from '../../models/Restaurant';
import { MapComponent } from '../../components/map/map';

@Component({
  selector: 'app-restaurant-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MapComponent],
  templateUrl: './restaurant-form.html',
  styleUrl: './restaurant-form.css'
})
export class RestaurantFormComponent implements OnInit {
  restaurantForm!: FormGroup;
  isEditMode = false;
  restaurantId: string | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedFiles: File[] = [];

  @ViewChild(MapComponent) mapComponent!: MapComponent;

  constructor(
    private fb: FormBuilder,
    private restaurantService: RestaurantService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.restaurantForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      cuisine: ['', [Validators.required]],
      location: this.fb.group({
        type: ['Point'],
        coordinates: [[0, 0]]
      }),
      images: [[]],
      menu: this.fb.array([])
    });
  }

  private checkEditMode(): void {
    this.restaurantId = this.route.snapshot.paramMap.get('id');
    if (this.restaurantId && this.restaurantId !== 'new') {
      this.isEditMode = true;
      this.loadRestaurant();
    } else {
      this.addMenuItem();
    }
  }

  private loadRestaurant(): void {
    if (this.restaurantId) {
      this.isLoading = true;
      this.restaurantService.getRestaurant(this.restaurantId).subscribe({
        next: (restaurant) => {
          this.populateForm(restaurant);
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load restaurant';
          this.isLoading = false;
          console.error('Error loading restaurant:', error);
        }
      });
    }
  }

  private populateForm(restaurant: Restaurant): void {
    this.restaurantForm.patchValue({
      name: restaurant.name,
      address: restaurant.address,
      cuisine: restaurant.cuisine,
      location: restaurant.location,
      images: restaurant.images
    });

    // Set map marker after a short delay to ensure map is initialized
    setTimeout(() => {
      if (restaurant.location && this.mapComponent) {
        this.mapComponent.setMarker(restaurant.location.coordinates[1], restaurant.location.coordinates[0]);
      }
    }, 200);

    const menuArray = this.restaurantForm.get('menu') as FormArray;
    menuArray.clear();

    if (restaurant.menu && restaurant.menu.length > 0) {
      restaurant.menu.forEach(item => this.addMenuItem(item));
    } else {
      this.addMenuItem();
    }
  }

  get menuItems(): FormArray {
    return this.restaurantForm.get('menu') as FormArray;
  }

  addMenuItem(item?: MenuItem): void {
    const menuItemForm = this.fb.group({
      name: [item?.name || '', [Validators.required]],
      description: [item?.description || '', [Validators.required]],
      price: [item?.price || 0, [Validators.required, Validators.min(0.01)]],
      category: [item?.category || '', [Validators.required]]
    });

    this.menuItems.push(menuItemForm);
  }

  removeMenuItem(index: number): void {
    this.menuItems.removeAt(index);
  }

  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
  }

  onLocationChanged(location: {lat: number, lng: number}) {
    this.restaurantForm.patchValue({
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      }
    });
  }

  searchLocation(query: string) {
    if (!query || query.trim() === '') {
      return;
    }

    // Clear any previous error messages
    this.errorMessage = '';

    // Call the map component's search function
    this.mapComponent.searchLocation(query.trim());
  }

  onSubmit(): void {
    if (this.restaurantForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      if (this.selectedFiles.length > 0) {
        this.restaurantService.uploadImages(this.selectedFiles).subscribe({
          next: (res) => {
            this.restaurantForm.patchValue({ images: res.files });
            this.saveRestaurant();
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMessage = 'Failed to upload images';
          }
        });
      } else {
        this.saveRestaurant();
      }
    }
  }

  saveRestaurant(): void {
    const restaurantData = this.restaurantForm.value;

    if (this.isEditMode && this.restaurantId) {
      this.restaurantService.updateRestaurant(this.restaurantId, restaurantData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Restaurant updated successfully!';
          setTimeout(() => {
            this.router.navigate(['/admin']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.msg || 'Failed to update restaurant';
        }
      });
    } else {
      this.restaurantService.createRestaurant(restaurantData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Restaurant created successfully!';
          setTimeout(() => {
            this.router.navigate(['/admin']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.msg || 'Failed to create restaurant';
        }
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.restaurantForm.controls).forEach(key => {
      const control = this.restaurantForm.get(key);
      control?.markAsTouched();
    });

    this.menuItems.controls.forEach(control => {
      Object.keys(control.value).forEach(key => {
        control.get(key)?.markAsTouched();
      });
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.restaurantForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }

  getMenuItemError(index: number, fieldName: string): string {
    const menuItem = this.menuItems.at(index);
    const field = menuItem.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['min']) return `${fieldName} must be greater than 0`;
    }
    return '';
  }

  onCancel(): void {
    this.router.navigate(['/admin']);
  }
}
