import mongoose from 'mongoose';
import RoomCategory from './models/roomCategory.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/reenam-hotel';

// All room categories with rates
const ROOM_CATEGORIES = [
  {
    name: 'Deluxe',
    slug: 'deluxe',
    summary: 'Deluxe rooms pair a king bed with big windows and a balcony that opens to the mountains.',
    sizeLabel: 'Approx. 336 sq. ft + balcony',
    rate: {
      ep: '₹2,100',
      cp: '₹2,688',
      map: '₹3,500',
      ap: '₹4,200',
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
  {
    name: 'Deluxe Economy',
    slug: 'deluxe-economy',
    summary: 'Deluxe Economy rooms sit on the ground floor without balconies but share the same central heating and essential amenities.',
    sizeLabel: 'Approx. 336 sq. ft (ground floor, no balcony)',
    rate: {
      ep: '₹1,800',
      cp: '₹2,400',
      map: '₹3,100',
      ap: '₹3,500',
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
  {
    name: 'Deluxe Triple',
    slug: 'deluxe-triple',
    summary: 'Deluxe Triple rooms are designed for small groups or families who prefer to share one larger room.',
    sizeLabel: 'Approx. 419 sq. ft (first and second floor)',
    rate: {
      ep: '₹3,000',
      cp: '₹3,900',
      map: '₹4,500',
      ap: '₹5,100',
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
  {
    name: 'Deluxe Single',
    slug: 'deluxe-single',
    summary: 'Deluxe Single refers to the same balcony rooms as Deluxe Double, priced for solo travellers.',
    sizeLabel: 'Approx. 336 sq. ft + balcony',
    rate: {
      ep: '₹1,900',
      cp: '₹2,500',
      map: '₹3,200',
      ap: '₹3,800',
    },
    amenities: [
      'King-size bed with warm bedding and electric blanket',
      'Private bathroom with towels, toiletries and 24-hour hot and cold water',
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
  {
    name: 'Family Suite',
    slug: 'family-suite',
    summary: 'Family Suite rooms are our largest rooms with multiple sleeping areas and plenty of space for families.',
    sizeLabel: 'Approx. 500 sq. ft',
    rate: {
      ep: '₹4,200',
      cp: '₹5,400',
      map: '₹6,300',
      ap: '₹7,200',
    },
    amenities: [
      'Multiple sleeping areas',
      'King bed and additional single beds',
      'Spacious living area with seating',
      'Private bathroom with towels, toiletries and 24-hour hot and cold water',
      'Tea/coffee maker and intercom',
      'Flat-screen TV with DTH connection',
      'Work desk and dining table',
      'Cupboard and additional storage space',
      'Central heating throughout',
      'In-house laundry service',
      'Free internet access',
      'Daily housekeeping',
      'Luggage room access',
      'Room service (within hotel timings)',
    ],
    photos: [
      '/img/rooms/family-suite-slider-1.jpg',
      '/img/rooms/family-suite-slider-2.jpg',
    ],
  },
  {
    name: 'Superior Deluxe',
    slug: 'superior-deluxe',
    summary: 'Superior Deluxe rooms offer an elevated experience with premium amenities and additional space.',
    sizeLabel: 'Approx. 400 sq. ft',
    rate: {
      ep: '₹2,800',
      cp: '₹3,500',
      map: '₹4,200',
      ap: '₹4,900',
    },
    amenities: [
      'King-size bed with premium bedding and electric blanket',
      'Private bathroom with towels, premium toiletries and 24-hour hot and cold water',
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
      '/img/rooms/superior-deluxe-slider-1.jpg',
      '/img/rooms/superior-deluxe-slider-2.jpg',
    ],
  },
  {
    name: 'Economy Single',
    slug: 'economy-single',
    summary: 'Economy Single uses the same ground-floor rooms as Deluxe Economy but is priced specifically for solo travellers.',
    sizeLabel: 'Approx. 336 sq. ft (ground floor, no balcony)',
    rate: {
      ep: '₹1,500',
      cp: '₹1,800',
      map: '₹2,200',
      ap: '₹2,500',
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
  {
    name: 'Superior Queen',
    slug: 'superior-deluxe-queen',
    summary: 'The Superior Deluxe Queen room adds extra floor area and a balcony to a cosy queen bed setup.',
    sizeLabel: 'Approx. 400 sq. ft with balcony',
    rate: {
      ep: '₹3,000',
      cp: '₹3,300',
      map: '₹3,600',
      ap: '₹3,900',
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
  {
    name: 'Superior Suite',
    slug: 'superior-suite',
    summary: 'Superior Suite rooms are spacious multi-room suites with separate living and sleeping areas.',
    sizeLabel: 'Approx. 450 sq. ft',
    rate: {
      ep: '₹3,800',
      cp: '₹4,500',
      map: '₹5,200',
      ap: '₹5,900',
    },
    amenities: [
      'Separate living and sleeping areas',
      'King-size bed with premium bedding and electric blanket',
      'Private bathroom with towels, premium toiletries and 24-hour hot and cold water',
      'Tea/coffee maker and intercom',
      'Flat-screen TV with DTH connection',
      'Work desk and dining area',
      'Cupboard and additional storage space',
      'Central heating throughout',
      'In-house laundry service',
      'Free internet access',
      'Daily housekeeping',
      'Luggage room access',
      'Room service (within hotel timings)',
    ],
    photos: [
      '/img/rooms/superior-suite-slider-1.jpg',
      '/img/rooms/superior-suite-slider-2.jpg',
    ],
  },
  {
    name: 'Superior Single',
    slug: 'superior-single',
    summary: 'Superior Single rooms offer the premium experience of Superior Deluxe, priced for solo travellers.',
    sizeLabel: 'Approx. 400 sq. ft',
    rate: {
      ep: '₹2,400',
      cp: '₹2,900',
      map: '₹3,400',
      ap: '₹3,900',
    },
    amenities: [
      'King-size bed with premium bedding and electric blanket',
      'Private bathroom with towels, premium toiletries and 24-hour hot and cold water',
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
      '/img/rooms/superior-deluxe-slider-1.jpg',
      '/img/rooms/superior-deluxe-slider-2.jpg',
    ],
  },
];

async function seedAllRooms() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const category of ROOM_CATEGORIES) {
      const existing = await RoomCategory.findOne({ slug: category.slug });
      if (existing) {
        // Update existing with all fields
        Object.assign(existing, category);
        await existing.save();
        console.log(`✅ Updated: ${category.slug}`);
      } else {
        // Create new
        const doc = new RoomCategory(category);
        await doc.save();
        console.log(`✅ Created: ${category.slug}`);
      }
    }

    console.log('\n✅ All room categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding room categories:', error);
    process.exit(1);
  }
}

seedAllRooms();
