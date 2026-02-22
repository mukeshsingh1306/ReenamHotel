
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

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

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Swagger/OpenAPI setup
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Reenam Hotel Booking API',
    version: '1.0.0',
    description: 'API documentation for Reenam Hotel booking endpoints',
  },
  servers: [
    { url: `http://localhost:${PORT}` },
  ],
};

const swaggerOptions = {
  swaggerDefinition,
  apis: [__filename],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Simple MongoDB connection using Mongoose
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error', err);
  });

// User schema for authentication
const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, sparse: true },
    mobile: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    name: { type: String },
    isAdmin: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model('User', userSchema);

// Contact Us schema for storing inquiries
const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const Contact = mongoose.model('Contact', contactSchema);

// Room and Booking models
import RoomCategory from './models/roomCategory.js';
import Room from './models/room.js';
import Booking from './models/booking.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function sendNotificationEmail(booking) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, BOOKING_NOTIFY_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !BOOKING_NOTIFY_EMAIL) {
    console.log('SMTP or BOOKING_NOTIFY_EMAIL not fully configured; skipping email send.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const subject = `New booking request - ${booking.name || 'Guest'}`;
  const text = [
    'New booking request from Reenam Hotel website',
    '',
    `Name: ${booking.name}`,
    `Email: ${booking.email}`,
    `Phone: ${booking.phone || '-'}`,
    `Room type: ${booking.roomType}`,
    `Guests: ${booking.guests}`,
    `Check-in: ${booking.checkIn}`,
    `Check-out: ${booking.checkOut}`,
    `Nights: ${booking.nights}`,
    '',
    'Special requests:',
    booking.specialRequests || '-',
  ].join('\n');

  await transporter.sendMail({
    from: `Reenam Website <${SMTP_USER}>`,
    to: BOOKING_NOTIFY_EMAIL,
    subject,
    text,
  });
}

// Authentication endpoints
/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               mobile:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *             required:
 *               - password
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Error creating user
 */
app.post('/api/auth/signup', async (req, res) => {
  const { email, mobile, password, name } = req.body || {};

  if (!password || (!email && !mobile)) {
    return res.status(400).json({ message: 'Email/mobile and password are required.' });
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ email: email || null }, { mobile: mobile || null }],
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email || undefined,
      mobile: mobile || undefined,
      password: hashedPassword,
      name,
    });

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(201).json({ message: 'User registered successfully.', token });
  } catch (e) {
    console.error('Error during signup', e);
    return res.status(500).json({ message: 'Failed to register user.' });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email/mobile and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               mobile:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - password
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Error during login
 */
app.post('/api/auth/login', async (req, res) => {
  const { email, mobile, password } = req.body || {};

  if (!password || (!email && !mobile)) {
    return res.status(400).json({ message: 'Email/mobile and password are required.' });
  }

  try {
    const user = await User.findOne({
      $or: [{ email: email || null }, { mobile: mobile || null }],
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email/mobile or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email/mobile or password.' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.json({ message: 'Login successful.', token, user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile } });
  } catch (e) {
    console.error('Error during login', e);
    return res.status(500).json({ message: 'Failed to login.' });
  }
});

app.post('/api/bookings', async (req, res) => {
  const {
    guestName,
    guestEmail,
    guestPhone,
    roomCategory,
    checkInDate,
    checkOutDate,
    numberOfRooms,
    numberOfGuests,
    ratePerRoom,
    mealPlan,
    totalPrice,
    specialRequests,
  } = req.body || {};

  if (
    !guestName ||
    !guestEmail ||
    !roomCategory ||
    !checkInDate ||
    !checkOutDate ||
    !numberOfRooms ||
    !numberOfGuests ||
    !ratePerRoom ||
    !mealPlan ||
    !totalPrice
  ) {
    return res.status(400).json({ message: 'Missing required booking fields.' });
  }

  try {
    // Check availability
    const booked = await Booking.countDocuments({
      roomCategory,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          checkInDate: { $lt: new Date(checkOutDate) },
          checkOutDate: { $gt: new Date(checkInDate) },
        },
      ],
    });

    // Get total rooms in category
    const category = await RoomCategory.findById(roomCategory);
    if (!category) {
      return res.status(404).json({ message: 'Room category not found.' });
    }

    const totalRooms = await Room.countDocuments({ category: roomCategory });
    const availableRooms = totalRooms - booked;

    if (availableRooms < numberOfRooms) {
      return res.status(400).json({
        message: `Only ${availableRooms} rooms available for selected dates.`,
        availableRooms,
      });
    }

    const booking = new Booking({
      guestName,
      guestEmail,
      guestPhone,
      roomCategory,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      numberOfRooms,
      numberOfGuests,
      ratePerRoom,
      mealPlan,
      totalPrice,
      specialRequests,
      status: 'pending',
    });

    await booking.save();

    return res
      .status(201)
      .json({
        message: 'Booking request received. We will contact you shortly.',
        bookingId: booking._id,
      });
  } catch (e) {
    console.error('Error saving booking to MongoDB', e);
    return res
      .status(500)
      .json({ message: 'Failed to save booking. Please try again later.' });
  }
});

// Simple endpoint to fetch recent bookings (for admin/tools)
app.get('/api/bookings', async (_req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).limit(50).lean();
    return res.json(bookings);
  } catch (e) {
    console.error('Error fetching bookings from MongoDB', e);
    return res.status(500).json({ message: 'Failed to fetch bookings.' });
  }
});

