const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema(
  {
    // Reference to the User who posted this item
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },

    // Reporter's info (denormalized for quick display without populating)
    name: {
      type: String,
      required: [true, 'Reporter name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Reporter email is required'],
      lowercase: true,
      trim: true,
    },

    // Item details
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [150, 'Item name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['electronics', 'jewelry', 'clothing', 'bags', 'documents', 'keys', 'wallet', 'pets', 'other'],
        message: '{VALUE} is not a valid category',
      },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    dateOfLoss: {
      type: Date,
      required: [true, 'Date of loss is required'],
    },

    // Image stored as Base64 string (or a URL if using cloud storage)
    image: {
      type: String,
      default: null,
    },

    // Status lifecycle: active → claimed → resolved
    status: {
      type: String,
      enum: ['active', 'claimed', 'resolved'],
      default: 'active',
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Index for fast queries
lostItemSchema.index({ status: 1 });
lostItemSchema.index({ userId: 1 });
lostItemSchema.index({ category: 1 });

module.exports = mongoose.model('LostItem', lostItemSchema);
