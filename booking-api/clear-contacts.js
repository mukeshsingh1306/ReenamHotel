import mongoose from 'mongoose';
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

const contactSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  message: { type: String },
}, { timestamps: true });

const Contact = mongoose.model('Contact', contactSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB at', MONGODB_URI);
    const res = await Contact.deleteMany({});
    console.log('Deleted contacts count:', res.deletedCount);
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error('Error clearing contacts:', e);
    process.exit(1);
  }
}

run();
