import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DatePipe, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { BookingApiService, BookingDto } from '../../booking-api.service';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, CurrencyPipe, TitleCasePipe],
  templateUrl: './admin-bookings.html',
  styleUrl: './admin-bookings.scss',
})
export class AdminBookings implements OnInit {
  loading = false;
  error: string | null = null;
  bookings: BookingDto[] = [];

  constructor(private readonly bookingApi: BookingApiService) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.error = null;
    this.bookingApi.getBookings().subscribe({
      next: (data) => {
        this.loading = false;
        this.bookings = data || [];
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load bookings. Please check the API.';
      },
    });
  }
}
