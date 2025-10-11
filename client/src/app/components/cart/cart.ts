import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart';
import { OrderService } from '../../services/order';
import { AuthService } from '../../services/auth';
import { MenuItem } from '../../models/Restaurant';
import { Order, OrderItem } from '../../models/Order';
import { Observable, map, first } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit {
  cart$!: Observable<CartItem[]>;
  total$!: Observable<number>;
  isPlacingOrder = false;
  showOrderModal = false;
  orderId = '';
  orderTotal = 0;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cart$ = this.cartService.cart$;
    this.total$ = this.cartService.total$;
  }

  removeFromCart(item: CartItem) {
    this.cartService.removeFromCart(item);
  }

  addToCart(item: CartItem) {
    this.cartService.addToCart(item, item.restaurant);
  }

  clearCart() {
    this.cartService.clearCart();
  }

  getUniqueItems(cartItems: CartItem[]): CartItem[] {
    const uniqueItems: CartItem[] = [];
    const seen = new Set<string>();

    cartItems.forEach(item => {
      if (item._id && !seen.has(item._id)) {
        seen.add(item._id);
        uniqueItems.push(item);
      }
    });

    return uniqueItems;
  }

  getItemQuantity(cartItems: CartItem[], item: CartItem): number {
    return cartItems.filter(cartItem => cartItem._id === item._id).length;
  }

  placeOrder() {
    this.isPlacingOrder = true;

    this.cart$.pipe(first()).subscribe(cartItems => {
      this.total$.pipe(first()).subscribe(total => {
        if (cartItems.length > 0) {
          const orderItems: OrderItem[] = this.getUniqueItems(cartItems).map(item => ({
            name: item.name,
            price: item.price,
            quantity: this.getItemQuantity(cartItems, item)
          }));

          // Get restaurant information from the first cart item
          const restaurant = cartItems[0].restaurant;
          if (!restaurant) {
            this.isPlacingOrder = false;
            alert('Restaurant information is missing. Please try again.');
            return;
          }

          const order: any = {
            restaurant: restaurant._id,
            items: orderItems,
            total: total,
            status: 'Pending'
          };

          this.orderService.createOrder(order).subscribe({
            next: (createdOrder: any) => {
              this.isPlacingOrder = false;
              this.orderId = createdOrder._id || 'ORD-' + Date.now();
              this.orderTotal = total;
              this.showOrderModal = true;
              this.cartService.clearCart();
            },
            error: (err) => {
              this.isPlacingOrder = false;
              console.error('Error placing order:', err);
              alert('Failed to place order. Please try again.');
            }
          });
        }
      });
    });
  }

  closeOrderModal() {
    this.showOrderModal = false;
    this.orderId = '';
    this.orderTotal = 0;
  }

  viewOrders() {
    this.closeOrderModal();
    this.router.navigate(['/profile']);
  }
}
