import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { RestaurantService } from '../../services/restaurant';
import { Restaurant } from '../../models/Restaurant';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  searchTerm = '';
  searchSuggestions: Restaurant[] = [];
  showSuggestions = false;
  popularSearches = [
    'Pizza', 'Burger', 'Chinese', 'Italian', 'Indian', 'Sushi',
    'Thai', 'Mexican', 'Desserts', 'Fast Food'
  ];
  recentSearches: string[] = [];

  constructor(
    private router: Router,
    private restaurantService: RestaurantService
  ) {
    this.loadRecentSearches();
  }

  ngOnInit(): void {
    // Set up search debouncing
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(term => {
        if (term.trim()) {
          this.performSearch(term);
        } else {
          this.searchSuggestions = [];
          this.showSuggestions = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.searchSubject.next(this.searchTerm);
  }

  onSearchFocus(): void {
    if (this.searchSuggestions.length > 0 || this.recentSearches.length > 0) {
      this.showSuggestions = true;
    }
  }

  onSearchBlur(): void {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  private performSearch(term: string): void {
    this.restaurantService.searchRestaurants(term)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (restaurants) => {
          this.searchSuggestions = restaurants.slice(0, 5); // Show only top 5
          this.showSuggestions = true;
        },
        error: (err) => {
          console.error('Search error:', err);
          this.searchSuggestions = [];
        }
      });
  }

  search(term?: string): void {
    const searchQuery = term || this.searchTerm;
    if (searchQuery.trim()) {
      this.saveRecentSearch(searchQuery);
      this.router.navigate(['/restaurants'], { queryParams: { q: searchQuery } });
      this.showSuggestions = false;
    }
  }

  selectSuggestion(restaurant: Restaurant): void {
    this.searchTerm = restaurant.name;
    this.search(restaurant.name);
  }

  selectRecentSearch(search: string): void {
    this.searchTerm = search;
    this.search(search);
  }

  selectPopularSearch(search: string): void {
    this.searchTerm = search;
    this.search(search);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchSuggestions = [];
    this.showSuggestions = false;
  }

  private saveRecentSearch(search: string): void {
    if (!this.recentSearches.includes(search)) {
      this.recentSearches.unshift(search);
      this.recentSearches = this.recentSearches.slice(0, 5); // Keep only 5 recent searches
      localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
    }
  }

  private loadRecentSearches(): void {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      this.recentSearches = JSON.parse(saved);
    }
  }

  clearRecentSearches(): void {
    this.recentSearches = [];
    localStorage.removeItem('recentSearches');
  }
}
