import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface RoomRateInfo {
  roomsLabel: string;
  occupancy: string;
  size: string;
  ep: string;
  cp: string;
  map: string;
  ap: string;
  note?: string;
}

interface RoomDetailConfig {
  slug: string;
  name: string;
  heroImage: string;
  heroAlt: string;
  shortTagline: string;
  summary: string;
  sizeLabel: string;
  occupancyLabel: string;
  rate: RoomRateInfo;
  amenities: string[];
  photos: string[];
}

const ROOM_DETAILS: Record<string, RoomDetailConfig> = {
  deluxe: {
    slug: 'deluxe',
    name: 'Deluxe Room',
    heroImage: '/img/rooms/deluxe-room-slider-1.jpg',
    heroAlt: 'Deluxe room at Reenam Hotel with mountain view balcony',
    shortTagline: 'Warm double room with balcony and views of the snow-capped hills.',
    summary:
      'Deluxe rooms pair a king bed with big windows and a balcony that opens to the mountains. They are centrally heated and sized comfortably for two guests who want a bright, cosy base in Leh.',
    sizeLabel: 'Approx. 336 sq. ft + balcony',
    occupancyLabel: 'Up to 2 guests (extra person at additional charge)',
    rate: {
      roomsLabel: '14 rooms',
      occupancy: 'Max 2 guests',
      size: '336 sq. ft + balcony overlooking the mountains',
      ep: '₹3,000',
      cp: '₹3,840',
      map: '₹4,920',
      ap: '₹6,000',
      note: 'Rates are indicative and may change with season and availability.',
    },
    amenities: [
      'King-size bed with warm bedding and electric blanket',
      'Private bathroom with towels, basic toiletries and 24-hour hot and cold water',
      'Tea/coffee maker and intercom',
      'Flat-screen TV with DTH connection',
      'Work desk with chair and a pair of easy chairs or small sofa',
      'Cupboard and luggage space',
      'Central heating with bed warmers for colder nights',
      'In-house laundry service',
      'Free internet access',
      'Daily housekeeping',
      'Luggage room access',
      'Room service (within hotel timings)',
    ],
    photos: [
      '/img/rooms/deluxe-room-slider-1.jpg',
      '/img/rooms/deluxe-room-slider-2.jpg',
      '/img/rooms/deluxe-room-slider-3.jpg',
      '/img/rooms/deluxe-room-slider-5.jpg',
    ],
  },
  'deluxe-economy': {
    slug: 'deluxe-economy',
    name: 'Deluxe Economy',
    heroImage: '/img/rooms/deluxe-economy-slider-1.jpg',
    heroAlt: 'Deluxe economy room at Reenam Hotel',
    shortTagline: 'Ground-floor rooms that keep core comforts at a friendlier price.',
    summary:
      'Deluxe Economy rooms sit on the ground floor without balconies but share the same central heating and essential amenities. They work well if you want a comfortable double room while keeping an eye on budget.',
    sizeLabel: 'Approx. 336 sq. ft (ground floor, no balcony)',
    occupancyLabel: 'Up to 2 guests (extra person at additional charge)',
    rate: {
      roomsLabel: '6 rooms on ground floor',
      occupancy: 'Max 2 guests',
      size: '336 sq. ft, ground floor without balcony',
      ep: '₹1,800',
      cp: '₹2,640',
      map: '₹3,720',
      ap: '₹4,800',
      note: 'Rates are indicative and may change with season and availability.',
    },
    amenities: [
      'King-size bed with warm bedding and electric blanket',
      'Private bathroom with towels, toiletries and 24-hour hot and cold water',
      'Tea/coffee maker and intercom',
      'Flat-screen TV with DTH connection',
      'Work desk with chair and a pair of easy chairs',
      'Cupboard and luggage space',
      'Central heating',
      'In-house laundry service',
      'Free internet access',
      'Daily housekeeping',
      'Luggage room access',
      'Room service (within hotel timings)',
    ],
    photos: [
      '/img/rooms/deluxe-economy-slider-1.jpg',
      '/img/rooms/deluxe-economy-slider-2.jpg',
    ],
  },
  'deluxe-triple': {
    slug: 'deluxe-triple',
    name: 'Deluxe Triple',
    heroImage: '/img/rooms/deluxe-triple-slider-1.jpg',
    heroAlt: 'Triple occupancy deluxe room at Reenam Hotel',
    shortTagline: 'A larger heated room with space for three guests.',
    summary:
      'Deluxe Triple rooms are designed for small groups or families who prefer to share one larger room. With central heating and flexible sleeping for three, they keep everyone together without feeling cramped.',
    sizeLabel: 'Approx. 419 sq. ft (first and second floor)',
    occupancyLabel: 'Up to 3 guests (extra person at additional charge)',
    rate: {
      roomsLabel: '2 rooms',
      occupancy: 'Max 3 guests',
      size: '419 sq. ft across first and second floors',
      ep: '₹3,600',
      cp: '₹4,860',
      map: '₹6,480',
      ap: '₹8,100',
      note: 'Rates are indicative and may change with season and availability.',
    },
    amenities: [
      'King bed with provision for extra bedding',
      'Private bathroom with towels, toiletries and 24-hour hot and cold water',
      'Tea/coffee maker and intercom',
      'Flat-screen TV with DTH connection',
      'Work desk with chair and a pair of easy chairs',
      'Cupboard and additional storage space',
      'Central heating with bed warmers',
      'In-house laundry service',
      'Free internet access',
      'Daily housekeeping',
      'Luggage room access',
      'Room service (within hotel timings)',
    ],
    photos: [
      '/img/rooms/deluxe-triple-slider-1.jpg',
      '/img/rooms/deluxe-triple-slider-2.jpg',
      '/img/rooms/deluxe-triple-slider-3.jpg',
    ],
  },
  'family-suite': {
    slug: 'family-suite',
    name: 'Family Suite',
    heroImage: '/img/rooms/family-suite-slider-1.jpg',
    heroAlt: 'Family suite with interconnected bedrooms at Reenam Hotel',
    shortTagline: 'Two interconnected rooms so families can stay close with extra privacy.',
    summary:
      'Family Suites join two bedrooms into one private unit: a main room with a king bed and a second room with twin beds. The layout keeps children nearby while still giving everyone their own space and storage.',
    sizeLabel: 'Approx. 549 + 336 sq. ft, interconnected',
    occupancyLabel: 'Up to 4 guests (plus extra person at additional charge)',
    rate: {
      roomsLabel: '2 suites (interconnected)',
      occupancy: 'Max 4 guests',
      size: 'Approx. 549 + 336 sq. ft on first and second floor',
      ep: '₹4,800',
      cp: '₹6,480',
      map: '₹8,640',
      ap: '₹10,800',
      note: 'Rates are indicative and may change with season and availability.',
    },
    amenities: [
      'One bedroom with king bed, second bedroom with twin beds',
      'Two attached bathrooms with towels, toiletries and 24-hour hot and cold water',
      'Tea/coffee maker and intercom',
      'Flat-screen TVs with DTH connection',
      'Work desk with chair and multiple easy chairs/sofas',
      'Cupboards and plenty of storage for family luggage',
      'Central heating with electric blankets',
      'In-house laundry service',
      'Free internet access',
      'Daily housekeeping',
      'Luggage room access',
      'Room service (within hotel timings)',
    ],
    photos: [
      '/img/rooms/family-suite-slider-1.jpg',
      '/img/rooms/family-suite-slider-2.jpg',
      '/img/rooms/family-suite-slider-3.jpg',
      '/img/rooms/family-suite-slider-4.jpg',
    ],
  },
  'superior-deluxe': {
    slug: 'superior-deluxe',
    name: 'Superior Deluxe',
    heroImage: '/img/rooms/superior-deluxe-slider-1.jpg',
    heroAlt: 'Superior deluxe room at Reenam Hotel with balcony',
    shortTagline: 'Top-floor rooms with balconies and wider mountain views.',
    summary:
      'Superior Deluxe rooms sit on the upper floor with balconies that look out over Leh and the surrounding ranges. They are slightly more spacious than standard deluxe rooms and suit guests looking for a more premium feel.',
    sizeLabel: 'Approx. 336 sq. ft with balcony',
    occupancyLabel: 'Up to 2 guests (extra person at additional charge)',
    rate: {
      roomsLabel: '8 rooms',
      occupancy: 'Max 2 guests',
      size: '336 sq. ft with balcony on third floor',
      ep: '₹4,800',
      cp: '₹5,640',
      map: '₹6,720',
      ap: '₹7,800',
      note: 'Rates are indicative and may change with season and availability.',
    },
    amenities: [
      'King-size bed with premium bedding and electric blanket',
      'Private bathroom with towels, toiletries and 24-hour hot and cold water',
      'Tea/coffee maker and intercom',
      'Flat-screen TV with DTH connection',
      'Work desk with chair and a pair of easy chairs',
      'Cupboard and balcony seating',
      'Central heating throughout the building',
      'In-house laundry service',
      'Free internet access',
      'Daily housekeeping',
      'Luggage room access',
      'Room service (within hotel timings)',
    ],
    photos: [
      '/img/rooms/superior-deluxe-slider-1.jpg',
      '/img/rooms/superior-deluxe-slider-2.jpg',
      '/img/rooms/superior-deluxe-slider-3.jpg',
      '/img/rooms/superior-deluxe-slider-4.jpg',
    ],
  },
  'superior-deluxe-queen': {
    slug: 'superior-deluxe-queen',
    name: 'Superior Deluxe Queen',
    heroImage: '/img/rooms/superior-deluxe-queen-slider-1.jpg',
    heroAlt: 'Superior deluxe queen room at Reenam Hotel',
    shortTagline: 'A spacious queen-bed room on the upper floor with balcony.',
    summary:
      'The Superior Deluxe Queen room adds extra floor area and a balcony to a cosy queen bed setup. It is a good match for couples who plan to spend more time indoors or enjoy slow mornings with a view.',
    sizeLabel: 'Approx. 400 sq. ft with balcony',
    occupancyLabel: 'Up to 2 guests (extra person at additional charge)',
    rate: {
      roomsLabel: 'Single, larger room on upper floor',
      occupancy: 'Max 2 guests',
      size: 'Around 400 sq. ft with balcony',
      ep: '₹5,400',
      cp: '₹6,240',
      map: '₹7,320',
      ap: '₹8,400',
      note: 'Rates are indicative and may change with season and availability.',
    },
    amenities: [
      'Queen-size bed with warm bedding and electric blanket',
      'Private bathroom with towels, toiletries and 24-hour hot and cold water',
      'Tea/coffee maker and intercom',
      'Flat-screen TV with DTH connection',
      'Work desk with chair and easy chairs',
      'Cupboard and balcony seating',
      'Central heating throughout the building',
      'In-house laundry service',
      'Free internet access',
      'Daily housekeeping',
      'Luggage room access',
      'Room service (within hotel timings)',
    ],
    photos: [
      '/img/rooms/superior-deluxe-queen-slider-1.jpg',
      '/img/rooms/superior-deluxe-queen-slider-2.jpg',
    ],
  },
  'superior-suite': {
    slug: 'superior-suite',
    name: 'Superior Suite',
    heroImage: '/img/rooms/superior-suite-slider-1.jpeg',
    heroAlt: 'Superior suite at Reenam Hotel with bedroom and separate sitting area',
    shortTagline: 'A suite with bedroom, sitting room and small kitchenette for longer stays.',
    summary:
      'The Superior Suite combines a separate bedroom, living area and small kitchen-like space, making it suitable for longer visits or guests who prefer extra privacy and room to unpack.',
    sizeLabel: 'Approx. 338 + 220 sq. ft (bedroom + sitting room)',
    occupancyLabel: 'Up to 2 guests',
    rate: {
      roomsLabel: 'Single suite on third floor',
      occupancy: 'Max 2 guests',
      size: 'Approx. 338 + 220 sq. ft',
      ep: '₹6,600',
      cp: '₹7,440',
      map: '₹8,520',
      ap: '₹9,600',
      note: 'Rates are indicative and may change with season and availability.',
    },
    amenities: [
      'King-size bed with warm bedding and electric blanket',
      'Bedroom and separate sitting room with sofa seating',
      'Private bathroom with towels, toiletries and 24-hour hot and cold water',
      'Tea/coffee maker and intercom',
      'Flat-screen TV with DTH in the main space',
      'Work desk and cupboard',
      'Central heating throughout the suite',
      'In-house laundry service',
      'Free internet access',
      'Daily housekeeping',
      'Luggage room access',
      'Room service (within hotel timings)',
    ],
    photos: [
      '/img/rooms/superior-suite-slider-1.jpeg',
      '/img/rooms/superior-suite-slider-2.jpeg',
    ],
  },
};

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf, RouterLink],
  templateUrl: './room-detail.html',
  styleUrl: './room-detail.scss',
})
export class RoomDetail {
  private readonly route = inject(ActivatedRoute);

  protected readonly slug = signal<string>('');

  protected readonly activeTab = signal<'rates' | 'amenities' | 'photos' | 'policy'>('rates');

  protected readonly room = computed<RoomDetailConfig | null>(() => {
    const key = this.slug();
    return ROOM_DETAILS[key] ?? null;
  });

  protected readonly hasRoom = computed(() => this.room() !== null);

  protected readonly childPolicyPoints: string[] = [
    'Children up to 5 years of age stay complimentary when sharing existing bedding.',
    'Children up to around 10 years without an extra bed are typically charged about 25% of the room rate.',
    'Older children and extra adults are usually charged around 40% of the room rate as an extra bed.',
  ];

  protected readonly roomKeys = Object.keys(ROOM_DETAILS);

  protected getSiblingRooms(currentSlug: string): RoomDetailConfig[] {
    return this.roomKeys
      .filter((s) => s !== currentSlug)
      .map((s) => ROOM_DETAILS[s]);
  }

  protected setTab(tab: 'rates' | 'amenities' | 'photos' | 'policy'): void {
    this.activeTab.set(tab);
  }

  constructor() {
    this.route.paramMap.subscribe((params) => {
      this.slug.set(params.get('slug') ?? '');
      this.activeTab.set('rates');
    });
  }
}
