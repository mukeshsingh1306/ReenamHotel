import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-gallery',
  imports: [NgFor, NgIf],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class Gallery implements OnInit, OnDestroy {
  images = [
    // Order and captions derived from the original gallery.php page
    { src: '/img/gallery/1.jpg', alt: 'Exterior view of Reenam Hotel', caption: 'Exterior View' },
    { src: '/img/gallery/g1.jpg', alt: 'Hotel exterior and approach', caption: 'Exterior View' },
    { src: '/img/gallery/g4.jpg', alt: 'Hotel facade with mountains', caption: 'Exterior View' },
    { src: '/img/gallery/g6.jpg', alt: 'Family room at Reenam Hotel', caption: 'Family Room' },
    { src: '/img/gallery/g8.jpg', alt: 'Conference room at Reenam Hotel', caption: 'Conference Room' },
    { src: '/img/gallery/g9.jpg', alt: 'Deluxe room interior', caption: 'Deluxe Room' },
    { src: '/img/gallery/g10.jpg', alt: 'Deluxe room with seating', caption: 'Deluxe Room' },
    { src: '/img/gallery/g11.jpg', alt: 'Deluxe room bed and window', caption: 'Deluxe Room' },
    { src: '/img/gallery/g12.jpg', alt: 'Deluxe room with warm decor', caption: 'Deluxe Room' },
    { src: '/img/gallery/g14.jpg', alt: 'Deluxe room layout', caption: 'Deluxe Room' },
    { src: '/img/gallery/g15.jpg', alt: 'Deluxe room overview', caption: 'Deluxe Room' },
    { src: '/img/gallery/2.jpg', alt: 'Deluxe room at Reenam Hotel', caption: 'Deluxe Room' },
    { src: '/img/gallery/3.jpg', alt: 'Conference hall seating', caption: 'Conference Hall' },
    { src: '/img/gallery/5.jpg', alt: 'Hotel garden view', caption: 'Garden View' },
    { src: '/img/gallery/6.jpg', alt: 'Family suite room', caption: 'Family Suite Room' },
    { src: '/img/gallery/g27.JPG', alt: 'Superior suite at Reenam Hotel', caption: 'Superior Suite' },
    { src: '/img/gallery/g28.JPG', alt: 'Superior suite living area', caption: 'Superior Suite' },
    { src: '/img/gallery/7.jpg', alt: 'Lobby area of Reenam Hotel', caption: 'Lobby Area' },
    { src: '/img/gallery/8.jpg', alt: 'Reenam Hotel exterior and surroundings', caption: 'Reenam Hotel' },
    { src: '/img/gallery/9.jpg', alt: 'Deluxe guest room', caption: 'Deluxe Room' },
    { src: '/img/gallery/10.jpg', alt: 'Main exterior of Reenam Hotel', caption: 'Exterior Main' },
    { src: '/img/gallery/11.jpg', alt: 'Family suite layout', caption: 'Family Suite Room' },
    { src: '/img/gallery/12.jpg', alt: 'Reception area at Reenam Hotel', caption: 'Reception' },
    { src: '/img/gallery/13.jpg', alt: 'Standard room interior', caption: 'Standard Room' },
    { src: '/img/gallery/14.jpg', alt: 'Super deluxe room', caption: 'Super Deluxe Room' },
    { src: '/img/gallery/15.jpg', alt: 'Lobby and coffee shop corner', caption: 'Lobby & Coffee Shop' },
    { src: '/img/gallery/16.jpg', alt: 'Dining area at Reenam Hotel', caption: 'Dining' },
    { src: '/img/gallery/17.jpg', alt: 'Super deluxe room view', caption: 'Super Deluxe Room' },
    { src: '/img/gallery/18.jpg', alt: 'Reenam Hotel building and courtyard', caption: 'Reenam Hotel' },
    { src: '/img/gallery/19.jpg', alt: 'Conference hall stage and seating', caption: 'Conference Hall' },
    { src: '/img/gallery/g23.jpg', alt: 'Dining setup at Reenam Hotel', caption: 'Dining' },
    { src: '/img/gallery/g24.jpg', alt: 'Restroom interior', caption: 'Restroom' },
    { src: '/img/gallery/g25.jpg', alt: 'Restroom fixtures', caption: 'Restroom' },
    { src: '/img/gallery/g26.jpg', alt: 'Restroom wash area', caption: 'Restroom' },
  ];

  currentIndex = 0;
  private autoSlideId: number | null = null;

  ngOnInit(): void {
    if (this.images.length > 1) {
      this.startAutoSlide();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  prev(): void {
    if (!this.images.length) return;
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  next(): void {
    if (!this.images.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  goTo(index: number): void {
    if (index < 0 || index >= this.images.length) return;
    this.currentIndex = index;
  }

  private startAutoSlide(): void {
    this.stopAutoSlide();
    this.autoSlideId = window.setInterval(() => {
      this.next();
    }, 5000);
  }

  private stopAutoSlide(): void {
    if (this.autoSlideId !== null) {
      window.clearInterval(this.autoSlideId);
      this.autoSlideId = null;
    }
  }

}
