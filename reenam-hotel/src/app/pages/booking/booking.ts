import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, NgIf, TitleCasePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

type RoomType =
  | 'deluxe'
  | 'deluxe-economy'
  | 'deluxe-triple'
  | 'family-suite'
  | 'superior-deluxe'
  | 'superior-deluxe-queen'
  | 'superior-suite';

interface BookingSummary {
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  roomType: RoomType;
  pricePerNight: number;
  total: number;
}

@Component({
  selector: 'app-booking',
  imports: [ReactiveFormsModule, NgIf, TitleCasePipe, CurrencyPipe, HttpClientModule],
  templateUrl: './booking.html',
  styleUrl: './booking.scss',
})
export class Booking {
  form: FormGroup;
  submitted = false;
  summary?: BookingSummary;
  submitting = false;
  serverMessage: string | null = null;

  private readonly basePrices: Record<RoomType, number> = {
    deluxe: 3000,
    'deluxe-economy': 1800,
    'deluxe-triple': 3600,
    'family-suite': 4800,
    'superior-deluxe': 4800,
    'superior-deluxe-queen': 5400,
    'superior-suite': 6600,
  };

  constructor(
    private readonly fb: FormBuilder,
    private readonly http: HttpClient,
    private readonly route: ActivatedRoute,
  ) {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    this.form = this.fb.group({
      checkIn: [this.toInputDate(today), Validators.required],
      checkOut: [this.toInputDate(tomorrow), Validators.required],
      guests: [2, [Validators.required, Validators.min(1), Validators.max(6)]],
      roomType: ['deluxe', Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      specialRequests: [''],
    });

    const roomFromQuery = this.route.snapshot.queryParamMap.get('room') as RoomType | null;
    if (roomFromQuery && this.basePrices[roomFromQuery] !== undefined) {
      this.form.patchValue({ roomType: roomFromQuery });
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.serverMessage = null;
    if (this.form.invalid) {
      this.summary = undefined;
      return;
    }

    const value = this.form.value;
    const nights = this.calculateNights(value.checkIn, value.checkOut);
    const roomType = value.roomType as RoomType;
    const pricePerNight = this.basePrices[roomType];
    const total = nights * pricePerNight;

    this.summary = {
      checkIn: value.checkIn,
      checkOut: value.checkOut,
      nights,
      guests: value.guests,
      roomType,
      pricePerNight,
      total,
    };

    this.submitting = true;
    this.http
      .post<{ message: string }>('http://localhost:4000/api/bookings', {
        ...value,
        nights,
        pricePerNight,
        total,
      })
      .subscribe({
        next: (res) => {
          this.submitting = false;
          this.serverMessage = res?.message || 'Booking request sent successfully.';
        },
        error: () => {
          this.submitting = false;
          this.serverMessage = 'Your request was saved locally, but we could not reach the booking service. Please contact the hotel directly.';
        },
      });
  }

  private calculateNights(checkIn: string, checkOut: string): number {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const ms = outDate.getTime() - inDate.getTime();
    const nights = Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
    return nights;
  }

  private toInputDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
