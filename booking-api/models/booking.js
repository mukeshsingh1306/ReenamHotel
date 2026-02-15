import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    // Guest Information
    guestName: {
      type: String,
      required: true,
      trim: true,
    },
    guestEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    guestPhone: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Booking Details
    roomCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomCategory',
      required: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    numberOfRooms: {
      type: Number,
      required: true,
      min: 1,
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1,
    },
    
    // Pricing
    ratePerRoom: {
      type: String, // e.g., "₹2,100"
      required: true,
    },
    mealPlan: {
      type: String, // 'ep', 'cp', 'map', 'ap'
      enum: ['ep', 'cp', 'map', 'ap'],
      required: true,
    },
    totalPrice: {
      type: String, // e.g., "₹4,200"
      required: true,
    },
    
    // Status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    
    // Special Requests
    specialRequests: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
bookingSchema.index({ roomCategory: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ guestEmail: 1 });
bookingSchema.index({ status: 1 });

export default mongoose.model('Booking', bookingSchema);
