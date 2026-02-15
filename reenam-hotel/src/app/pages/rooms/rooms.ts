import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { Component, signal, inject, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { API_BASE_URL } from '../../booking-api.service';

interface RoomCategoryView {
  _id?: string;
  name: string;
  slug: string;
  summary?: string;
  sizeLabel?: string;
  occupancyLabel?: string;
  rate?: any;
}

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, NgForOf, NgIf, RouterLink, HttpClientModule],
  templateUrl: './rooms.html',
  styleUrl: './rooms.scss',
})
export class Rooms implements OnInit {
  private http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  protected categories = signal<RoomCategoryView[]>([]);

  ngOnInit(): void {
    this.loadCategories();
  }

  protected async loadCategories(): Promise<void> {
    try {
      const cats = await this.http.get<RoomCategoryView[]>(`${this.baseUrl}/api/room-categories`).toPromise();
      this.categories.set(cats || []);
      console.log('✅ Loaded categories:', cats);
    } catch (e) {
      console.error('❌ Failed to load room categories', e);
    }
  }
}
