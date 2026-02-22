import mongoose from 'mongoose';
import RoomCategory from './models/roomCategory.js';
import Room from './models/room.js';

import dotenv from 'dotenv';
dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env');
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error', err);
    process.exit(1);
  });

const CATEGORY_MAP = {
  Deluxe: '101-102-103-104-203-204-205-206-207-209-210-302-303-304-305-306-407-309-310',
  'Deluxe Triple': '301-202-202',
  Superior: '402-403-404-405-406-407-408-409',
  'Superior Suite': '410',
  'Family Suite': '208-308',
  'Superior Queen': '401',
};

const CATEGORY_CONFIG = {
  Deluxe: { slug: 'deluxe', summary: 'Deluxe rooms', sizeLabel: 'Approx. 336 sq. ft + balcony' },
  'Deluxe Triple': { slug: 'deluxe-triple', summary: 'Deluxe triple rooms', sizeLabel: 'Approx. 419 sq. ft' },
  Superior: { slug: 'superior-deluxe', summary: 'Superior rooms', sizeLabel: 'Approx. 336 sq. ft' },
  'Superior Suite': { slug: 'superior-suite', summary: 'Superior suites', sizeLabel: 'Suite sizes vary' },
  'Family Suite': { slug: 'family-suite', summary: 'Family suites (interconnected)', sizeLabel: 'Interconnected' },
  'Superior Queen': { slug: 'superior-deluxe-queen', summary: 'Superior queen room', sizeLabel: 'Approx. 400 sq. ft' },
};

// Shared rates to be stored in DB (EP: room only, CP: room + breakfast, MAP: room + breakfast & dinner, AP: all meals)
const SHARED_RATES = {
  ep: '₹1,800',
  cp: '₹2,300',
  map: '₹3,150',
  ap: '₹3,800',
};

function parseRoomNumbers(list) {
  return Array.from(new Set(
    (list || '')
      .split(/\s*-\s*/)
      .map((s) => s.trim())
      .filter(Boolean),
  ));
}

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB at', MONGODB_URI);

    for (const [catName, numbersStr] of Object.entries(CATEGORY_MAP)) {
      const cfg = CATEGORY_CONFIG[catName] || {};
      const slug = cfg.slug || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      let category = await RoomCategory.findOne({ slug });
      if (!category) {
        category = await RoomCategory.create({ name: catName, slug, summary: cfg.summary || '', sizeLabel: cfg.sizeLabel || '', rate: SHARED_RATES });
        console.log('Created category', catName);
      } else {
        // ensure rate exists
        if (!category.rate) {
          category.rate = SHARED_RATES;
          await category.save();
        }
        console.log('Category exists', catName);
      }

      const roomNumbers = parseRoomNumbers(numbersStr);
      for (const rn of roomNumbers) {
        const exists = await Room.findOne({ roomNumber: rn });
        if (exists) {
          console.log('Skipping existing room', rn);
          continue;
        }

        const floor = Number(String(rn).slice(0, 1)) || undefined;
        await Room.create({ roomNumber: rn, category: category._id, floor, occupancy: 2, sizeLabel: cfg.sizeLabel || undefined });
        console.log('Created room', rn, '->', catName);
      }
    }

    console.log('Seeding complete');
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error('Error during seeding:', e);
    process.exit(1);
  }
}

run();
