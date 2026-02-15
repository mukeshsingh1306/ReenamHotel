import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';

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
export class Rooms {
  private http = inject(HttpClient);

  protected categories = signal<RoomCategoryView[]>([]);

  constructor() {
    this.load();
  }

  protected async load(): Promise<void> {
    try {
      const cats = await this.http.get<RoomCategoryView[]>('/api/room-categories').toPromise();
      this.categories.set(cats || []);
    } catch (e) {
      // fallback: leave categories empty
      console.error('Failed to load room categories', e);
    }
  }
}
