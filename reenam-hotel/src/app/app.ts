import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('reenam-hotel');

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
