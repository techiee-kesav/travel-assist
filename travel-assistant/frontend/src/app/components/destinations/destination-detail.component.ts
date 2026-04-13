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
  <div class="dest-hero" [style.background-image]="'url(' + dest.imageUrl + ')'">
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
            <i class="fa-solid fa-satellite-dish"></i>
            Live data (Open‑Meteo & OSM)
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

    <!-- PAYMENT SECTION (UI ONLY) -->
    <div class="payment-section">
      <h3>Select Payment Method</h3>

      <div class="payment-methods">
        <div class="payment-card">
          <img src="assets/payments/gpay.png" alt="Google Pay">
          <span>Google Pay</span>
        </div>

        <div class="payment-card">
          <img src="assets/payments/paytm.png" alt="Paytm">
          <span>Paytm</span>
        </div>

        <div class="payment-card">
          <img src="assets/banks/sbi.png" alt="SBI">
          <span>State Bank of India</span>
        </div>

        <div class="payment-card">
          <img src="assets/banks/hdfc.png" alt="HDFC">
          <span>HDFC Bank</span>
        </div>

        <div class="payment-card">
          <img src="assets/banks/icici.png" alt="ICICI">
          <span>ICICI Bank</span>
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
            <i class="fa-solid fa-cloud"></i> Weather
          </button>
          <button class="btn btn-secondary" (click)="activeTab='map'">
            <i class="fa-solid fa-map"></i> Map
          </button>
          <button class="btn btn-primary" (click)="planTrip()">
            Plan Trip →
          </button>
        </div>
      </div>
    </div>

  </div>
</div>
`,
  styles: [`
.payment-section{
  margin:40px 0;
  background:#f8f9ff;
  padding:24px;
  border-radius:16px
}
.payment-methods{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(180px,1fr));
  gap:16px
}
.payment-card{
  background:#fff;
  padding:16px;
  border-radius:12px;
  border:2px solid #e8ecf4;
  display:flex;
  align-items:center;
  gap:12px;
  cursor:pointer;
  transition:0.2s
}
.payment-card:hover{
  border-color:#e94560;
  transform:translateY(-2px)
}
.payment-card img{
  height:32px;
  object-fit:contain
}
.payment-card span{
  font-size:13px;
  font-weight:600
}
`]
})
export class DestinationDetailComponent implements OnInit {

  dest: Destination | null = null;
  loading = true;
  activeTab = 'overview';
  selectedBudget = 'MID';

  constructor(
    private route: ActivatedRoute,
    private destService: DestinationService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(p => {
      this.destService.getById(+p['id']).subscribe({
        next: r => {
          this.dest = r.data;
          this.loading = false;
        },
        error: () => this.loading = false
      });
    });
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
