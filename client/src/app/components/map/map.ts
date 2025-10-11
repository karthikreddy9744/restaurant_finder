import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

// Fix for default icon paths
import { icon, Marker } from 'leaflet';
const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './map.html',
  styleUrls: ['./map.css']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map: any;
  private marker: any;
  private markers: L.Marker[] = [];
  private defaultLat: number = 40.7128;
  private defaultLng: number = -74.0059;
  mapId: string = '';

  // Expose map for external access
  get mapInstance() {
    return this.map;
  }

  @Input() lat: number = this.defaultLat;
  @Input() lng: number = this.defaultLng;
  @Input() zoom: number = 13;
  @Input() markerDraggable: boolean = false;
  @Input() showHeader: boolean = true;
  @Input() mapTitle: string = '';
  @Input() height: string = '400px';
  @Input() showUserLocationOnInit: boolean = false;
  @Input() showCenterMarker: boolean = true;

  @Output() locationChanged = new EventEmitter<{lat: number, lng: number}>();

  // Component state
  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';
  showInfo: boolean = false;
  selectedLocation: any = null;
  userLocationMarker: any = null;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    // Set default coordinates if not provided
    if (this.lat === 0 && this.lng === 0) {
      this.lat = this.defaultLat;
      this.lng = this.defaultLng;
    }

    // Generate unique map ID to avoid conflicts
    this.mapId = 'map-' + Math.random().toString(36).substr(2, 9);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
      if (this.showUserLocationOnInit) {
        this.getUserLocation();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    // Clear markers array
    this.markers = [];
    this.userLocationMarker = null;
  }

  private initMap(): void {
    try {
      this.isLoading = true;
      this.hasError = false;

      // Initialize map with better options
      this.map = L.map(this.mapId, {
        center: [this.lat, this.lng],
        zoom: this.zoom,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        touchZoom: true
      });

      // Add custom tile layer with better styling
      const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        className: 'custom-tiles'
      });

      tiles.addTo(this.map);

      if (this.showCenterMarker) {

        let icon = iconDefault;

        if(this.markerDraggable) {
          icon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
        }

        // Create main marker
        this.marker = L.marker([this.lat, this.lng], {
          draggable: this.markerDraggable,
          icon: icon
        }).addTo(this.map);

        // Add marker drag events
        if (this.markerDraggable) {
          this.marker.on('dragend', (e: any) => {
            const { lat, lng } = e.target.getLatLng();
            this.locationChanged.emit({ lat, lng });
            this.showLocationInfo(lat, lng);
          });

          this.marker.on('dragstart', () => {
            this.hideLocationInfo();
          });
        }

        // Add marker click event
        this.marker.on('click', () => {
          this.showLocationInfo(this.lat, this.lng);
        });
      }

      // Add click event to map
      this.map.on('click', (e: any) => {
        if (this.markerDraggable) {
          this.setMarker(e.latlng.lat, e.latlng.lng);
          this.showLocationInfo(e.latlng.lat, e.latlng.lng);
        }
      });

      // Map ready
      this.map.whenReady(() => {
        this.isLoading = false;
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      this.hasError = true;
      this.errorMessage = 'Failed to initialize map';
      this.isLoading = false;
    }
  }

  public setMarker(lat: number, lng: number): void {
    if (this.marker && this.map) {
      this.lat = lat;
      this.lng = lng;
      this.marker.setLatLng([lat, lng]);
      this.map.panTo([lat, lng]);

      // Emit location change event
      this.locationChanged.emit({ lat, lng });
    } else if (this.map) {
      // Create user location marker if it doesn't exist
      this.createUserLocationMarker(lat, lng);
    }
  }

  private createUserLocationMarker(lat: number, lng: number): void {
    if (!this.map) return;

    // Create blue user location icon
    const userLocationIcon = L.divIcon({
      className: 'custom-marker user-location',
      html: `<div class="marker-pin user-location"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10]
    });

    // Remove existing user marker
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    // Create new user location marker
    this.marker = L.marker([lat, lng], {
      icon: userLocationIcon,
      draggable: this.markerDraggable
    }).addTo(this.map);

    // Add marker events
    if (this.markerDraggable) {
      this.marker.on('dragend', (e: any) => {
        const { lat, lng } = e.target.getLatLng();
        this.locationChanged.emit({ lat, lng });
        this.showLocationInfo(lat, lng);
      });

      this.marker.on('dragstart', () => {
        this.hideLocationInfo();
      });
    }

    this.marker.on('click', () => {
      this.showLocationInfo(lat, lng);
    });
  }

  public addMarker(lat: number, lng: number, popupContent: string, isMain: boolean = false): void {
    if (!this.map) {
      console.error('Map not initialized when trying to add marker');
      return;
    }

    console.log(`Adding marker at coordinates: ${lat}, ${lng} for: ${popupContent}`);

    const redIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const marker = L.marker([lat, lng], {
      icon: redIcon,
      draggable: false, // Restaurant markers are not draggable
      zIndexOffset: 1000 // Force markers to be on top
    })
      .addTo(this.map)
      .bindPopup(popupContent);

    marker.on('click', () => {
      this.showLocationInfo(lat, lng);
    });

    this.markers.push(marker);
    console.log(`Marker added successfully. Total markers: ${this.markers.length}`);
  }

  public clearMarkers(): void {
    console.log(`Clearing ${this.markers.length} markers`);
    this.markers.forEach(marker => {
      if (this.map) {
        this.map.removeLayer(marker);
      }
    });
    this.markers = [];
    console.log('Markers cleared');
  }

  public searchLocation(query: string): void {
    if (!query || !this.map) return;

    this.isLoading = true;
    this.hasError = false;

    // Use Nominatim API for geocoding
    const encodedQuery = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1&addressdetails=1`;

    this.http.get(url).subscribe({
      next: (data: any) => {
        this.isLoading = false;
        if (data && data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);

          // Update map view and marker
          this.map.setView([lat, lng], 15);
          this.setMarker(lat, lng);

          // Show location info with address
          const address = result.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          this.showLocationInfo(lat, lng, address);

          console.log('Location found:', address);
        } else {
          this.hasError = true;
          this.errorMessage = 'Location not found. Please try a different search term.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = 'Search failed. Please check your internet connection and try again.';
        console.error('Search error:', error);
      }
    });
  }

  public getUserLocation(): void {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Add or update user location marker
        this.addUserLocationMarker(userLat, userLng);

        // Center map on user location
        this.map.setView([userLat, userLng], 15);

        console.log('User location:', userLat, userLng);
      },
      (error) => {
        console.error('Error getting user location:', error);
        alert('Unable to get your location. Please check your browser permissions.');
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 60000
      }
    );
  }

  private addUserLocationMarker(lat: number, lng: number): void {
    // Remove existing user location marker
    if (this.userLocationMarker) {
      this.map.removeLayer(this.userLocationMarker);
    }

    // Create user location icon
    const userLocationIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Add user location marker
    this.userLocationMarker = L.marker([lat, lng], {
      icon: userLocationIcon,
      draggable: false
    })
      .addTo(this.map)
      .bindPopup('Your current location');
  }

  public retryMap(): void {
    this.hasError = false;
    this.errorMessage = '';
    this.initMap();
  }

  private showLocationInfo(lat: number, lng: number, address?: string): void {
    this.selectedLocation = { lat, lng, address };
    this.showInfo = true;
  }

  public closeInfo(): void {
    this.showInfo = false;
    this.selectedLocation = null;
  }

  private hideLocationInfo(): void {
    this.showInfo = false;
  }

  // Fit map to show all markers
  public fitToMarkers(): void {
    if (this.map && this.markers.length > 0) {
      console.log(`Fitting map to ${this.markers.length} markers`);
      const group = L.featureGroup(this.markers);
      const bounds = group.getBounds();
      console.log('Marker bounds:', bounds);
      this.map.fitBounds(bounds.pad(0.1));
    } else {
      console.log('Cannot fit to markers - map:', !!this.map, 'markers:', this.markers.length);
    }
  }

  // Get current map bounds
  public getMapBounds(): any {
    if (this.map) {
      return this.map.getBounds();
    }
    return null;
  }
}
