import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/reenam-hotel';

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

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

app.listen(PORT, () => {
  console.log(`Booking API listening on http://localhost:${PORT}`);
});
