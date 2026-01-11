import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');

function appendBooking(booking) {
  let current = [];
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const raw = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
      current = JSON.parse(raw || '[]');
    }
  } catch (e) {
    console.error('Failed reading existing bookings file', e);
  }
  current.push({ ...booking, createdAt: new Date().toISOString() });
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(current, null, 2));
  } catch (e) {
    console.error('Failed writing bookings file', e);
  }
}

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

  appendBooking(booking);

  try {
    await sendNotificationEmail(booking);
  } catch (e) {
    console.error('Error sending booking email', e);
  }

  return res.status(201).json({ message: 'Booking request received. We will contact you shortly.' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Booking API listening on http://localhost:${PORT}`);
});
