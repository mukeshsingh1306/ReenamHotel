import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomCategory' },
    floor: { type: Number },
    status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
    features: { type: [String], default: [] },
    occupancy: { type: Number },
    sizeLabel: { type: String },
    price: { type: Number },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

const Room = mongoose.model('Room', roomSchema);

export default Room;
