import mongoose from 'mongoose';

const roomCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    summary: { type: String },
    sizeLabel: { type: String },
    occupancyLabel: { type: String },
    rate: { type: mongoose.Schema.Types.Mixed },
    amenities: { type: [String], default: [] },
    photos: { type: [String], default: [] },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

const RoomCategory = mongoose.model('RoomCategory', roomCategorySchema);

export default RoomCategory;
