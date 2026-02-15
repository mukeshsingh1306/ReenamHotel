import { Component, OnDestroy, OnInit, signal, inject } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  protected isAuthenticated$ = this.authService.isAuthenticated$;
  protected currentUser$ = this.authService.currentUser$;

  protected readonly isNavOpen = signal(false);

  protected readonly offers = [
    {
      title: 'Early Bird Offer',
      subtitle: 'Book 30 days in advance and save 15% on your stay.',
    },
    {
      title: 'Family Package',
      subtitle: 'Complimentary breakfast for family suites on 3+ night stays.',
    },
    {
      title: 'Winter in Leh',
      subtitle: 'Seasonal stays available from April to September each year.',
    },
  ];

  protected currentOfferIndex = 0;

  private offerTimerId: any;

  protected toggleNav(): void {
    this.isNavOpen.update((open) => !open);
  }

  protected closeNav(): void {
    this.isNavOpen.set(false);
  }

  protected nextOffer(): void {
    if (!this.offers.length) {
      return;
    }
    this.currentOfferIndex = (this.currentOfferIndex + 1) % this.offers.length;
  }

  protected prevOffer(): void {
    if (!this.offers.length) {
      return;
    }
    this.currentOfferIndex =
      (this.currentOfferIndex - 1 + this.offers.length) % this.offers.length;
  }

  protected logout(): void {
    this.authService.logout();
    this.closeNav();
  }

  ngOnInit(): void {
    // Always start the offer timer on init
    this.startOfferTimer();
  }

  ngOnDestroy(): void {
    this.clearOfferTimer();
  }

  private startOfferTimer(): void {
    this.clearOfferTimer();
    this.offerTimerId = setInterval(() => {
      this.nextOffer();
      console.log('Banner auto-slide: switched to offer', this.currentOfferIndex);
    }, 2000);
  }

  private clearOfferTimer(): void {
    if (this.offerTimerId) {
      clearInterval(this.offerTimerId);
      this.offerTimerId = null;
    }
  }
}
