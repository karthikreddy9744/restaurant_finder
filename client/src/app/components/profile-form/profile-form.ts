import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User, Address, UserPreferences } from '../../models/User';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile-form.html',
  styleUrls: ['./profile-form.css']
})
export class ProfileFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  profileForm!: FormGroup;
  addressForm!: FormGroup;
  preferencesForm!: FormGroup;
  user: User | null = null;
  isLoading = false;
  isSaving = false;
  activeTab = 'profile';
  showAddressForm = false;
  editingAddress: Address | null = null;

  // Options for form dropdowns
  addressTypes = [
    { value: 'home', label: 'Home', icon: '🏠' },
    { value: 'work', label: 'Work', icon: '🏢' },
    { value: 'other', label: 'Other', icon: '📍' }
  ];

  cuisineOptions = [
    'Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese',
    'Korean', 'Mediterranean', 'American', 'Continental', 'Fast Food', 'Desserts'
  ];

  dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free',
    'Halal', 'Kosher', 'Low-Carb', 'Keto', 'Paleo'
  ];

  states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForms(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: [{ value: '', disabled: true }],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]]
    });

    this.addressForm = this.fb.group({
      street: ['', [Validators.required, Validators.minLength(5)]],
      area: ['', [Validators.required, Validators.minLength(2)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      landmark: [''],
      type: ['home', Validators.required]
    });

    this.preferencesForm = this.fb.group({
      cuisine: this.fb.array([]),
      dietaryRestrictions: this.fb.array([]),
      deliveryInstructions: [''],
      notificationSettings: this.fb.group({
        email: [true],
        sms: [true],
        push: [true]
      })
    });
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.userService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.user = user;
          this.populateForms(user);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading profile:', err);
          this.isLoading = false;
        }
      });
  }

  populateForms(user: User): void {
    this.profileForm.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone || ''
    });

    if (user.preferences) {
      this.populatePreferencesForm(user.preferences);
    }
  }

  populatePreferencesForm(preferences: UserPreferences): void {
    // Clear existing arrays
    this.clearFormArray(this.preferencesForm.get('cuisine') as FormArray);
    this.clearFormArray(this.preferencesForm.get('dietaryRestrictions') as FormArray);

    // Add cuisine preferences
    preferences.cuisine?.forEach(cuisine => {
      this.addCuisinePreference(cuisine);
    });

    // Add dietary restrictions
    preferences.dietaryRestrictions?.forEach(restriction => {
      this.addDietaryRestriction(restriction);
    });

    this.preferencesForm.patchValue({
      deliveryInstructions: preferences.deliveryInstructions || '',
      notificationSettings: preferences.notificationSettings || {
        email: true,
        sms: true,
        push: true
      }
    });
  }

  clearFormArray(formArray: FormArray): void {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  // Profile form methods
  saveProfile(): void {
    if (this.profileForm.valid) {
      this.isSaving = true;
      this.userService.updateProfile(this.profileForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (user) => {
            this.user = user;
            this.isSaving = false;
            this.showSuccessMessage('Profile updated successfully!');
          },
          error: (err) => {
            console.error('Error updating profile:', err);
            this.isSaving = false;
            this.showErrorMessage('Failed to update profile. Please try again.');
          }
        });
    }
  }

  // Address form methods
  showAddAddressForm(): void {
    this.editingAddress = null;
    this.addressForm.reset({ type: 'home' });
    this.showAddressForm = true;
  }

  editAddress(address: Address): void {
    this.editingAddress = address;
    this.addressForm.patchValue(address);
    this.showAddressForm = true;
  }

  saveAddress(): void {
    if (this.addressForm.valid) {
      this.isSaving = true;
      const addressData = this.addressForm.value;

      const saveOperation = this.editingAddress
        ? this.userService.updateAddress(this.editingAddress._id!, addressData)
        : this.userService.addAddress(addressData);

      saveOperation
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (user) => {
            this.user = user;
            this.isSaving = false;
            this.showAddressForm = false;
            this.editingAddress = null;
            this.showSuccessMessage('Address saved successfully!');
          },
          error: (err) => {
            console.error('Error saving address:', err);
            this.isSaving = false;
            this.showErrorMessage('Failed to save address. Please try again.');
          }
        });
    }
  }

  deleteAddress(address: Address): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.isSaving = true;
      this.userService.deleteAddress(address._id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (user) => {
            this.user = user;
            this.isSaving = false;
            this.showSuccessMessage('Address deleted successfully!');
          },
          error: (err) => {
            console.error('Error deleting address:', err);
            this.isSaving = false;
            this.showErrorMessage('Failed to delete address. Please try again.');
          }
        });
    }
  }

  setDefaultAddress(address: Address): void {
    this.isSaving = true;
    this.userService.setDefaultAddress(address._id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.user = user;
          this.isSaving = false;
          this.showSuccessMessage('Default address updated!');
        },
        error: (err) => {
          console.error('Error setting default address:', err);
          this.isSaving = false;
          this.showErrorMessage('Failed to update default address. Please try again.');
        }
      });
  }

  // Preferences form methods
  addCuisinePreference(cuisine: string = ''): void {
    const cuisineArray = this.preferencesForm.get('cuisine') as FormArray;
    cuisineArray.push(this.fb.control(cuisine, Validators.required));
  }

  removeCuisinePreference(index: number): void {
    const cuisineArray = this.preferencesForm.get('cuisine') as FormArray;
    cuisineArray.removeAt(index);
  }

  addDietaryRestriction(restriction: string = ''): void {
    const dietaryArray = this.preferencesForm.get('dietaryRestrictions') as FormArray;
    dietaryArray.push(this.fb.control(restriction, Validators.required));
  }

  removeDietaryRestriction(index: number): void {
    const dietaryArray = this.preferencesForm.get('dietaryRestrictions') as FormArray;
    dietaryArray.removeAt(index);
  }

  savePreferences(): void {
    if (this.preferencesForm.valid) {
      this.isSaving = true;
      const preferences = this.preferencesForm.value;

      this.userService.updatePreferences(preferences)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (user) => {
            this.user = user;
            this.isSaving = false;
            this.showSuccessMessage('Preferences updated successfully!');
          },
          error: (err) => {
            console.error('Error updating preferences:', err);
            this.isSaving = false;
            this.showErrorMessage('Failed to update preferences. Please try again.');
          }
        });
    }
  }

  // Utility methods
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  cancelAddressForm(): void {
    this.showAddressForm = false;
    this.editingAddress = null;
    this.addressForm.reset({ type: 'home' });
  }

  getAddressTypeIcon(type: string): string {
    const addressType = this.addressTypes.find(t => t.value === type);
    return addressType?.icon || '📍';
  }

  getAddressTypeLabel(type: string): string {
    const addressType = this.addressTypes.find(t => t.value === type);
    return addressType?.label || 'Other';
  }

  showSuccessMessage(message: string): void {
    // You can implement a toast notification here
    alert(message);
  }

  showErrorMessage(message: string): void {
    // You can implement a toast notification here
    alert(message);
  }

  // Getters for form arrays
  get cuisineArray(): FormArray {
    return this.preferencesForm.get('cuisine') as FormArray;
  }

  get dietaryArray(): FormArray {
    return this.preferencesForm.get('dietaryRestrictions') as FormArray;
  }

  // Getter to safely access user addresses
  get userAddresses(): Address[] {
    return this.user?.addresses || [];
  }

  // Check if user has addresses
  get hasAddresses(): boolean {
    return this.userAddresses.length > 0;
  }
}
