import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgIf],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  heroImages = [
    { src: '/img/slider/slider10.jpg', alt: 'Mountain view from Reenam Hotel' },
    { src: '/img/slider/slider5.jpg', alt: 'Hotel exterior and garden' },
    { src: '/img/slider/slider3.jpg', alt: 'Rooms with mountain backdrop' },
    { src: '/img/slider/slider2.jpg', alt: 'Morning light over Leh from the hotel' },
  ];

  currentHeroIndex = 0;
  private heroAutoSlideId: number | null = null;

  ngOnInit(): void {
    if (this.heroImages.length > 1) {
      this.startHeroAutoSlide();
    }
  }

  ngOnDestroy(): void {
    this.stopHeroAutoSlide();
  }

  nextHero(): void {
    if (!this.heroImages.length) return;
    this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroImages.length;
  }

  prevHero(): void {
    if (!this.heroImages.length) return;
    this.currentHeroIndex = (this.currentHeroIndex - 1 + this.heroImages.length) % this.heroImages.length;
  }

  goToHero(index: number): void {
    if (index < 0 || index >= this.heroImages.length) return;
    this.currentHeroIndex = index;
    this.startHeroAutoSlide();
  }

  private startHeroAutoSlide(): void {
    this.stopHeroAutoSlide();
    this.heroAutoSlideId = window.setInterval(() => {
      this.nextHero();
    }, 5000);
  }

  private stopHeroAutoSlide(): void {
    if (this.heroAutoSlideId !== null) {
      window.clearInterval(this.heroAutoSlideId);
      this.heroAutoSlideId = null;
    }
  }
}
