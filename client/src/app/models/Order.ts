export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id?: string;
  user: string;
  restaurant: {
    _id: string;
    name: string;
    address: string;
    cuisine: string;
  };
  items: OrderItem[];
  total: number;
  status: string;
  date?: string;
}
