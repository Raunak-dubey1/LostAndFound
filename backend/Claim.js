const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    // Who is claiming
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },

    // Claimer's info (denormalized for quick display)
    name: {
      type: String,
      required: [true, 'Claimer name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Claimer email is required'],
      lowercase: true,
      trim: true,
    },

    // Which lost item is being claimed
    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LostItem',
      required: [true, 'Lost item ID is required'],
    },

    // Claim details
    description: {
      type: String,
      required: [true, 'Description of how you found it is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    contactDetails: {
      type: String,
      trim: true,
      default: '',
    },

    // Status lifecycle: pending → approved → rejected
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true, // createdAt = claimDate
  }
);

// Index for fast lookups
claimSchema.index({ lostItemId: 1 });
claimSchema.index({ userId: 1 });
claimSchema.index({ status: 1 });

module.exports = mongoose.model('Claim', claimSchema);