// Check room availability for a date range
/**
 * @swagger
 * /api/bookings/availability/{categorySlug}:
 *   get:
 *     summary: Check room availability for a category on given dates
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: categorySlug
 *         required: true
 *         schema:
 *           type: string
 *         description: Room category slug
 *       - in: query
 *         name: checkInDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Check-in date (ISO 8601 format)
 *       - in: query
 *         name: checkOutDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Check-out date (ISO 8601 format)
 *     responses:
 *       200:
 *         description: Availability information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categorySlug:
 *                   type: string
 *                 totalRooms:
 *                   type: number
 *                 bookedRooms:
 *                   type: number
 *                 availableRooms:
 *                   type: number
 *                 isAvailable:
 *                   type: boolean
 *                 soldOut:
 *                   type: boolean
 *       400:
 *         description: Missing required parameters
 *       404:
 *         description: Room category not found
 *       500:
 *         description: Server error
 */
app.get('/api/bookings/availability/:categorySlug', async (req, res) => {
  const { categorySlug } = req.params;
  const { checkInDate, checkOutDate } = req.query;

  if (!checkInDate || !checkOutDate) {
    return res
      .status(400)
      .json({ message: 'checkInDate and checkOutDate are required.' });
  }

  try {
    // Find the room category by slug
    const category = await RoomCategory.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(404).json({ message: 'Room category not found.' });
    }

    // Count total rooms in category
    const totalRooms = await Room.countDocuments({ category: category._id });

    // Count booked rooms for the date range
    const bookedCount = await Booking.countDocuments({
      roomCategory: category._id,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          checkInDate: { $lt: new Date(checkOutDate) },
          checkOutDate: { $gt: new Date(checkInDate) },
        },
      ],
    });

    const availableRooms = totalRooms - bookedCount;
    const isAvailable = availableRooms > 0;
    const soldOut = availableRooms === 0;

    return res.json({
      categorySlug,
      categoryName: category.name,
      totalRooms,
      bookedRooms: bookedCount,
      availableRooms,
      isAvailable,
      soldOut,
    });
  } catch (e) {
    console.error('Error checking availability:', e);
    return res.status(500).json({ message: 'Failed to check availability.' });
  }
});

// Contact Us endpoints
/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Submit a contact us inquiry
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               message:
 *                 type: string
 *             required:
 *               - name
 *               - email
 *               - message
 *     responses:
 *       201:
 *         description: Contact inquiry submitted
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Failed to save contact inquiry
 *   get:
 *     summary: Get all contact inquiries (admin)
 *     tags: [Contact]
 *     responses:
 *       200:
 *         description: List of contact inquiries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   message:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *       500:
 *         description: Failed to fetch inquiries
 */

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required.' });
  }

  try {
    await Contact.create({ name, email, message });
    return res.status(201).json({ message: 'Thank you for reaching out. We will contact you soon.' });
  } catch (e) {
    console.error('Error saving contact inquiry to MongoDB', e);
    return res.status(500).json({ message: 'Failed to save your inquiry. Please try again later.' });
  }
});

app.get('/api/contact', async (_req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
    return res.json(contacts);
  } catch (e) {
    console.error('Error fetching contact inquiries from MongoDB', e);
    return res.status(500).json({ message: 'Failed to fetch inquiries.' });
  }
});

/**
 * @swagger
 * /api/room-categories:
 *   get:
 *     summary: Get list of room categories
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: List of categories
 *       500:
 *         description: Server error
 */
app.get('/api/room-categories', async (_req, res) => {
  try {
    const cats = await RoomCategory.find().lean();
    return res.json(cats);
  } catch (e) {
    console.error('Error fetching room categories', e);
    return res.status(500).json({ message: 'Failed to fetch room categories.' });
  }
});

/**
 * @swagger
 * /api/room-categories/{slug}:
 *   get:
 *     summary: Get a room category by slug
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category object
 *       404:
 *         description: Not found
 */
app.get('/api/room-categories/:slug', async (req, res) => {
  try {
    const { slug } = req.params || {};
    const cat = await RoomCategory.findOne({ slug }).lean();
    if (!cat) return res.status(404).json({ message: 'Category not found.' });
    return res.json(cat);
  } catch (e) {
    console.error('Error fetching room category', e);
    return res.status(500).json({ message: 'Failed to fetch room category.' });
  }
});

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Get list of rooms (optionally filter by category slug)
 *     tags: [Rooms]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category slug to filter rooms
 *     responses:
 *       200:
 *         description: List of rooms
 *       500:
 *         description: Server error
 */
