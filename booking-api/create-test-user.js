import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

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

async function createTestUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@reenam.com' });
    if (existingUser) {
      console.log('Test user already exists!');
      console.log('\nTest User Credentials:');
      console.log('Email: test@reenam.com');
      console.log('Mobile: 9876543210');
      console.log('Password: test@123');
      await mongoose.disconnect();
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('test@123', 10);
    const testUser = await User.create({
      email: 'test@reenam.com',
      mobile: '9876543210',
      password: hashedPassword,
      name: 'Test User',
      isAdmin: true,
    });

    console.log('✅ Test user created successfully!');
    console.log('\nTest User Credentials:');
    console.log('Email: test@reenam.com');
    console.log('Mobile: 9876543210');
    console.log('Password: test@123');
    console.log('\nYou can now login using either email or mobile with the password.');

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error creating test user:', err);
    process.exit(1);
  }
}

createTestUser();
