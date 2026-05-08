const express = require('express');
const router = express.Router();
const LostItem = require('./LostItem');
const Claim = require('./Claim');
const { protect } = require('./authMiddleware');

// ─── GET /api/items/lost ──────────────────────────────────────────────────────
// Get all active lost items (public)
router.get('/lost', async (req, res) => {
  try {
    const items = await LostItem.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json(
      items.map((item) => ({
        ...item.toObject(),
        id: item._id, // expose 'id' for frontend compatibility
      }))
    );
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching items', error: error.message });
  }
});

// ─── POST /api/items/lost ─────────────────────────────────────────────────────
// Post a new lost item (protected)
router.post('/lost', protect, async (req, res) => {
  try {
    const { name, email, itemName, description, category, location, dateOfLoss, image } = req.body;

    if (!name || !email || !itemName || !description || !category || !location || !dateOfLoss) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const newItem = await LostItem.create({
      userId: req.user._id,
      name,
      email,
      itemName,
      description,
      category,
      location,
      dateOfLoss: new Date(dateOfLoss),
      image: image || null,
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Lost item posted successfully',
      data: { ...newItem.toObject(), id: newItem._id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error uploading lost item', error: error.message });
  }
});

// ─── GET /api/items/lost/:id ──────────────────────────────────────────────────
// Get a single lost item by ID
router.get('/lost/:id', async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ ...item.toObject(), id: item._id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching item', error: error.message });
  }
});

// ─── PUT /api/items/lost/:id ──────────────────────────────────────────────────
// Update item status (protected - only owner)
router.put('/lost/:id', protect, async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Only the owner can update
    if (item.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this item' });
    }

    item.status = req.body.status || item.status;
    const updatedItem = await item.save();

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: { ...updatedItem.toObject(), id: updatedItem._id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating item', error: error.message });
  }
});

// ─── GET /api/items/lost/:id/claims ──────────────────────────────────────────
// Get all claims for a specific lost item (protected - only owner)
router.get('/lost/:id/claims', protect, async (req, res) => {
  try {
    const claims = await Claim.find({ lostItemId: req.params.id }).sort({ createdAt: -1 });
    res.json(
      claims.map((c) => ({ ...c.toObject(), id: c._id, claimDate: c.createdAt }))
    );
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching claims', error: error.message });
  }
});

// ─── GET /api/items/claims ────────────────────────────────────────────────────
// Get all claims (for current logged-in user's dashboard)
router.get('/claims', protect, async (req, res) => {
  try {
    const myLostItemIds = await LostItem.find({ userId: req.user._id }).distinct('_id');
    const claims = await Claim.find({
      $or: [{ userId: req.user._id }, { lostItemId: { $in: myLostItemIds } }],
    }).sort({ createdAt: -1 });
    res.json(
      claims.map((c) => ({
        ...c.toObject(),
        id: c._id,
        claimDate: c.createdAt,
      }))
    );
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching claims', error: error.message });
  }
});

// ─── GET /api/items/claims/:claimId ───────────────────────────────────────────
// Get a single claim with associated lost item (protected - claimer or owner)
router.get('/claims/:claimId', protect, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    const item = await LostItem.findById(claim.lostItemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Lost item not found' });
    }

    const isClaimer = claim.userId.toString() === req.user._id.toString();
    const isReporter = item.userId.toString() === req.user._id.toString();
    if (!isClaimer && !isReporter) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this claim' });
    }

    res.json({
      ...claim.toObject(),
      id: claim._id,
      claimDate: claim.createdAt,
      userId: claim.userId?.toString(),
      lostItem: { ...item.toObject(), id: item._id, userId: item.userId?.toString() },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching claim details', error: error.message });
  }
});

// ─── PATCH /api/items/claims/:claimId/status ──────────────────────────────────
// Approve/reject a claim (protected - only item owner)
router.patch('/claims/:claimId/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const claim = await Claim.findById(req.params.claimId);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    const item = await LostItem.findById(claim.lostItemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Lost item not found' });
    }

    if (item.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this claim' });
    }

    claim.status = status;
    await claim.save();

    item.status = status === 'approved' ? 'resolved' : 'active';
    await item.save();

    res.json({
      success: true,
      message: `Claim ${status} successfully`,
      data: {
        claim: { ...claim.toObject(), id: claim._id, claimDate: claim.createdAt },
        lostItem: { ...item.toObject(), id: item._id },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating claim status', error: error.message });
  }
});

// ─── POST /api/items/claim ────────────────────────────────────────────────────
// Submit a claim on a lost item (protected)
router.post('/claim', protect, async (req, res) => {
  try {
    const { name, email, lostItemId, description, contactDetails } = req.body;

    if (!name || !email || !lostItemId || !description) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Make sure the item exists
    const item = await LostItem.findById(lostItemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Lost item not found' });
    }

    // Prevent owner from claiming their own item
    if (item.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot claim your own item' });
    }

    // Create the claim
    const claim = await Claim.create({
      userId: req.user._id,
      name,
      email,
      lostItemId,
      description,
      contactDetails: contactDetails || '',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully',
      data: { ...claim.toObject(), id: claim._id, claimDate: claim.createdAt },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting claim', error: error.message });
  }
});

module.exports = router;