app.get('/api/rooms', async (req, res) => {
  try {
    const { category } = req.query || {};
    let q = {};
    if (category) {
      const cat = await RoomCategory.findOne({ slug: category }).lean();
      if (cat) q.category = cat._id;
    }
    const rooms = await Room.find(q).populate('category').sort({ roomNumber: 1 }).lean();
    return res.json(rooms);
  } catch (e) {
    console.error('Error fetching rooms', e);
    return res.status(500).json({ message: 'Failed to fetch rooms.' });
  }
});

/**
 * @swagger
 * /api/rooms/{roomNumber}:
 *   get:
 *     summary: Get room by room number
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: roomNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room object
 *       404:
 *         description: Not found
 */
app.get('/api/rooms/:roomNumber', async (req, res) => {
  try {
    const { roomNumber } = req.params || {};
    const room = await Room.findOne({ roomNumber }).populate('category').lean();
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    return res.json(room);
  } catch (e) {
    console.error('Error fetching room', e);
    return res.status(500).json({ message: 'Failed to fetch room.' });
  }
});

// --- Admin CRUD for RoomCategories ---
app.post('/api/admin/room-categories', async (req, res) => {
  try {
    const { name, slug, summary, sizeLabel, rate, amenities, photos } = req.body || {};
    if (!name || !slug) return res.status(400).json({ message: 'name and slug are required' });
    const exists = await RoomCategory.findOne({ slug });
    if (exists) return res.status(400).json({ message: 'slug already exists' });
    const cat = await RoomCategory.create({ name, slug, summary, sizeLabel, rate, amenities, photos });
    return res.status(201).json(cat);
  } catch (e) {
    console.error('Error creating category', e);
    return res.status(500).json({ message: 'Failed to create category' });
  }
});

app.put('/api/admin/room-categories/:id', async (req, res) => {
  try {
    const { id } = req.params || {};
    const update = req.body || {};
    const cat = await RoomCategory.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    return res.json(cat);
  } catch (e) {
    console.error('Error updating category', e);
    return res.status(500).json({ message: 'Failed to update category' });
  }
});

app.delete('/api/admin/room-categories/:id', async (req, res) => {
  try {
    const { id } = req.params || {};
    await RoomCategory.findByIdAndDelete(id);
    return res.json({ message: 'Deleted' });
  } catch (e) {
    console.error('Error deleting category', e);
    return res.status(500).json({ message: 'Failed to delete category' });
  }
});

// --- Admin CRUD for Rooms ---
app.post('/api/admin/rooms', async (req, res) => {
  try {
    const { roomNumber, categorySlug, floor, status, features, occupancy, sizeLabel, price } = req.body || {};
    if (!roomNumber) return res.status(400).json({ message: 'roomNumber required' });
    let category = undefined;
    if (categorySlug) category = await RoomCategory.findOne({ slug: categorySlug });
    const exists = await Room.findOne({ roomNumber });
    if (exists) return res.status(400).json({ message: 'roomNumber exists' });
    const room = await Room.create({ roomNumber, category: category?._id, floor, status, features, occupancy, sizeLabel, price });
    return res.status(201).json(room);
  } catch (e) {
    console.error('Error creating room', e);
    return res.status(500).json({ message: 'Failed to create room' });
  }
});

app.put('/api/admin/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params || {};
    const update = req.body || {};
    if (update.categorySlug) {
      const cat = await RoomCategory.findOne({ slug: update.categorySlug });
      update.category = cat?._id;
      delete update.categorySlug;
    }
    const room = await Room.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!room) return res.status(404).json({ message: 'Room not found' });
    return res.json(room);
  } catch (e) {
    console.error('Error updating room', e);
    return res.status(500).json({ message: 'Failed to update room' });
  }
});

app.delete('/api/admin/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params || {};
    await Room.findByIdAndDelete(id);
    return res.json({ message: 'Deleted' });
  } catch (e) {
    console.error('Error deleting room', e);
    return res.status(500).json({ message: 'Failed to delete room' });
  }
});


app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         checkIn:
 *           type: string
 *           example: '2024-02-01'
 *         checkOut:
 *           type: string
 *           example: '2024-02-05'
 *         guests:
 *           type: integer
 *           example: 2
 *         roomType:
 *           type: string
 *           example: 'Deluxe'
 *         name:
 *           type: string
 *           example: 'John Doe'
 *         email:
 *           type: string
 *           example: 'john@example.com'
 *         phone:
 *           type: string
 *           example: '+1234567890'
 *         specialRequests:
 *           type: string
 *           example: 'Late check-in'
 *         pricePerNight:
 *           type: number
 *           example: 120
 *         total:
 *           type: number
 *           example: 480
 *         nights:
 *           type: integer
 *           example: 4
 *       required:
 *         - checkIn
 *         - checkOut
 *         - guests
 *         - roomType
 *         - name
 *         - email
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       201:
 *         description: Booking created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing required booking fields
 *       500:
 *         description: Failed to save booking
 *   get:
 *     summary: Get recent bookings (admin)
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: List of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       500:
 *         description: Failed to fetch bookings
 */

app.listen(PORT, () => {
  console.log(`Booking API listening on http://localhost:${PORT}`);
});
