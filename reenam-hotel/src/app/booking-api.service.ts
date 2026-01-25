import { inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface CreateBookingRequest {
  checkIn: string;
  checkOut: string;
  guests: number;
  roomType: string;
  name: string;
  email: string;
  phone?: string;
  specialRequests?: string;
  pricePerNight: number;
  total: number;
  nights: number;
}

export interface CreateBookingResponse {
  message: string;
}

export interface BookingDto {
  _id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomType: string;
  name: string;
  email: string;
  phone?: string;
  specialRequests?: string;
  pricePerNight?: number;
  total?: number;
  nights?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

@Injectable({ providedIn: 'root' })
export class BookingApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  createBooking(payload: CreateBookingRequest) {
    return this.http.post<CreateBookingResponse>(
      `${this.baseUrl}/api/bookings`,
      payload,
    );
  }

  getBookings() {
    return this.http.get<BookingDto[]>(`${this.baseUrl}/api/bookings`);
  }
}
