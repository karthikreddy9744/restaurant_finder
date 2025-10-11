import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MenuItem, Restaurant } from '../models/Restaurant';

export interface CartItem extends MenuItem {
  restaurant?: Restaurant;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$: Observable<CartItem[]> = this.cartSubject.asObservable();

  // Create a new observable for the total price.
  // It automatically recalculates when the cart$ observable emits a new value.
  total$: Observable<number> = this.cart$.pipe(
    map(items => items.reduce((acc, item) => acc + item.price, 0))
  );

  addToCart(item: MenuItem, restaurant?: Restaurant) {
    const currentCart = this.cartSubject.getValue();
    const cartItem: CartItem = { ...item, restaurant };
    this.cartSubject.next([...currentCart, cartItem]);
  }

  removeFromCart(item: MenuItem) {
    const currentCart = [...this.cartSubject.getValue()]; // Create a copy
    const itemIndex = currentCart.findIndex(cartItem => cartItem._id === item._id);
    if (itemIndex > -1) {
      currentCart.splice(itemIndex, 1);
      this.cartSubject.next(currentCart);
    }
  }

  clearCart() {
    this.cartSubject.next([]);
  }
}
