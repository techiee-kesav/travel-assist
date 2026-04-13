import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DestinationService } from '../../services/destination.service';
import { ReviewService } from '../../services/review.service';
import { RecommendationService } from '../../services/recommendation.service';
import { AuthService } from '../../services/auth.service';
import { Destination, Review } from '../../models';
import { WeatherWidgetComponent } from '../weather/weather-widget.component';
import { LeafletMapComponent } from '../map/map.component';

@Component({
  selector: 'app-destination-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    WeatherWidgetComponent,
    LeafletMapComponent
  ],
  template: `
  <div *ngIf="loading" class="loading-spinner">
    <div class="spinner"></div>
  </div>

  <div *ngIf="dest && !loading">

    <!-- HERO -->
    <div class="dest-hero" [style.background-image]="'url('+dest.imageUrl+')'">
      <div class="dest-hero-overlay">
        <div class="container">

          <div class="breadcrumb">
            <i class="fa-solid fa-house"></i>
            Home → {{dest.state}} →
            <strong>{{dest.name}}</strong>
          </div>

          <h1>{{dest.name}}</h1>
          <p>{{dest.state}}, {{dest.country}}</p>

          <div class="hero-meta">
            <span>
              <i class="fa-solid fa-star"></i>
              {{dest.rating}} ({{dest.reviewCount | number}} reviews)
            </span>
            <span>
              <i class="fa-solid fa-cloud-sun"></i>
              {{dest.climate}}
            </span>
            <span>
              <i class="fa-solid fa-language"></i>
              {{dest.language}}
            </span>
            <span class="open-source-badge">
              <i class="fa-solid fa-database"></i>
              Live data: Open‑Meteo + OSM
            </span>
          </div>

          <div class="hero-actions">
            <button class="btn btn-primary" (click)="planTrip()">
              <i class="fa-solid fa-plane"></i>
              Plan Trip Here
            </button>
            <button class="btn btn-outline" (click)="activeTab='weather'">
              <i class="fa-solid fa-cloud"></i>
              Live Weather
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- BODY -->
    <div class="container dest-body">

      <!-- BUDGET CARDS -->
      <div class="budget-cards">

        <div class="budget-card low"
             [class.selected]="selectedBudget==='LOW'"
             (click)="selectedBudget='LOW'; loadRecommendations()">
          <div class="bc-icon">
            <i class="fa-solid fa-wallet"></i>
          </div>
          <div class="bc-label">Budget</div>
          <div class="bc-price">
            ₹{{dest.lowBudgetPerDay | number}}<span>/day</span>
          </div>
          <ul class="bc-features">
            <li>Hostel</li>
            <li>Local Transport</li>
            <li>Street Food</li>
          </ul>
        </div>

        <div class="budget-card mid"
             [class.selected]="selectedBudget==='MID'"
             (click)="selectedBudget='MID'; loadRecommendations()">
          <div class="bc-popular">Most Popular</div>
          <div class="bc-icon">
            <i class="fa-solid fa-credit-card"></i>
          </div>
          <div class="bc-label">Mid‑Range</div>
          <div class="bc-price">
            ₹{{dest.midBudgetPerDay | number}}<span>/day</span>
          </div>
          <ul class="bc-features">
            <li>3‑Star Hotel</li>
            <li>Cab / Train</li>
            <li>Restaurants</li>
          </ul>
        </div>

        <div class="budget-card luxury"
             [class.selected]="selectedBudget==='LUXURY'"
             (click)="selectedBudget='LUXURY'; loadRecommendations()">
          <div class="bc-icon">
            <i class="fa-solid fa-gem"></i>
          </div>
          <div class="bc-label">Luxury</div>
          <div class="bc-price">
            ₹{{dest.luxuryBudgetPerDay | number}}<span>/day</span>
          </div>
          <ul class="bc-features">
            <li>5‑Star Resort</li>
            <li>Private Car</li>
            <li>Fine Dining</li>
          </ul>
        </div>

      </div>

      <!-- TABS -->
      <div class="dest-tabs">
        <button *ngFor="let t of tabs"
                [class.active]="activeTab===t.key"
                (click)="activeTab=t.key">
          <i class="fa-solid" [ngClass]="t.icon"></i>
          {{t.label}}
        </button>
      </div>

      <!-- OVERVIEW -->
      <div *ngIf="activeTab==='overview'" class="tab-content fade-in-up">

        <div class="grid-2">
          <div>
            <h2>About {{dest.name}}</h2>
            <p class="about-text">{{dest.description}}</p>

            <div class="info-chips">
              <div class="info-chip">
                <i class="fa-solid fa-calendar"></i>
                <div>
                  <strong>Best Season</strong><br>
                  {{dest.bestSeason}}
                </div>
              </div>
              <div class="info-chip">
                <i class="fa-solid fa-temperature-half"></i>
                <div>
                  <strong>Climate</strong><br>
                  {{dest.climate}}
                </div>
              </div>
              <div class="info-chip">
                <i class="fa-solid fa-language"></i>
                <div>
                  <strong>Language</strong><br>
                  {{dest.language}}
                </div>
              </div>
              <div class="info-chip">
                <i class="fa-solid fa-money-bill-wave"></i>
                <div>
                  <strong>Currency</strong><br>
                  Indian Rupee
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3>Famous Places</h3>
            <div class="places-list">
              <div class="place-item"
                   *ngFor="let p of parsedFamousPlaces; let i=index">
                <div class="place-num">{{i+1}}</div>
                <span>{{p}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- WEATHER -->
      <div *ngIf="activeTab==='weather'" class="tab-content fade-in-up">
        <h2>
          <i class="fa-solid fa-cloud-sun"></i>
          Live Weather — {{dest.name}}
        </h2>
        <p class="data-source">
          Data: Open‑Meteo API + OpenStreetMap
        </p>
        <app-weather-widget [city]="dest.name"></app-weather-widget>
      </div>

      <!-- MAP -->
      <div *ngIf="activeTab==='map'" class="tab-content fade-in-up">
        <h2>
          <i class="fa-solid fa-map-location-dot"></i>
          {{dest.name}} on Map
        </h2>

        <div class="map-controls">
          <button *ngFor="let pt of poiTypes"
                  (click)="loadPois(pt.key)"
                  [class.active]="activePoi===pt.key"
                  class="poi-btn">
            <i class="fa-solid" [ngClass]="pt.icon"></i>
            {{pt.label}}
          </button>
        </div>

        <app-leaflet-map
          [lat]="dest.latitude"
          [lon]="dest.longitude"
          [name]="dest.name"
          [pois]="pois">
        </app-leaflet-map>
      </div>

      <!-- REVIEWS -->
      <div *ngIf="activeTab==='reviews'" class="tab-content fade-in-up">
        <h2>
          <i class="fa-solid fa-star"></i>
          Traveller Reviews
        </h2>

        <div class="reviews-header">
          <button class="btn btn-primary"
                  *ngIf="auth.isLoggedIn"
                  (click)="showReviewForm=!showReviewForm">
            Write Review
          </button>
        </div>
      </div>

    </div>

    <!-- STICKY BAR -->
    <div class="sticky-book-bar">
      <div class="container sbb-inner">
        <div>
          <strong>{{dest.name}}</strong>
          <span>{{selectedBudget}} · ₹{{getBudgetPrice() | number}}/day/person</span>
        </div>
        <div class="sbb-actions">
          <button class="btn btn-secondary" (click)="activeTab='weather'">
            <i class="fa-solid fa-cloud"></i>
            Weather
          </button>
          <button class="btn btn-secondary" (click)="activeTab='map'">
            <i class="fa-solid fa-map"></i>
            Map
          </button>
          <button class="btn btn-primary" (click)="planTrip()">
            Plan Trip →
          </button>
        </div>
      </div>
    </div>

  </div>
  `
})
export class DestinationDetailComponent implements OnInit {

