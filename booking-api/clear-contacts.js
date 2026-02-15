import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/reenam-hotel';

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
