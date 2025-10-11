import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { RestaurantListComponent } from './pages/restaurant-list/restaurant-list';
import { RestaurantDetailComponent } from './pages/restaurant-detail/restaurant-detail';
import { RestaurantFormComponent } from './pages/restaurant-form/restaurant-form';
import { ProfileComponent } from './pages/profile/profile';
import { AboutComponent } from './pages/about/about';
import { ContactComponent } from './pages/contact/contact';
import { AdminComponent } from './pages/admin/admin';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'restaurants', component: RestaurantListComponent },
  { path: 'restaurants/new', component: RestaurantFormComponent },
  { path: 'restaurants/:id', component: RestaurantDetailComponent },
  { path: 'restaurants/:id/edit', component: RestaurantFormComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '' } // Catch-all route to redirect to home
];
