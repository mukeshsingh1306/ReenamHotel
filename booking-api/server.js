
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/reenam-hotel';

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

const bookingSchema = new mongoose.Schema(
  {
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    guests: { type: Number, required: true },
    roomType: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    specialRequests: { type: String },
    pricePerNight: { type: Number },
    total: { type: Number },
    nights: { type: Number },
  },
  {
    timestamps: true,
  },
);

const Booking = mongoose.model('Booking', bookingSchema);

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
    checkIn,
    checkOut,
    guests,
    roomType,
    name,
    email,
    phone,
    specialRequests,
    pricePerNight,
    total,
    nights,
  } = req.body || {};

  if (!checkIn || !checkOut || !guests || !roomType || !name || !email) {
    return res.status(400).json({ message: 'Missing required booking fields.' });
  }

  const booking = {
    checkIn,
    checkOut,
    guests,
    roomType,
    name,
    email,
    phone,
    specialRequests,
    pricePerNight,
    total,
    nights,
  };

  try {
    await Booking.create(booking);
  } catch (e) {
    console.error('Error saving booking to MongoDB', e);
    return res
      .status(500)
      .json({ message: 'Failed to save booking. Please try again later.' });
  }

  try {
    await sendNotificationEmail(booking);
  } catch (e) {
    console.error('Error sending booking email', e);
  }

  return res.status(201).json({ message: 'Booking request received. We will contact you shortly.' });
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