  dest: Destination | null = null;
  loading = true;
  activeTab = 'overview';
  selectedBudget = 'MID';
  reviews: Review[] = [];
  showReviewForm = false;
  recommendation: any = null;
  pois: any[] = [];
  activePoi = 'HOTEL';

  tabs = [
    { key: 'overview',  icon: 'fa-circle-info', label: 'Overview' },
    { key: 'weather',   icon: 'fa-cloud-sun', label: 'Live Weather' },
    { key: 'map',       icon: 'fa-map-location-dot', label: 'Map & POIs' },
    { key: 'reviews',   icon: 'fa-star', label: 'Reviews' }
  ];

  poiTypes = [
    { key: 'HOTEL', icon: 'fa-hotel', label: 'Hotels' },
    { key: 'RESTAURANT', icon: 'fa-utensils', label: 'Restaurants' },
    { key: 'ATM', icon: 'fa-money-bill', label: 'ATMs' }
  ];

  constructor(
    private route: ActivatedRoute,
    private destService: DestinationService,
    private reviewService: ReviewService,
    private recService: RecommendationService,
    public auth: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.params.subscribe(p => {
      this.destService.getById(+p['id']).subscribe({
        next: res => {
          this.dest = res.data;
          this.loading = false;
        },
        error: () => this.loading = false
      });
    });
  }

  loadRecommendations() {
    if (!this.dest) return;
    this.recService.getRecommendations({
      destination: this.dest.name,
      budget: this.selectedBudget,
      people: 2,
      days: 5
    }).subscribe();
  }

  loadPois(type: string) {
    this.activePoi = type;
    if (!this.dest) return;
    this.http
      .get<any>(
        `http://localhost:8080/api/pois?lat=${this.dest.latitude}&lon=${this.dest.longitude}&type=${type}`
      )
      .subscribe(r => this.pois = r.data || []);
  }

  getBudgetPrice(): number {
    if (!this.dest) return 0;
    return this.selectedBudget === 'LOW'
      ? this.dest.lowBudgetPerDay
      : this.selectedBudget === 'MID'
      ? this.dest.midBudgetPerDay
      : this.dest.luxuryBudgetPerDay;
  }

  planTrip() {
    if (!this.auth.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.router.navigate(['/planner'], {
      queryParams: {
        to: this.dest?.name,
        budget: this.selectedBudget
      }
    });
  }
}
