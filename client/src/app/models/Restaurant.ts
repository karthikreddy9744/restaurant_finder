
export interface Review {
  _id?: string;
  user: string;
  rating: number;
  comment: string;
  date?: string;
}

export interface MenuItem {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  restaurant?: Restaurant;
}

export interface Restaurant {
  _id?: string;
  name: string;
  address: string;
  cuisine: string;
  images?: string[];
  location?: {
    type: string;
    coordinates: number[];
  };
  owner?: string;
  menu: MenuItem[];
  reviews: Review[];
  date?: string;
}
