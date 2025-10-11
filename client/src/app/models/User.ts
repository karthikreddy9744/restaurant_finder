export interface Address {
  _id?: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  type: 'home' | 'work' | 'other';
  isDefault?: boolean;
}

export interface UserPreferences {
  cuisine: string[];
  dietaryRestrictions: string[];
  deliveryInstructions?: string;
  notificationSettings: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role?: string;
  addresses?: Address[];
  preferences?: UserPreferences;
  date?: string;
}
