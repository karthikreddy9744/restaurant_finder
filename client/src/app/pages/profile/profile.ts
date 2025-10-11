import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderService } from '../../services/order';
import { Order } from '../../models/Order';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProfileFormComponent } from '../../components/profile-form/profile-form';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, ProfileFormComponent]
})
export class ProfileComponent implements OnInit {
  orders$!: Observable<Order[]>;

  constructor(private orderService: OrderService) { }

  ngOnInit(): void {
    this.orders$ = this.orderService.getOrders();
  }
}
